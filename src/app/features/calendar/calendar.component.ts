import { Component, input, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions } from '@fullcalendar/core';

@Component({
  selector: 'pelu-calendar-component',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  events = input<{ title: string; start: string }[]>([]);

  private baseOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    }
  });

  calendarOptions = computed(() => {
    const base = this.baseOptions();
    const events = this.events();
    return {
      ...base,
      events: events
    };
  });

  constructor() {
    // Effect to log when events change (optional, for debugging)
    effect(() => {
      const events = this.events();
      console.log('Calendar events updated:', events.length, 'events');
    });
  }
}
