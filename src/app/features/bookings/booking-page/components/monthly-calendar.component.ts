import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarGridComponent } from './calendar-grid.component';
import { BookingStateService } from '../services/booking-state.service';

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
        (dateSelected)="onDateClicked($event)"
      ></pelu-calendar-grid>
    </div>
  `
})
export class MonthlyCalendarComponent {
  private readonly bookingStateService = inject(BookingStateService);

  // Input signals
  readonly selectedDate = input<Date | null>(null);

  // Output events
  readonly dateSelected = output<Date>();

  // ===== COMPUTED PROPERTIES =====

  readonly monthDays = computed(() => this.bookingStateService.monthDays());

  // ===== EVENT HANDLERS =====

  onDateClicked(date: Date): void {
    this.dateSelected.emit(date);
  }
}
