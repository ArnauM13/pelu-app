import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { BookingStateService } from '../services/booking-state.service';

export type CalendarViewMode = 'week' | 'month';

@Component({
  selector: 'pelu-calendar-period-navigation',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
  ],
  template: `
    <div class="period-navigation">
      <pelu-button
        [icon]="'pi pi-chevron-left'"
        [disabled]="!canGoToPreviousPeriod()"
        (clicked)="canGoToPreviousPeriod() ? onPreviousPeriod() : null"
        severity="secondary"
        [rounded]="true"
        [ariaLabel]="'COMMON.ACTIONS.PREVIOUS' | translate"
      ></pelu-button>

      <div class="current-period">
        @if (viewMode() === 'week') {
          <span class="period-label">{{ 'COMMON.WEEK_OF' | translate }}</span>
          <span class="period-date">
            {{ weekDays().length > 0 ? formatDay(weekDays()[0]) : '' }}
            -
            {{ weekDays().length > 6 ? formatDay(weekDays()[6]) : '' }}
          </span>
        }
        @if (viewMode() === 'month') {
          <span class="period-label">{{ 'COMMON.MONTH_OF' | translate }}</span>
          <span class="period-date">
            {{ formatMonth(viewDate()) }}
          </span>
        }
      </div>

      <pelu-button
        [icon]="'pi pi-chevron-right'"
        (clicked)="onNextPeriod()"
        severity="secondary"
        [rounded]="true"
        [ariaLabel]="'COMMON.ACTIONS.NEXT' | translate"
      ></pelu-button>
    </div>
  `,
  styles: [`
    .period-navigation {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      padding: 1rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(25, 118, 210, 0.1);
      box-shadow: 0 4px 12px rgba(13, 71, 161, 0.08);

      .current-period {
        text-align: center;
        flex: 1;
        margin: 0 1rem;

        .period-label {
          display: block;
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 0.25rem;
          color: #000000;
        }

        .period-date {
          font-weight: 600;
          font-size: 1rem;
          color: #000000;
        }
      }

      pelu-button {
        ::ng-deep .p-button {
          width: 40px;
          height: 40px;
          min-width: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  `]
})
export class CalendarPeriodNavigationComponent {
  private readonly bookingStateService = inject(BookingStateService);

  // Input signals
  readonly viewMode = input<CalendarViewMode>('week');
  readonly weekDays = input<Date[]>([]);

  // Output events
  readonly previousPeriod = output<void>();
  readonly nextPeriod = output<void>();

  // ===== COMPUTED PROPERTIES =====

  readonly viewDate = computed(() => this.bookingStateService.viewDate());

  // ===== EVENT HANDLERS =====

  onPreviousPeriod(): void {
    this.previousPeriod.emit();
  }

  onNextPeriod(): void {
    this.nextPeriod.emit();
  }

  // ===== UTILITY METHODS =====

  canGoToPreviousPeriod(): boolean {
    return true; // Allow free navigation
  }

  // ===== FORMATTING METHODS =====

  formatDay(date: Date): string {
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatMonth(date: Date): string {
    return date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' });
  }
}
