import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DayHeaderData {
  date: Date;
  dayName: string;
  dayDate: string;
  isPast: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'pelu-calendar-day-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="day-header"
         [class.past]="data().isPast"
         [class.disabled]="data().isDisabled">
      <div class="day-name">{{ data().dayName }}</div>
      <div class="day-date">{{ data().dayDate }}</div>
    </div>
  `,
  styles: [`
    .day-header {
      padding: 0.5rem 0.25rem;
      background: #e9ecef;
      border-bottom: 1px solid #dee2e6;
      min-height: 40px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: baseline;
      gap: 0.5rem;
      grid-row: 1;
    }

    .day-name {
      font-weight: 600;
      color: #3b82f6;
      font-size: 0.8rem;
    }

    .day-date {
      color: #6c757d;
      font-size: 0.7rem;
    }

    .day-header.past .day-name,
    .day-header.past .day-date {
      color: #999;
    }

    .day-header.disabled .day-name,
    .day-header.disabled .day-date {
      color: #ccc;
    }
  `]
})
export class CalendarDayHeaderComponent {
  readonly data = input.required<DayHeaderData>();
}
