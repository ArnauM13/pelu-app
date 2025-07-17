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
import { AuthService } from '../../core/auth/auth.service';
import { CalendarPositionService } from './calendar-position.service';
import { CalendarBusinessService } from './calendar-business.service';
import { CalendarStateService } from './calendar-state.service';
import { CalendarDragDropService } from './calendar-drag-drop.service';
import { ServiceColorsService } from '../../core/services/service-colors.service';
import { CalendarHeaderComponent } from './header/calendar-header.component';

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
  imports: [CommonModule, CalendarModule, FormsModule, AppointmentDetailPopupComponent, AppointmentSlotComponent, CalendarHeaderComponent],
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
  readonly dragDropService = inject(CalendarDragDropService);

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
    const allBusinessDays = this.businessService.getBusinessDaysForWeek(this.viewDate());

    // Filter out days that have no available time slots
    return allBusinessDays.filter(day => {
      // Always show past days (they might have appointments to view)
      if (this.isPastDate(day)) {
        return true;
      }

      // Check if the day has any available time slots
      return this.businessService.hasAvailableTimeSlots(day, this.allEvents());
    });
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

  constructor(private serviceColorsService: ServiceColorsService) {
    // Initialize appointments from localStorage
    this.loadAppointmentsFromStorage();
  }

  // Load appointments from localStorage
  private loadAppointmentsFromStorage(): void {
    try {
      // Carreguem les cites des de 'cites' (format original) i també des de 'appointments' si existeix
      const citesStored = localStorage.getItem('cites');
      const appointmentsStored = localStorage.getItem('appointments');

      let appointments: any[] = [];

      if (citesStored) {
        const cites = JSON.parse(citesStored);
        appointments = [...appointments, ...cites];
      }

      if (appointmentsStored) {
        const appointmentsData = JSON.parse(appointmentsStored);
        appointments = [...appointments, ...appointmentsData];
      }

      // Eliminem duplicats per ID
      const uniqueAppointments = appointments.filter((appointment, index, self) =>
        index === self.findIndex(a => a.id === appointment.id)
      );

      this.stateService.setAppointments(uniqueAppointments);
    } catch (error) {
      // Handle storage error silently
    }
  }

  // Save appointments to localStorage
  private saveAppointmentsToStorage(): void {
    try {
      const appointments = this.appointments();
      localStorage.setItem('appointments', JSON.stringify(appointments));
    } catch (error) {
      // Handle storage error silently
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
    // Convert AppointmentEvent to the format expected by the popup
    const originalAppointment = this.findOriginalAppointment(appointmentEvent);

    if (originalAppointment) {
      // Use the original appointment data which has the correct format
      // Assegurem-nos que té l'userId correcte
      const currentUser = this.authService.user();
      if (currentUser?.uid && !originalAppointment.userId) {
        originalAppointment.userId = currentUser.uid;
      }
      this.stateService.openAppointmentDetail(originalAppointment);
    } else {
      // Fallback: convert AppointmentEvent to the expected format
      const currentUser = this.authService.user();

      // Generate a unique ID if not available
      const appointmentId = appointmentEvent.id || uuidv4();

      const convertedAppointment = {
        id: appointmentId,
        nom: appointmentEvent.title || appointmentEvent.clientName || '',
        data: appointmentEvent.start ? appointmentEvent.start.split('T')[0] : '',
        hora: appointmentEvent.start ? appointmentEvent.start.split('T')[1]?.substring(0, 5) : '',
        duration: appointmentEvent.duration || 60,
        serviceName: appointmentEvent.serviceName || '',
        servei: appointmentEvent.serviceName || '',
        notes: '',
        preu: 0,
        userId: currentUser?.uid || '',
        serviceId: ''
      };

      // Save the converted appointment to localStorage so it can be found later
      this.saveConvertedAppointmentToStorage(convertedAppointment);

      this.stateService.openAppointmentDetail(convertedAppointment);
    }
  }

  /**
   * Save a converted appointment to localStorage so it can be found by the detail page
   */
  private saveConvertedAppointmentToStorage(appointment: any): void {
    try {
      const appointments = this.appointments();
      const updatedAppointments = [...appointments, appointment];
      this.stateService.setAppointments(updatedAppointments);

      // Also save to localStorage
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    } catch (error) {
      console.error('Error saving converted appointment:', error);
    }
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

    // First try to find by ID if available
    if (appointmentEvent.id) {
      const foundById = appointments.find(app => app.id === appointmentEvent.id);
      if (foundById) {
        return foundById;
      }
    }

    // Then try to find by date, time and title
    return appointments.find(app => {
      if (!app.data || !appointmentEvent.start) return false;

      const appDate = app.data;
      const eventDate = appointmentEvent.start.split('T')[0];
      const eventTime = appointmentEvent.start.split('T')[1]?.substring(0, 5);

      // Match by date and time
      const dateMatches = appDate === eventDate;
      const timeMatches = app.hora === eventTime;

      // Also try to match by title/nom
      const titleMatches = app.nom === appointmentEvent.title || app.nom === appointmentEvent.clientName;

      return dateMatches && timeMatches && titleMatches;
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
    return this.businessService.canNavigateToPreviousWeek(this.viewDate(), this.allEvents());
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
    // Always show day of week and date, never "Demà" or "Avui"
    return dateFnsFormat(date, 'EEEE dd/MM', { locale: ca });
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
    this.loadAppointmentsFromStorage();
  }

  onDateChange(dateString: string) {
    this.stateService.navigateToDate(dateString);
  }

  // Drag & Drop methods
  onDropZoneMouseEnter(event: MouseEvent, day: Date) {
    if (this.dragDropService.isDragging()) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      this.dragDropService.updateTargetDateTime({ top: relativeY, left: 0 }, day);
    }
  }

  onDropZoneMouseMove(event: MouseEvent, day: Date) {
    if (this.dragDropService.isDragging()) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      this.dragDropService.updateTargetDateTime({ top: relativeY, left: 0 }, day);
    }
  }

    onDropZoneDrop(event: DragEvent, day: Date) {
    event.preventDefault();
    const success = this.dragDropService.endDrag();

    if (success) {
      // Appointment was successfully moved
      this.reloadAppointments();

      // Force a change detection cycle to update the view
      setTimeout(() => {
        this.reloadAppointments();
      }, 100);
    }
  }

  onDropZoneDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Helper method to compare dates
  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
  }

  // Create appointment slot data for the new component
  createAppointmentSlotData(appointment: AppointmentEvent, date: Date): AppointmentSlotData {
    return {
      appointment,
      date
    };
  }

  private convertToCalendarEvent(appointment: any): AppointmentEvent {
    if (appointment.originalAppointment) {
      return appointment.originalAppointment;
    } else {
      return appointment;
    }
  }
}
