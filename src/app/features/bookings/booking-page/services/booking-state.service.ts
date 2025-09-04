import { Injectable, signal, computed, inject } from '@angular/core';
import { FirebaseService, FirebaseServicesService } from '../../../../core/services/firebase-services.service';
import { Booking } from '../../../../core/interfaces/booking.interface';
import { TimeSlot, DaySlot } from '../../../../shared/utils/time.utils';
import { BookingDetails } from '../../../../shared/components/booking-popup/booking-popup.component';
import { BookingService } from '../../../../core/services/booking.service';
import { BookingValidationService } from '../../../../core/services/booking-validation.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';

// Unified booking step type
export type BookingStep = 'service' | 'datetime' | 'confirmation' | 'success';

@Injectable()
export class BookingStateService {
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly bookingService = inject(BookingService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly timeUtils = inject(TimeUtils);
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

  // Booking details signal
  private readonly bookingDetailsSignal = signal<BookingDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });

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
  readonly selectedDate = computed(() => this.selectedDateSignal());
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

  // Available services from centralized service
  readonly availableServices = computed(() => this.firebaseServicesService.activeServices());

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

    return this.currentViewDays().map((day: Date) => ({
      date: day,
      timeSlots: this.bookingValidationService.generateTimeSlotsForService(
        day,
        selectedService.duration,
        this.appointments()
      ),
    }));
  });

  // ===== STATE MANAGEMENT METHODS =====

  // Step management
  setCurrentStep(step: BookingStep): void {
    this.currentStepSignal.set(step);
  }

  // Service selection
  setSelectedService(service: FirebaseService | null): void {
    this.selectedServiceSignal.set(service);
    // Clear related selections when service changes
    if (service === null) {
      this.selectedDateSignal.set(null);
      this.selectedTimeSlotSignal.set(null);
    }
  }

  // Date selection
  setSelectedDate(date: Date | null): void {
    this.selectedDateSignal.set(date);
    // Clear time slot when date changes
    if (date === null) {
      this.selectedTimeSlotSignal.set(null);
    }
  }

  // Time slot selection
  setSelectedTimeSlot(timeSlot: TimeSlot | null): void {
    this.selectedTimeSlotSignal.set(timeSlot);
  }

  // View management
  setViewDate(date: Date): void {
    this.viewDateSignal.set(date);
  }

  setViewMode(mode: 'week' | 'month'): void {
    this.viewModeSignal.set(mode);
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
  }

  resetDesktopPopups(): void {
    this.showServiceSelectionPopupSignal.set(false);
    this.showBookingPopupSignal.set(false);
    this.showLoginPromptSignal.set(false);
  }
}
