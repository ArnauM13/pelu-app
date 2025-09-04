import { Component, computed, inject, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { CalendarComponent } from '../../../../features/calendar/core/calendar.component';
import { BookingStateService } from '../services/booking-state.service';
import { BookingValidationService } from '../services/booking-validation.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';
import { startOfWeek, endOfWeek } from 'date-fns';

@Component({
  selector: 'pelu-desktop-layout',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
  ],
  template: `
    <div class="desktop-layout">
      <!-- Date Controls -->
      <div class="date-controls-section">
        <div class="date-controls">
          <pelu-button
            [label]="'COMMON.TIME.TODAY'"
            [icon]="'pi pi-calendar'"
            (clicked)="onTodayClicked()"
          ></pelu-button>

          <div class="week-navigation">
            <pelu-button
              [icon]="'pi pi-chevron-left'"
              [rounded]="true"
              (clicked)="goToPreviousWeek()"
              [ariaLabel]="'COMMON.ACTIONS.PREVIOUS' | translate"
            ></pelu-button>

            <div class="week-info">
              <span>{{ weekInfo() }}</span>
            </div>

            <pelu-button
              [icon]="'pi pi-chevron-right'"
              [rounded]="true"
              (clicked)="goToNextWeek()"
              [ariaLabel]="'COMMON.ACTIONS.NEXT' | translate"
            ></pelu-button>
          </div>
        </div>
      </div>

      <!-- Calendar Component -->
      <div class="calendar-section">
        <pelu-calendar-component
          #calendarComponent
          [mini]="false"
          [events]="[]"
          [isBlocked]="isCalendarBlocked()"
          (dateSelected)="onDesktopTimeSlotSelected($event)"
        ></pelu-calendar-component>
      </div>

      <!-- Footer -->
      <div class="footer-section">
        <!-- Footer content here -->
      </div>
    </div>
  `,
  styles: [`
    .desktop-layout {
      .date-controls-section {
        margin-bottom: 1rem;

        .date-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 0;
        }

        .week-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: auto;

          .week-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            background: transparent;

            span {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 0.35rem 1rem;
              height: 2.75rem;
              background: var(--primary-color);
              color: #fff;
              border-radius: 6px;
              font-weight: 600;
              font-size: 0.9rem;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
          }

          pelu-button {
            // Navigation buttons styling
            ::ng-deep .p-button {
              width: 40px;
              height: 40px;
              min-width: 40px;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
            }
          }
        }
      }

      .calendar-section {
        padding: 0;
        margin-bottom: 2rem;
      }

      .next-appointment-section {
        margin-bottom: 2rem;
      }

      .footer-section {
        margin-top: 2rem;
      }
    }

    @media (max-width: 768px) {
      .desktop-layout {
        .date-controls {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }

        .week-navigation {
          margin-left: 0;
          justify-content: center;
          gap: 0.75rem;

          .week-info {
            margin: 0;
          }

          pelu-button {
            ::ng-deep .p-button {
              width: 36px;
              height: 36px;
              min-width: 36px;
            }
          }
        }
      }
    }
  `]
})
export class DesktopLayoutComponent {
  @ViewChild('calendarComponent') calendarComponent!: CalendarComponent;

  private readonly bookingStateService = inject(BookingStateService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly timeUtils = inject(TimeUtils);

  // Output events
  timeSlotSelected = output<{ date: string; time: string }>();

  // ===== COMPUTED PROPERTIES =====

  readonly isCalendarBlocked = computed(() => this.bookingValidationService.isCalendarBlocked());

  // Computed week info that updates when calendar view changes
  readonly weekInfo = computed(() => {
    const referenceDate = this.bookingStateService.viewDate();
    const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const end = endOfWeek(referenceDate, { weekStartsOn: 1 });

    const formatDate = (date: Date) =>
      date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });

    return `${formatDate(start)} - ${formatDate(end)}`;
  });

  // ===== EVENT HANDLERS =====

  onTodayClicked(): void {
    const today = new Date();
    const firstBusinessDayOfWeek = this.timeUtils.getFirstBusinessDayOfWeek(today, [1, 2, 3, 4, 5, 6]);

    this.bookingStateService.setSelectedDate(firstBusinessDayOfWeek);
    this.calendarComponent?.onDateChange(firstBusinessDayOfWeek);
  }

  onDesktopTimeSlotSelected(event: { date: string; time: string }): void {
    this.timeSlotSelected.emit(event);
  }

  // ===== NAVIGATION METHODS =====

  goToPreviousWeek(): void {
    const currentDate = this.bookingStateService.viewDate();
    const newWeekDate = this.timeUtils.getPreviousWeek(currentDate);

    // Get the first business day of the new week
    const firstBusinessDay = this.timeUtils.getFirstBusinessDayOfWeek(newWeekDate, [1, 2, 3, 4, 5, 6]);

    // Update the view date to the first business day of the week
    this.bookingStateService.setViewDate(firstBusinessDay);

    // Update the calendar component to show the new week
    this.calendarComponent?.onDateChange(firstBusinessDay);

    this.bookingStateService.setSelectedDate(null);
  }

  goToNextWeek(): void {
    const currentDate = this.bookingStateService.viewDate();
    const newWeekDate = this.timeUtils.getNextWeek(currentDate);

    // Get the first business day of the new week
    const firstBusinessDay = this.timeUtils.getFirstBusinessDayOfWeek(newWeekDate, [1, 2, 3, 4, 5, 6]);

    // Update the view date to the first business day of the week
    this.bookingStateService.setViewDate(firstBusinessDay);

    // Update the calendar component to show the new week
    this.calendarComponent?.onDateChange(firstBusinessDay);

    this.bookingStateService.setSelectedDate(null);
  }
}
