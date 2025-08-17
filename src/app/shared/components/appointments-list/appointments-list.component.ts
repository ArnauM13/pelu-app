import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { AppointmentStatusBadgeComponent } from '../appointment-status-badge';
import { CardComponent } from '../card/card.component';
import { NotFoundStateComponent } from '../not-found-state/not-found-state.component';
import { ServicesService } from '../../../core/services/services.service';
import { isFutureAppointment } from '../../services';
import { Booking } from '../../../core/interfaces/booking.interface';

@Component({
  selector: 'pelu-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TooltipModule,
    AppointmentStatusBadgeComponent,
    CardComponent,
    NotFoundStateComponent,
  ],
  template: `
    @if (bookings().length === 0) {
      <div class="full-screen-empty-state">
        <pelu-not-found-state [config]="notFoundConfig" (buttonClick)="clearFilters.emit()">
        </pelu-not-found-state>
      </div>
    } @else {
      <pelu-card>
        <div class="card-header">
          <div class="header-left">
            <h3>
              {{ 'COMMON.APPOINTMENTS_LIST' | translate }}
              <span class="appointments-count">({{ bookings().length }})</span>
            </h3>
          </div>
          <div class="header-right">
            <span class="list-subtitle" style="color:var(--text-color-light); font-size:0.95rem;">{{
              'COMMON.VIEW_APPOINTMENTS_LIST' | translate
            }}</span>
          </div>
        </div>

        <div class="appointments-list">
          @for (booking of bookings(); track booking.id) {
            <!-- Service color functionality temporarily disabled - uncomment to restore colored appointments -->
            <!-- <div class="appointment-item" [ngClass]="serviceColorsService.getServiceCssClass((booking.serviceName || booking.servei || '') + '')" (click)="onViewBooking.emit(booking)"> -->
            <div class="appointment-item" (click)="viewBooking.emit(booking)">
              <div class="appointment-info">
                <div class="client-info">
                  <div class="client-name-row">
                    <h4 class="client-name">{{ getClientName(booking) }}</h4>
                    <pelu-appointment-status-badge
                      [appointmentData]="{ date: booking.data || '', time: booking.hora || '' }"
                      [config]="{
                        size: 'small',
                        variant: 'default',
                        showIcon: false,
                        showDot: true,
                      }"
                    >
                    </pelu-appointment-status-badge>
                  </div>
                  <div class="appointment-details">
                    @if (booking.data && booking.hora) {
                      <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <span class="detail-text"
                          >{{ formatTime(booking.hora || '') }}
                          {{ formatDate(booking.data || '') }}</span
                        >
                      </div>
                    } @else if (booking.data) {
                      <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <span class="detail-text">{{ formatDate(booking.data || '') }}</span>
                      </div>
                    } @else {
                      <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <span class="detail-text">{{ 'COMMON.NO_DATE_SET' | translate }}</span>
                      </div>
                    }
                    @if (getServiceDuration(booking)) {
                      <div class="detail-item">
                        <span class="detail-icon">⏱️</span>
                        <span class="detail-text">{{ getServiceDuration(booking) }} min</span>
                      </div>
                    }
                    @if (getServiceName(booking)) {
                      <div class="detail-item">
                        <span class="detail-icon">✂️</span>
                        <span class="detail-text">{{ getServiceName(booking) }}</span>
                      </div>
                    }
                    @if (booking.status === 'draft') {
                      <div class="detail-item">
                        <span class="detail-icon">📝</span>
                        <span class="detail-text">{{ 'COMMON.STATUS.DRAFT' | translate }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
              <div class="appointment-actions-container">
                <button
                  class="btn btn-primary"
                  (click)="$event.stopPropagation(); viewBooking.emit(booking)"
                  [pTooltip]="'COMMON.CLICK_TO_VIEW' | translate"
                  pTooltipPosition="left"
                >
                  👁️
                </button>
                @if (isFutureAppointment({ data: booking.data || '', hora: booking.hora || '' })) {
                  <button
                    class="btn btn-secondary"
                    (click)="$event.stopPropagation(); editBooking.emit(booking)"
                   [pTooltip]="'APPOINTMENTS.EDIT_APPOINTMENT_DETAILS' | translate"
                    pTooltipPosition="left"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn btn-danger"
                    (click)="$event.stopPropagation(); deleteBooking.emit(booking)"
                    [pTooltip]="'COMMON.DELETE_CONFIRMATION' | translate"
                    pTooltipPosition="left"
                  >
                    🗑️
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </pelu-card>
    }
  `,
  styles: [
    `
      .full-screen-empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-color);
        border-radius: 16px;
        box-shadow: var(--box-shadow);
        border: 1px solid var(--border-color);
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

      .appointments-count {
        color: var(--primary-color);
        font-weight: 500;
        font-size: 1.2rem;
      }

      .list-subtitle {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 0.875rem;
      }

      .appointments-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .appointment-item {
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

      .appointment-item:hover {
        box-shadow: var(--box-shadow-hover);
        border-color: var(--primary-color-light);
        transform: translateY(-1px);
      }

      .appointment-item.today {
        border-color: var(--primary-color);
        background: var(--secondary-color-light);
      }

      .appointment-item.past {
        opacity: 0.7;
        background: #f8f9fa;
      }

      .appointment-info {
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

      .client-name-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.2rem;
      }

      .client-name {
        margin: 0;
        color: var(--text-color);
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .appointment-details {
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

      .appointment-actions-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.4rem;
        flex-shrink: 0;
      }

      .appointment-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .btn-primary,
      .btn-secondary,
      .btn-danger {
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
        background: linear-gradient(
          135deg,
          var(--primary-color-dark) 0%,
          var(--primary-color) 100%
        );
        border-color: var(--primary-color-dark);
      }

      .btn-secondary {
        background: var(--gradient-secondary);
        color: white;
        border-color: var(--secondary-color);
      }

      .btn-secondary:hover {
        background: linear-gradient(
          135deg,
          var(--secondary-color-dark) 0%,
          var(--secondary-color) 100%
        );
        border-color: var(--secondary-color-dark);
      }

      .btn-danger {
        background: var(--gradient-error);
        color: white;
        border-color: var(--error-color);
      }

      .btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, var(--error-color) 100%);
        border-color: #b91c1c;
      }

      .btn {
        padding: 0.4rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: var(--gradient-primary);
        color: white;
      }

      .btn-primary:hover {
        background: linear-gradient(
          135deg,
          var(--primary-color-dark) 0%,
          var(--primary-color) 100%
        );
      }

      .btn-danger {
        background: var(--gradient-error);
        color: white;
      }

      .btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, var(--error-color) 100%);
      }

      @media (max-width: 768px) {
        .empty-state-content {
          padding: 3rem 1rem;
        }

        .empty-icon {
          font-size: 4rem;
        }

        .empty-state-content h3 {
          font-size: 1.5rem;
        }

        .empty-state-content p {
          font-size: 1rem;
        }
      }
    `,
  ],
})
export class AppointmentsListComponent {
  bookings = input.required<Booking[]>();
  hasActiveFilters = input.required<boolean>();

  viewBooking = output<Booking>();
  editBooking = output<Booking>();
  deleteBooking = output<Booking>();
  clearFilters = output<void>();

  readonly isFutureAppointment = isFutureAppointment;

  #servicesService = inject(ServicesService);

  get notFoundConfig() {
    return {
      icon: '📅',
      title: 'COMMON.NO_APPOINTMENTS',
      message: this.hasActiveFilters()
        ? 'COMMON.NO_APPOINTMENTS_FILTERED'
        : 'COMMON.NO_APPOINTMENTS_SCHEDULED',
      buttonText: this.hasActiveFilters() ? 'COMMON.CLEAR_FILTERS_BUTTON' : undefined,
      showButton: this.hasActiveFilters(),
    };
  }

  getClientName(booking: Booking): string {
    return booking.clientName;
  }

  isToday(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getServiceName(booking: Booking): string {
    if (!booking.serviceId) {
      return '';
    }

    // Get service from Firebase using serviceId
    const service = this.#servicesService.getAllServices().find(s => s.id === booking.serviceId);
    if (!service) {
      return '';
    }

    return this.#servicesService.getServiceName(service);
  }

  getServiceDuration(booking: Booking): number {
    if (!booking.serviceId) {
      return 60; // Default duration
    }

    // Get service from Firebase using serviceId
    const service = this.#servicesService.getAllServices().find(s => s.id === booking.serviceId);
    if (!service) {
      return 60; // Default duration
    }

    return service.duration;
  }
}
