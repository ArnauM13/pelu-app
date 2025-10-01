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
      @for (day of days(); track day.toISOString().split('T')[0]) {
        <div
          class="day-item"
          [class.past-date]="isPastDate(day)"
          [class.non-working-day]="!isBusinessDay(day)"
          [class.today]="isToday(day)"
          [class.selected]="isSelected(day)"
          [class.current-week]="isCurrentWeek(day)"
          [class.warning-day]="canSelectDate(day) && isBusinessDay(day) && isFullyBookedWorkingDayForService(day)"
          [class.out-of-range]="canSelectDate(day) && !canMakeBookingOnDate(day)"
          [class.adjacent-month]="isAdjacentMonth(day)"
          (click)="onDateClicked(day)"
        >
          <div class="day-name">{{ formatDayShort(day) }}</div>
          <div class="day-number">{{ day.getDate() }}</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.38rem;
      transition: all 0.3s ease-in-out;

      @media (max-width: 480px) {
        gap: 0.19rem;
      }

      &.month-view {
        grid-template-columns: repeat(7, 1fr);
        gap: 0.19rem;

        @media (max-width: 480px) {
          gap: 0.11rem;
        }
      }
    }

    .day-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.56rem 0.38rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      border: 1.5px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      &.today {
        border-color: #10b981 !important;
        background: #f0fdf4 !important;
        color: #10b981 !important;

        .day-name,
        .day-number {
          color: #10b981 !important;
        }
      }

      &.today.selected {
        border-color: #667eea !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;

        .day-name,
        .day-number {
          color: white !important;
        }
      }

      &.selected {
        border-color: #667eea;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      &.current-week {
        border-color: #3b82f6 !important;
        background: #eff6ff !important;
        color: #1e40af !important;

        .day-name,
        .day-number {
          color: #1e40af !important;
          font-weight: 600 !important;
        }

        &:hover {
          background: #dbeafe !important;
          border-color: #2563eb !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
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

        // Today should always be green, even if it's a past date
        &.today {
          border-color: #10b981 !important;
          background: #f0fdf4 !important;
          color: #10b981 !important;
          opacity: 0.8 !important;

          .day-name,
          .day-number {
            color: #10b981 !important;
          }
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

        // Today should always be green, even if it's a non-working day
        &.today {
          border-color: #10b981 !important;
          background: #f0fdf4 !important;
          color: #10b981 !important;
          opacity: 0.8 !important;
          text-decoration: none !important;

          .day-name,
          .day-number {
            color: #10b981 !important;
          }
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

      &.out-of-range {
        opacity: 0.3;
        background: #f3f4f6;
        cursor: pointer;
        position: relative;

        .day-name,
        .day-number {
          color: var(--input-placeholder-color);
        }

        &:hover {
          opacity: 0.5;
          background: #e5e7eb;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        // Out of range days can still be selected and show today
        &.today {
          border-color: #10b981 !important;
          background: #f0fdf4 !important;
          opacity: 0.8 !important;

          .day-name,
          .day-number {
            color: #10b981 !important;
          }
        }

        &.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0.9;

          .day-name,
          .day-number {
            color: white;
          }
        }
      }

      &.adjacent-month {
        opacity: 0.5;
        background: #f8f9fa;
        color: #9ca3af;
        border-color: #e5e7eb;
        cursor: pointer;
        position: relative;

        .day-name,
        .day-number {
          color: #9ca3af;
        }

        &:hover {
          opacity: 0.8;
          background: #e9ecef;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #adb5bd;
        }

        // Adjacent month days can still be selected and show today
        &.today {
          border-color: #10b981 !important;
          background: #f0fdf4 !important;
          opacity: 0.8 !important;

          .day-name,
          .day-number {
            color: #10b981 !important;
          }
        }

        &.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0.9;

          .day-name,
          .day-number {
            color: white;
          }
        }

        // Add a subtle indicator that these are adjacent month days
        &::before {
          content: '';
          position: absolute;
          top: 2px;
          right: 2px;
          width: 4px;
          height: 4px;
          background: #9ca3af;
          border-radius: 50%;
          opacity: 0.6;
        }
      }

      .day-name {
        font-size: 0.6rem;
        font-weight: 600;
        margin-bottom: 0.19rem;
        text-transform: uppercase;
      }

      .day-number {
        font-size: 0.9rem;
        font-weight: 700;
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
  readonly currentMonth = input<Date | null>(null); // Add current month for adjacent day detection
  readonly currentView = input<'daily' | 'weekly'>('weekly'); // Current view mode from main calendar

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

    const viewMode = this.currentView();

    if (viewMode === 'weekly') {
      // In weekly view, check if the date is in the same week as the selected date
      return this.isInSameWeek(date, selectedDate);
    } else {
      // In daily view, check if it's the exact same day
      return this.isSameDay(date, selectedDate);
    }
  }

  // Check if a date is in the current week being displayed
  isCurrentWeek(date: Date): boolean {
    const viewMode = this.currentView();

    if (viewMode === 'weekly') {
      const selectedDate = this.selectedDate();
      if (!selectedDate) return false;

      // Check if the date is in the same week as the selected date
      return this.isInSameWeek(date, selectedDate);
    }

    return false;
  }

  private isInSameWeek(date1: Date, date2: Date): boolean {
    const weekStart1 = this.getWeekStart(date1);
    const weekStart2 = this.getWeekStart(date2);
    return this.isSameDay(weekStart1, weekStart2);
  }

  private getWeekStart(date: Date): Date {
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1, Sunday = 0
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
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

  canMakeBookingOnDate(date: Date): boolean {
    return this.bookingValidationService.canMakeBookingOnDate(date);
  }

  isFullyBookedWorkingDayForService(day: Date): boolean {
    return this.bookingValidationService.isFullyBookedWorkingDayForService(day);
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  // Check if a day belongs to the current month being displayed
  isCurrentMonth(date: Date): boolean {
    const currentMonth = this.currentMonth();
    if (!currentMonth) return true; // If no current month specified, treat all as current

    return date.getMonth() === currentMonth.getMonth() &&
           date.getFullYear() === currentMonth.getFullYear();
  }

  // Check if a day is from an adjacent month (previous or next)
  isAdjacentMonth(date: Date): boolean {
    return !this.isCurrentMonth(date);
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
