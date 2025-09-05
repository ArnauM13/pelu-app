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
      <!-- Backdrop for mobile overlay -->
      <div
        class="mobile-backdrop"
        [class.visible]="!sidebarCollapsed()"
        (click)="closeSidebarOnMobile()"
      ></div>

      <!-- Two Column Grid Layout -->
      <div class="grid-container" [class.sidebar-collapsed]="sidebarCollapsed()">
        <!-- Left Column: Title + Manual Booking -->
        <div class="left-column" [class.collapsed]="sidebarCollapsed()">
          <div class="sidebar-content">
            <!-- Title Section - Hide in overlay mode (< 1275px) -->
            <div class="title-section" [class.hidden-in-overlay]="true">
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
        </div>

        <!-- Right Column: Date Controls + Calendar -->
        <div class="right-column">
          <!-- Sidebar Toggle Button -->
          <div class="sidebar-toggle">
            <pelu-button
              [icon]="sidebarCollapsed() ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
              [rounded]="true"
              (clicked)="toggleSidebar()"
              [ariaLabel]="sidebarCollapsed() ? 'Expandir sidebar' : 'Plegar sidebar'"
              class="toggle-button"
            ></pelu-button>
          </div>
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
      position: relative;

      .mobile-backdrop {
        position: fixed;
        top: 70px; // Below header
        left: 0;
        width: 100vw;
        height: calc(100vh - 70px); // Account for header height
        background: rgba(0, 0, 0, 0.5);
        z-index: 140; // Below sidebar but above normal content
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        display: none;

        &.visible {
          opacity: 1;
          visibility: visible;
        }

        @media (max-width: 1275px) {
          display: block;
        }
      }

      .right-column {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        height: 100%;
        transition: all 0.3s ease;

        .sidebar-toggle {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 1000;
          background: var(--primary-color);
          border-radius: 0 8px 8px 0;
          padding: 0.5rem 0.25rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;

          .toggle-button {
            ::ng-deep .p-button {
              background: transparent !important;
              border: none !important;
              color: white !important;
              width: 32px;
              height: 32px;
              min-width: 32px;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              transition: all 0.3s ease;

              .p-button-icon {
                transition: transform 0.3s ease;
                font-size: 1.2rem;
              }

              &:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                transform: scale(1.1);

                .p-button-icon {
                  transform: translateX(1px);
                }
              }

              &:active {
                transform: scale(0.95);
              }
            }
          }
        }
      }

      .grid-container {
        display: grid;
        grid-template-columns: 375px auto;
        gap: 2rem;
        min-height: 100vh;
        width: 100%;
        padding: 1rem 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

        &.sidebar-collapsed {
          grid-template-columns: 0px auto;
          gap: 0;

          .right-column .sidebar-toggle {
            background: var(--primary-color);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);

            .toggle-button ::ng-deep .p-button .p-button-icon {
              animation: pulseExpand 0.6s ease-in-out;
            }
          }
        }
      }

      .left-column {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        overflow: hidden;
        transition: all 0.3s ease;

        &.collapsed {
          width: 0;
          min-width: 0;
          opacity: 0;
          visibility: hidden;
        }

        .sidebar-content {
          width: 100%;
          min-width: 300px;
          transition: all 0.3s ease;
        }
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

    @media (max-width: 1275px) {
      .desktop-layout {
        .grid-container {
          grid-template-columns: auto !important;
          gap: 0 !important;
          position: relative;
        }

        .left-column {
          position: fixed;
          top: 70px; // Below header height
          left: 0;
          width: 375px;
          height: calc(100vh - 70px); // Account for header height
          background: white;
          z-index: 150; // Below header (200) but above normal content
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          padding: 1rem;

          &.collapsed {
            transform: translateX(-100%);
            opacity: 0;
            visibility: hidden;
          }

          &:not(.collapsed) {
            transform: translateX(0);
            opacity: 1 !important;
            visibility: visible !important;
          }

          .sidebar-content {
            min-width: auto;
            width: 100%;

            .title-section.hidden-in-overlay {
              display: none;
            }
          }
        }

        .right-column {
          width: 100%;

          .sidebar-toggle {
            position: fixed;
            top: 50%;
            left: 1rem;
            transform: translateY(-50%);
            z-index: 1002;
            background: var(--primary-color);
            border-radius: 8px;
            padding: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

    @keyframes pulseExpand {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(-10px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
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
  readonly sidebarCollapsed = computed(() => this.bookingStateService.sidebarCollapsed());

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

  // ===== SIDEBAR METHODS =====

  toggleSidebar(): void {
    this.bookingStateService.toggleSidebar();
  }

  closeSidebarOnMobile(): void {
    // Only close if we're in mobile view (< 1275px)
    if (window.innerWidth < 1275) {
      this.bookingStateService.setSidebarCollapsed(true);
    }
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
