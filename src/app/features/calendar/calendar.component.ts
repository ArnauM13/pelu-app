import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule, CalendarView, CalendarEvent, CalendarUtils, DateAdapter, CalendarA11y } from 'angular-calendar';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format, addDays, isSameDay, isSameWeek, eachDayOfInterval, addMinutes } from 'date-fns';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ca } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentDetailPopupComponent } from '../../shared/components/appointment-detail-popup/appointment-detail-popup.component';
import { AuthService } from '../../auth/auth.service';

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
  imports: [CommonModule, CalendarModule, FormsModule, AppointmentDetailPopupComponent],
  providers: [
    CalendarUtils,
    CalendarA11y,
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  // Inject services
  private readonly authService = inject(AuthService);

  // Input signals
  readonly mini = input<boolean>(false);
  readonly events = input<AppointmentEvent[]>([]);

  // Output signals
  readonly dateSelected = output<{date: string, time: string}>();

  // Internal state
  private readonly viewDateSignal = signal<Date>(new Date());
  private readonly selectedDateTimeSignal = signal<{date: string, time: string}>({date: '', time: ''});
  private readonly selectedDaySignal = signal<Date | null>(null);
  private readonly showDetailPopupSignal = signal<boolean>(false);
  private readonly selectedAppointmentSignal = signal<any>(null);
  private readonly appointmentsSignal = signal<any[]>([]);

  // Public computed signals
  readonly viewDate = computed(() => this.viewDateSignal());
  readonly selectedDateTime = computed(() => this.selectedDateTimeSignal());
  readonly selectedDay = computed(() => this.selectedDaySignal());
  readonly showDetailPopup = computed(() => this.showDetailPopupSignal());
  readonly selectedAppointment = computed(() => this.selectedAppointmentSignal());
  readonly appointments = computed(() => this.appointmentsSignal());

  // Constants
  readonly view: CalendarView = CalendarView.Week;
  readonly businessHours = {
    start: 8,
    end: 20
  };
  readonly lunchBreak = {
    start: 13,
    end: 15
  };
  readonly businessDays = {
    start: 2, // Tuesday (0 = Sunday, 1 = Monday, 2 = Tuesday, etc.)
    end: 6    // Saturday
  };
  readonly SLOT_DURATION_MINUTES = 30; // 30-minute slots
  readonly PIXELS_PER_MINUTE = 1; // 1 pixel per minute
  readonly SLOT_HEIGHT_PX = this.SLOT_DURATION_MINUTES * this.PIXELS_PER_MINUTE; // 30px per slot

  // Computed events that combines input events with localStorage appointments
  readonly allEvents = computed((): AppointmentEvent[] => {
    // Use provided events or load from localStorage
    const providedEvents = this.events();
    if (providedEvents.length > 0) {
      return providedEvents;
    }

    // Load from localStorage
    const events = this.appointments().map(c => {
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
        id: c.id,
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

  constructor() {
    this.loadAppointments();
    this.initializeViewDate();

    // Reload appointments when user changes
    effect(() => {
      const user = this.authService.user();
      if (user) {
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.loadAppointments();
        }, 0);
      }
    }, { allowSignalWrites: true });

    // Set up periodic reload to catch new appointments
    setInterval(() => {
      this.loadAppointments();
    }, 2000); // Check every 2 seconds
  }

  private loadAppointments() {
    const dades = JSON.parse(localStorage.getItem('cites') || '[]');

    // Only add IDs to appointments that don't have them (no migration of userId)
    const dadesAmbIds = dades.map((cita: any) => {
      if (!cita.id) {
        return { ...cita, id: uuidv4() };
      }
      return cita;
    });

    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.appointmentsSignal.set(dadesAmbIds);
    }, 0);

    // Save migrated data back to localStorage if there were changes
    if (dadesAmbIds.some((cita: any, index: number) =>
      cita.id !== dades[index]?.id
    )) {
      localStorage.setItem('cites', JSON.stringify(dadesAmbIds));
    }
  }

      // Get the appropriate view date considering business days
  private getAppropriateViewDate(): Date {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.

    // If today is outside business days, jump to next business week
    if (currentDayOfWeek < this.businessDays.start || currentDayOfWeek > this.businessDays.end) {
      // Calculate days to add to get to next business day
      let daysToAdd: number;

      if (currentDayOfWeek < this.businessDays.start) {
        // Before business days (Sunday, Monday) - jump to next Tuesday
        daysToAdd = this.businessDays.start - currentDayOfWeek;
      } else {
        // After business days (Sunday) - jump to next Tuesday
        daysToAdd = 7 - currentDayOfWeek + this.businessDays.start;
      }

      const nextBusinessDay = new Date(today);
      nextBusinessDay.setDate(today.getDate() + daysToAdd);

      return nextBusinessDay;
    } else {
      // If today is a business day, show current week
      return today;
    }
  }

  // Initialize view date to show the next business week if today is weekend
  private initializeViewDate() {
    this.viewDateSignal.set(this.getAppropriateViewDate());
  }

  // ✅ Generate 30-minute time slots from 08:00 to 20:00
  readonly timeSlots = computed(() => {
    const slots: string[] = [];
    const startHour = this.businessHours.start;
    const endHour = this.businessHours.end;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    return slots;
  });

  // Computed properties
  readonly weekDays = computed(() => {
    const start = startOfWeek(this.viewDate(), { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(this.viewDate(), { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start, end });

    // Filter to show only business days
    return allDays.filter(day => {
      const dayOfWeek = day.getDay();
      return this.isBusinessDay(dayOfWeek);
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
        meta: {
          duration: event.duration || 60,
          serviceName: event.serviceName,
          clientName: event.clientName
        }
      };
    });
  });

  readonly selectedDateMessage = computed(() => {
    const selected = this.selectedDateTime();
    if (selected.date) {
      const dateStr = this.formatPopupDate(selected.date);
      if (selected.time) {
        return `Seleccionat: ${dateStr} a les ${selected.time}`;
      } else {
        return `Dia seleccionat: ${dateStr}`;
      }
    }
    return 'Cap dia seleccionat';
  });

  // Computed properties for appointment positioning
  readonly appointmentPositions = computed(() => {
    const appointments = this.allEvents();
    const positions = new Map<string, { top: number, height: number }>();

    appointments.forEach(appointment => {
      if (!appointment || !appointment.start) {
        const key = appointment?.id || appointment?.title || 'default';
        positions.set(key, { top: 0, height: 60 });
        return;
      }

      const startTime = new Date(appointment.start);
      if (isNaN(startTime.getTime())) {
        const key = appointment.id || appointment.title || 'default';
        positions.set(key, { top: 0, height: 60 });
        return;
      }

      // Calculate top position
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const businessStartMinutes = this.businessHours.start * 60;
      const relativeMinutes = startMinutes - businessStartMinutes;
      const top = Math.max(0, relativeMinutes * this.PIXELS_PER_MINUTE);

      // Calculate height
      let duration: number;
      if (appointment.end) {
        const endTime = new Date(appointment.end);
        if (isNaN(endTime.getTime())) {
          duration = appointment.duration || 60;
        } else {
          duration = Math.max(30, (endTime.getTime() - startTime.getTime()) / (1000 * 60));
        }
      } else {
        duration = appointment.duration || 60;
      }
      const height = Math.max(30, duration * this.PIXELS_PER_MINUTE);

      const key = appointment.id || appointment.title || 'default';
      positions.set(key, { top, height });
    });

    return positions;
  });

  // Helper methods that use the computed positions
  getAppointmentTopPx(appointment: AppointmentEvent): number {
    if (!appointment || !appointment.start) {
      console.log('getAppointmentTopPx: No appointment or start time');
      return 0;
    }

    const startTime = new Date(appointment.start);
    if (isNaN(startTime.getTime())) {
      console.log('getAppointmentTopPx: Invalid start time', appointment.start);
      return 0;
    }

    // Calculate top position based on start time
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const businessStartMinutes = this.businessHours.start * 60;
    const relativeMinutes = startMinutes - businessStartMinutes;
    const top = Math.max(0, relativeMinutes * this.PIXELS_PER_MINUTE);

    console.log('getAppointmentTopPx:', {
      title: appointment.title,
      start: appointment.start,
      startMinutes,
      businessStartMinutes,
      relativeMinutes,
      top
    });

    return top;
  }

  getAppointmentHeightPx(appointment: AppointmentEvent): number {
    if (!appointment) {
      return 60 * this.PIXELS_PER_MINUTE; // Default height
    }

    let duration: number;

    if (appointment.end) {
      // Calculate duration from start and end times
      const startTime = new Date(appointment.start);
      const endTime = new Date(appointment.end);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        duration = appointment.duration || 60;
      } else {
        duration = Math.max(30, (endTime.getTime() - startTime.getTime()) / (1000 * 60));
      }
    } else {
      // Use duration property or default to 60 minutes
      duration = appointment.duration || 60;
    }

    // Ensure minimum height and convert to pixels
    return Math.max(30, duration * this.PIXELS_PER_MINUTE);
  }

  // ✅ Check if a time slot is available (considering partial overlaps)
  isTimeSlotAvailable(date: Date, time: string, requestedDuration: number = this.SLOT_DURATION_MINUTES): boolean {
    // If it's lunch break, it's not available
    if (this.isLunchBreak(time)) {
      return false;
    }

    // If it's a past date, it's not available
    if (this.isPastDate(date)) {
      return false;
    }

    // If it's today but the time has passed, it's not available
    if (this.isPastTimeSlot(date, time)) {
      return false;
    }

    // For now, allow all time slots to be available
    // The appointments will be shown on top of the time slots
    return true;
  }

  // Get events for a specific day
  getEventsForDay(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    return this.allEvents().filter(event => event.start.startsWith(dateStr));
  }

  // Get appointments for a specific day (with ID for tracking)
  getAppointmentsForDay(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAppointments = this.allEvents().filter(event => event.start.startsWith(dateStr));

    console.log('Appointments for day', dateStr, ':', dayAppointments);

    return dayAppointments.map(event => {
      // Find the original appointment with ID
      const originalAppointment = this.findOriginalAppointment(event);
      const result = {
        ...event,
        id: originalAppointment?.id || event.id || uuidv4() // Use original ID, event ID, or generate new one
      };

      console.log('Appointment processed:', {
        title: result.title,
        start: result.start,
        top: this.getAppointmentTopPx(result),
        height: this.getAppointmentHeightPx(result)
      });

      return result;
    });
  }

  // Open appointment popup
  openAppointmentPopup(appointmentEvent: AppointmentEvent) {
    if (!appointmentEvent) return;

    // Find the original appointment with the correct structure
    const originalAppointment = this.findOriginalAppointment(appointmentEvent);

    if (originalAppointment) {
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.selectedAppointmentSignal.set(originalAppointment);
        this.showDetailPopupSignal.set(true);
      }, 0);
    } else {
      console.error('Could not find original appointment for:', appointmentEvent);
    }
  }

  // Check if a time slot is during lunch break
  isLunchBreak(time: string): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    const lunchStartMinutes = this.lunchBreak.start * 60;
    const lunchEndMinutes = this.lunchBreak.end * 60;

    return timeInMinutes >= lunchStartMinutes && timeInMinutes < lunchEndMinutes;
  }

  // Get appointment that covers a specific time slot
  getAppointmentForTimeSlot(date: Date, time: string) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const timeSlotStart = new Date(`${dateStr}T${time}`);

    return this.allEvents().find(event => {
      const appointmentStart = new Date(event.start);
      const appointmentEnd = event.end ? new Date(event.end) : addMinutes(appointmentStart, event.duration || 60);

      // Check if the time slot is within the appointment
      return appointmentStart <= timeSlotStart && appointmentEnd > timeSlotStart;
    });
  }

  // Find the original appointment with ID based on an AppointmentEvent
  findOriginalAppointment(appointmentEvent: AppointmentEvent) {
    if (!appointmentEvent) return null;

    // First try to find by ID if available
    if (appointmentEvent.id) {
      const foundById = this.appointments().find(appointment => appointment.id === appointmentEvent.id);
      if (foundById) {
        return foundById;
      }
    }

    // If no ID match, try to find by date, time and title
    const appointmentStart = new Date(appointmentEvent.start);
    if (isNaN(appointmentStart.getTime())) return null;

    const appointmentDate = format(appointmentStart, 'yyyy-MM-dd');
    const appointmentTime = format(appointmentStart, 'HH:mm');

    return this.appointments().find(appointment => {
      // Match by date and time
      const matchesDate = appointment.data === appointmentDate;
      const matchesTime = appointment.hora === appointmentTime;
      const matchesTitle = appointment.nom === appointmentEvent.title;

      return matchesDate && matchesTime && matchesTitle;
    }) || null;
  }

  // Get appointment display info for a time slot
  getAppointmentDisplayInfo(date: Date, time: string) {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return null;

    // Only show info if this slot should display it
    if (this.shouldShowAppointmentInfo(date, time)) {
      return {
        title: appointment.title,
        duration: appointment.duration || 60,
        serviceName: appointment.serviceName,
        clientName: appointment.clientName
      };
    }

    return null;
  }

  // Calculate how much of a time slot an appointment occupies (0-1)
  getAppointmentSlotCoverage(date: Date, time: string): number {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return 0;

    const appointmentStart = new Date(appointment.start);
    const appointmentEnd = appointment.end ? new Date(appointment.end) : addMinutes(appointmentStart, appointment.duration || 60);
    const timeSlotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);
    const timeSlotEnd = addMinutes(timeSlotStart, this.SLOT_DURATION_MINUTES);

    // Calculate overlap
    const overlapStart = new Date(Math.max(appointmentStart.getTime(), timeSlotStart.getTime()));
    const overlapEnd = new Date(Math.min(appointmentEnd.getTime(), timeSlotEnd.getTime()));

    if (overlapEnd <= overlapStart) return 0;

    const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
    return overlapMinutes / this.SLOT_DURATION_MINUTES; // Return as fraction of slot
  }

  // Check if this slot should show appointment info
  shouldShowAppointmentInfo(date: Date, time: string): boolean {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return false;

    const appointmentStart = new Date(appointment.start);
    const timeSlotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);

    // Show info if this is the start of the appointment or if it's a significant part
    return appointmentStart.getTime() === timeSlotStart.getTime() || this.getAppointmentSlotCoverage(date, time) > 0.5;
  }

  // Check if this time slot is the start of a multi-slot appointment
  isAppointmentStart(date: Date, time: string): boolean {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return false;

    const appointmentStart = new Date(appointment.start);
    const timeSlotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);

    return appointmentStart.getTime() === timeSlotStart.getTime();
  }

  // Check if this time slot is within an appointment (but not the start)
  isWithinAppointment(date: Date, time: string): boolean {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return false;

    const appointmentStart = new Date(appointment.start);
    const timeSlotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);

    return appointmentStart.getTime() !== timeSlotStart.getTime();
  }

  // Select a day
  selectDay(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date >= today) {
      // If clicking the same day, deselect it
      if (this.selectedDay() && isSameDay(this.selectedDay()!, date)) {
        this.selectedDaySignal.set(null);
      } else {
        this.selectedDaySignal.set(date);
      }
    }
  }

  // Select a time slot
  selectTimeSlot(date: Date, time: string) {
    // Check if there's an appointment in this slot
    const appointmentEvent = this.getAppointmentForTimeSlot(date, time);
    if (appointmentEvent) {
      // Find the original appointment with ID from the appointments array
      const originalAppointment = this.findOriginalAppointment(appointmentEvent);
      if (originalAppointment) {
        // Show appointment detail popup with the original appointment
        setTimeout(() => {
          this.selectedAppointmentSignal.set(originalAppointment);
          this.showDetailPopupSignal.set(true);
        }, 0);
        return;
      }
    }

    // Only allow selection if the time slot is available
    if (!this.isTimeSlotAvailable(date, time)) {
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    this.selectedDateTimeSignal.set({date: dateStr, time: time});
    this.dateSelected.emit({date: dateStr, time: time});
  }

  // Check if a day is selected
  isDaySelected(date: Date): boolean {
    return this.selectedDay() ? isSameDay(this.selectedDay()!, date) : false;
  }

    // Check if we can navigate to previous week
  canNavigateToPreviousWeek(): boolean {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const viewWeekStart = startOfWeek(this.viewDate(), { weekStartsOn: 1 });

    // Only prevent navigation to weeks that have already passed
    return viewWeekStart > currentWeekStart;
  }

    // Get information about the current view date
  getViewDateInfo(): string {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const dayNames = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];

    // Check if today is outside business days
    if (currentDayOfWeek < this.businessDays.start || currentDayOfWeek > this.businessDays.end) {
      return `Avui és ${dayNames[currentDayOfWeek]} (no lectiu) - Mostrant següent setmana`;
    } else {
      return `Avui és ${dayNames[currentDayOfWeek]} - Setmana actual`;
    }
  }

  // Check if a day is a business day
  isBusinessDay(dayOfWeek: number): boolean {
    return dayOfWeek >= this.businessDays.start && dayOfWeek <= this.businessDays.end;
  }

  // Get business days configuration info
  getBusinessDaysInfo(): string {
    const dayNames = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    const startDay = dayNames[this.businessDays.start];
    const endDay = dayNames[this.businessDays.end];
    return `Dies laborables: ${startDay} a ${endDay}`;
  }

  // Check if a time slot is selected
  isTimeSlotSelected(date: Date, time: string): boolean {
    const selected = this.selectedDateTime();
    const dateStr = format(date, 'yyyy-MM-dd');
    return selected.date === dateStr && selected.time === time;
  }

  // Get event for a specific time slot (legacy method for compatibility)
  getEventForTimeSlot(date: Date, time: string) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const eventKey = `${dateStr}T${time}`;
    return this.events().find(event => event.start === eventKey);
  }

  previousWeek() {
    if (this.canNavigateToPreviousWeek()) {
      this.viewDateSignal.set(addDays(this.viewDate(), -7));
      this.selectedDaySignal.set(null); // Clear selection when changing weeks
    }
  }

  nextWeek() {
    this.viewDateSignal.set(addDays(this.viewDate(), 7));
    this.selectedDaySignal.set(null); // Clear selection when changing weeks
  }

  today() {
    this.viewDateSignal.set(this.getAppropriateViewDate());
    this.selectedDaySignal.set(null); // Clear selection when going to today
  }

  formatPopupDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    const months = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
  }

  format(date: Date, formatString: string): string {
    return format(date, formatString);
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  // Check if a time slot is in the past (for today's date)
  isPastTimeSlot(date: Date, time: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If it's not today, it's not a past time slot
    if (date < today || date > today) {
      return false;
    }

    // If it's today, check if the time has passed
    const currentTime = new Date();
    const timeSlotDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);

    return timeSlotDateTime < currentTime;
  }

  getDayName(date: Date): string {
    const days = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    return days[date.getDay()];
  }

  getEventTime(startString: string): string {
    const parts = startString.split('T');
    if (parts.length > 1 && parts[1]) {
      return parts[1].substring(0, 5);
    }
    return '';
  }

  // Format duration for display
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}min`;
      }
    }
  }

  // Get tooltip text for a time slot
  getTimeSlotTooltip(date: Date, time: string): string {
    if (this.isLunchBreak(time)) {
      return 'Pausa per dinar - No disponible';
    }

    if (this.isPastDate(date)) {
      return 'Data passada - No disponible';
    }

    if (this.isPastTimeSlot(date, time)) {
      return 'Hora passada - No disponible';
    }

    // Check if there's an appointment in this time slot
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (appointment) {
      const duration = appointment.duration || 60;
      return `Clic per veure detall: ${appointment.title} (${this.formatDuration(duration)})`;
    }

    return `Disponible - Clic per seleccionar`;
  }

  // Close appointment detail popup
  onAppointmentDetailPopupClosed() {
    this.showDetailPopupSignal.set(false);
    this.selectedAppointmentSignal.set(null);
  }

  // Detecta si aquest slot és l'inici de la pausa de dinar
  isLunchBreakStart(time: string): boolean {
    // Per defecte, la pausa comença a les 13:00
    return time === '13:00';
  }

  // Force reload appointments (can be called from parent components)
  reloadAppointments() {
    this.loadAppointments();
  }

  // Test function to clear all appointments
  clearAllAppointments() {
    // Clear localStorage
    localStorage.removeItem('cites');

    // Clear internal state
    this.appointmentsSignal.set([]);

    // Clear selected appointment if any
    this.selectedAppointmentSignal.set(null);
    this.showDetailPopupSignal.set(false);

    console.log('Totes les cites han estat eliminades');
  }
}
