import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimeSlotData {
  date: Date;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  isLunchBreak: boolean;
  isPastDate: boolean;
  isPastTime: boolean;
  isClickable: boolean;
  isDisabled: boolean;
  tooltip: string;
}

@Component({
  selector: 'pelu-calendar-time-slot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-slot"
         [class.available]="data().isAvailable"
         [class.booked]="data().isBooked"
         [class.lunch-break]="data().isLunchBreak"
         [class.past-date]="data().isPastDate"
         [class.past-time]="data().isPastTime"
         [class.clickable]="data().isClickable"
         [class.disabled]="data().isDisabled"
         [title]="data().tooltip"
         (click)="onTimeSlotClick()">
    </div>
  `,
  styles: [`
    .time-slot {
      height: 30px;
      min-height: 30px;
      border-bottom: 1px solid #f1f3f4;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.1rem;
      transition: all 0.2s ease;
      overflow: hidden;
      cursor: default;
      grid-row: auto;
    }

    .time-slot.clickable {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .time-slot.clickable:hover {
      background: #e3f2fd;
      border-color: #3b82f6;
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    }

    .time-slot.available {
      background: #f8f9fa;
      color: #6c757d;
      cursor: pointer;
    }

    .time-slot.available:hover {
      background: #e9ecef;
    }

    .time-slot.booked {
      background: #f8f9fa;
      color: #6c757d;
      cursor: pointer;
      position: relative;
    }

    .time-slot.booked::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 2px,
        rgba(108, 117, 125, 0.1) 2px,
        rgba(108, 117, 125, 0.1) 4px
      );
    }

    .time-slot.lunch-break {
      background: #fff3cd;
      color: #856404;
      cursor: not-allowed;
      opacity: 0.8;
      position: relative;
    }

    .time-slot.lunch-break::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 2px,
        rgba(253, 203, 110, 0.3) 2px,
        rgba(253, 203, 110, 0.3) 4px
      );
      pointer-events: none;
    }

    .time-slot.past-date {
      background: #f8f9fa;
      color: #6c757d;
      cursor: default;
      opacity: 0.7;
      position: relative;
    }

    .time-slot.past-date::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(173, 181, 189, 0.05) 50%,
        transparent 70%
      );
    }

    .time-slot.past-time {
      background: #f8f9fa;
      color: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
      position: relative;
      pointer-events: none;
    }

    .time-slot.past-time::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        transparent 40%,
        rgba(173, 181, 189, 0.15) 50%,
        transparent 60%
      );
    }

    .time-slot.disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
  `]
})
export class CalendarTimeSlotComponent {
  readonly data = input.required<TimeSlotData>();
  readonly clicked = output<{date: Date, time: string}>();

  onTimeSlotClick(): void {
    if (this.data().isClickable) {
      this.clicked.emit({
        date: this.data().date,
        time: this.data().time
      });
    }
  }
}
