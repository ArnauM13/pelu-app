import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { BookingStateService } from '../services/booking-state.service';
import { BookingValidationService } from '../services/booking-validation.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';
import { TimeSlot, DaySlot } from '../../../../shared/utils/time.utils';

@Component({
  selector: 'pelu-datetime-selection-step',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
  ],
  template: `
    <div class="datetime-step">
      <!-- Calendar Card -->
      <div class="calendar-card">
        <div class="calendar-header">
          <h3>{{ 'COMMON.SELECTION.SELECT_DAY' | translate }}</h3>
          <div class="calendar-buttons">
            <pelu-button
              [label]="'BOOKING.QUICK_SELECTION.TODAY'"
              [icon]="'pi pi-calendar'"
              [disabled]="!canSelectDate(getToday())"
              (clicked)="canSelectDate(getToday()) ? selectToday() : null"
              severity="primary"
              size="small"
            >
            </pelu-button>
            <pelu-button
              [label]="viewMode() === 'week' ? 'COMMON.VIEWS.CALENDAR.VIEW_MONTH' : 'COMMON.VIEWS.CALENDAR.VIEW_WEEK'"
              [icon]="viewMode() === 'week' ? 'pi pi-calendar' : 'pi pi-calendar-times'"
              (clicked)="toggleViewMode()"
              [ariaLabel]="viewMode() === 'week' ? 'COMMON.VIEWS.CALENDAR.VIEW_MONTH' : 'COMMON.VIEWS.CALENDAR.VIEW_WEEK'"
              severity="secondary"
              size="small"
              [raised]="true"
            >
            </pelu-button>
          </div>
        </div>

        <!-- Period Navigation -->
        <div class="period-navigation">
          <pelu-button
            [icon]="'pi pi-chevron-left'"
            [disabled]="!canGoToPreviousPeriod()"
            (clicked)="canGoToPreviousPeriod() ? previousPeriod() : null"
            severity="secondary"
            [rounded]="true"
            [ariaLabel]="'COMMON.ACTIONS.PREVIOUS' | translate"
          >
          </pelu-button>

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
            (clicked)="nextPeriod()"
            severity="secondary"
            [rounded]="true"
            [ariaLabel]="'COMMON.ACTIONS.NEXT' | translate"
          >
          </pelu-button>
        </div>

        <!-- Day Selection -->
        <div class="days-grid" [class.month-view]="viewMode() === 'month'">
          @for (day of currentViewDays(); track day) {
            <div
              class="day-item"
              [class.past-date]="isPastDate(day)"
              [class.non-working-day]="!isBusinessDay(day)"
              [class.today]="isToday(day)"
              [class.selected]="isSelected(day)"
              [class.warning-day]="canSelectDate(day) && isBusinessDay(day) && isFullyBookedWorkingDayForService(day)"
              (click)="onDateClicked(day)"
            >
              <div class="day-name">{{ formatDayShort(day) }}</div>
              <div class="day-number">{{ day.getDate() }}</div>
              @if (isToday(day)) {
                <div class="today-indicator">{{ 'COMMON.TIME.TODAY' | translate }}</div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Time Slots for Selected Day -->
      @if (selectedDate()) {
        <div class="time-slots-section">
          @for (daySlot of daySlots(); track daySlot.date) {
            @if (isSelected(daySlot.date)) {
              <!-- Morning Time Slots -->
              @if (hasMorningSlots(daySlot)) {
                <div class="time-section">
                  <h4 class="time-section-title">🌅 {{ 'COMMON.TIME.MORNING' | translate }}</h4>
                  <div class="time-slots-grid">
                    @for (timeSlot of getMorningSlots(daySlot); track timeSlot.time) {
                      <div
                        class="time-slot"
                        [class.available]="timeSlot.available"
                        [class.occupied]="!timeSlot.available"
                        [class.selected]="selectedTimeSlot()?.time === timeSlot.time"
                        [style.background]="
                          !timeSlot.available && timeSlot.serviceName
                            ? 'linear-gradient(135deg, ' +
                              getServiceBackgroundColor(timeSlot.serviceName) +
                              ' 0%, ' +
                              getServiceColor(timeSlot.serviceName) +
                              ' 100%)'
                            : ''
                        "
                        [style.border-color]="
                          !timeSlot.available && timeSlot.serviceName
                            ? getServiceColor(timeSlot.serviceName)
                            : ''
                        "
                        [style.box-shadow]="
                          !timeSlot.available && timeSlot.serviceName
                            ? '0 4px 15px ' + getServiceColor(timeSlot.serviceName) + '40'
                            : ''
                        "
                        (click)="onTimeSlotClicked(timeSlot)"
                      >
                        <div class="slot-content">
                          <div class="time">{{ formatTime(timeSlot.time) }}</div>
                          @if (!timeSlot.available && isAdmin()) {
                            <div class="occupied-details">
                              <div class="client-info">
                                <span class="service-icon">{{ timeSlot.serviceIcon }}</span>
                                <span class="client-name">{{ timeSlot.clientName }}</span>
                              </div>
                              <div class="service-name">{{ timeSlot.serviceName }}</div>
                              @if (timeSlot.notes) {
                                <div class="notes">{{ timeSlot.notes }}</div>
                              }
                            </div>
                          }
                          @if (!timeSlot.available && !isAdmin()) {
                            <div class="occupied-simple">
                              <span class="occupied-label">{{ 'COMMON.STATUS.OCCUPIED' | translate }}</span>
                            </div>
                          }
                          @if (timeSlot.available) {
                            <div class="available-label">
                              {{ 'COMMON.STATUS.AVAILABLE' | translate }}
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Afternoon Time Slots -->
              @if (hasAfternoonSlots(daySlot)) {
                <div class="time-section">
                  <h4 class="time-section-title">🌆 {{ 'COMMON.TIME.AFTERNOON' | translate }}</h4>
                  <div class="time-slots-grid">
                    @for (timeSlot of getAfternoonSlots(daySlot); track timeSlot.time) {
                      <div
                        class="time-slot"
                        [class.available]="timeSlot.available"
                        [class.occupied]="!timeSlot.available"
                        [class.selected]="selectedTimeSlot()?.time === timeSlot.time"
                        [style.background]="
                          !timeSlot.available && timeSlot.serviceName
                            ? 'linear-gradient(135deg, ' +
                              getServiceBackgroundColor(timeSlot.serviceName) +
                              ' 0%, ' +
                              getServiceColor(timeSlot.serviceName) +
                              ' 100%)'
                            : ''
                        "
                        [style.border-color]="
                          !timeSlot.available && timeSlot.serviceName
                            ? getServiceColor(timeSlot.serviceName)
                            : ''
                        "
                        [style.box-shadow]="
                          !timeSlot.available && timeSlot.serviceName
                            ? '0 4px 15px ' + getServiceColor(timeSlot.serviceName) + '40'
                            : ''
                        "
                        (click)="onTimeSlotClicked(timeSlot)"
                      >
                        <div class="slot-content">
                          <div class="time">{{ formatTime(timeSlot.time) }}</div>
                          @if (!timeSlot.available && isAdmin()) {
                            <div class="occupied-details">
                              <div class="client-info">
                                <span class="service-icon">{{ timeSlot.serviceIcon }}</span>
                                <span class="client-name">{{ timeSlot.clientName }}</span>
                              </div>
                              <div class="service-name">{{ timeSlot.serviceName }}</div>
                              @if (timeSlot.notes) {
                                <div class="notes">{{ timeSlot.notes }}</div>
                              }
                            </div>
                          }
                          @if (!timeSlot.available && !isAdmin()) {
                            <div class="occupied-simple">
                              <span class="occupied-label">{{ 'COMMON.STATUS.OCCUPIED' | translate }}</span>
                            </div>
                          }
                          @if (timeSlot.available) {
                            <div class="available-label">
                              {{ 'COMMON.STATUS.AVAILABLE' | translate }}
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .datetime-step {
      .calendar-card {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 12px;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(13, 71, 161, 0.08);
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;

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
              // Ensure consistent sizing for calendar buttons
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
            // Navigation buttons styling
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

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          transition: all 0.3s ease-in-out;

          @media (max-width: 480px) {
            gap: 0.25rem;
          }

          &.month-view {
            grid-template-columns: repeat(7, 1fr);
            gap: 0.25rem;

            @media (max-width: 480px) {
              gap: 0.15rem;
            }
          }
        }

        .day-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          border: 2px solid transparent;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }

          &.today {
            border-color: #10b981;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
          }

          &.selected {
            border-color: #667eea;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          &.past-date {
            opacity: 0.3;
            background: #f3f4f6;
            cursor: not-allowed;
            position: relative;

            &::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              width: 100%;
              height: 2px;
              background: #ef4444;
              opacity: 0.6;
            }

            .day-name,
            .day-number {
              color: var(--input-placeholder-color);
            }
          }

          &.non-working-day {
            opacity: 0.5;
            text-decoration: line-through;
            background: #f3f4f6;
            border: 2px solid #d1d5db;
            color: #6b7280;

            .day-name,
            .day-number {
              color: #6b7280;
            }

            &:hover {
              background: #e5e7eb;
              border-color: #9ca3af;
            }
          }

          &.warning-day {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
            border-color: #f59e0b;
            position: relative;

            &::before {
              content: '⚠️';
              position: absolute;
              top: -5px;
              right: -5px;
              font-size: 0.8rem;
              background: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .day-name,
            .day-number {
              color: #92400e;
            }

            &:hover {
              background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
              transform: translateY(-2px);
              box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
            }
          }

          .day-name {
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
          }

          .day-number {
            font-size: 1.2rem;
            font-weight: 700;
          }

          .today-indicator {
            font-size: 0.7rem;
            margin-top: 0.25rem;
            opacity: 0.8;
          }
        }
      }

      .time-slots-section {
        margin-bottom: 2rem;

        .time-section {
          margin-bottom: 2rem;

          &:last-child {
            margin-bottom: 0;
          }

          .time-section-title {
            color: #0d47a1;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e3f2fd;
            text-align: left;
          }
        }

        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;

          @media (max-width: 480px) {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.5rem;
          }
        }

        .time-slot {
          min-height: 80px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          border: 2px solid transparent;

          &:hover {
            transform: translateY(-2px);
          }

          &.available {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            border-color: #10b981;

            &:hover {
              box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
              transform: translateY(-3px);
            }
          }

          &.occupied {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
            color: white;
            cursor: not-allowed;
            border-color: #ef4444 !important;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3) !important;
          }

          &.selected {
            border-color: #667eea;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
          }

          .slot-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0.75rem;
            text-align: center;

            .time {
              font-weight: 700;
              font-size: 1.1rem;
              margin-bottom: 0.5rem;
            }

            .available-label {
              font-size: 0.8rem;
              opacity: 0.9;
              font-weight: 500;
            }

            .occupied-simple {
              .occupied-label {
                font-size: 0.8rem;
                opacity: 0.9;
                font-weight: 500;
              }
            }

            .occupied-details {
              width: 100%;

              .client-info {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.25rem;
                margin-bottom: 0.25rem;

                .service-icon {
                  font-size: 0.9rem;
                }

                .client-name {
                  font-size: 0.75rem;
                  font-weight: 600;
                  opacity: 0.9;
                }
              }

              .service-name {
                font-size: 0.7rem;
                opacity: 0.8;
                margin-bottom: 0.25rem;
                font-weight: 500;
              }

              .notes {
                font-size: 0.65rem;
                opacity: 0.7;
                font-style: italic;
                line-height: 1.2;
              }
            }
          }
        }
      }
    }
  `]
})
export class DateTimeSelectionStepComponent {
  private readonly bookingStateService = inject(BookingStateService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly timeUtils = inject(TimeUtils);

  // Output events
  dateSelected = output<Date>();
  timeSlotSelected = output<TimeSlot>();
  viewModeChanged = output<'week' | 'month'>();

  // ===== COMPUTED PROPERTIES =====

  readonly selectedDate = computed(() => this.bookingStateService.selectedDate());
  readonly selectedTimeSlot = computed(() => this.bookingStateService.selectedTimeSlot());
  readonly viewDate = computed(() => this.bookingStateService.viewDate());
  readonly viewMode = computed(() => this.bookingStateService.viewMode());
  readonly daySlots = computed(() => this.bookingStateService.daySlots());
  readonly weekDays = computed(() => this.bookingStateService.weekDays());
  readonly monthDays = computed(() => this.bookingStateService.monthDays());
  readonly currentViewDays = computed(() => this.bookingStateService.currentViewDays());

  // ===== EVENT HANDLERS =====

  onDateClicked(date: Date): void {
    if (this.canSelectDate(date)) {
      this.bookingStateService.setSelectedDate(date);
      this.dateSelected.emit(date);
    }
  }

  onTimeSlotClicked(timeSlot: TimeSlot): void {
    if (timeSlot.available) {
      this.bookingStateService.setSelectedTimeSlot(timeSlot);
      this.timeSlotSelected.emit(timeSlot);
    }
  }

  toggleViewMode(): void {
    const newMode = this.viewMode() === 'week' ? 'month' : 'week';
    this.bookingStateService.setViewMode(newMode);
    this.viewModeChanged.emit(newMode);
  }

  // ===== NAVIGATION METHODS =====

  canGoToPreviousPeriod(): boolean {
    return true; // Allow free navigation through all weeks - no restrictions
  }

  previousPeriod(): void {
    if (!this.canGoToPreviousPeriod()) {
      return;
    }

    const currentDate = this.viewDate();
    if (this.viewMode() === 'week') {
      const newDate = this.timeUtils.getPreviousWeek(currentDate);
      this.bookingStateService.setViewDate(newDate);
    } else {
      const newDate = this.timeUtils.getPreviousMonth(currentDate);
      this.bookingStateService.setViewDate(newDate);
    }
    this.bookingStateService.setSelectedDate(null);
  }

  nextPeriod(): void {
    const currentDate = this.viewDate();
    if (this.viewMode() === 'week') {
      const newDate = this.timeUtils.getNextWeek(currentDate);
      this.bookingStateService.setViewDate(newDate);
    } else {
      const newDate = this.timeUtils.getNextMonth(currentDate);
      this.bookingStateService.setViewDate(newDate);
    }
    this.bookingStateService.setSelectedDate(null);
  }

  // ===== QUICK SELECTION METHODS =====

  getToday(): Date {
    return new Date();
  }

  selectToday(): void {
    const today = new Date();
    if (this.canSelectDate(today)) {
      this.bookingStateService.setSelectedDate(today);
      this.bookingStateService.setViewDate(today);
    }
  }

  // ===== UTILITY METHODS =====

  canSelectDate(date: Date): boolean {
    return this.bookingValidationService.canSelectDate(date);
  }

  isPastDate(date: Date): boolean {
    return this.bookingValidationService.isPastDate(date);
  }

  isBusinessDay(date: Date): boolean {
    return this.bookingValidationService.isBusinessDay(date);
  }

  isToday(date: Date): boolean {
    return this.timeUtils.isToday(date);
  }

  isSelected(date: Date): boolean {
    const selectedDate = this.selectedDate();
    return this.timeUtils.isSelected(date, selectedDate);
  }

  isFullyBookedWorkingDayForService(day: Date): boolean {
    return this.bookingValidationService.isFullyBookedWorkingDayForService(day);
  }

  hasMorningSlots(daySlot: DaySlot): boolean {
    return daySlot.timeSlots.some(slot => slot.time < '13:00' && slot.available);
  }

  hasAfternoonSlots(daySlot: DaySlot): boolean {
    return daySlot.timeSlots.some(slot => slot.time >= '14:00' && slot.available);
  }

  getMorningSlots(daySlot: DaySlot): TimeSlot[] {
    return daySlot.timeSlots.filter(slot => slot.time < '13:00' && slot.available);
  }

  getAfternoonSlots(daySlot: DaySlot): TimeSlot[] {
    return daySlot.timeSlots.filter(slot => slot.time >= '14:00' && slot.available);
  }

  // ===== FORMAT METHODS =====

  formatDay(date: Date): string {
    return this.timeUtils.formatDay(date);
  }

  formatDayShort(date: Date): string {
    return this.timeUtils.formatDayShort(date);
  }

  formatTime(time: string): string {
    return this.timeUtils.formatTime(time);
  }

  formatMonth(date: Date): string {
    return this.timeUtils.formatMonth(date);
  }

  // ===== SERVICE COLOR METHODS =====

  getServiceColor(serviceName: string): string {
    // This would need to be injected from the main component or service
    return '#3b82f6'; // Default color
  }

  getServiceBackgroundColor(serviceName: string): string {
    // This would need to be injected from the main component or service
    return '#dbeafe'; // Default background color
  }

  // ===== ADMIN CHECK =====

  isAdmin(): boolean {
    // This would need to be injected from the main component or service
    return false; // Default to false
  }
}
