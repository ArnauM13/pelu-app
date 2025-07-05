import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule, CalendarView, CalendarEvent, CalendarUtils, DateAdapter, CalendarA11y } from 'angular-calendar';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format, addDays, isSameDay, isSameWeek, eachDayOfInterval, addMinutes } from 'date-fns';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ca } from 'date-fns/locale';

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
  imports: [CommonModule, CalendarModule, FormsModule],
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
  // Input signals
  readonly mini = input<boolean>(false);
  readonly events = input<AppointmentEvent[]>([]);

  // Output signals
  readonly dateSelected = output<{date: string, time: string}>();

  // Internal state
  private readonly viewDateSignal = signal<Date>(new Date());
  private readonly selectedDateTimeSignal = signal<{date: string, time: string}>({date: '', time: ''});
  private readonly selectedDaySignal = signal<Date | null>(null);

  // Public computed signals
  readonly viewDate = computed(() => this.viewDateSignal());
  readonly selectedDateTime = computed(() => this.selectedDateTimeSignal());
  readonly selectedDay = computed(() => this.selectedDaySignal());

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
    return this.events().map(event => {
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
    const slots = [];
    for (let hour = this.businessHours.start; hour < this.businessHours.end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
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
    return this.events().filter(event => event.start.startsWith(dateStr));
  }

  // Check if a time slot is during lunch break
  isLunchBreak(time: string): boolean {
    const hour = parseInt(time.split(':')[0]);
    return hour >= this.lunchBreak.start && hour < this.lunchBreak.end;
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
    return !this.events().some(event => {
      const appointmentStart = new Date(event.start);
      const appointmentDuration = event.duration || 60;
      const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);

      // Check if the time slot overlaps with the appointment
      return appointmentStart < timeSlotStart && appointmentEnd > timeSlotStart;
    });
  }

  // Get appointment that covers a specific time slot
  getAppointmentForTimeSlot(date: Date, time: string) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const timeSlotStart = new Date(`${dateStr}T${time}`);

    return this.events().find(event => {
      const appointmentStart = new Date(event.start);
      const appointmentDuration = event.duration || 60;
      const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);

      // Check if the time slot is within the appointment
      return appointmentStart <= timeSlotStart && appointmentEnd > timeSlotStart;
    });
  }

  // Get appointment display info for a time slot
  getAppointmentDisplayInfo(date: Date, time: string) {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return null;

    const appointmentStart = new Date(appointment.start);
    const appointmentDuration = appointment.duration || 60;
    const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);
    const timeSlotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);

    // Only show info if this is the start of the appointment
    if (appointmentStart.getTime() === timeSlotStart.getTime()) {
      return {
        title: appointment.title,
        duration: appointmentDuration,
        serviceName: appointment.serviceName,
        clientName: appointment.clientName
      };
    }

    return null;
  }

  // Check if a time slot is the start of an appointment
  isAppointmentStart(date: Date, time: string): boolean {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return false;

    const appointmentStart = new Date(appointment.start);
    const timeSlotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);

    return appointmentStart.getTime() === timeSlotStart.getTime();
  }

  // Check if a time slot is within an appointment (but not the start)
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
        return `Ocupat per: ${appointment.title} (${this.formatDuration(appointment.duration || 60)})`;
      }
      return 'Ocupat - No disponible';
    }

    return `Disponible - Clic per seleccionar`;
  }
}
