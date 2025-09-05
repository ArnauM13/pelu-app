import { Component, computed, inject, output, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { CalendarComponent } from '../../../../features/calendar/core/calendar.component';
import { BookingFormComponent } from './booking-form.component';
import { BookingStateService } from '../services/booking-state.service';
import { BookingValidationService } from '../services/booking-validation.service';
import { DateTimeSelectionService } from '../services/date-time-selection.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';
import { startOfWeek, endOfWeek } from 'date-fns';
import { Booking } from '../../../../core/interfaces/booking.interface';

@Component({
  selector: 'pelu-desktop-layout',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    BookingFormComponent,
  ],
  template: `
    <div class="desktop-layout">
      <!-- Two Column Grid Layout -->
      <div class="grid-container">
        <!-- Left Column: Title + Manual Booking -->
        <div class="left-column">
          <!-- Title Section -->
          <div class="title-section">
            <h1 class="page-title">{{ 'BOOKING.TITLE' | translate }}</h1>
            <p class="page-subtitle">{{ 'BOOKING.SUBTITLE' | translate }}</p>
          </div>

          <!-- Manual Booking Section -->
          <div class="manual-booking-section">
            <pelu-booking-form
              (bookingCreated)="onManualBookingCreated($event)"
            ></pelu-booking-form>
          </div>
        </div>

        <!-- Right Column: Date Controls + Calendar -->
        <div class="right-column">
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

          <!-- Calendar Section -->
          <div class="calendar-section">
            <pelu-calendar-component
              #calendarComponent
              [mini]="false"
              [events]="[]"
              [isBlocked]="isCalendarBlocked()"
              (dateSelected)="onDesktopTimeSlotSelected($event)"
            ></pelu-calendar-component>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .desktop-layout {
      .grid-container {
        display: grid;
        grid-template-columns: 1fr 4fr;
        gap: 2rem;
        min-height: 100vh;
        width: 100%;
        padding: 1rem 0;
      }

      .left-column {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .right-column {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        height: 100%;
      }

      .title-section {
        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary-color);
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 1.1rem;
          color: var(--text-color-secondary);
          margin: 0;
          line-height: 1.4;
        }
      }

      .manual-booking-section {
        flex: 1;
        min-width: 0;
      }

      .date-controls-section {
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
        flex: 1;
        min-width: 0;
        width: 100%;
        height: 100%;

        pelu-calendar-component {
          width: 100%;
          height: 100%;

          ::ng-deep {
            .calendar-container {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }

    @media (max-width: 1200px) {
      .desktop-layout {
        .grid-container {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .left-column {
          order: 2;
        }

        .right-column {
          order: 1;
        }
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

        .title-section {
          .page-title {
            font-size: 2rem;
          }

          .page-subtitle {
            font-size: 1rem;
          }
        }
      }
    }
  `]
})
export class DesktopLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('calendarComponent') calendarComponent!: CalendarComponent;

  private readonly bookingStateService = inject(BookingStateService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly dateTimeSelectionService = inject(DateTimeSelectionService);
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
    // Update the centralized date/time selection service
    this.dateTimeSelectionService.setSelectedDate(event.date);
    this.dateTimeSelectionService.setSelectedTime(event.time);

    // Update available time slots for the selected date and service
    const service = this.bookingStateService.selectedService();
    if (service) {
      this.dateTimeSelectionService.updateAvailableTimeSlots(service, this.bookingStateService.appointments());
    }

    // Emit the event to parent components
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

  // ===== MANUAL BOOKING METHODS =====

  onManualBookingCreated(booking: Booking): void {
    console.log('Manual booking created:', booking);

    // The booking state service already handles refreshing appointments
    // and dispatching the bookingUpdated event, which will update the calendar
  }

  // ===== LIFECYCLE METHODS =====

  ngOnInit(): void {
    // Listen for booking updates to refresh the calendar
    window.addEventListener('bookingUpdated', this.onBookingUpdated.bind(this));
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('bookingUpdated', this.onBookingUpdated.bind(this));
  }

  private onBookingUpdated(): void {
    console.log('Booking updated event received, refreshing calendar...');
    // Force calendar refresh by triggering a change detection
    // The calendar component should automatically update when appointments change
  }
}
