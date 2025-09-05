import { Injectable, signal, computed, inject } from '@angular/core';
import { FirebaseService, FirebaseServicesService } from '../../../../core/services/firebase-services.service';
import { Booking } from '../../../../core/interfaces/booking.interface';
import { TimeSlot, DaySlot } from '../../../../shared/utils/time.utils';
import { BookingDetails } from '../../../../shared/components/booking-popup/booking-popup.component';
import { BookingService } from '../../../../core/services/booking.service';
import { BookingValidationService } from '../../../../core/services/booking-validation.service';
import { DateTimeAvailabilityService } from '../../../../core/services/date-time-availability.service';
import { DateTimeSelectionService } from './date-time-selection.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';

// Unified booking step type
export type BookingStep = 'service' | 'datetime' | 'confirmation' | 'success';

@Injectable({
  providedIn: 'root',
})
export class BookingStateService {
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly bookingService = inject(BookingService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly dateTimeSelectionService = inject(DateTimeSelectionService);
  private readonly timeUtils = inject(TimeUtils);
  private readonly dateTimeAvailabilityService = inject(DateTimeAvailabilityService);

  // ===== PERSISTENCE KEYS =====
  private readonly STORAGE_KEYS = {
    currentStep: 'booking_current_step',
    selectedService: 'booking_selected_service',
    selectedDate: 'booking_selected_date',
    selectedTimeSlot: 'booking_selected_time_slot',
    viewDate: 'booking_view_date',
    viewMode: 'booking_view_mode',
    bookingDetails: 'booking_details'
  };
  // ===== STATE SIGNALS =====

  // Step management signals (Mobile only)
  private readonly currentStepSignal = signal<BookingStep>('service');
  private readonly selectedTimeSlotSignal = signal<TimeSlot | null>(null);
  private readonly createdBookingSignal = signal<Booking | null>(null);

  // Internal state signals
  private readonly selectedDateSignal = signal<Date | null>(null);
  private readonly viewDateSignal = signal<Date>(new Date());
  private readonly selectedServiceSignal = signal<FirebaseService | null>(null);
  private readonly appointmentsSignal = signal<Booking[]>([]);
  private readonly viewModeSignal = signal<'week' | 'month'>('week');

  // Services cache
  private readonly servicesCache = signal<FirebaseService[]>([]);
  private readonly servicesCacheLoaded = signal<boolean>(false);

  // Booking details signal
  private readonly bookingDetailsSignal = signal<BookingDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });

  constructor() {
    // Load persisted state on initialization
    this.loadPersistedState();

    // Listen for service updates from admin panel
    window.addEventListener('serviceUpdated', () => {
      this.refreshServicesCache();
    });
  }

  // Desktop popup signals
  readonly showServiceSelectionPopupSignal = signal(false);
  readonly showBookingPopupSignal = signal(false);
  readonly serviceSelectionDetailsSignal = signal({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });
  readonly showLoginPromptSignal = signal(false);

  // ===== COMPUTED PROPERTIES =====

  readonly currentStep = computed(() => this.currentStepSignal());
  readonly selectedTimeSlot = computed(() => this.selectedTimeSlotSignal());
  readonly selectedDate = computed(() => this.dateTimeSelectionService.selectedDate());
  readonly viewDate = computed(() => this.viewDateSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal() || undefined);
  readonly appointments = computed(() => this.appointmentsSignal());
  readonly viewMode = computed(() => this.viewModeSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly createdBooking = computed(() => this.createdBookingSignal());

  // Desktop popup computed properties
  readonly showServiceSelectionPopup = computed(() => this.showServiceSelectionPopupSignal());
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly serviceSelectionDetails = computed(() => this.serviceSelectionDetailsSignal());
  readonly showLoginPrompt = computed(() => this.showLoginPromptSignal());

  // Available services from cache or centralized service
  readonly availableServices = computed(() => {
    if (this.servicesCacheLoaded()) {
      return this.servicesCache() || [];
    }
    return this.firebaseServicesService.activeServices() || [];
  });

  // Recently booked services (3 most recent unique services)
  readonly recentlyBookedServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.availableServices().filter(service =>
      recentServiceIds.includes(service.id || '')
    );
  });

  // Popular services (services with popular flag, but not recently booked)
  readonly popularServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.availableServices().filter(service =>
      service.isPopular === true &&
      !recentServiceIds.includes(service.id || '')
    );
  });

  // Other services (non-popular services and not recently booked)
  readonly otherServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.availableServices().filter(service =>
      service.isPopular !== true &&
      !recentServiceIds.includes(service.id || '')
    );
  });

  // Week days computation - show all days of the week
  readonly weekDays = computed(() => {
    const currentDate = this.viewDate();
    return this.timeUtils.getWeekDays(currentDate);
  });

  // Month days computation - show all days of the month
  readonly monthDays = computed(() => {
    const currentDate = this.viewDate();
    return this.timeUtils.getMonthDays(currentDate);
  });

  // Current view days
  readonly currentViewDays = computed(() => {
    return this.viewMode() === 'week' ? this.weekDays() : this.monthDays();
  });

  // Day slots computation
  readonly daySlots = computed(() => {
    const selectedService = this.selectedService();
    if (!selectedService) {
      return this.currentViewDays().map((day: Date) => ({
        date: day,
        timeSlots: [],
      }));
    }

    return this.currentViewDays().map((day: Date) => {
      const timeSlots = selectedService.id
        ? this.dateTimeAvailabilityService.getAvailableTimeSlotsForDate(
            day,
            selectedService.id,
            { includeUnavailable: true }
          )
        : [];

      return {
        date: day,
        timeSlots,
      };
    });
  });

  // ===== STATE MANAGEMENT METHODS =====

  // Step management
  setCurrentStep(step: BookingStep): void {
    this.currentStepSignal.set(step);
    this.savePersistedState();
  }

  // Service selection
  setSelectedService(service: FirebaseService | null): void {
    this.selectedServiceSignal.set(service);
    // Clear related selections when service changes
    if (service === null) {
      this.selectedDateSignal.set(null);
      this.selectedTimeSlotSignal.set(null);
    }
    this.savePersistedState();
  }

  // Date selection
  setSelectedDate(date: Date | null): void {
    if (date) {
      this.dateTimeSelectionService.setSelectedDateFromDate(date);
    } else {
      this.dateTimeSelectionService.resetDateSelection();
    }
    this.savePersistedState();
  }

  // Time slot selection
  setSelectedTimeSlot(timeSlot: TimeSlot | null): void {
    if (timeSlot) {
      this.dateTimeSelectionService.setSelectedTime(timeSlot.time);
    } else {
      this.dateTimeSelectionService.resetTimeSelection();
    }
    this.selectedTimeSlotSignal.set(timeSlot);
    this.savePersistedState();
  }

  // View management
  setViewDate(date: Date): void {
    this.viewDateSignal.set(date);
    this.savePersistedState();
  }

  setViewMode(mode: 'week' | 'month'): void {
    this.viewModeSignal.set(mode);
    this.savePersistedState();
  }

  // Appointments management
  setAppointments(appointments: Booking[]): void {
    this.appointmentsSignal.set(appointments);
  }

  // Booking details management
  setBookingDetails(details: BookingDetails): void {
    this.bookingDetailsSignal.set(details);
  }

  updateBookingDetails(updates: Partial<BookingDetails>): void {
    this.bookingDetailsSignal.update(current => ({ ...current, ...updates }));
    this.savePersistedState();
  }

  // Created booking management
  setCreatedBooking(booking: Booking | null): void {
    this.createdBookingSignal.set(booking);
  }

  // Desktop popup management
  setShowServiceSelectionPopup(show: boolean): void {
    this.showServiceSelectionPopupSignal.set(show);
  }

  setShowBookingPopup(show: boolean): void {
    this.showBookingPopupSignal.set(show);
  }

  setServiceSelectionDetails(details: any): void {
    this.serviceSelectionDetailsSignal.set(details);
  }

  setShowLoginPrompt(show: boolean): void {
    this.showLoginPromptSignal.set(show);
  }

  // ===== RESET METHODS =====

  resetBookingState(): void {
    this.currentStepSignal.set('service');
    this.selectedServiceSignal.set(null);
    this.selectedDateSignal.set(null);
    this.selectedTimeSlotSignal.set(null);
    this.createdBookingSignal.set(null);
    this.bookingDetailsSignal.set({
      date: '',
      time: '',
      clientName: '',
      email: '',
    });
    this.clearPersistedState();
  }

  resetDesktopPopups(): void {
    this.showServiceSelectionPopupSignal.set(false);
    this.showBookingPopupSignal.set(false);
    this.showLoginPromptSignal.set(false);
  }

  // ===== PERSISTENCE METHODS =====

  private loadPersistedState(): void {
    try {
      // Load current step
      const savedStep = localStorage.getItem(this.STORAGE_KEYS.currentStep);
      if (savedStep && ['service', 'datetime', 'confirmation', 'success'].includes(savedStep)) {
        this.currentStepSignal.set(savedStep as BookingStep);
      }

      // Load selected service
      const savedService = localStorage.getItem(this.STORAGE_KEYS.selectedService);
      if (savedService) {
        try {
          const service = JSON.parse(savedService);
          this.selectedServiceSignal.set(service);
        } catch (e) {
          console.warn('Failed to parse saved service:', e);
        }
      }

      // Load selected date
      const savedDate = localStorage.getItem(this.STORAGE_KEYS.selectedDate);
      if (savedDate) {
        const date = new Date(savedDate);
        if (!isNaN(date.getTime())) {
          this.selectedDateSignal.set(date);
        }
      }

      // Load selected time slot
      const savedTimeSlot = localStorage.getItem(this.STORAGE_KEYS.selectedTimeSlot);
      if (savedTimeSlot) {
        try {
          const timeSlot = JSON.parse(savedTimeSlot);
          this.selectedTimeSlotSignal.set(timeSlot);
        } catch (e) {
          console.warn('Failed to parse saved time slot:', e);
        }
      }

      // Load view date
      const savedViewDate = localStorage.getItem(this.STORAGE_KEYS.viewDate);
      if (savedViewDate) {
        const date = new Date(savedViewDate);
        if (!isNaN(date.getTime())) {
          this.viewDateSignal.set(date);
        }
      }

      // Load view mode
      const savedViewMode = localStorage.getItem(this.STORAGE_KEYS.viewMode);
      if (savedViewMode && ['week', 'month'].includes(savedViewMode)) {
        this.viewModeSignal.set(savedViewMode as 'week' | 'month');
      }

      // Load booking details
      const savedBookingDetails = localStorage.getItem(this.STORAGE_KEYS.bookingDetails);
      if (savedBookingDetails) {
        try {
          const details = JSON.parse(savedBookingDetails);
          this.bookingDetailsSignal.set(details);
        } catch (e) {
          console.warn('Failed to parse saved booking details:', e);
        }
      }

      console.log('Persisted state loaded successfully');
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  }

  private savePersistedState(): void {
    try {
      // Save current step
      localStorage.setItem(this.STORAGE_KEYS.currentStep, this.currentStepSignal());

      // Save selected service
      const selectedService = this.selectedServiceSignal();
      if (selectedService) {
        localStorage.setItem(this.STORAGE_KEYS.selectedService, JSON.stringify(selectedService));
      } else {
        localStorage.removeItem(this.STORAGE_KEYS.selectedService);
      }

      // Save selected date
      const selectedDate = this.selectedDateSignal();
      if (selectedDate) {
        localStorage.setItem(this.STORAGE_KEYS.selectedDate, selectedDate.toISOString());
      } else {
        localStorage.removeItem(this.STORAGE_KEYS.selectedDate);
      }

      // Save selected time slot
      const selectedTimeSlot = this.selectedTimeSlotSignal();
      if (selectedTimeSlot) {
        localStorage.setItem(this.STORAGE_KEYS.selectedTimeSlot, JSON.stringify(selectedTimeSlot));
      } else {
        localStorage.removeItem(this.STORAGE_KEYS.selectedTimeSlot);
      }

      // Save view date
      localStorage.setItem(this.STORAGE_KEYS.viewDate, this.viewDateSignal().toISOString());

      // Save view mode
      localStorage.setItem(this.STORAGE_KEYS.viewMode, this.viewModeSignal());

      // Save booking details
      localStorage.setItem(this.STORAGE_KEYS.bookingDetails, JSON.stringify(this.bookingDetailsSignal()));

    } catch (error) {
      console.error('Error saving persisted state:', error);
    }
  }

  private clearPersistedState(): void {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('Persisted state cleared');
    } catch (error) {
      console.error('Error clearing persisted state:', error);
    }
  }

  // ===== SERVICES CACHE METHODS =====

  /**
   * Load services into cache
   */
  async loadServicesCache(): Promise<void> {
    if (this.servicesCacheLoaded()) {
      return; // Already loaded
    }

    try {
      await this.firebaseServicesService.loadServices();
      const services = this.firebaseServicesService.activeServices();
      this.servicesCache.set(services);
      this.servicesCacheLoaded.set(true);
    } catch (error) {
      console.error('Error loading services cache:', error);
      throw error;
    }
  }

  /**
   * Force refresh services cache
   */
  async refreshServicesCache(): Promise<void> {
    this.servicesCacheLoaded.set(false);
    await this.loadServicesCache();
  }

  /**
   * Check if services cache is loaded
   */
  isServicesCacheLoaded(): boolean {
    return this.servicesCacheLoaded();
  }

  // ===== MANUAL BOOKING METHODS =====

  /**
   * Create a booking manually (for manual booking component)
   */
  async createBooking(bookingData: any): Promise<Booking | null> {
    try {
      const booking = await this.bookingService.createBooking(bookingData, true);

      if (booking) {
        // Refresh appointments to include the new booking
        await this.bookingService.refreshBookings();
        const bookings = this.bookingService.bookings();
        this.setAppointments(bookings);

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('bookingUpdated'));
      }

      return booking;
    } catch (error) {
      console.error('Error creating manual booking:', error);
      throw error;
    }
  }
}
