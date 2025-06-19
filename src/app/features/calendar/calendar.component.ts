import { Component, input, computed, output, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';

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

  dateSelected = output<string>();

  private today = new Date();
  private todayStr = this.today.toISOString().split('T')[0];
  private selectedDate = signal<string>('');

  private baseOptions = computed<CalendarOptions>(() => {
    const isMini = this.mini();
    return {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: isMini ? 'dayGridWeek' : 'dayGridMonth',
      height: isMini ? 250 : 'auto',
      headerToolbar: isMini ? {
        left: 'prev,next',
        center: 'title',
        right: ''
      } : {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
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
      dateClick: (info) => {
        console.log('Date clicked:', info.dateStr);
        const clickedDate = info.dateStr;
        if (clickedDate >= this.todayStr) {
          const currentSelected = this.selectedDate();

          if (currentSelected === clickedDate) {
            // If same date is clicked, deselect it
            console.log('Deselecting date:', clickedDate);
            this.selectedDate.set('');
            this.clearSelectedDateStyle();
            this.dateSelected.emit('');
          } else {
            // Select new date
            console.log('Selecting new date:', clickedDate);
            this.selectedDate.set(clickedDate);
            this.applySelectedDateStyle(clickedDate);
            this.dateSelected.emit(clickedDate);
          }
        }
      },
      dayCellDidMount: (info) => {
        const cellDate = info.date.toISOString().split('T')[0];
        if (cellDate < this.todayStr) {
          info.el.style.opacity = '0.5';
          info.el.style.pointerEvents = 'none';
        }

        // Add selected date styling
        if (cellDate === this.selectedDate()) {
          this.addSelectedClass(info.el);
        }
      },
      datesSet: () => {
        // Re-apply selected date styling when view changes
        setTimeout(() => {
          const selectedDate = this.selectedDate();
          if (selectedDate) {
            this.applySelectedDateStyle(selectedDate);
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
    const selected = this.selectedDate();
    if (selected) {
      const date = new Date(selected);
      return `Dia seleccionat: ${date.toLocaleDateString('ca-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
    }
    return 'Cap dia seleccionat';
  }
}
