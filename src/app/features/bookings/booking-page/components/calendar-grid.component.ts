import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BookingValidationService } from '../services/booking-validation.service';
import { UserService } from '../../../../core/services/user.service';

export type CalendarViewMode = 'week' | 'month';

@Component({
  selector: 'pelu-calendar-grid',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
  ],
  template: `
    <div class="days-grid" [class.month-view]="viewMode() === 'month'">
      @for (day of days(); track day) {
        <div
          class="day-item"
          [class.past-date]="isPastDate(day)"
          [class.non-working-day]="!isBusinessDay(day)"
          [class.today]="isToday(day)"
          [class.selected]="isSelected(day)"
          [class.warning-day]="canSelectDate(day) && isBusinessDay(day) && isFullyBookedWorkingDayForService(day)"
          (click)="onDateClicked(day)"
        >
          <div class="day-name">{{ formatDayShort(day) }}</div>
          <div class="day-number">{{ day.getDate() }}</div>
          @if (isToday(day)) {
            <div class="today-indicator">{{ 'COMMON.TIME.TODAY' | translate }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
      transition: all 0.3s ease-in-out;

      @media (max-width: 480px) {
        gap: 0.25rem;
      }

      &.month-view {
        grid-template-columns: repeat(7, 1fr);
        gap: 0.25rem;

        @media (max-width: 480px) {
          gap: 0.15rem;
        }
      }
    }

    .day-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      &.today {
        border-color: #10b981;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }

      &.selected {
        border-color: #667eea;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      &.past-date {
        opacity: 0.3;
        background: #f3f4f6;
        cursor: not-allowed;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          width: 100%;
          height: 2px;
          background: #ef4444;
          opacity: 0.6;
        }

        .day-name,
        .day-number {
          color: var(--input-placeholder-color);
        }
      }

      &.non-working-day {
        opacity: 0.5;
        text-decoration: line-through;
        background: #f3f4f6;
        border: 2px solid #d1d5db;
        color: #6b7280;

        .day-name,
        .day-number {
          color: #6b7280;
        }

        &:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
      }

      &.warning-day {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #92400e;
        border-color: #f59e0b;
        position: relative;

        &::before {
          content: '⚠️';
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 0.8rem;
          background: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .day-name,
        .day-number {
          color: #92400e;
        }

        &:hover {
          background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }
      }

      .day-name {
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
      }

      .day-number {
        font-size: 1.2rem;
        font-weight: 700;
      }

      .today-indicator {
        font-size: 0.7rem;
        margin-top: 0.25rem;
        opacity: 0.8;
      }
    }
  `]
})
export class CalendarGridComponent {
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly userService = inject(UserService);

  // Input signals
  readonly days = input<Date[]>([]);
  readonly viewMode = input<CalendarViewMode>('week');
  readonly selectedDate = input<Date | null>(null);

  // Output events
  readonly dateSelected = output<Date>();

  // ===== EVENT HANDLERS =====

  onDateClicked(date: Date): void {
    if (this.canSelectDate(date)) {
      this.dateSelected.emit(date);
    }
  }

  // ===== UTILITY METHODS =====

  isToday(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  }

  isSelected(date: Date): boolean {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return false;
    return this.isSameDay(date, selectedDate);
  }

  isBusinessDay(date: Date): boolean {
    return this.bookingValidationService.isBusinessDay(date);
  }

  isPastDate(date: Date): boolean {
    return this.bookingValidationService.isPastDate(date);
  }

  canSelectDate(date: Date): boolean {
    return this.bookingValidationService.canSelectDate(date);
  }

  isFullyBookedWorkingDayForService(day: Date): boolean {
    return this.bookingValidationService.isFullyBookedWorkingDayForService(day);
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  // ===== FORMATTING METHODS =====

  formatDayShort(date: Date): string {
    return date.toLocaleDateString('ca-ES', { weekday: 'short' });
  }

  // ===== PRIVATE UTILITY METHODS =====

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}
