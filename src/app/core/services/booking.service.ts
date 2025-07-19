import { Injectable, inject, signal, computed } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp, orderBy } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { RoleService } from './role.service';
import { ToastService } from '../../shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';

export interface Booking {
  id?: string;
  // Informació bàsica (pot ser mínima inicialment)
  nom?: string;
  email?: string;
  data?: string;
  hora?: string;

  // Informació del servei (pot ser mínima inicialment)
  serviceName?: string;
  serviceId?: string;
  duration?: number;
  price?: number;

  // Informació addicional (opcional)
  notes?: string;
  status?: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  editToken: string; // Sempre requerit per identificació

  // Informació d'usuari (pot ser null per usuaris anònims)
  uid?: string | null;

  // Timestamps
  createdAt?: any;
  updatedAt?: any;

  // Campos legacy per compatibilitat
  title?: string;
  start?: string;
  servei?: string;
  preu?: number;
  userId?: string;
  clientName?: string;
}

// Interfície per a reserves públiques (sense detalls privats)
export interface PublicBooking {
  id?: string;
  data: string;
  hora: string;
  duration: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt?: any;
  updatedAt?: any;
}

export interface BookingForm {
  nom: string;
  email: string;
  data: string;
  hora: string;
  serviceName: string;
  serviceId: string;
  duration: number;
  price: number;
  notes?: string;
}

export interface MinimalBooking {
  editToken: string;
  status?: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);

  // Signals
  private readonly bookingsSignal = signal<Booking[]>([]);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Computed properties
  readonly bookings = computed(() => this.bookingsSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());

  constructor() {
    this.loadBookings();
  }

  /**
   * Create a minimal booking with just basic information
   */
  async createMinimalBooking(minimalData: Partial<Booking> = {}): Promise<Booking | null> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.authService.user();

      const minimalBooking: Booking = {
        editToken: minimalData.editToken || nanoid(32),
        status: minimalData.status || 'draft',
        uid: currentUser?.uid || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...minimalData
      };

      // Save to Firestore
      const docRef = await addDoc(collection(this.firestore, 'bookings'), minimalBooking);

      // Create new booking with ID
      const newBooking: Booking = {
        ...minimalBooking,
        id: docRef.id
      };

      // Update local state
      this.bookingsSignal.update(bookings => [newBooking, ...bookings]);

      return newBooking;
    } catch (error) {
      console.error('Error creating minimal booking:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error creating booking');
      this.toastService.showGenericError('Error creating booking');
      return null;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Create a complete booking with all required information
   */
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking | null> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required for complete bookings');
      }

      const booking = {
        nom: bookingData.nom || '',
        email: bookingData.email || '',
        data: bookingData.data || '',
        hora: bookingData.hora || '',
        serviceName: bookingData.serviceName || '',
        serviceId: bookingData.serviceId || '',
        duration: bookingData.duration || 60,
        price: bookingData.price || 0,
        notes: bookingData.notes || '',
        status: 'confirmed' as const,
        editToken: bookingData.editToken || nanoid(32),
        uid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Campos legacy
        title: bookingData.title || bookingData.nom || '',
        start: bookingData.start || `${bookingData.data}T${bookingData.hora}`,
        servei: bookingData.servei || bookingData.serviceName || '',
        preu: bookingData.preu || bookingData.price || 0,
        userId: bookingData.userId || currentUser.uid,
        clientName: bookingData.clientName || bookingData.nom || ''
      };

      // Save to Firestore
      const docRef = await addDoc(collection(this.firestore, 'bookings'), booking);

      // Create new booking with ID
      const newBooking: Booking = {
        ...booking,
        id: docRef.id
      };

      // Update local state
      this.bookingsSignal.update(bookings => [newBooking, ...bookings]);

      this.toastService.showAppointmentCreated(bookingData.nom || 'Client', docRef.id);

      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error creating booking');
      this.toastService.showGenericError('Error creating booking');
      return null;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Update a booking with partial data (useful for completing minimal bookings)
   */
  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<boolean> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Get current booking to verify ownership
      const currentBooking = await this.getBookingById(bookingId);
      if (!currentBooking) {
        throw new Error('Booking not found');
      }

      if (currentBooking.uid !== currentUser.uid) {
        throw new Error('Access denied');
      }

      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Update in Firestore
      const docRef = doc(this.firestore, 'bookings', bookingId);
      await updateDoc(docRef, updateData);

      // Update local state
      this.bookingsSignal.update(bookings =>
        bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, ...updates, updatedAt: new Date() }
            : booking
        )
      );

      this.toastService.showSuccess('Booking updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error updating booking');
      this.toastService.showGenericError('Error updating booking');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Complete a minimal booking with full information
   */
  async completeBooking(bookingId: string, completeData: BookingForm): Promise<boolean> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Get current booking to verify ownership
      const currentBooking = await this.getBookingById(bookingId);
      if (!currentBooking) {
        throw new Error('Booking not found');
      }

      if (currentBooking.uid !== currentUser.uid) {
        throw new Error('Access denied');
      }

      // Prepare complete booking data
      const completeBookingData = {
        nom: completeData.nom,
        email: completeData.email,
        data: completeData.data,
        hora: completeData.hora,
        serviceName: completeData.serviceName,
        serviceId: completeData.serviceId,
        duration: completeData.duration,
        price: completeData.price,
        notes: completeData.notes || '',
        status: 'confirmed' as const,
        updatedAt: serverTimestamp(),
        // Campos legacy
        title: completeData.nom,
        start: `${completeData.data}T${completeData.hora}`,
        servei: completeData.serviceName,
        preu: completeData.price,
        userId: currentUser.uid,
        clientName: completeData.nom
      };

      // Update in Firestore
      const docRef = doc(this.firestore, 'bookings', bookingId);
      await updateDoc(docRef, completeBookingData);

      // Update local state
      this.bookingsSignal.update(bookings =>
        bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, ...completeBookingData, updatedAt: new Date() }
            : booking
        )
      );

      this.toastService.showSuccess('Booking completed successfully');
      return true;
    } catch (error) {
      console.error('Error completing booking:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error completing booking');
      this.toastService.showGenericError('Error completing booking');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Load bookings based on user role:
   * - Super Admin: All bookings with full details
   * - User/Invited: Only public booking info (time slots occupied)
   */
  async loadBookings(): Promise<void> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      // Wait for auth to be initialized
      await this.waitForAuthInitialization();

      const currentUser = this.authService.user();
      const isAdmin = this.roleService.isAdmin();

      console.log('Loading bookings - User:', currentUser?.uid, 'Email:', currentUser?.email, 'IsAdmin:', isAdmin);

      if (isAdmin) {
        // Super Admin: Load all bookings with full details
        console.log('Loading as admin...');
        await this.loadAllBookingsForAdmin();
      } else if (currentUser?.uid) {
        // Authenticated User: Load own bookings + public info of others
        console.log('Loading as authenticated user...');
        await this.loadUserBookingsWithPublicInfo(currentUser.uid);
      } else {
        // Invited User: Load only public booking info
        console.log('Loading as invited user...');
        await this.loadPublicBookingsOnly();
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error loading bookings');
      this.toastService.showGenericError('Error loading bookings');
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Wait for authentication to be initialized
   */
  private async waitForAuthInitialization(): Promise<void> {
    return new Promise((resolve) => {
      const checkAuth = () => {
        if (this.authService.isInitialized()) {
          console.log('Auth initialized - User:', this.authService.user()?.uid);
          resolve();
        } else {
          console.log('Waiting for auth initialization...');
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
  }

  /**
   * Load all bookings with full details for Super Admin
   */
  private async loadAllBookingsForAdmin(): Promise<void> {
    console.log('Loading all bookings for admin...');

    const bookingsQuery = query(
      collection(this.firestore, 'bookings'),
      orderBy('createdAt', 'desc')
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    console.log('Admin query result - Size:', bookingsSnapshot.size);

    const bookings: Booking[] = [];

    bookingsSnapshot.forEach((doc) => {
      const bookingData = doc.data();
      console.log('Admin booking data:', bookingData);

      const booking: Booking = {
        id: doc.id,
        nom: bookingData['nom'] || '',
        email: bookingData['email'] || '',
        data: bookingData['data'] || '',
        hora: bookingData['hora'] || '',
        serviceName: bookingData['serviceName'] || '',
        serviceId: bookingData['serviceId'] || '',
        duration: bookingData['duration'] || 60,
        price: bookingData['price'] || 0,
        notes: bookingData['notes'] || '',
        status: bookingData['status'] || 'draft',
        editToken: bookingData['editToken'],
        uid: bookingData['uid'],
        createdAt: bookingData['createdAt'],
        updatedAt: bookingData['updatedAt'],
        // Campos legacy
        title: bookingData['title'] || bookingData['nom'] || '',
        start: bookingData['start'] || `${bookingData['data']}T${bookingData['hora']}`,
        servei: bookingData['servei'] || bookingData['serviceName'] || '',
        preu: bookingData['preu'] || bookingData['price'] || 0,
        userId: bookingData['userId'] || bookingData['uid'] || '',
        clientName: bookingData['clientName'] || bookingData['nom'] || ''
      };
      bookings.push(booking);
    });

    console.log('Admin bookings loaded:', bookings.length);
    this.bookingsSignal.set(bookings);
  }

      /**
   * Load user's own bookings + public info of other bookings
   */
  private async loadUserBookingsWithPublicInfo(userId: string): Promise<void> {
    console.log('Loading user bookings for userId:', userId);

    try {
      // Load user's own bookings with full details
      const userBookingsQuery = query(
        collection(this.firestore, 'bookings'),
        where('uid', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const userBookingsSnapshot = await getDocs(userBookingsQuery);
      console.log('User bookings query result - Size:', userBookingsSnapshot.size);

      const userBookings: Booking[] = [];

      userBookingsSnapshot.forEach((doc) => {
        const bookingData = doc.data();
        console.log('User booking data:', bookingData);

        const booking: Booking = {
          id: doc.id,
          nom: bookingData['nom'] || '',
          email: bookingData['email'] || '',
          data: bookingData['data'] || '',
          hora: bookingData['hora'] || '',
          serviceName: bookingData['serviceName'] || '',
          serviceId: bookingData['serviceId'] || '',
          duration: bookingData['duration'] || 60,
          price: bookingData['price'] || 0,
          notes: bookingData['notes'] || '',
          status: bookingData['status'] || 'draft',
          editToken: bookingData['editToken'],
          uid: bookingData['uid'],
          createdAt: bookingData['createdAt'],
          updatedAt: bookingData['updatedAt'],
          // Campos legacy
          title: bookingData['title'] || bookingData['nom'] || '',
          start: bookingData['start'] || `${bookingData['data']}T${bookingData['hora']}`,
          servei: bookingData['servei'] || bookingData['serviceName'] || '',
          preu: bookingData['preu'] || bookingData['price'] || 0,
          userId: bookingData['userId'] || bookingData['uid'] || '',
          clientName: bookingData['clientName'] || bookingData['nom'] || ''
        };
        userBookings.push(booking);
      });

      console.log('User bookings loaded:', userBookings.length);

      // For now, only load user's own bookings to avoid permission issues
      // We'll implement public booking loading later with proper security rules
      const allBookings = [...userBookings];

      // Sort by date
      allBookings.sort((a, b) => {
        if (a.data && b.data) {
          const dateA = new Date(a.data);
          const dateB = new Date(b.data);
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      });

      console.log('Total bookings for user:', allBookings.length);
      this.bookingsSignal.set(allBookings);
    } catch (error) {
      console.error('Error loading user bookings:', error);
      // If user query fails, try loading all bookings (admin fallback)
      console.log('Trying admin fallback...');
      await this.loadAllBookingsForAdmin();
    }
  }

    /**
   * Load only public booking info for invited users
   */
  private async loadPublicBookingsOnly(): Promise<void> {
    console.log('Loading public bookings only...');

    try {
      // For now, load all bookings and filter client-side to avoid permission issues
      // This is a temporary solution until we implement proper security rules
      const allBookingsQuery = query(
        collection(this.firestore, 'bookings'),
        orderBy('createdAt', 'desc')
      );

      const allBookingsSnapshot = await getDocs(allBookingsQuery);
      console.log('All bookings query result - Size:', allBookingsSnapshot.size);

      const publicBookings: Booking[] = [];

      allBookingsSnapshot.forEach((doc) => {
        const bookingData = doc.data();
        console.log('Booking data:', bookingData);

        // Only include confirmed bookings for public view
        if (bookingData['status'] === 'confirmed') {
          // Create a minimal booking with only public info
          const publicBooking: Booking = {
            id: doc.id,
            data: bookingData['data'] || '',
            hora: bookingData['hora'] || '',
            duration: bookingData['duration'] || 60,
            status: bookingData['status'] || 'confirmed',
            createdAt: bookingData['createdAt'],
            updatedAt: bookingData['updatedAt'],
            // Minimal info for public display
            nom: 'Ocupat',
            serviceName: 'Servei reservat',
            editToken: bookingData['editToken'],
            uid: bookingData['uid']
          };
          publicBookings.push(publicBooking);
        }
      });

      console.log('Public bookings loaded:', publicBookings.length);

      // Sort by date
      publicBookings.sort((a, b) => {
        if (a.data && b.data) {
          const dateA = new Date(a.data);
          const dateB = new Date(b.data);
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      });

      this.bookingsSignal.set(publicBookings);
    } catch (error) {
      console.error('Error loading public bookings:', error);
      // If query fails, set empty array
      console.log('Setting empty bookings array due to error');
      this.bookingsSignal.set([]);
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      const docRef = doc(this.firestore, 'bookings', bookingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const bookingData = docSnap.data();

        const booking: Booking = {
          id: docSnap.id,
          nom: bookingData['nom'] || '',
          email: bookingData['email'] || '',
          data: bookingData['data'] || '',
          hora: bookingData['hora'] || '',
          serviceName: bookingData['serviceName'] || '',
          serviceId: bookingData['serviceId'] || '',
          duration: bookingData['duration'] || 60,
          price: bookingData['price'] || 0,
          notes: bookingData['notes'] || '',
          status: bookingData['status'] || 'draft',
          editToken: bookingData['editToken'],
          uid: bookingData['uid'],
          createdAt: bookingData['createdAt'],
          updatedAt: bookingData['updatedAt'],
          // Campos legacy
          title: bookingData['title'] || bookingData['nom'] || '',
          start: bookingData['start'] || `${bookingData['data']}T${bookingData['hora']}`,
          servei: bookingData['servei'] || bookingData['serviceName'] || '',
          preu: bookingData['preu'] || bookingData['price'] || 0,
          userId: bookingData['userId'] || bookingData['uid'] || '',
          clientName: bookingData['clientName'] || bookingData['nom'] || ''
        };

        // Verify ownership
        if (booking.uid !== currentUser.uid) {
          throw new Error('Access denied');
        }

        return booking;
      }

      return null;
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      return null;
    }
  }

  /**
   * Delete booking
   */
  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Get current booking to verify ownership
      const currentBooking = await this.getBookingById(bookingId);
      if (!currentBooking) {
        throw new Error('Booking not found');
      }

      if (currentBooking.uid !== currentUser.uid) {
        throw new Error('Access denied');
      }

      // Delete from Firestore
      const docRef = doc(this.firestore, 'bookings', bookingId);
      await deleteDoc(docRef);

      // Update local state
      this.bookingsSignal.update(bookings =>
        bookings.filter(booking => booking.id !== bookingId)
      );

      this.toastService.showSuccess('Booking deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error deleting booking');
      this.toastService.showGenericError('Error deleting booking');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get bookings for a specific date
   */
  getBookingsForDate(date: string): Booking[] {
    return this.bookings().filter(booking => booking.data === date);
  }

  /**
   * Get bookings for a date range
   */
  getBookingsForDateRange(startDate: string, endDate: string): Booking[] {
    return this.bookings().filter(booking => {
      const bookingDate = booking.data;
      return bookingDate && bookingDate >= startDate && bookingDate <= endDate;
    });
  }

  /**
   * Get upcoming bookings (only confirmed ones with dates)
   */
  getUpcomingBookings(): Booking[] {
    const now = new Date();
    return this.bookings().filter(booking => {
      if (!booking.data || booking.status !== 'confirmed') return false;
      const bookingDate = new Date(booking.data);
      return bookingDate > now;
    });
  }

  /**
   * Get past bookings (only confirmed ones with dates)
   */
  getPastBookings(): Booking[] {
    const now = new Date();
    return this.bookings().filter(booking => {
      if (!booking.data || booking.status !== 'confirmed') return false;
      const bookingDate = new Date(booking.data);
      return bookingDate < now;
    });
  }

  /**
   * Get draft bookings (minimal bookings not yet completed)
   */
  getDraftBookings(): Booking[] {
    return this.bookings().filter(booking => booking.status === 'draft');
  }

  /**
   * Check if a booking is complete (has all required information)
   */
  isBookingComplete(booking: Booking): boolean {
    return !!(
      booking.nom &&
      booking.email &&
      booking.data &&
      booking.hora &&
      booking.serviceName &&
      booking.serviceId &&
      booking.duration &&
      booking.price &&
      booking.status === 'confirmed'
    );
  }

  /**
   * Check if a booking is public (minimal info only)
   */
  isPublicBooking(booking: Booking): boolean {
    return booking.nom === 'Ocupat' && booking.serviceName === 'Servei reservat';
  }

  /**
   * Check if a booking belongs to the current user
   */
  isOwnBooking(booking: Booking): boolean {
    const currentUser = this.authService.user();
    return currentUser?.uid === booking.uid;
  }

  /**
   * Load anonymous booking by token
   */
  async loadAnonymousBooking(token: string): Promise<Booking | null> {
    try {
      const bookingsQuery = query(
        collection(this.firestore, 'bookings'),
        where('editToken', '==', token)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);

      if (bookingsSnapshot.empty) {
        return null;
      }

      const doc = bookingsSnapshot.docs[0];
      const bookingData = doc.data();

      const booking: Booking = {
        id: doc.id,
        nom: bookingData['nom'] || '',
        email: bookingData['email'] || '',
        data: bookingData['data'] || '',
        hora: bookingData['hora'] || '',
        serviceName: bookingData['serviceName'] || '',
        serviceId: bookingData['serviceId'] || '',
        duration: bookingData['duration'] || 60,
        price: bookingData['price'] || 0,
        notes: bookingData['notes'] || '',
        status: bookingData['status'] || 'draft',
        editToken: bookingData['editToken'],
        uid: bookingData['uid'],
        createdAt: bookingData['createdAt'],
        updatedAt: bookingData['updatedAt'],
        // Campos legacy
        title: bookingData['title'] || bookingData['nom'] || '',
        start: bookingData['start'] || `${bookingData['data']}T${bookingData['hora']}`,
        servei: bookingData['servei'] || bookingData['serviceName'] || '',
        preu: bookingData['preu'] || bookingData['price'] || 0,
        userId: bookingData['userId'] || bookingData['uid'] || '',
        clientName: bookingData['clientName'] || bookingData['nom'] || ''
      };

      return booking;
    } catch (error) {
      console.error('Error loading anonymous booking:', error);
      return null;
    }
  }

  /**
   * Update anonymous booking
   */
  async updateAnonymousBooking(bookingId: string, updates: Partial<Booking>, token: string): Promise<boolean> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      // Verify token
      const currentBooking = await this.loadAnonymousBooking(token);
      if (!currentBooking || currentBooking.id !== bookingId) {
        throw new Error('Invalid token or booking not found');
      }

      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Update in Firestore
      const docRef = doc(this.firestore, 'bookings', bookingId);
      await updateDoc(docRef, updateData);

      this.toastService.showSuccess('Booking updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating anonymous booking:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error updating booking');
      this.toastService.showGenericError('Error updating booking');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Refresh bookings from server
   */
  async refreshBookings(): Promise<void> {
    await this.loadBookings();
  }
}
