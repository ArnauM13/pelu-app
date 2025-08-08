import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  serverTimestamp,
  orderBy,
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { RoleService } from './role.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoggerService } from '../../shared/services/logger.service';
import { BookingValidationService } from './booking-validation.service';
import { EmailService } from './email.service';
import { v4 as uuidv4 } from 'uuid';
import { Booking } from '../interfaces/booking.interface';


@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly emailService = inject(EmailService);

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
  readonly isAdmin = computed(() => this.roleService.isAdmin());
  readonly hasCachedData = computed(
    () => this.bookingsSignal().length > 0 && this.isInitializedSignal()
  );

  // Cache configuration - INCREASED CACHE DURATION
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (increased from 5)

  constructor() {
    // Only load bookings if we don't have cached data
    if (!this.hasCachedData()) {
      this.initializeBookings();
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
   * Initialize bookings with proper auth waiting
   */
  private async initializeBookings(): Promise<void> {
    await this.waitForAuthInitialization();
    await this.loadBookings();
  }

  /**
   * Create a complete booking with all required information
   */
  async createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt'>,
    showToast: boolean = true
  ): Promise<Booking | null> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required for complete bookings');
      }

      // Validate booking using the new validation service (skip validation for admins)
      if (!this.isAdmin()) {
        const bookingDate = new Date(bookingData.data || '');
        if (!this.bookingValidationService.canBookAppointment(bookingDate, bookingData.hora || '')) {
          throw new Error('ERROR_BOOKING_NOT_ALLOWED');
        }
      }

      // Generate unique UUID for the booking
      const uniqueId = uuidv4();

      const booking = {
        id: uniqueId,
        clientName: bookingData.clientName || '',
        email: bookingData.email || '',
        data: bookingData.data || '',
        hora: bookingData.hora || '',
        notes: bookingData.notes || '',
        serviceId: bookingData.serviceId || '',
        status: 'confirmed' as const,
        createdAt: serverTimestamp(),
      };

      // Save to Firestore with the unique ID
      await setDoc(doc(this.firestore, 'bookings', uniqueId), booking);

      // Create new booking with the unique ID
      const newBooking: Booking = {
        ...booking,
        id: uniqueId,
      };

      // Update local state
      this.bookingsSignal.update(bookings => [newBooking, ...bookings]);

      // Send confirmation email
      try {
        await this.emailService.sendBookingConfirmationEmail(newBooking);
      } catch (emailError) {
        // Log email error but don't fail the booking creation
        this.logger.error(emailError, {
          component: 'BookingService',
          method: 'createBooking',
          data: JSON.stringify({ bookingId: uniqueId, clientEmail: bookingData.email })
        });
      }

      if (showToast) {
        this.toastService.showAppointmentCreated(bookingData.clientName || 'Client', uniqueId);
      }

      return newBooking;
    } catch (error) {
      const currentUser = this.authService.user();

      // Log detallat de l'error
      this.logger.firebaseError(error, 'createBooking', {
        component: 'BookingService',
        method: 'createBooking',
        userId: currentUser?.uid,
        data: JSON.stringify({ bookingData: { ...bookingData, email: '[REDACTED]' } }),
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
   * Update a booking with partial data
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

      // Check if user is admin or owns the booking
      const isOwner = currentBooking.email === currentUser.email;

      if (!this.isAdmin() && !isOwner) {
        throw new Error('Access denied');
      }

      // Validate that the updated booking is allowed (skip validation for admins)
      if (updates.data && updates.hora && !this.isAdmin()) {
        const bookingDate = new Date(updates.data);
        if (!this.bookingValidationService.canBookAppointment(bookingDate, updates.hora)) {
          throw new Error('ERROR_BOOKING_NOT_ALLOWED');
        }
      }

      // Prepare update data
      const updateData = {
        ...updates,
      };

      // Update in Firestore
      const docRef = doc(this.firestore, 'bookings', bookingId);
      await updateDoc(docRef, updateData);

      // Update local state
      this.bookingsSignal.update(bookings =>
        bookings.map(booking =>
          booking.id === bookingId ? { ...booking, ...updates } : booking
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
        data: JSON.stringify({ bookingId, updates: { ...updates, email: '[REDACTED]' } }),
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
   * Load all bookings from Firebase - OPTIMIZED
   */
  async loadBookings(): Promise<void> {
    try {
      await this.waitForAuthInitialization();

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        this.bookingsSignal.set([]);
        this.isInitializedSignal.set(true);
        return;
      }

      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      await this.loadAllBookingsWithFullDetails();

      if (!this.isAdmin()) {
        this.filterSensitiveDetailsForNonAdmin(currentUser.email || '');
      }

      this.isInitializedSignal.set(true);
      this.lastCacheTimeSignal.set(Date.now());

    } catch (error) {
      this.logger.firebaseError(error, 'loadBookings', {
        component: 'BookingService',
        method: 'loadBookings',
      });

      const errorMessage = error instanceof Error ? error.message : 'Error loading bookings';
      this.errorSignal.set(errorMessage);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Load all bookings with full details from Firebase - OPTIMIZED
   */
  private async loadAllBookingsWithFullDetails(): Promise<void> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const q = query(bookingsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const bookings: Booking[] = [];
    querySnapshot.forEach(doc => {
      const bookingData = doc.data();

      const booking: Booking = {
        id: doc.id,
        clientName: bookingData['clientName'] || bookingData['nom'] || '',
        email: bookingData['email'] || '',
        data: bookingData['data'] || '',
        hora: bookingData['hora'] || '',
        serviceId: bookingData['serviceId'] || '',
        notes: bookingData['notes'] || '',
        status: bookingData['status'] || 'draft',
        createdAt: bookingData['createdAt'],
      };
      bookings.push(booking);
    });

    this.bookingsSignal.set(bookings);
  }

  /**
   * Filter sensitive details for non-admin users based on email ownership
   */
  private filterSensitiveDetailsForNonAdmin(userEmail: string): void {
    const currentBookings = this.bookingsSignal();
    const filteredBookings = currentBookings.map(booking => {
      // Check if the booking belongs to the current user by comparing emails
      const isOwnBooking = booking.email && booking.email.toLowerCase() === userEmail.toLowerCase();

      if (isOwnBooking) {
        // Keep full details for own bookings
        return booking;
      } else {
        // Hide sensitive details for bookings that don't belong to the user
        return {
          ...booking,
          clientName: 'Reservada',
          email: '', // Hide email
          notes: '', // Hide notes
        } as Booking;
      }
    });

    this.bookingsSignal.set(filteredBookings);
  }

  /**
   * Get booking by ID with validation - OPTIMIZED
   */
  async getBookingByIdWithToken(bookingId: string): Promise<Booking | null> {
    try {
      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // First check local cache
      const localBooking = this.bookings().find(booking => booking.id === bookingId);
      if (localBooking) {
        // Verify access: either ownership, valid token, or admin role
        const isOwner = localBooking.email === currentUser.email;

        if (isOwner || this.isAdmin()) {
          return localBooking;
        }
        return null;
      }

      // If not in cache, fetch from Firebase
      const docRef = doc(this.firestore, 'bookings', bookingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const bookingData = docSnap.data();

        const booking: Booking = {
          id: docSnap.id,
          clientName: bookingData['clientName'] || bookingData['nom'] || '',
          email: bookingData['email'] || '',
          data: bookingData['data'] || '',
          hora: bookingData['hora'] || '',
          serviceId: bookingData['serviceId'] || '',
          notes: bookingData['notes'] || '',
          status: bookingData['status'] || 'draft',
          createdAt: bookingData['createdAt'],
        };

        // Verify access: either ownership, valid token, or admin role
        const isOwner = booking.email === currentUser.email;

        if (isOwner || this.isAdmin()) {
          return booking;
        }

        return null;
      }

      return null;
    } catch (error) {
      this.logger.firebaseError(error, 'getBookingByIdWithToken', {
        component: 'BookingService',
        method: 'getBookingByIdWithToken',
      });
      return null;
    }
  }

  /**
   * Get booking by ID - OPTIMIZED to use cache first
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      // First check local cache
      const localBooking = this.bookings().find(booking => booking.id === bookingId);
      if (localBooking) {
        return localBooking;
      }

      // If not in cache, fetch from Firebase
      const docRef = doc(this.firestore, 'bookings', bookingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const bookingData = docSnap.data();

        const booking: Booking = {
          id: docSnap.id,
          clientName: bookingData['clientName'] || bookingData['nom'] || '',
          email: bookingData['email'] || '',
          data: bookingData['data'] || '',
          hora: bookingData['hora'] || '',
          serviceId: bookingData['serviceId'] || '',
          notes: bookingData['notes'] || '',
          status: bookingData['status'] || 'draft',
          createdAt: bookingData['createdAt'],
        };

        return booking;
      }

      return null;
    } catch (error) {
      this.logger.firebaseError(error, 'getBookingById', {
        component: 'BookingService',
        method: 'getBookingById',
      });
      return null;
    }
  }

  /**
   * Delete a booking
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

      // Check if user is admin or owns the booking
      const isOwner = currentBooking.email === currentUser.email;

      if (!this.isAdmin() && !isOwner) {
        throw new Error('Access denied');
      }

      // Delete from Firestore
      const docRef = doc(this.firestore, 'bookings', bookingId);
      await deleteDoc(docRef);

      // Update local state
      this.bookingsSignal.update(bookings =>
        bookings.filter(booking => booking.id !== bookingId)
      );

      return true;
    } catch (error) {
      const currentUser = this.authService.user();

      // Log detallat de l'error
      this.logger.firebaseError(error, 'deleteBooking', {
        component: 'BookingService',
        method: 'deleteBooking',
        userId: currentUser?.uid,
        data: JSON.stringify({ bookingId }),
      });

      const errorMessage = error instanceof Error ? error.message : 'Error deleting booking';
      this.errorSignal.set(errorMessage);

      // Don't show toast here - let the calling component handle it
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
      const bookingDate = new Date(booking.data);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return bookingDate >= start && bookingDate <= end;
    });
  }

  /**
   * Get upcoming bookings
   */
  getUpcomingBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.bookings().filter(booking => {
      const bookingDate = new Date(booking.data);
      return bookingDate >= today && booking.status !== 'cancelled';
    });
  }

  /**
   * Get past bookings
   */
  getPastBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.bookings().filter(booking => {
      const bookingDate = new Date(booking.data);
      return bookingDate < today;
    });
  }

  /**
   * Get draft bookings
   */
  getDraftBookings(): Booking[] {
    return this.bookings().filter(booking => booking.status === 'draft');
  }

  /**
   * Check if a booking is complete
   */
  isBookingComplete(booking: Booking): boolean {
    return !!(
      booking.clientName &&
      booking.email &&
      booking.data &&
      booking.hora &&
      booking.serviceId
    );
  }

  /**
   * Check if a booking belongs to the current user
   */
  isOwnBooking(booking: Booking): boolean {
    const currentUser = this.authService.user();
    return currentUser?.email === booking.email;
  }

  /**
   * Check if a booking belongs to a specific email
   */
  isOwnBookingByEmail(booking: Booking): boolean {
    const currentUser = this.authService.user();
    return currentUser?.email === booking.email;
  }

  /**
   * Refresh bookings from Firebase
   */
  async refreshBookings(): Promise<void> {
    this.clearCache();
    await this.loadBookings();
  }

  /**
   * Silent refresh bookings (without loading indicators) - OPTIMIZED
   */
  async silentRefreshBookings(): Promise<void> {
    try {
      await this.waitForAuthInitialization();

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        return;
      }

      await this.loadAllBookingsWithFullDetails();

      if (!this.isAdmin()) {
        this.filterSensitiveDetailsForNonAdmin(currentUser.email || '');
      }

      this.lastCacheTimeSignal.set(Date.now());

    } catch (error) {
      this.logger.firebaseError(error, 'silentRefreshBookings', {
        component: 'BookingService',
        method: 'silentRefreshBookings',
      });
    }
  }

  /**
   * Check if cache should be refreshed - OPTIMIZED
   */
  private shouldRefreshCache(): boolean {
    const lastSync = this.lastCacheTimeSignal();
    const now = Date.now();
    return now - lastSync > this.CACHE_DURATION;
  }

  /**
   * Get bookings with cache management - OPTIMIZED
   */
  async getBookingsWithCache(): Promise<Booking[]> {
    if (this.shouldRefreshCache()) {
      await this.silentRefreshBookings();
    }
    return this.bookings();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.bookingsSignal.set([]);
    this.isInitializedSignal.set(false);
    this.lastCacheTimeSignal.set(0);
  }

  /**
   * Generate booking URL
   */
  generateBookingUrl(booking: Booking): string {
    return `/appointments/${booking.id}`;
  }

  /**
   * Wait for auth initialization
   */
  private async waitForAuthInitialization(): Promise<void> {
    return new Promise((resolve) => {
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
}
