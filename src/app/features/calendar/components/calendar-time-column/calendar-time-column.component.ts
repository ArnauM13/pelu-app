import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimeSlot {
  time: string;
  isBlocked: boolean;
  isLunchBreakStart: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'pelu-calendar-time-column',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-column">
      <div class="time-header">Hora</div>
      @for (timeSlot of timeSlots(); track timeSlot.time; let k = $index) {
        <div class="time-slot-label"
             [class.lunch-break]="timeSlot.isBlocked"
             [class.lunch-break-start]="timeSlot.isLunchBreakStart"
             [class.disabled]="timeSlot.isDisabled">
          {{ timeSlot.time }}
        </div>
      }
    </div>
  `,
  styles: [`
    .time-column {
      min-width: 80px;
      max-width: 80px;
      width: 80px;
      flex-shrink: 0;
      background: #f8f9fa;
      border-right: 1px solid #e9ecef;
      display: grid;
      grid-template-rows: 40px repeat(var(--calendar-slot-count, 24), 30px);
    }

    .time-header {
      padding: 0.5rem 0.25rem;
      background: #e9ecef;
      font-weight: 600;
      text-align: center;
      border-bottom: 1px solid #dee2e6;
      font-size: 0.8rem;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      grid-row: 1;
    }

    .time-slot-label {
      padding: 0.25rem 0.25rem;
      text-align: center;
      font-size: 0.7rem;
      font-weight: 500;
      color: #495057;
      border-bottom: 1px solid #f1f3f4;
      height: 30px;
      min-height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .time-slot-label.lunch-break {
      background: #fff3cd;
      color: #856404;
      font-weight: 600;
    }

    .time-slot-label.lunch-break-start {
      background: #ffeaa7;
      color: #6c5ce7;
      font-weight: 700;
    }

    .time-slot-label.disabled {
      background: #f8f9fa;
      color: #6c757d;
      opacity: 0.7;
      font-style: italic;
    }
  `]
})
export class CalendarTimeColumnComponent {
  readonly timeSlots = input.required<TimeSlot[]>();
}
