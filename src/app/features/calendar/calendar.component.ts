import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule, CalendarView, CalendarEvent, CalendarUtils, DateAdapter, CalendarA11y } from 'angular-calendar';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format, addDays, isSameDay, isSameWeek, eachDayOfInterval } from 'date-fns';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ca } from 'date-fns/locale';

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
  readonly events = input<{ title: string; start: string }[]>([]);

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

  // Computed properties
  readonly weekDays = computed(() => {
    const start = startOfWeek(this.viewDate(), { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(this.viewDate(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  });

  readonly calendarEvents = computed(() => {
    return this.events().map(event => ({
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.start),
      color: {
        primary: '#3b82f6',
        secondary: '#dbeafe'
      }
    }));
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

  // Check if a time slot is available
  isTimeSlotAvailable(date: Date, time: string) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const eventKey = `${dateStr}T${time}`;
    return !this.events().some(event => event.start === eventKey);
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
    const dateStr = format(date, 'yyyy-MM-dd');
    this.selectedDateTimeSignal.set({date: dateStr, time: time});
    this.dateSelected.emit({date: dateStr, time: time});
  }

  // Check if a day is selected
  isDaySelected(date: Date): boolean {
    return this.selectedDay() ? isSameDay(this.selectedDay()!, date) : false;
  }

  previousWeek() {
    this.viewDateSignal.set(addDays(this.viewDate(), -7));
    this.selectedDaySignal.set(null); // Clear selection when changing weeks
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
}
