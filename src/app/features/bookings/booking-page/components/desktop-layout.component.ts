import { Component, computed, inject, output, ViewChild, OnInit, OnDestroy, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { CalendarComponent } from '../../../../features/calendar/core/calendar.component';
import { BookingFormComponent } from './booking-form.component';
import { DateControlsComponent } from './date-controls/date-controls.component';
import { MonthlyCalendarComponent } from './monthly-calendar.component';
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
    CardComponent,
    CalendarComponent,
    BookingFormComponent,
    DateControlsComponent,
    MonthlyCalendarComponent,
  ],
  template: `
    <div class="desktop-layout">
      <!-- Backdrop for mobile overlay -->
      <div
        class="mobile-backdrop"
        [class.visible]="shouldShowSidebar()"
        (click)="closeSidebarOnMobile()"
      ></div>

      <!-- Two Column Grid Layout -->
      <div class="grid-container" [class.sidebar-collapsed]="sidebarCollapsed()">
        <!-- Left Column: Title + Monthly Calendar + Manual Booking -->
        <div class="left-column" [class.collapsed]="!shouldShowSidebar()">
          <div class="sidebar-content">
            <!-- Title Section - Hide in overlay mode (< 1275px) -->
            <div class="title-section" [class.hidden-in-overlay]="true">
              <h1 class="page-title">{{ 'BOOKING.TITLE' | translate }}</h1>
              <p class="page-subtitle">{{ 'BOOKING.SUBTITLE' | translate }}</p>
            </div>

            <!-- Date Controls Section -->
            <div class="left-date-controls-section">
              <pelu-card class="month-navigation-card">
                <div class="month-navigation">
                  <div class="month-display">
                    <span class="month-name">{{ currentMonthName() }}</span>
                  </div>

                  <div class="navigation-buttons">
                    <pelu-button
                      [icon]="'pi pi-chevron-left'"
                      [rounded]="true"
                      (clicked)="onPreviousMonth()"
                      [ariaLabel]="'Previous month'"
                      size="small"
                      severity="secondary"
                    ></pelu-button>

                    <pelu-button
                      [icon]="'pi pi-chevron-right'"
                      [rounded]="true"
                      (clicked)="onNextMonth()"
                      [ariaLabel]="'Next month'"
                      size="small"
                      severity="secondary"
                    ></pelu-button>
                  </div>
                </div>
              </pelu-card>
            </div>

            <!-- Monthly Calendar Section -->
            <div class="monthly-calendar-section">
              <pelu-card class="monthly-calendar-card">
                <pelu-monthly-calendar
                  [selectedDate]="selectedDate()"
                  (dateSelected)="onMonthlyCalendarDateSelected($event)"
                ></pelu-monthly-calendar>
              </pelu-card>
            </div>

            <!-- Manual Booking Section -->
            <div class="manual-booking-section" [class.collapsed]="manualBookingCollapsed()">
              @if (!manualBookingCollapsed()) {
                <!-- Expanded state: Show booking form with collapse button -->
                <div class="expanded-booking-section">
                  <div class="booking-form-header">
                    <h4 class="booking-form-title">{{ 'BOOKING.MANUAL.TITLE' | translate }}</h4>
                    <pelu-button
                      [icon]="'pi pi-times'"
                      [rounded]="true"
                      (clicked)="toggleManualBooking()"
                      [ariaLabel]="'Close booking form'"
                      size="small"
                      severity="secondary"
                      class="close-booking-button"
                    ></pelu-button>
                  </div>
                  <pelu-booking-form
                    #bookingForm
                    (bookingCreated)="onManualBookingCreated($event)"
                  ></pelu-booking-form>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right Column: Date Controls + Calendar -->
        <div class="right-column">
          <!-- Sidebar Toggle Button -->
          <div class="sidebar-toggle" [title]="sidebarCollapsed() ? ('BOOKING.SIDEBAR.SHOW_MANUAL_BOOKING' | translate) : ('BOOKING.SIDEBAR.HIDE_MANUAL_BOOKING' | translate)">
            <pelu-button
              [icon]="sidebarCollapsed() ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
              [rounded]="true"
              (clicked)="toggleSidebar()"
              [ariaLabel]="sidebarCollapsed() ? ('BOOKING.SIDEBAR.SHOW_MANUAL_BOOKING' | translate) : ('BOOKING.SIDEBAR.HIDE_MANUAL_BOOKING' | translate)"
              class="toggle-button"
            ></pelu-button>
          </div>
          <!-- Date Controls -->
          <div class="date-controls-section">
            <pelu-date-controls
              [currentView]="calendarComponent?.currentView() || 'weekly'"
              [weekInfo]="weekInfo()"
              (todayClicked)="onTodayClicked()"
              (previousClicked)="goToPreviousWeek()"
              (nextClicked)="goToNextWeek()"
              (viewChanged)="onViewChanged($event)"
            ></pelu-date-controls>
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

      <!-- Floating Create Booking Button -->
      <div class="floating-create-booking">
        <pelu-button
          [icon]="'pi pi-plus'"
          (clicked)="onFloatingCreateBookingClicked()"
          severity="primary"
          size="small"
          class="floating-booking-button"
        ></pelu-button>
      </div>
    </div>
  `,
  styles: [`
    .desktop-layout {
      position: relative;

      .mobile-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
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
                font-size: 1.2rem !important;
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
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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

      .left-date-controls-section {

        .month-navigation-card {
          ::ng-deep .pelu-card {
            padding: 0;
          }
        }

        .month-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;

          .month-display {
            flex: 1;

            .month-name {
              font-size: 1.1rem;
              font-weight: 600;
              color: var(--text-color);
              text-transform: capitalize;
            }
          }

          .navigation-buttons {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            pelu-button {
              ::ng-deep .p-button {
                width: 36px;
                height: 36px;
                min-width: 36px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            }
          }
        }
      }

      .monthly-calendar-section {

        .monthly-calendar-card {
          ::ng-deep .pelu-card {
            padding: 0;
          }
        }
      }

      .manual-booking-section {
        flex: 1;
        min-width: 0;
        transition: all 0.3s ease;


        .expanded-booking-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          .booking-form-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--surface-border);

            .booking-form-title {
              margin: 0;
              font-size: 1.1rem;
              font-weight: 600;
              color: var(--primary-color);
            }

            .close-booking-button {
              ::ng-deep .p-button {
                width: 28px;
                height: 28px;
                min-width: 28px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            }
          }

          pelu-booking-form {
            flex: 1;
            min-width: 0;
          }
        }
      }

      .date-controls-section {
        // Styles are now handled by the date-controls component
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
          top: 0;
          left: 0;
          width: 375px;
          height: 100vh;
          background: white;
          z-index: 150; // Below header (200) but above normal content
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          padding: 1rem;
          padding-top: calc(70px + 1rem);

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
            left: 0;
            transform: translateY(-50%);
            z-index: 1002;
            background: var(--primary-color);
            border-radius: 0 8px 8px 0;
            padding: 0.5rem 0.25rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            width: 14px;
            height: 50px;
            transition: all 0.3s ease;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              width: 50px;
              height: 50px;
              padding: 0.5rem;

              .toggle-button {
                ::ng-deep .p-button {
                  .p-button-icon {
                    font-size: 1rem !important;
                  }
                }
              }
            }

            .toggle-button {
              ::ng-deep .p-button {
                width: 18px;
                height: 18px;
                min-width: 18px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.3s ease;

                .p-button-icon {
                  transition: transform 0.3s ease, font-size 0.3s ease;
                  font-size: 0.5rem !important;
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
        // Date controls styles are now handled by the date-controls component

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

    .floating-create-booking {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
      pointer-events: none;

      .floating-booking-button {
        pointer-events: auto;
        border-radius: 50%;
        width: 56px;
        height: 56px;
        transition: all 0.3s ease;

        ::ng-deep .p-button {
          border-radius: 50%;
          width: 56px;
          height: 56px;
          min-width: 56px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.1);
          }
        }
      }
    }
  `]
})
export class DesktopLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('calendarComponent') calendarComponent!: CalendarComponent;
  @ViewChild('bookingForm') bookingForm!: BookingFormComponent;

  private readonly bookingStateService = inject(BookingStateService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly dateTimeSelectionService = inject(DateTimeSelectionService);
  private readonly timeUtils = inject(TimeUtils);

  // Signal to track if booking form inputs are mounted
  private readonly inputsMountedSignal = signal<boolean>(false);


  // Signal to track if manual booking form is collapsed
  readonly manualBookingCollapsed = signal<boolean>(true);

  // Output events
  timeSlotSelected = output<{ date: string; time: string }>();

  // ===== COMPUTED PROPERTIES =====

  readonly isCalendarBlocked = computed(() => this.bookingValidationService.isCalendarBlocked());
  readonly sidebarCollapsed = computed(() => this.bookingStateService.sidebarCollapsed());
  readonly selectedDate = computed(() => this.bookingStateService.selectedDate());

  // Computed property to check if sidebar should be shown
  readonly shouldShowSidebar = computed(() => {
    const collapsed = this.sidebarCollapsed();

    // Show sidebar if it's not collapsed
    return !collapsed;
  });

  // Signal to force reactivity for week info
  private readonly weekInfoUpdateTrigger = signal(0);

  // Computed week info that updates when calendar view changes
  readonly weekInfo = computed(() => {
    // Trigger reactivity
    this.weekInfoUpdateTrigger();

    // Use calendar component's current view info if available
    if (this.calendarComponent?.currentViewInfo) {
      return this.calendarComponent.currentViewInfo().label;
    }

    // Fallback to original implementation
    const referenceDate = this.bookingStateService.viewDate();
    const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const end = endOfWeek(referenceDate, { weekStartsOn: 1 });

    const formatDate = (date: Date) =>
      date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });

    return `${formatDate(start)} - ${formatDate(end)}`;
  });

  // Computed property to get current month name
  readonly currentMonthName = computed(() => {
    const referenceDate = this.bookingStateService.viewDate();
    const month = referenceDate.toLocaleDateString('ca-ES', { month: 'long' });
    const year = referenceDate.getFullYear();
    return `${month} ${year}`;
  });

  // ===== EVENT HANDLERS =====

  onTodayClicked(): void {
    this.calendarComponent?.today();
    this.weekInfoUpdateTrigger.update(v => v + 1);
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

  onMonthlyCalendarDateSelected(date: Date): void {
    // Update the booking state service with the selected date
    this.bookingStateService.setSelectedDate(date);

    // Update the calendar component to show the selected date
    if (this.calendarComponent) {
      // Navigate the calendar to show the selected date using the public method
      this.calendarComponent.navigateToDate(this.formatDateISO(date));
    }
  }

  // ===== NAVIGATION METHODS =====

  goToPreviousWeek(): void {
    // Delegate to calendar component's navigation method
    this.calendarComponent?.previousDay();
    // Force week info update
    this.weekInfoUpdateTrigger.update(v => v + 1);
  }

  goToNextWeek(): void {
    // Delegate to calendar component's navigation method
    this.calendarComponent?.nextDay();
    // Force week info update
    this.weekInfoUpdateTrigger.update(v => v + 1);
  }

  onViewChanged(view: 'daily' | 'weekly' | 'month' | 'week'): void {
    // Delegate to calendar component's view change method
    this.calendarComponent?.onViewChanged(view);
    // Force week info update
    this.weekInfoUpdateTrigger.update(v => v + 1);
  }


  onPreviousMonth(): void {
    const currentDate = this.bookingStateService.viewDate();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    this.bookingStateService.setViewDate(previousMonth);
  }

  onNextMonth(): void {
    const currentDate = this.bookingStateService.viewDate();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    this.bookingStateService.setViewDate(nextMonth);
  }

  toggleManualBooking(): void {
    this.manualBookingCollapsed.update(collapsed => !collapsed);
  }

  onFloatingCreateBookingClicked(): void {
    // Open sidebar if it's collapsed
    if (this.sidebarCollapsed()) {
      this.bookingStateService.setSidebarCollapsed(false);
    }

    // Expand manual booking form
    this.manualBookingCollapsed.set(false);
  }

  // ===== SIDEBAR METHODS =====

  toggleSidebar(): void {
    const wasCollapsed = this.sidebarCollapsed();
    this.bookingStateService.toggleSidebar();

    // If sidebar is being collapsed, also close the booking form
    if (!wasCollapsed) {
      this.manualBookingCollapsed.set(true);
    }
  }

  closeSidebarOnMobile(): void {
    // Only close if we're in mobile view (< 1275px)
    if (window.innerWidth < 1275) {
      this.bookingStateService.setSidebarCollapsed(true);
      // Also close the booking form when sidebar is closed on mobile
      this.manualBookingCollapsed.set(true);
    }
  }

  private checkInputsMounted(): void {
    if (!this.bookingForm) {
      this.inputsMountedSignal.set(false);
      return;
    }

    // Check if the booking form component is properly initialized
    // and has all its required inputs available
    const formElement = this.bookingForm as any;

    // Check if the form has the required computed properties available
    const hasRequiredProperties = !!(
      formElement.availableServices &&
      formElement.serviceOptions &&
      formElement.timeSlotOptions
    );

    // Check if services are loaded
    const servicesLoaded = formElement.availableServices && formElement.availableServices().length > 0;

    // Set mounted state based on all checks
    this.inputsMountedSignal.set(hasRequiredProperties && servicesLoaded);
  }

  private setupInputMountingCheck(): void {
    // Check every 200ms for the first 5 seconds to ensure inputs are mounted
    let checkCount = 0;
    const maxChecks = 25; // 5 seconds at 200ms intervals

    const checkInterval = setInterval(() => {
      this.checkInputsMounted();
      checkCount++;

      if (checkCount >= maxChecks || this.inputsMountedSignal()) {
        clearInterval(checkInterval);
      }
    }, 200);

    // Also listen for service updates to recheck mounting
    window.addEventListener('serviceUpdated', () => {
      setTimeout(() => this.checkInputsMounted(), 100);
    });
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

    // Set up periodic check for input mounting
    this.setupInputMountingCheck();
  }

  ngAfterViewInit(): void {
    // Check if inputs are mounted after view initialization
    this.checkInputsMounted();
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('bookingUpdated', this.onBookingUpdated.bind(this));
    window.removeEventListener('serviceUpdated', () => this.checkInputsMounted());
  }

  private onBookingUpdated(): void {
    console.log('Booking updated event received, refreshing calendar...');
    // Force calendar refresh by triggering a change detection
    // The calendar component should automatically update when appointments change
  }

  private formatDateISO(date: Date): string {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
