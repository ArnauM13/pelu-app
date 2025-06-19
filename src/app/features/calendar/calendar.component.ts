import { Component, input, computed, output, signal, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';

@Component({
  selector: 'pelu-calendar-component',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  @ViewChild('calendarContainer') calendarContainer!: ElementRef;

  mini = input<boolean>(false);
  events = input<{ title: string; start: string }[]>([]);

  dateSelected = output<{date: string, time: string}>();

  private today = new Date();
  private todayStr = this.today.toISOString().split('T')[0];
  private selectedDateTime = signal<{date: string, time: string}>({date: '', time: ''});
  showTimePopup = signal<boolean>(false);
  popupDate = signal<string>('');

  constructor() {
    // Effect to reapply styles when view changes
    effect(() => {
      const selected = this.selectedDateTime();

      if (selected.date) {
        setTimeout(() => {
          this.applySelectedDateStyle(selected.date);
        }, 200);
      }
    });
  }

  private baseOptions = computed<CalendarOptions>(() => {
    const isMini = this.mini();
    return {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      height: isMini ? 400 : 'auto',
      headerToolbar: isMini ? {
        left: 'prev,next',
        center: 'title',
        right: ''
      } : {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      buttonText: {
        prev: '←',
        next: '→',
        today: 'Avui'
      },
      validRange: {
        start: this.todayStr
      },
      selectable: false,
      dateClick: (info: any) => {
        console.log('Date clicked:', info.dateStr);
        const clickedDate = info.dateStr;
        if (clickedDate >= this.todayStr) {
          // Show time popup for date selection
          this.popupDate.set(clickedDate);
          this.showTimePopup.set(true);
        }
      },
      dayCellDidMount: (info) => {
        const cellDate = info.date.toISOString().split('T')[0];
        if (cellDate < this.todayStr) {
          info.el.style.opacity = '0.5';
          info.el.style.pointerEvents = 'none';
        }

        if (cellDate === this.selectedDateTime().date) {
          this.addSelectedClass(info.el);
        }
      },
      datesSet: () => {
        setTimeout(() => {
          const selected = this.selectedDateTime();
          if (selected.date) {
            this.applySelectedDateStyle(selected.date);
          }
        }, 100);
      }
    };
  });

  calendarOptions = computed(() => {
    const base = this.baseOptions();
    const events = this.events();
    return {
      ...base,
      events: events
    };
  });

  selectTime(time: string) {
    const date = this.popupDate();
    this.selectedDateTime.set({date, time});
    this.applySelectedDateStyle(date);
    this.dateSelected.emit({date, time});
    this.showTimePopup.set(false);
  }

  closeTimePopup() {
    this.showTimePopup.set(false);
  }

  private applySelectedDateStyle(selectedDate: string) {
    const cells = this.calendarContainer?.nativeElement?.querySelectorAll('.fc-daygrid-day');
    if (cells) {
      cells.forEach((cell: any) => {
        cell.classList.remove('selected-date');
        this.removeSelectedClass(cell);
        const dateAttr = cell.getAttribute('data-date');
        if (dateAttr === selectedDate) {
          this.addSelectedClass(cell);
        }
      });
    }
  }

  private clearSelectedDateStyle() {
    const cells = this.calendarContainer?.nativeElement?.querySelectorAll('.fc-daygrid-day');
    if (cells) {
      cells.forEach((cell: any) => {
        cell.classList.remove('selected-date');
        this.removeSelectedClass(cell);
      });
    }
  }

  private addSelectedClass(element: any) {
    element.classList.add('selected-date');
    element.style.backgroundColor = '#3b82f6';
    element.style.color = 'white';
    element.style.borderRadius = '6px';
    element.style.fontWeight = '600';
    element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  }

  private removeSelectedClass(element: any) {
    element.style.backgroundColor = '';
    element.style.color = '';
    element.style.borderRadius = '';
    element.style.fontWeight = '';
    element.style.boxShadow = '';
  }

  getSelectedDateMessage() {
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
  }

  getTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
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
}
