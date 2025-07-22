import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { CardComponent } from '../card/card.component';
import { CalendarComponent, AppointmentEvent } from '../../../features/calendar/calendar.component';
import { CalendarWithFooterComponent } from '../../../features/calendar/calendar-with-footer.component';
import { AppointmentStatusBadgeComponent } from '../appointment-status-badge/appointment-status-badge.component';
import { NotFoundStateComponent } from '../not-found-state/not-found-state.component';
import { LoadingStateComponent } from '../loading-state/loading-state.component';
import { isFutureAppointment } from '../../services';
import { Booking } from '../../../core/services/booking.service';

@Component({
  selector: 'pelu-calendar-appointments-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TooltipModule,
    CardComponent,
    CalendarComponent,
    CalendarWithFooterComponent,
    AppointmentStatusBadgeComponent,
    NotFoundStateComponent,
    LoadingStateComponent
  ],
  template: `
    @if (isLoading()) {
      <pelu-loading-state [config]="loadingConfig"></pelu-loading-state>
    } @else if (bookings().length === 0) {
      <div class="full-screen-empty-state">
        <pelu-not-found-state
          [config]="notFoundConfig">
        </pelu-not-found-state>
      </div>
    } @else {
      <pelu-card>
        <div class="card-header">
          <div class="header-left">
            <h3>{{ 'COMMON.CALENDAR_VIEW' | translate }}</h3>
          </div>
          <div class="header-right">
            <span class="list-subtitle" style="color:var(--text-color-light); font-size:0.95rem;">{{ 'COMMON.VIEW_CALENDAR_APPOINTMENTS' | translate }}</span>
          </div>
        </div>

        <div class="calendar-container">
          <pelu-calendar-with-footer
            [mini]="false"
            [events]="calendarEvents()"
            (dateSelected)="onDateSelected.emit($event)"
            (onEditAppointment)="onCalendarEditBooking($event)"
            (onDeleteAppointment)="onCalendarDeleteBooking($event)">
          </pelu-calendar-with-footer>
        </div>

        @if (selectedDate()) {
          <div class="selected-date-bookings">
            <h4>{{ 'COMMON.BOOKINGS_FOR_DATE' | translate }} {{ formatDateForDisplay(selectedDate()!) }}</h4>
            <div class="bookings-list">
              @for (booking of getBookingsForDate(selectedDate()!); track booking.id) {
                <div class="booking-item"
                     [ngClass]="{'today': isToday(booking.data)}"
                     (click)="onViewBooking.emit(booking)">
                  <div class="booking-info">
                    <div class="client-info">
                      <h5 class="client-name">{{ booking.nom }}</h5>
                      <div class="booking-details">
                        <div class="detail-item">
                          <span class="detail-icon">🕐</span>
                          <span class="detail-text">{{ formatTime(booking.hora) }}</span>
                        </div>
                        @if (booking.duration) {
                          <div class="detail-item">
                            <span class="detail-icon">⏱️</span>
                            <span class="detail-text">{{ booking.duration }} min</span>
                          </div>
                        }
                        @if (booking.serviceName || booking.servei) {
                          <div class="detail-item">
                            <span class="detail-icon">✂️</span>
                            <span class="detail-text">{{ booking.serviceName || booking.servei }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="booking-actions">
                    <pelu-appointment-status-badge
                      [appointmentData]="{ date: booking.data, time: booking.hora }"
                      [config]="{ size: 'small', variant: 'default', showIcon: false, showDot: true }">
                    </pelu-appointment-status-badge>
                    <button
                      class="btn btn-primary"
                      (click)="$event.stopPropagation(); onViewBooking.emit(booking)"
                      [pTooltip]="'COMMON.CLICK_TO_VIEW' | translate"
                      pTooltipPosition="left">
                      👁️
                    </button>
                    @if (isFutureAppointment({ data: booking.data, hora: booking.hora || '' })) {
                      <button
                        class="btn btn-secondary"
                        (click)="$event.stopPropagation(); onEditBooking.emit(booking)"
                        [pTooltip]="'COMMON.ACTIONS.EDIT' | translate"
                        pTooltipPosition="left">
                        ✏️
                      </button>
                      <button
                        class="btn btn-danger"
                        (click)="$event.stopPropagation(); onDeleteBooking.emit(booking)"
                        [pTooltip]="'COMMON.DELETE_CONFIRMATION' | translate"
                        pTooltipPosition="left">
                        🗑️
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </pelu-card>
    }
  `,
  styles: [`
    .full-screen-empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      background: var(--surface-color);
      border-radius: 16px;
      box-shadow: var(--box-shadow);
      border: 1px solid var(--border-color);
      margin: 2rem 0;
    }

    @media (max-width: 768px) {
      .full-screen-empty-state {
        min-height: 50vh;
        margin: 1rem 0;
      }
    }

    .card-header {
      margin-bottom: 1.5rem;
    }

    .card-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .list-subtitle {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .calendar-container {
      margin-bottom: 2rem;
    }

    .selected-date-bookings {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
    }

    .selected-date-bookings h4 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .booking-item {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
      gap: 0.75rem;
      min-height: 40px;
      font-size: 0.9rem;
      box-shadow: var(--box-shadow);
      cursor: pointer;
    }

    .booking-item:hover {
      box-shadow: var(--box-shadow-hover);
      border-color: var(--primary-color-light);
      transform: translateY(-1px);
    }

    .booking-item.today {
      border-color: var(--primary-color);
      background: var(--secondary-color-light);
    }

    .booking-info {
      flex: 1;
      display: flex;
      align-items: center;
      min-width: 0;
    }

    .client-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }

    .client-name {
      margin: 0 0 0.2rem 0;
      color: var(--text-color);
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .booking-details {
      display: flex;
      flex-direction: row;
      gap: 0.6rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    .detail-icon {
      font-size: 0.9rem;
      width: 16px;
      text-align: center;
    }

    .detail-text {
      color: var(--text-color-light);
      font-size: 0.85rem;
    }

    .booking-actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }

    .btn-primary, .btn-secondary, .btn-danger {
      padding: 0.3rem 0.4rem;
      font-size: 0.85rem;
      min-width: 28px;
      min-height: 28px;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
      border-color: var(--primary-color);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, var(--primary-color-dark) 0%, var(--primary-color) 100%);
      border-color: var(--primary-color-dark);
    }

    .btn-secondary {
      background: var(--gradient-secondary);
      color: white;
      border-color: var(--secondary-color);
    }

    .btn-secondary:hover {
      background: linear-gradient(135deg, var(--secondary-color-dark) 0%, var(--secondary-color) 100%);
      border-color: var(--secondary-color-dark);
    }

    .btn-danger {
      background: var(--gradient-error);
      color: white;
      border-color: var(--error-color);
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #B91C1C 0%, var(--error-color) 100%);
      border-color: #B91C1C;
    }

    .btn {
      padding: 0.4rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }

    @media (max-width: 768px) {
      .full-screen-empty-state {
        min-height: 50vh;
        margin: 1rem 0;
      }

      .booking-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .booking-actions {
        width: 100%;
        justify-content: space-between;
      }

      .booking-details {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class CalendarAppointmentsViewComponent {
  bookings = input.required<Booking[]>();
  selectedDate = input<string | null>(null);
  isLoading = input<boolean>(false);

  onDateSelected = output<{date: string, time: string}>();
  onViewBooking = output<Booking>();
  onEditBooking = output<Booking>();
  onDeleteBooking = output<Booking>();

  // Internal event handlers that convert AppointmentEvent to Booking
  onCalendarEditBooking(appointmentEvent: AppointmentEvent) {
    // Convert AppointmentEvent to Booking
    const booking = this.convertAppointmentEventToBooking(appointmentEvent);
    this.onEditBooking.emit(booking);
  }

  onCalendarDeleteBooking(appointmentEvent: AppointmentEvent) {
    // Convert AppointmentEvent to Booking
    const booking = this.convertAppointmentEventToBooking(appointmentEvent);
    this.onDeleteBooking.emit(booking);
  }

  private convertAppointmentEventToBooking(appointmentEvent: AppointmentEvent): Booking {
    // Find the original booking from the bookings array
    const originalBooking = this.bookings().find(booking => {
      if (appointmentEvent.id && booking.id === appointmentEvent.id) {
        return true;
      }

      // Match by date, time and name
      const eventDate = appointmentEvent.start.split('T')[0];
      const eventTime = appointmentEvent.start.split('T')[1]?.substring(0, 5);

      return booking.data === eventDate &&
             booking.hora === eventTime &&
             booking.nom === appointmentEvent.title;
    });

    if (originalBooking) {
      return originalBooking;
    }

    // Fallback: create a new booking from the event
    return {
      id: appointmentEvent.id || '',
      nom: appointmentEvent.title || appointmentEvent.clientName || '',
      email: '',
      data: appointmentEvent.start.split('T')[0],
      hora: appointmentEvent.start.split('T')[1]?.substring(0, 5) || '',
      serviceName: appointmentEvent.serviceName || '',
      serviceId: '',
      duration: appointmentEvent.duration || 60,
      price: 0,
      notes: '',
      status: 'confirmed',
      editToken: '',
      uid: null,
      createdAt: new Date(),
      title: appointmentEvent.title || appointmentEvent.clientName || '',
      start: appointmentEvent.start,
      servei: appointmentEvent.serviceName || '',
      preu: 0,
      userId: '',
      clientName: appointmentEvent.clientName || ''
    };
  }

  readonly isFutureAppointment = isFutureAppointment;

  get notFoundConfig() {
    return {
      icon: '📅',
      title: 'COMMON.NO_APPOINTMENTS',
      message: 'COMMON.NO_APPOINTMENTS_SCHEDULED',
      showButton: false
    };
  }

  get loadingConfig() {
    return {
      message: 'COMMON.LOADING',
      spinnerSize: 'large' as const,
      showMessage: true,
      fullHeight: false
    };
  }

  calendarEvents = computed((): AppointmentEvent[] => {
    return this.bookings().map(booking => ({
      id: booking.id,
      title: booking.nom,
      start: booking.data + (booking.hora ? 'T' + booking.hora : ''),
      duration: booking.duration || 60,
      serviceName: booking.serviceName,
      clientName: booking.nom
    }));
  });

  getBookingsForDate(date: string): Booking[] {
    return this.bookings().filter(booking => booking.data === date);
  }

  isToday(date: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  }

  formatTime(time: string): string {
    return time;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ca-ES');
  }

  formatDateForDisplay(date: string): string {
    return date;
  }
}
