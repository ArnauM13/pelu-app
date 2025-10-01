import { Component, computed, inject, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarGridComponent } from './calendar-grid.component';
import { BookingStateService } from '../services/booking-state.service';
import { CalendarStateService } from '../../../calendar/services/calendar-state.service';

@Component({
  selector: 'pelu-monthly-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarGridComponent,
  ],
  template: `
    <div class="monthly-calendar">
      <!-- Calendar Grid Only -->
      <pelu-calendar-grid
        [days]="monthDays()"
        [viewMode]="'month'"
        [selectedDate]="selectedDate()"
        [currentMonth]="monthlyViewDate()"
        [currentView]="currentView()"
        (dateSelected)="onDateClicked($event)"
      ></pelu-calendar-grid>
    </div>
  `
})
export class MonthlyCalendarComponent {
  private readonly bookingStateService = inject(BookingStateService);
  private readonly calendarStateService = inject(CalendarStateService);

  // Input signals
  readonly selectedDate = input<Date | null>(null);
  readonly viewDate = input<Date | null>(null);
  readonly referenceDate = input<Date | null>(null); // Date to use for determining which month to show
  readonly currentView = input<'daily' | 'weekly'>('weekly'); // Current view mode from main calendar

  // Output events
  readonly dateSelected = output<Date>();

  // ===== INTERNAL STATE =====

  // Internal state for monthly calendar navigation (independent from main calendar)
  readonly monthlyViewDate = signal<Date>(new Date());

  // ===== COMPUTED PROPERTIES =====

  // Get the current month date for adjacent day detection and month display
  readonly currentMonthDate = computed(() => {
    // Use the internal monthly view date for navigation
    return this.monthlyViewDate();
  });

  // Simple reactive computation: use the reference date to determine which month to show
  readonly monthDays = computed(() => {
    // Use the current month date (which is based on monthlyViewDate)
    const monthDate = this.currentMonthDate();
    return this.bookingStateService.getCompleteMonthCalendar(monthDate);
  });

  // ===== LIFECYCLE =====

  constructor() {
    // Sync with main calendar when referenceDate changes
    effect(() => {
      const referenceDate = this.referenceDate();
      if (referenceDate) {
        this.monthlyViewDate.set(referenceDate);
      } else {
        // Initialize with current date if no reference date
        this.monthlyViewDate.set(new Date());
      }
    });
  }

  // ===== NAVIGATION METHODS =====

  navigateToPreviousMonth(): void {
    const currentDate = this.monthlyViewDate();
    const previousMonth = new Date(currentDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    this.monthlyViewDate.set(previousMonth);
  }

  navigateToNextMonth(): void {
    const currentDate = this.monthlyViewDate();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.monthlyViewDate.set(nextMonth);
  }

  // ===== EVENT HANDLERS =====

  onDateClicked(date: Date): void {
    const viewMode = this.currentView();

    if (viewMode === 'weekly') {
      // In weekly view, we need to select the entire week containing the clicked date
      const weekStart = this.getWeekStart(date);
      this.dateSelected.emit(weekStart);
    } else {
      // In daily view, select the specific day
      this.dateSelected.emit(date);
    }
  }

  private getWeekStart(date: Date): Date {
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1, Sunday = 0
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

}
