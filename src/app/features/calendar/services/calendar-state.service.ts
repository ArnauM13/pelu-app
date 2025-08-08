import { Injectable, signal, computed, inject } from '@angular/core';
import { TimeUtils } from '../../../shared/utils/time.utils';
import { Booking } from '../../../core/interfaces/booking.interface';
import { SystemParametersService } from '../../../core/services/system-parameters.service';

export interface CalendarState {
  viewDate: Date;
  selectedDay: Date | null;
  showDetailPopup: boolean;
  selectedAppointment: Booking | null;
  appointments: Booking[];
}

@Injectable({
  providedIn: 'root',
})
export class CalendarStateService {
  private readonly timeUtils = inject(TimeUtils);
  private readonly systemParametersService = inject(SystemParametersService);

  // Internal state signals
  private readonly viewDateSignal = signal<Date>(this.timeUtils.getAppropriateWeeklyViewDate(this.systemParametersService.workingDays()));
  private readonly selectedDaySignal = signal<Date | null>(null);
  private readonly showDetailPopupSignal = signal<boolean>(false);
  private readonly selectedAppointmentSignal = signal<Booking | null>(null);
  private readonly appointmentsSignal = signal<Booking[]>([]);

  // Public computed signals
  readonly viewDate = computed(() => this.viewDateSignal());
  readonly selectedDay = computed(() => this.selectedDaySignal());
  readonly showDetailPopup = computed(() => this.showDetailPopupSignal());
  readonly selectedAppointment = computed(() => this.selectedAppointmentSignal());
  readonly appointments = computed(() => this.appointmentsSignal());

  constructor() {
    // Initialize with empty array to avoid undefined values
    this.appointmentsSignal.set([]);
  }

  /**
   * Set view date
   */
  setViewDate(date: Date): void {
    this.viewDateSignal.set(date);
  }

  /**
   * Set selected day
   */
  setSelectedDay(day: Date | null): void {
    this.selectedDaySignal.set(day);
  }

  /**
   * Set show detail popup
   */
  setShowDetailPopup(show: boolean): void {
    this.showDetailPopupSignal.set(show);
  }

  /**
   * Set selected appointment
   */
  setSelectedAppointment(appointment: Booking | null): void {
    this.selectedAppointmentSignal.set(appointment);
  }

  /**
   * Set appointments
   */
  setAppointments(appointments: Booking[]): void {
    this.appointmentsSignal.set(appointments || []);
  }

  /**
   * Add appointment
   */
  addAppointment(appointment: Booking): void {
    const currentAppointments = this.appointmentsSignal();
    this.appointmentsSignal.set([...currentAppointments, appointment]);
  }

  /**
   * Remove appointment
   */
  removeAppointment(appointmentId: string): void {
    const currentAppointments = this.appointmentsSignal();
    const filteredAppointments = currentAppointments.filter(app => app.id !== appointmentId);
    this.appointmentsSignal.set(filteredAppointments);
  }

  /**
   * Clear all appointments
   */
  clearAllAppointments(): void {
    this.appointmentsSignal.set([]);
  }

  /**
   * Navigate to previous week
   */
  previousWeek(): void {
    const currentDate = this.viewDateSignal();
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    this.viewDateSignal.set(newDate);
  }

  /**
   * Navigate to next week
   */
  nextWeek(): void {
    const currentDate = this.viewDateSignal();
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    this.viewDateSignal.set(newDate);
  }

  /**
   * Navigate to today
   */
  today(): void {
    this.viewDateSignal.set(this.timeUtils.getAppropriateWeeklyViewDate(this.systemParametersService.workingDays()));
  }

  /**
   * Navigate to specific date
   */
  navigateToDate(dateString: string): void {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // Set the selected date as the view date (first day of the calendar)
      this.viewDateSignal.set(date);
    }
  }

  /**
   * Open appointment detail popup
   */
  openAppointmentDetail(appointment: Booking): void {
    this.setSelectedAppointment(appointment);
    this.setShowDetailPopup(true);
  }

  /**
   * Close appointment detail popup
   */
  closeAppointmentDetail(): void {
    this.setShowDetailPopup(false);
    this.setSelectedAppointment(null);
  }

  /**
   * Get current state
   */
  getCurrentState(): CalendarState {
    return {
      viewDate: this.viewDate(),
      selectedDay: this.selectedDay(),
      showDetailPopup: this.showDetailPopup(),
      selectedAppointment: this.selectedAppointment(),
      appointments: this.appointments(),
    };
  }
}
