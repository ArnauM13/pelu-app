import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { BookingValidationService } from '../services/booking-validation.service';

export type CalendarViewMode = 'week' | 'month';

@Component({
  selector: 'pelu-calendar-header',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
  ],
  template: `
    <div class="calendar-header">
      <h3>{{ 'COMMON.SELECTION.SELECT_DAY' | translate }}</h3>
      <div class="calendar-buttons">
        <pelu-button
          [label]="'BOOKING.QUICK_SELECTION.TODAY'"
          [icon]="'pi pi-calendar'"
          [disabled]="!canSelectDate(getToday())"
          (clicked)="canSelectDate(getToday()) ? onTodayClicked() : null"
          severity="primary"
          size="small"
        ></pelu-button>
        <pelu-button
          [label]="viewMode() === 'week' ? 'COMMON.VIEWS.CALENDAR.VIEW_MONTH' : 'COMMON.VIEWS.CALENDAR.VIEW_WEEK'"
          [icon]="viewMode() === 'week' ? 'pi pi-calendar' : 'pi pi-calendar-times'"
          (clicked)="onViewModeToggle()"
          [ariaLabel]="viewMode() === 'week' ? 'COMMON.VIEWS.CALENDAR.VIEW_MONTH' : 'COMMON.VIEWS.CALENDAR.VIEW_WEEK'"
          severity="secondary"
          size="small"
          [raised]="true"
        ></pelu-button>
      </div>
    </div>
  `,
  styles: [`
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .calendar-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        align-items: center;

        pelu-button {
          ::ng-deep .p-button {
            min-width: auto;
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }
        }
      }

      h3 {
        color: #0d47a1;
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
      }
    }
  `]
})
export class CalendarHeaderComponent {
  private readonly bookingValidationService = inject(BookingValidationService);

  // Input signals
  readonly viewMode = input<CalendarViewMode>('week');

  // Output events
  readonly todayClicked = output<void>();
  readonly viewModeToggle = output<void>();

  // ===== EVENT HANDLERS =====

  onTodayClicked(): void {
    this.todayClicked.emit();
  }

  onViewModeToggle(): void {
    this.viewModeToggle.emit();
  }

  // ===== UTILITY METHODS =====

  getToday(): Date {
    return new Date();
  }

  canSelectDate(date: Date): boolean {
    return this.bookingValidationService.canSelectDate(date);
  }
}
