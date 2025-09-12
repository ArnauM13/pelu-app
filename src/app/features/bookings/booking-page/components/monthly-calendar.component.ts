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
  `,
  styles: [`
    .monthly-calendar {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      padding: 1rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(13, 71, 161, 0.08);
    }
  `]
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
