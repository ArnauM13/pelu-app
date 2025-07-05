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
  title: string;
  start: string;
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

  // Computed events that combines input events with localStorage appointments
  readonly allEvents = computed((): AppointmentEvent[] => {
    // Use provided events or load from localStorage
    const providedEvents = this.events();
    if (providedEvents.length > 0) {
      return providedEvents;
    }

    // Load from localStorage
    return this.appointments().map(c => ({
      title: c.nom,
      start: c.data + (c.hora ? 'T' + c.hora : ''),
      duration: c.duration || 60, // Default to 60 minutes if not specified
      serviceName: c.serviceName,
      clientName: c.nom
    }));
  });

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

  constructor() {
    this.loadAppointments();

    // Reload appointments when user changes
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.loadAppointments();
      }
    }, { allowSignalWrites: true });
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

    this.appointmentsSignal.set(dadesAmbIds);

    // Save migrated data back to localStorage if there were changes
    if (dadesAmbIds.some((cita: any, index: number) =>
      cita.id !== dades[index]?.id
    )) {
      localStorage.setItem('cites', JSON.stringify(dadesAmbIds));
    }
  }

  // Computed properties
  readonly weekDays = computed(() => {
    const start = startOfWeek(this.viewDate(), { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(this.viewDate(), { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start, end });

    // Filter to show only Tuesday (1) to Saturday (5)
    // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
    return allDays.filter(day => {
      const dayOfWeek = day.getDay();
      return dayOfWeek >= 2 && dayOfWeek <= 6; // Tuesday to Saturday
    });
  });

  readonly calendarEvents = computed(() => {
    return this.allEvents().map(event => {
      const startDate = new Date(event.start);
      const duration = event.duration || 60; // Default to 60 minutes if not specified
      const endDate = addMinutes(startDate, duration);

      return {
        title: event.title,
        start: startDate,
        end: endDate,
        color: {
          primary: '#3b82f6',
          secondary: '#dbeafe'
        },
        meta: {
          duration: duration,
          serviceName: event.serviceName,
          clientName: event.clientName
        }
      };
    });
  });

    readonly timeSlots = computed(() => {
    const slots: string[] = [];
    for (let hour = this.businessHours.start; hour < this.businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }

    // Add lunch break slots (13:30 and 14:30) if they're not already included
    const lunchSlots = ['13:30', '14:30'];
    lunchSlots.forEach(slot => {
      if (!slots.includes(slot)) {
        slots.push(slot);
      }
    });

    // Sort slots to maintain chronological order
    return slots.sort();
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

  // Get events for a specific day
  getEventsForDay(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    return this.allEvents().filter(event => event.start.startsWith(dateStr));
  }

  // Check if a time slot is during lunch break
  isLunchBreak(time: string): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    const lunchStartMinutes = this.lunchBreak.start * 60;
    const lunchEndMinutes = this.lunchBreak.end * 60;

    return timeInMinutes >= lunchStartMinutes && timeInMinutes < lunchEndMinutes;
  }

  // Check if a time slot is available (considering appointment duration)
  isTimeSlotAvailable(date: Date, time: string) {
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

    const dateStr = format(date, 'yyyy-MM-dd');
    const timeSlotStart = new Date(`${dateStr}T${time}`);

    // Check if any appointment overlaps with this time slot
    return !this.allEvents().some(event => {
      const appointmentStart = new Date(event.start);
      const appointmentDuration = event.duration || 60;
      const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);

      // Check if the time slot overlaps with the appointment
      return appointmentStart <= timeSlotStart && appointmentEnd > timeSlotStart;
    });
  }

  // Get appointment that covers a specific time slot
  getAppointmentForTimeSlot(date: Date, time: string) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const timeSlotStart = new Date(`${dateStr}T${time}`);

    return this.allEvents().find(event => {
      const appointmentStart = new Date(event.start);
      const appointmentDuration = event.duration || 60;
      const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);

      // Check if the time slot is within the appointment
      return appointmentStart <= timeSlotStart && appointmentEnd > timeSlotStart;
    });
  }

  // Find the original appointment with ID based on an AppointmentEvent
  findOriginalAppointment(appointmentEvent: AppointmentEvent) {
    const appointmentStart = new Date(appointmentEvent.start);
    const appointmentDate = format(appointmentStart, 'yyyy-MM-dd');
    const appointmentTime = format(appointmentStart, 'HH:mm');

    return this.appointments().find(appointment => {
      // Match by date and time
      const matchesDate = appointment.data === appointmentDate;
      const matchesTime = appointment.hora === appointmentTime;
      const matchesTitle = appointment.nom === appointmentEvent.title;

      return matchesDate && matchesTime && matchesTitle;
    });
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
    const appointmentDuration = appointment.duration || 60;
    const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);
    const timeSlotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);
    const timeSlotEnd = addMinutes(timeSlotStart, 30); // 30-minute slots

    // Calculate overlap
    const overlapStart = new Date(Math.max(appointmentStart.getTime(), timeSlotStart.getTime()));
    const overlapEnd = new Date(Math.min(appointmentEnd.getTime(), timeSlotEnd.getTime()));

    if (overlapEnd <= overlapStart) return 0;

    const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
    return overlapMinutes / 30; // Return as fraction of 30-minute slot
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
        this.selectedAppointmentSignal.set(originalAppointment);
        this.showDetailPopupSignal.set(true);
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
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const viewWeekStart = startOfWeek(this.viewDate(), { weekStartsOn: 1 });
    return viewWeekStart > currentWeekStart;
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
    this.viewDateSignal.set(new Date());
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

    if (!this.isTimeSlotAvailable(date, time)) {
      const appointment = this.getAppointmentForTimeSlot(date, time);
      if (appointment) {
        return `Clic per veure detall: ${appointment.title} (${this.formatDuration(appointment.duration || 60)})`;
      }
      return 'Ocupat - No disponible';
    }

    return `Disponible - Clic per seleccionar`;
  }

  // Close appointment detail popup
  onAppointmentDetailPopupClosed() {
    this.showDetailPopupSignal.set(false);
    this.selectedAppointmentSignal.set(null);
  }
}
