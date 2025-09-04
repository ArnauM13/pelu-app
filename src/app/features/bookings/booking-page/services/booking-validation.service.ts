import { Injectable, computed, inject } from '@angular/core';
import { BookingStateService } from './booking-state.service';
import { BookingValidationService as CoreBookingValidationService } from '../../../../core/services/booking-validation.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { BookingService } from '../../../../core/services/booking.service';
import { SystemParametersService } from '../../../../core/services/system-parameters.service';

@Injectable()
export class BookingValidationService {
  private readonly bookingStateService = inject(BookingStateService);
  private readonly coreBookingValidationService = inject(CoreBookingValidationService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly systemParametersService = inject(SystemParametersService);

  // ===== COMPUTED PROPERTIES =====

  // Authentication and user state
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userAppointments = computed(() =>
    this.bookingStateService.appointments().filter((b) => this.bookingService.isOwnBooking(b))
  );

  // Check if user has reached appointment limit for first screen validation
  readonly hasReachedAppointmentLimit = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Check if user should be blocked from proceeding to next steps
  readonly isUserBlockedFromBooking = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Business configuration
  readonly businessHours = computed(() => this.systemParametersService.getBusinessHours());
  readonly lunchBreak = computed(() => this.systemParametersService.getLunchBreak());
  readonly businessDays = computed(() => this.systemParametersService.getWorkingDays());
  readonly slotDuration = computed(() => this.systemParametersService.getAppointmentDuration());

  // Mobile step validation computed signals
  readonly canProceedToDateTime = computed(() => {
    if (this.isUserBlockedFromBooking()) {
      return false;
    }
    return !!this.bookingStateService.selectedService();
  });

  readonly canProceedToConfirmation = computed(() => {
    if (this.isUserBlockedFromBooking()) {
      return false;
    }

    const selectedService = this.bookingStateService.selectedService();
    const selectedDate = this.bookingStateService.selectedDate();
    const selectedTimeSlot = this.bookingStateService.selectedTimeSlot();

    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      return false;
    }

    return this.coreBookingValidationService.canBookServiceAtTime(
      selectedDate,
      selectedTimeSlot.time,
      selectedService.duration,
      this.bookingStateService.appointments()
    );
  });

  readonly canGoBack = computed(() => {
    const step = this.bookingStateService.currentStep();
    return step === 'datetime' || step === 'confirmation';
  });

  readonly canProceedToNextStep = computed(() => {
    if (this.isUserBlockedFromBooking()) {
      return false;
    }

    const step = this.bookingStateService.currentStep();
    if (step === 'service') {
      return this.canProceedToDateTime();
    } else if (step === 'datetime') {
      return this.canProceedToConfirmation();
    } else if (step === 'confirmation') {
      return this.canConfirmBooking();
    }
    return false;
  });

  // Fixed reactive computed for booking confirmation
  readonly canConfirmBooking = computed(() => {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (!this.canUserBookMoreAppointments()) {
      return false;
    }

    const details = this.bookingStateService.bookingDetails();
    const hasClientName = details.clientName && details.clientName.trim().length > 0;
    const hasEmail = details.email && details.email.trim().length > 0;
    const selectedService = this.bookingStateService.selectedService();
    const selectedDate = this.bookingStateService.selectedDate();
    const selectedTimeSlot = this.bookingStateService.selectedTimeSlot();

    if (!hasClientName || !hasEmail || !selectedService || !selectedDate || !selectedTimeSlot) {
      return false;
    }

    return this.coreBookingValidationService.canBookServiceAtTime(
      selectedDate,
      selectedTimeSlot.time,
      selectedService.duration,
      this.bookingStateService.appointments()
    );
  });

  // Check if calendar should be blocked due to appointment limit
  readonly isCalendarBlocked = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // ===== VALIDATION METHODS =====

  canUserBookMoreAppointments(): boolean {
    const currentBookings = this.bookingService.bookings();
    return this.coreBookingValidationService.canUserBookMoreAppointments(currentBookings);
  }

  getUserAppointmentCount(): number {
    const currentBookings = this.bookingService.bookings();
    return this.coreBookingValidationService.getUserAppointmentCount(currentBookings);
  }

  getMaxAppointmentsPerUser(): number {
    return this.systemParametersService.getMaxAppointmentsPerUser();
  }

  // Check if a specific day has no available appointments for the selected service
  hasNoAvailableAppointmentsForDay(day: Date): boolean {
    const selectedService = this.bookingStateService.selectedService();
    if (!selectedService) {
      return false;
    }

    const daySlots = this.coreBookingValidationService.generateTimeSlotsForService(
      day,
      selectedService.duration,
      this.bookingStateService.appointments()
    );
    return daySlots.every(slot => !slot.available);
  }

  isFullyBookedWorkingDay(day: Date): boolean {
    return this.coreBookingValidationService.canBookOnDate(day) && this.hasNoAvailableAppointmentsForDay(day);
  }

  // Check if a day is a fully booked working day for the selected service duration
  isFullyBookedWorkingDayForService(day: Date): boolean {
    if (!this.coreBookingValidationService.canBookOnDate(day)) return false;

    const selectedService = this.bookingStateService.selectedService();
    if (!selectedService) return false;

    return !this.hasEnoughSpaceForService(day, selectedService);
  }

  // Check if there's enough space for the selected service on a given day
  private hasEnoughSpaceForService(day: Date, service: any): boolean {
    const daySlots = this.coreBookingValidationService.generateTimeSlotsForService(
      day,
      service.duration,
      this.bookingStateService.appointments()
    );

    return daySlots.some(slot => slot.available);
  }

  canSelectDate(date: Date): boolean {
    if (!this.coreBookingValidationService.canBookOnDate(date) ||
        !this.coreBookingValidationService.canBookInAdvance(date) ||
        this.isPastDate(date)) {
      return false;
    }

    if (this.bookingStateService.viewMode() === 'week') {
      return true;
    } else {
      const currentDate = this.bookingStateService.viewDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const isInCurrentMonth =
        date.getMonth() === currentMonth && date.getFullYear() === currentYear;

      return isInCurrentMonth;
    }
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isBusinessDay(date: Date): boolean {
    return this.coreBookingValidationService.canBookOnDate(date);
  }
}
