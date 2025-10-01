import { Component, computed, inject, output, ViewChild, OnInit, OnDestroy, ElementRef, AfterViewInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { PopupDialogComponent, PopupDialogConfig } from '../../../../shared/components/popup-dialog/popup-dialog.component';
import { CalendarComponent } from '../../../../features/calendar/core/calendar.component';
import { BookingFormComponent } from './booking-form.component';
import { DateControlsComponent } from './date-controls/date-controls.component';
import { MonthlyCalendarComponent } from './monthly-calendar.component';
import { BookingStateService } from '../services/booking-state.service';
import { BookingValidationService } from '../services/booking-validation.service';
import { DateTimeSelectionService } from '../services/date-time-selection.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';
import { startOfWeek, endOfWeek, isSameDay, addDays, startOfDay } from 'date-fns';
import { Booking } from '../../../../core/interfaces/booking.interface';
import { CalendarStateService } from '../../../calendar/services/calendar-state.service';

@Component({
  selector: 'pelu-desktop-layout',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
    PopupDialogComponent,
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
        <!-- Left Column: Monthly Calendar + Manual Booking -->
        <div class="left-column" [class.collapsed]="!shouldShowSidebar()">
          <div class="sidebar-content">

            <!-- Combined Monthly Calendar Section -->
            <div class="monthly-calendar-section">
              <pelu-card class="monthly-calendar-card">
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
                      size="mini"
                      severity="secondary"
                      variant="text"
                    ></pelu-button>

                    <pelu-button
                      [icon]="'pi pi-chevron-right'"
                      [rounded]="true"
                      (clicked)="onNextMonth()"
                      [ariaLabel]="'Next month'"
                      size="mini"
                      severity="secondary"
                      variant="text"
                    ></pelu-button>
                  </div>
                </div>

                <pelu-monthly-calendar
                  [selectedDate]="getMonthlyCalendarSelectedDate()"
                  [viewDate]="calendarStateService.viewDate()"
                  [referenceDate]="calendarStateService.viewDate()"
                  [currentView]="calendarComponent?.currentView() || 'weekly'"
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
                  <pelu-card>
                    <h4 class="booking-form-title">{{ 'BOOKING.MANUAL.TITLE' | translate }}</h4>
                    <pelu-booking-form
                      #bookingForm
                      (bookingCreated)="onManualBookingCreated($event)"
                    ></pelu-booking-form>
                  </pelu-card>
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

      <!-- Booking Form Popup -->
      <pelu-popup-dialog
        [isOpen]="bookingPopupOpen()"
        [config]="bookingPopupConfig()"
        (closed)="closeBookingPopup()"
      >
        <pelu-booking-form
          #bookingFormPopup
          [twoColumns]="true"
          (bookingCreated)="onPopupBookingCreated($event)"
        ></pelu-booking-form>
      </pelu-popup-dialog>

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
        gap: 2rem;
        width: 100%;
        min-width: 0;
        height: 100vh;
        transition: all 0.3s ease;
        overflow: hidden;

        .sidebar-toggle {
          position: fixed;
          top: 95%;
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
        grid-template-columns: 300px 1fr;
        gap: 1.5rem;
        width: 100%;
        min-height: 100vh;
        padding: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;

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
          gap: 1rem;
          width: 100%;
          min-width: 280px;
          transition: all 0.3s ease;
        }
      }



      .monthly-calendar-section {
        .monthly-calendar-card {
          ::ng-deep .pelu-card {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
        }

        .month-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--surface-border);

          .month-display {
            flex: 1;

            .month-name {
              font-size: 0.9rem;
              font-weight: 600;
              color: var(--text-color);
              text-transform: capitalize;
            }
          }

          .navigation-buttons {
            display: flex;
            align-items: center;
            gap: 0.25rem;

            // Force 22x22px for mini buttons in month navigation
            pelu-button {
              ::ng-deep .p-button {
                width: 22px !important;
                height: 22px !important;
                min-width: 22px !important;
                min-height: 22px !important;
                padding: 0 !important;
                font-size: 0.7rem !important;

                .p-button-icon {
                  font-size: 0.7rem !important;
                }
              }
            }
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
              font-size: 0.9rem;
              font-weight: 600;
              color: var(--primary-color);
            }
          }

          pelu-card {
            .booking-form-title {
              margin: 0 0 1rem 0;
              font-size: 1rem;
              font-weight: 600;
              color: var(--primary-color);
            }
          }

          pelu-booking-form {
            flex: 1;
            min-width: 0;
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
          width: 300px;
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
      }
    }
  `]
})
export class DesktopLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('calendarComponent') calendarComponent!: CalendarComponent;
  @ViewChild('bookingForm') bookingForm!: BookingFormComponent;
  @ViewChild('bookingFormPopup') bookingFormPopup!: BookingFormComponent;

  private readonly bookingStateService = inject(BookingStateService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly dateTimeSelectionService = inject(DateTimeSelectionService);
  private readonly timeUtils = inject(TimeUtils);
  private readonly translateService = inject(TranslateService);
  readonly calendarStateService = inject(CalendarStateService);

  // Signal to track if booking form inputs are mounted
  private readonly inputsMountedSignal = signal<boolean>(false);


  // Signal to track if manual booking form is collapsed
  readonly manualBookingCollapsed = signal<boolean>(true);

  // Signal to track if booking popup is open
  readonly bookingPopupOpen = signal<boolean>(false);

  // Signal for monthly calendar display month (can be different from main calendar)
  readonly monthlyCalendarViewDate = signal<Date>(new Date());

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

  // Computed property to get current month name for monthly calendar
  readonly currentMonthName = computed(() => {
    // Use the main calendar's viewDate to determine which month to display
    const viewDate = this.calendarStateService.viewDate();
    const month = viewDate.toLocaleDateString('ca-ES', { month: 'long' });
    const year = viewDate.getFullYear();
    return `${month} ${year}`;
  });

  // Computed property to get the first enabled day from the main calendar
  readonly firstEnabledDay = computed(() => {
    // Force reactivity by accessing the viewDate signal
    const currentViewDate = this.calendarStateService.viewDate();

    // Get the current view info from the calendar component if available
    if (this.calendarComponent?.currentViewInfo) {
      try {
        const viewInfo = this.calendarComponent.currentViewInfo();

        if (viewInfo.type === 'weekly' && viewInfo.startDate) {
          return viewInfo.startDate;
        } else if (viewInfo.type === 'daily' && viewInfo.date) {
          return viewInfo.date;
        }
      } catch (error) {
        // If there's any error accessing currentViewInfo, fall back to viewDate
        console.warn('Error accessing calendar currentViewInfo:', error);
      }
    }

    // Fallback to current viewDate
    return currentViewDate;
  });

  // Method to get the correct selected date for the monthly calendar based on current view
  getMonthlyCalendarSelectedDate(): Date {
    const currentView = this.calendarComponent?.currentView() || 'weekly';
    const firstEnabledDay = this.firstEnabledDay();

    if (currentView === 'weekly') {
      // In weekly view, return the start of the week containing the first enabled day
      const weekStart = this.getWeekStart(firstEnabledDay);
      return weekStart;
    } else {
      // In daily view, return the exact day
      return firstEnabledDay;
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

  // Booking popup configuration
  readonly bookingPopupConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('BOOKING.MANUAL.TITLE'),
    size: 'large',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.translateService.instant('COMMON.ACTIONS.CANCEL'),
        severity: 'danger',
        action: () => this.closeBookingPopup()
      },
      {
        label: this.translateService.instant('COMMON.ACTIONS.CREATE'),
        severity: 'primary',
        action: () => this.onCreateBooking()
      }
    ]
  }));

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
    const currentView = this.calendarComponent?.currentView() || 'weekly';

    // Check if the selected date is from an adjacent month
    const currentViewDate = this.calendarStateService.viewDate();
    const isAdjacentMonth = date.getMonth() !== currentViewDate.getMonth() ||
                           date.getFullYear() !== currentViewDate.getFullYear();

    if (isAdjacentMonth) {
      // Navigate the main calendar to the month of the selected date
      this.calendarStateService.navigateToDate(this.formatDateISO(date));
    }

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
    // Navigate the main calendar to the previous month
    // We need to go back 4-5 weeks to reach the previous month
    for (let i = 0; i < 4; i++) {
      this.calendarComponent?.previousWeek();
    }
  }

  onNextMonth(): void {
    // Navigate the main calendar to the next month
    // We need to go forward 4-5 weeks to reach the next month
    for (let i = 0; i < 4; i++) {
      this.calendarComponent?.nextWeek();
    }
  }

  toggleManualBooking(): void {
    this.manualBookingCollapsed.update(collapsed => !collapsed);
  }

  onFloatingCreateBookingClicked(): void {
    // Open booking popup
    this.bookingPopupOpen.set(true);
  }

  closeBookingPopup(): void {
    this.bookingPopupOpen.set(false);
  }

  onCreateBooking(): void {
    // Trigger the booking form submission
    const bookingForm = this.bookingFormPopup;
    if (bookingForm) {
      // If the form has a submit method, call it
      const formAsAny = bookingForm as any;
      if (typeof formAsAny.onSubmit === 'function') {
        formAsAny.onSubmit();
      }
    }
  }

  onPopupBookingCreated(booking: any): void {
    // Handle booking creation from popup
    console.log('Popup booking created:', booking);

    // Close the popup
    this.closeBookingPopup();

    // The booking state service already handles refreshing appointments
    // and dispatching the bookingUpdated event, which will update the calendar
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

  constructor() {
    // Effect to sync monthly calendar with main calendar
    effect(() => {
      // Watch for changes in the main calendar's view date
      const viewDate = this.bookingStateService.viewDate();
      if (viewDate) {
        this.syncMonthlyCalendarWithMainCalendar();
      }
    });
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

  private syncMonthlyCalendarWithMainCalendar(): void {
    // Get the current view date from the main calendar
    const mainCalendarViewDate = this.bookingStateService.viewDate();

    if (!mainCalendarViewDate) return;

    // Calculate the start of the week for the current view date
    const weekStart = startOfWeek(mainCalendarViewDate, { weekStartsOn: 1 }); // Monday as first day

    // Find the first available day in the current week
    const firstAvailableDay = this.findFirstAvailableDayInWeek(weekStart);

    if (firstAvailableDay) {
      // Update the selected date to the first available day
      this.bookingStateService.setSelectedDate(firstAvailableDay);

      // Update the monthly calendar view date to show the month of the first available day
      this.monthlyCalendarViewDate.set(firstAvailableDay);
    } else {
      // If no available day found, at least update the monthly calendar to show the current week's month
      this.monthlyCalendarViewDate.set(weekStart);
    }
  }

  private findFirstAvailableDayInWeek(weekStart: Date): Date | null {
    // Check each day of the week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);

      // Check if this day is available for booking
      if (this.bookingValidationService.canSelectDate(currentDay)) {
        return currentDay;
      }
    }

    // If no day in the week is available, return null
    return null;
  }

  private formatDateISO(date: Date): string {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
