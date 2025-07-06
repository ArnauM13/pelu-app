import { Component, input, output, signal, computed, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule, CalendarView, CalendarEvent, CalendarUtils, DateAdapter, CalendarA11y } from 'angular-calendar';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format as dateFnsFormat, addDays, isSameDay, isSameWeek, eachDayOfInterval, addMinutes } from 'date-fns';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ca } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentDetailPopupComponent } from '../../shared/components/appointment-detail-popup/appointment-detail-popup.component';
import { AppointmentSlotComponent, AppointmentSlotData } from './appointment-slot.component';
import { AuthService } from '../../auth/auth.service';
import { CalendarPositionService } from './calendar-position.service';
import { CalendarBusinessService } from './calendar-business.service';
import { CalendarStateService } from './calendar-state.service';

// Interface for appointment with duration
export interface AppointmentEvent {
  id?: string;
  title: string;
  start: string;
  end?: string; // New: explicit end time
  duration?: number; // in minutes, default 60 if not specified
  serviceName?: string;
  clientName?: string;
}

@Component({
  selector: 'pelu-calendar-component',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule, AppointmentDetailPopupComponent, AppointmentSlotComponent],
  providers: [
    CalendarUtils,
    CalendarA11y,
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  // Inject services
  private readonly authService = inject(AuthService);
  private readonly positionService = inject(CalendarPositionService);
  private readonly businessService = inject(CalendarBusinessService);
  private readonly stateService = inject(CalendarStateService);

  // Input signals
  readonly mini = input<boolean>(false);
  readonly events = input<AppointmentEvent[]>([]);

  // Output signals
  readonly dateSelected = output<{date: string, time: string}>();

  // Public computed signals from state service
  readonly viewDate = this.stateService.viewDate;
  readonly selectedDay = this.stateService.selectedDay;
  readonly showDetailPopup = this.stateService.showDetailPopup;
  readonly selectedAppointment = this.stateService.selectedAppointment;
  readonly appointments = this.stateService.appointments;

  // Constants
  readonly view: CalendarView = CalendarView.Week;
  readonly businessHours = this.businessService.getBusinessConfig().hours;
  readonly lunchBreak = this.businessService.getBusinessConfig().lunchBreak;
  readonly businessDays = this.businessService.getBusinessConfig().days;
  readonly SLOT_DURATION_MINUTES = this.positionService.getSlotDurationMinutes();
  readonly PIXELS_PER_MINUTE = this.positionService.getPixelsPerMinute();
  readonly SLOT_HEIGHT_PX = this.positionService.getSlotHeightPx();

  // Computed events that combines input events with localStorage appointments
  readonly allEvents = computed((): AppointmentEvent[] => {
    // Use provided events or load from appointments signal
    const providedEvents = this.events();
    if (providedEvents.length > 0) {
      // Ensure all provided events have unique IDs
      return providedEvents.map(event => ({
        ...event,
        id: event.id || uuidv4() // Generate unique ID if not exists
      }));
    }

    // Use appointments from signal - ensure it's always an array
    const appointments = this.appointments() || [];
    const events = appointments.map(c => {
      // Ensure proper date and time formatting
      const date = c.data || '';
      const time = c.hora || '00:00';
      const duration = c.duration || 60;

      // Create proper ISO string for start
      const startString = `${date}T${time}:00`;

      // Calculate end time based on duration
      const startDate = new Date(startString);
      const endDate = addMinutes(startDate, duration);
      const endString = endDate.toISOString().slice(0, 16).replace('T', 'T');

      return {
        id: c.id || uuidv4(), // Generate unique ID if not exists
        title: c.nom,
        start: startString,
        end: endString,
        duration: duration,
        serviceName: c.serviceName,
        clientName: c.nom
      };
    });

    return events;
  });

  // ✅ Generate 30-minute time slots from 08:00 to 20:00
  readonly timeSlots = computed(() => {
    return this.businessService.generateTimeSlots();
  });

  // Computed properties
  readonly weekDays = computed(() => {
    return this.businessService.getBusinessDaysForWeek(this.viewDate());
  });

  readonly calendarEvents = computed(() => {
    return this.allEvents().map(event => {
      const startDate = new Date(event.start);
      const endDate = event.end ? new Date(event.end) : addMinutes(startDate, event.duration || 60);

      return {
        title: event.title,
        start: startDate,
        end: endDate,
        color: {
          primary: '#3b82f6',
          secondary: '#dbeafe'
        },
        meta: event
      };
    });
  });

  // Computed appointment positions - this is now stable and won't cause ExpressionChangedAfterItHasBeenCheckedError
  readonly appointmentPositions = computed(() => {
    const appointments = this.allEvents();
    return this.positionService.getAppointmentPositions(appointments);
  });

  constructor() {
    // Initialize appointments from localStorage
    this.loadAppointmentsFromLocalStorage();
  }

  // Load appointments from localStorage
  private loadAppointmentsFromLocalStorage() {
    try {
      const stored = localStorage.getItem('appointments');
      if (stored) {
        const appointments = JSON.parse(stored);
        this.stateService.setAppointments(appointments);
      }
    } catch (error) {
      console.error('Error loading appointments from localStorage:', error);
      this.stateService.setAppointments([]);
    }
  }

  // Save appointments to localStorage
  private saveAppointmentsToLocalStorage() {
    try {
      const appointments = this.appointments();
      localStorage.setItem('appointments', JSON.stringify(appointments));
    } catch (error) {
      console.error('Error saving appointments to localStorage:', error);
    }
  }

  // Methods that delegate to services
  isTimeSlotAvailable(date: Date, time: string, requestedDuration: number = this.SLOT_DURATION_MINUTES): boolean {
    return this.positionService.isTimeSlotAvailable(date, time, this.allEvents(), requestedDuration);
  }

  getEventsForDay(date: Date) {
    return this.calendarEvents().filter(event => isSameDay(event.start, date));
  }

  getAppointmentsForDay(date: Date) {
    return this.businessService.getAppointmentsForDay(date, this.allEvents());
  }

  openAppointmentPopup(appointmentEvent: AppointmentEvent) {
    this.stateService.openAppointmentDetail(appointmentEvent);
  }

  isLunchBreak(time: string): boolean {
    return this.businessService.isLunchBreak(time);
  }

  getAppointmentForTimeSlot(date: Date, time: string) {
    const appointments = this.getAppointmentsForDay(date);
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);

    return appointments.find(appointment => {
      if (!appointment.start) return false;
      const appointmentStart = new Date(appointment.start);
      const appointmentEnd = appointment.end ? new Date(appointment.end) : addMinutes(appointmentStart, appointment.duration || 60);
      return appointmentStart <= slotTime && slotTime < appointmentEnd;
    });
  }

  findOriginalAppointment(appointmentEvent: AppointmentEvent) {
    const appointments = this.appointments();
    return appointments.find(app => {
      if (!app.data || !appointmentEvent.start) return false;
      const appDate = app.data;
      const eventDate = appointmentEvent.start.split('T')[0];
      return appDate === eventDate && app.hora === appointmentEvent.start.split('T')[1].substring(0, 5);
    });
  }

  getAppointmentDisplayInfo(date: Date, time: string) {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return null;

    return {
      title: appointment.title,
      serviceName: appointment.serviceName,
      duration: appointment.duration || 60
    };
  }

  getAppointmentSlotCoverage(date: Date, time: string): number {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return 0;

    const [hour, minute] = time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);

    const appointmentStart = new Date(appointment.start);
    const appointmentEnd = appointment.end ? new Date(appointment.end) : addMinutes(appointmentStart, appointment.duration || 60);

    const slotEnd = addMinutes(slotStart, this.SLOT_DURATION_MINUTES);

    const overlapStart = appointmentStart > slotStart ? appointmentStart : slotStart;
    const overlapEnd = appointmentEnd < slotEnd ? appointmentEnd : slotEnd;

    if (overlapStart >= overlapEnd) return 0;

    const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
    return (overlapMinutes / this.SLOT_DURATION_MINUTES) * 100;
  }

  shouldShowAppointmentInfo(date: Date, time: string): boolean {
    const coverage = this.getAppointmentSlotCoverage(date, time);
    return coverage > 50; // Show info if more than 50% of slot is covered
  }

  isAppointmentStart(date: Date, time: string): boolean {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment || !appointment.start) return false;

    const appointmentStart = new Date(appointment.start);
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);

    return Math.abs(appointmentStart.getTime() - slotTime.getTime()) < 60000; // Within 1 minute
  }

  isWithinAppointment(date: Date, time: string): boolean {
    return this.getAppointmentForTimeSlot(date, time) !== undefined;
  }

  selectDay(date: Date) {
    this.stateService.setSelectedDay(date);
  }

  selectTimeSlot(date: Date, time: string) {
    if (!this.isTimeSlotAvailable(date, time)) {
      return;
    }

    const dateString = dateFnsFormat(date, 'yyyy-MM-dd');
    this.dateSelected.emit({ date: dateString, time: time });
  }

  isDaySelected(date: Date): boolean {
    const selectedDay = this.selectedDay();
    return selectedDay ? isSameDay(date, selectedDay) : false;
  }

  canNavigateToPreviousWeek(): boolean {
    return this.businessService.canNavigateToPreviousWeek();
  }

  getViewDateInfo(): string {
    const viewDate = this.viewDate();
    const start = startOfWeek(viewDate, { weekStartsOn: 1 });
    const end = endOfWeek(viewDate, { weekStartsOn: 1 });
    return `${dateFnsFormat(start, 'dd/MM')} - ${dateFnsFormat(end, 'dd/MM')}`;
  }

  isBusinessDay(dayOfWeek: number): boolean {
    return this.businessService.isBusinessDay(dayOfWeek);
  }

  getBusinessDaysInfo(): string {
    return this.businessService.getBusinessDaysInfo();
  }

  getEventForTimeSlot(date: Date, time: string) {
    return this.getAppointmentForTimeSlot(date, time);
  }

  previousWeek() {
    this.stateService.previousWeek();
  }

  nextWeek() {
    this.stateService.nextWeek();
  }

  today() {
    this.stateService.today();
  }

  formatPopupDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (isSameDay(date, today)) {
      return 'Avui';
    } else if (isSameDay(date, tomorrow)) {
      return 'Demà';
    } else {
      return dateFnsFormat(date, 'EEEE, d MMMM', { locale: ca });
    }
  }

  format(date: Date, formatString: string): string {
    return dateFnsFormat(date, formatString, { locale: ca });
  }

  isPastDate(date: Date): boolean {
    return this.businessService.isPastDate(date);
  }

  isPastTimeSlot(date: Date, time: string): boolean {
    return this.businessService.isPastTimeSlot(date, time);
  }

  getDayName(date: Date): string {
    return dateFnsFormat(date, 'EEEE', { locale: ca });
  }

  getEventTime(startString: string): string {
    const date = new Date(startString);
    return dateFnsFormat(date, 'HH:mm');
  }

  getTimeSlotTooltip(date: Date, time: string): string {
    if (this.isPastDate(date)) {
      return 'Data passada';
    }

    if (this.isPastTimeSlot(date, time)) {
      return 'Hora passada';
    }

    if (this.isLunchBreak(time)) {
      return 'Pausa per dinar';
    }

    if (this.isTimeSlotAvailable(date, time)) {
      return 'Disponible';
    }

    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (appointment) {
      return `${appointment.title} - ${appointment.serviceName || ''}`;
    }

    return 'No disponible';
  }

  onAppointmentDetailPopupClosed() {
    this.stateService.closeAppointmentDetail();
  }

  isLunchBreakStart(time: string): boolean {
    return this.businessService.isLunchBreakStart(time);
  }

  reloadAppointments() {
    this.loadAppointmentsFromLocalStorage();
  }

  clearAllAppointments() {
    this.stateService.clearAllAppointments();
    this.saveAppointmentsToLocalStorage();
  }

  // Create appointment slot data for the new component
  createAppointmentSlotData(appointment: AppointmentEvent, date: Date): AppointmentSlotData {
    return {
      appointment,
      date
    };
  }
}
