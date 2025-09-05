import { Injectable, inject, signal, computed } from '@angular/core';
import { BookingValidationService } from '../../../../core/services/booking-validation.service';
import { FirebaseServicesService, FirebaseService } from '../../../../core/services/firebase-services.service';
import { TimeSlot, TimeUtils } from '../../../../shared/utils/time.utils';
import { SelectOption } from '../../../../shared/components/inputs/input-select/input-select.component';
import { Booking } from '../../../../core/interfaces/booking.interface';
import { DateTimeAvailabilityService } from '../../../../core/services/date-time-availability.service';

export interface DateSelectionState {
  selectedDate: Date | null;
  selectedDateString: string;
  availableDates: Date[];
}

export interface TimeSelectionState {
  selectedTime: string;
  availableTimeSlots: TimeSlot[];
  timeSlotOptions: SelectOption[];
}

export interface DateTimeSelectionState {
  date: DateSelectionState;
  time: TimeSelectionState;
  isDateValid: boolean;
  isTimeValid: boolean;
  canProceed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DateTimeSelectionService {
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly timeUtils = inject(TimeUtils);
  private readonly dateTimeAvailabilityService = inject(DateTimeAvailabilityService);

  // ===== SIGNALS =====

  // Date selection signals
  private readonly selectedDateSignal = signal<Date | null>(null);
  private readonly selectedDateStringSignal = signal<string>('');

  // Time selection signals
  private readonly selectedTimeSignal = signal<string>('');

  // ===== COMPUTED PROPERTIES =====

  // Date selection state
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly selectedDateString = computed(() => this.selectedDateStringSignal());

  // Time selection state
  readonly selectedTime = computed(() => this.selectedTimeSignal());

  // Available dates (next 30 days that are bookable)
  readonly availableDates = computed(() => {
    const today = new Date();
    const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    return this.bookingValidationService.generateAvailableDays(today, endDate);
  });

  // Available time slots for selected date and service
  // This will be calculated by passing service and appointments as parameters
  private readonly availableTimeSlotsSignal = signal<TimeSlot[]>([]);

  readonly availableTimeSlots = computed(() => this.availableTimeSlotsSignal());

  // Time slot options for select component
  readonly timeSlotOptions = computed((): SelectOption[] => {
    return this.availableTimeSlots()
      .filter(slot => slot.available)
      .map(slot => ({
        label: slot.time,
        value: slot.time,
      }));
  });

  // Validation states
  readonly isDateValid = computed(() => {
    const date = this.selectedDate();
    return date !== null && this.bookingValidationService.canBookOnDate(date);
  });

  readonly isTimeValid = computed(() => {
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!date || !time) {
      return false;
    }

    // This will be validated when the time slots are updated
    return this.availableTimeSlots().some(slot => slot.time === time && slot.available);
  });

  readonly canProceed = computed(() => {
    return this.isDateValid() && this.isTimeValid();
  });

  // Complete state object
  readonly state = computed((): DateTimeSelectionState => ({
    date: {
      selectedDate: this.selectedDate(),
      selectedDateString: this.selectedDateString(),
      availableDates: this.availableDates(),
    },
    time: {
      selectedTime: this.selectedTime(),
      availableTimeSlots: this.availableTimeSlots(),
      timeSlotOptions: this.timeSlotOptions(),
    },
    isDateValid: this.isDateValid(),
    isTimeValid: this.isTimeValid(),
    canProceed: this.canProceed(),
  }));

  // ===== METHODS =====

  /**
   * Set selected date from date string
   */
  setSelectedDate(dateString: string): void {
    if (!dateString) {
      this.selectedDateSignal.set(null);
      this.selectedDateStringSignal.set('');
      this.resetTimeSelection();
      return;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string provided:', dateString);
      return;
    }

    this.selectedDateSignal.set(date);
    this.selectedDateStringSignal.set(dateString);
    this.resetTimeSelection(); // Reset time when date changes
  }

  /**
   * Set selected date from Date object
   */
  setSelectedDateFromDate(date: Date): void {
    if (!date || isNaN(date.getTime())) {
      console.warn('Invalid date provided:', date);
      return;
    }

    const dateString = this.formatDateForInput(date);
    this.selectedDateSignal.set(date);
    this.selectedDateStringSignal.set(dateString);
    this.resetTimeSelection(); // Reset time when date changes
  }

  /**
   * Set selected time
   */
  setSelectedTime(time: string): void {
    this.selectedTimeSignal.set(time || '');
  }

  /**
   * Reset time selection
   */
  resetTimeSelection(): void {
    this.selectedTimeSignal.set('');
  }

  /**
   * Reset date selection
   */
  resetDateSelection(): void {
    this.selectedDateSignal.set(null);
    this.selectedDateStringSignal.set('');
    this.resetTimeSelection();
  }

  /**
   * Reset all selections
   */
  resetAllSelections(): void {
    this.resetDateSelection();
  }

  /**
   * Get validation message for current state
   */
  getValidationMessage(): string {
    if (!this.bookingValidationService.canUserBookMoreAppointments()) {
      return 'BOOKING.USER_LIMIT_REACHED_MESSAGE';
    }

    if (!this.isDateValid()) {
      return 'BOOKING.INVALID_DATE_SELECTION';
    }

    if (!this.isTimeValid()) {
      return 'BOOKING.TIME_SLOT_NOT_AVAILABLE';
    }

    return '';
  }

  /**
   * Check if a specific time slot is available
   */
  isTimeSlotAvailable(time: string, service: FirebaseService, appointments: Booking[]): boolean {
    const date = this.selectedDate();

    if (!service || !date || !service.id) {
      return false;
    }

    return this.dateTimeAvailabilityService.isTimeSlotAvailable(
      date,
      time,
      service.id
    );
  }

  /**
   * Get available time slots for a specific date and service
   * Now using centralized DateTimeAvailabilityService
   */
  getAvailableTimeSlotsForDate(date: Date, service: FirebaseService, appointments: Booking[]): TimeSlot[] {
    if (!service.id) {
      return [];
    }

    return this.dateTimeAvailabilityService.getAvailableTimeSlotsForDate(
      date,
      service.id,
      { includeUnavailable: true }
    );
  }

  /**
   * Update available time slots for the selected date and service
   * Now using centralized DateTimeAvailabilityService
   */
  updateAvailableTimeSlots(service: FirebaseService, appointments: Booking[]): void {
    const date = this.selectedDate();
    if (date && service && service.id) {
      const timeSlots = this.dateTimeAvailabilityService.getAvailableTimeSlotsForDate(
        date,
        service.id,
        { includeUnavailable: true }
      );
      this.availableTimeSlotsSignal.set(timeSlots);
    } else {
      this.availableTimeSlotsSignal.set([]);
    }
  }

  /**
   * Format date for input components (YYYY-MM-DD)
   */
  private formatDateForInput(date: Date): string {
    return this.timeUtils.formatDateISO(date);
  }

  /**
   * Get minimum selectable date (today)
   */
  getMinDate(): Date {
    return new Date();
  }

  /**
   * Get maximum selectable date (30 days from now)
   */
  getMaxDate(): Date {
    const today = new Date();
    return new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}
