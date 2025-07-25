import { Injectable, signal, computed, inject } from '@angular/core';
import { AppointmentEvent } from '../core/calendar.component';
import { CalendarBusinessService } from './calendar-business.service';

export interface CalendarState {
  viewDate: Date;
  selectedDay: Date | null;
  showDetailPopup: boolean;
  selectedAppointment: any;
  appointments: any[];
}

@Injectable({
  providedIn: 'root',
})
export class CalendarStateService {
  private readonly businessService = inject(CalendarBusinessService);

  // Internal state signals
  private readonly viewDateSignal = signal<Date>(this.businessService.getAppropriateViewDate());
  private readonly selectedDaySignal = signal<Date | null>(null);
  private readonly showDetailPopupSignal = signal<boolean>(false);
  private readonly selectedAppointmentSignal = signal<any>(null);
  private readonly appointmentsSignal = signal<any[]>([]);

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
  setSelectedAppointment(appointment: any): void {
    this.selectedAppointmentSignal.set(appointment);
  }

  /**
   * Set appointments
   */
  setAppointments(appointments: any[]): void {
    this.appointmentsSignal.set(appointments || []);
  }

  /**
   * Add appointment
   */
  addAppointment(appointment: any): void {
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
    this.viewDateSignal.set(this.businessService.getAppropriateViewDate());
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
  openAppointmentDetail(appointment: any): void {
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
