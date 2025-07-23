import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { RoleService } from './role.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoggerService } from '../../shared/services/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { isPastDateTime } from '../../shared/services/appointment-utils';

export interface Booking {
  id?: string;
  nom?: string;
  email?: string;
  data?: string;
  hora?: string;
  serviceName?: string;
  serviceId?: string;
  duration?: number;
  price?: number;
  notes?: string;
  status?: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  editToken: string;
  uid?: string | null;
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

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);
  private readonly logger = inject(LoggerService);

  // Signals
  private readonly bookingsSignal = signal<Booking[]>([]);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly isInitializedSignal = signal<boolean>(false);
  private readonly lastCacheTimeSignal = signal<number>(0);

  // Computed properties
  readonly bookings = computed(() => this.bookingsSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly isInitialized = computed(() => this.isInitializedSignal());
  readonly hasCachedData = computed(
    () => this.bookingsSignal().length > 0 && this.isInitializedSignal()
  );

  constructor() {
    // Only load bookings if we don't have cached data
    if (!this.hasCachedData()) {
      this.loadBookings();
    }

    // Set up a periodic check for auth state changes to clear cache on logout
    setInterval(() => {
      if (!this.authService.isAuthenticated() && this.hasCachedData()) {
        // User logged out, clear cache
        this.clearCache();
      }
    }, 1000); // Check every second
  }

  /**
   * Create a complete booking with all required information
   */
  async createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Booking | null> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required for complete bookings');
      }

      // Validate that the booking is not in the past
      if (isPastDateTime(bookingData.data || '', bookingData.hora || '')) {
        throw new Error('ERROR_PAST_BOOKING');
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
        clientName: bookingData.clientName || bookingData.nom || '',
      };

      // Save to Firestore
      const docRef = await addDoc(collection(this.firestore, 'bookings'), booking);

      // Create new booking with ID
      const newBooking: Booking = {
        ...booking,
        id: docRef.id,
      };

      // Update local state
      this.bookingsSignal.update(bookings => [newBooking, ...bookings]);

      this.toastService.showAppointmentCreated(bookingData.nom || 'Client', docRef.id);

      return newBooking;
    } catch (error) {
      const currentUser = this.authService.user();

      // Log detallat de l'error
      this.logger.firebaseError(error, 'createBooking', {
        component: 'BookingService',
        method: 'createBooking',
        userId: currentUser?.uid,
        data: { bookingData: { ...bookingData, email: '[REDACTED]' } },
      });

      const errorMessage = error instanceof Error ? error.message : 'Error creating booking';
      this.errorSignal.set(errorMessage);

      // Show translated error message
      if (errorMessage === 'ERROR_PAST_BOOKING') {
        this.toastService.showGenericError('COMMON.ERROR_PAST_BOOKING');
      } else {
        this.toastService.showGenericError('Error creating booking');
      }
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

      // Validate that the updated booking is not in the past
      if (updates.data && updates.hora && isPastDateTime(updates.data, updates.hora)) {
        throw new Error('ERROR_PAST_BOOKING');
      }

      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Update in Firestore
      const docRef = doc(this.firestore, 'bookings', bookingId);
      await updateDoc(docRef, updateData);

      // Update local state
      this.bookingsSignal.update(bookings =>
        bookings.map(booking =>
          booking.id === bookingId ? { ...booking, ...updates, updatedAt: new Date() } : booking
        )
      );

      return true;
    } catch (error) {
      const currentUser = this.authService.user();

      // Log detallat de l'error
      this.logger.firebaseError(error, 'updateBooking', {
        component: 'BookingService',
        method: 'updateBooking',
        userId: currentUser?.uid,
        data: { bookingId, updates: { ...updates, email: '[REDACTED]' } },
      });

      const errorMessage = error instanceof Error ? error.message : 'Error updating booking';
      this.errorSignal.set(errorMessage);

      // Show translated error message
      if (errorMessage === 'ERROR_PAST_BOOKING') {
        this.toastService.showGenericError('COMMON.ERROR_PAST_BOOKING');
      } else {
        this.toastService.showGenericError('Error updating booking');
      }
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

      if (isAdmin) {
        // Super Admin: Load all bookings with full details
        await this.loadAllBookingsForAdmin();
      } else if (currentUser?.uid) {
        // Authenticated User: Load own bookings
        await this.loadUserBookings(currentUser.uid);
      } else {
        // Invited User: Load only public booking info
        await this.loadPublicBookingsOnly();
      }

      // Mark as initialized and update cache time
      this.isInitializedSignal.set(true);
      this.lastCacheTimeSignal.set(Date.now());
    } catch (error) {
      const currentUser = this.authService.user();

      // Log detallat de l'error
      this.logger.firebaseError(error, 'loadBookings', {
        component: 'BookingService',
        method: 'loadBookings',
        userId: currentUser?.uid,
      });

      this.errorSignal.set(error instanceof Error ? error.message : 'Error loading bookings');
      // Don't show toast for loading errors - they're not user-initiated actions
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Wait for authentication to be initialized
   */
  private async waitForAuthInitialization(): Promise<void> {
    return new Promise(resolve => {
      const checkAuth = () => {
        if (this.authService.isInitialized()) {
          resolve();
        } else {
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
    const bookingsQuery = query(
      collection(this.firestore, 'bookings'),
      orderBy('createdAt', 'desc')
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings: Booking[] = [];

    bookingsSnapshot.forEach(doc => {
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
        clientName: bookingData['clientName'] || bookingData['nom'] || '',
      };
      bookings.push(booking);
    });

    this.bookingsSignal.set(bookings);
  }

  /**
   * Load user's own bookings
   */
  private async loadUserBookings(userId: string): Promise<void> {
    try {
      // Load user's own bookings with full details
      const userBookingsQuery = query(
        collection(this.firestore, 'bookings'),
        where('uid', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const userBookingsSnapshot = await getDocs(userBookingsQuery);
      const userBookings: Booking[] = [];

      userBookingsSnapshot.forEach(doc => {
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
          clientName: bookingData['clientName'] || bookingData['nom'] || '',
        };
        userBookings.push(booking);
      });

      // Sort by date
      userBookings.sort((a, b) => {
        if (a.data && b.data) {
          const dateA = new Date(a.data);
          const dateB = new Date(b.data);
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      });

      this.bookingsSignal.set(userBookings);
    } catch (error) {
      // Log detallat de l'error
      this.logger.firebaseError(error, 'loadUserBookings', {
        component: 'BookingService',
        method: 'loadUserBookings',
        userId: userId,
      });

      // If user query fails, try loading all bookings (admin fallback)
      await this.loadAllBookingsForAdmin();
    }
  }

  /**
   * Load only public booking info for invited users
   */
  private async loadPublicBookingsOnly(): Promise<void> {
    try {
      // Load all bookings and filter client-side to avoid permission issues
      const allBookingsQuery = query(
        collection(this.firestore, 'bookings'),
        orderBy('createdAt', 'desc')
      );

      const allBookingsSnapshot = await getDocs(allBookingsQuery);
      const publicBookings: Booking[] = [];

      allBookingsSnapshot.forEach(doc => {
        const bookingData = doc.data();

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
            uid: bookingData['uid'],
          };
          publicBookings.push(publicBooking);
        }
      });

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
      // Log detallat de l'error
      this.logger.firebaseError(error, 'loadPublicBookingsOnly', {
        component: 'BookingService',
        method: 'loadPublicBookingsOnly',
      });

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
          clientName: bookingData['clientName'] || bookingData['nom'] || '',
        };

        // Verify ownership
        if (booking.uid !== currentUser.uid) {
          throw new Error('Access denied');
        }

        return booking;
      }

      return null;
    } catch (error) {
      const currentUser = this.authService.user();

      // Log detallat de l'error
      this.logger.firebaseError(error, 'getBookingById', {
        component: 'BookingService',
        method: 'getBookingById',
        userId: currentUser?.uid,
        data: { bookingId },
      });

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
      this.bookingsSignal.update(bookings => bookings.filter(booking => booking.id !== bookingId));

      return true;
    } catch (error) {
      const currentUser = this.authService.user();

      // Log detallat de l'error
      this.logger.firebaseError(error, 'deleteBooking', {
        component: 'BookingService',
        method: 'deleteBooking',
        userId: currentUser?.uid,
        data: { bookingId },
      });

      this.errorSignal.set(error instanceof Error ? error.message : 'Error deleting booking');
      // Don't show toast here - let the component handle it
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
   * Refresh bookings from server
   */
  async refreshBookings(): Promise<void> {
    await this.loadBookings();
  }

  /**
   * Silently refresh bookings without showing loader
   */
  async silentRefreshBookings(): Promise<void> {
    try {
      // Don't set loading state for silent refresh
      const currentUser = this.authService.user();
      const isAdmin = this.roleService.isAdmin();

      if (isAdmin) {
        // Super Admin: Load all bookings with full details
        await this.loadAllBookingsForAdmin();
      } else if (currentUser?.uid) {
        // Authenticated User: Load own bookings
        await this.loadUserBookings(currentUser.uid);
      } else {
        // Invited User: Load only public booking info
        await this.loadPublicBookingsOnly();
      }

      // Update cache time
      this.lastCacheTimeSignal.set(Date.now());
    } catch (error) {
      const currentUser = this.authService.user();

      // Log detallat de l'error
      this.logger.firebaseError(error, 'silentRefreshBookings', {
        component: 'BookingService',
        method: 'silentRefreshBookings',
        userId: currentUser?.uid,
      });

      this.errorSignal.set(error instanceof Error ? error.message : 'Error loading bookings');
      // Don't show toast for silent refresh errors
    }
  }

  /**
   * Check if we need to refresh data based on cache age
   */
  private shouldRefreshCache(): boolean {
    const cacheAge = Date.now() - this.lastCacheTimeSignal();
    const maxCacheAge = 5 * 60 * 1000; // 5 minutes
    return cacheAge > maxCacheAge;
  }

  /**
   * Get bookings with cache support
   */
  async getBookingsWithCache(): Promise<Booking[]> {
    // If we have cached data and it's fresh, return it immediately
    if (this.hasCachedData() && !this.shouldRefreshCache()) {
      return this.bookings();
    }

    // If we need to refresh, do it silently
    if (this.hasCachedData()) {
      await this.silentRefreshBookings();
    } else {
      // First time loading
      await this.loadBookings();
    }

    return this.bookings();
  }

  /**
   * Clear cache when user logs out
   */
  clearCache(): void {
    this.bookingsSignal.set([]);
    this.isInitializedSignal.set(false);
    this.lastCacheTimeSignal.set(0);
  }
}
