import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { ServiceColorsService, ServiceColor } from '../../../core/services/service-colors.service';
import { Booking } from '../../../core/services/booking.service';

@Component({
  selector: 'pelu-next-appointment',
  imports: [CommonModule, TranslateModule],
  template: `
    @if (nextBooking(); as booking) {
      <div class="next-appointment-card" [ngClass]="serviceCssClass()">
        <div class="appointment-header">
          <div class="header-icon" [style.background]="serviceColor().color">⏰</div>
          <div class="header-content">
            <h3 class="title">{{ 'APPOINTMENTS.MESSAGES.NEXT_APPOINTMENT' | translate }}</h3>
            <p class="subtitle">
              {{ 'APPOINTMENTS.MESSAGES.NEXT_APPOINTMENT_SUBTITLE' | translate }}
            </p>
          </div>
        </div>

        <div class="appointment-content">
          <div class="client-info">
            <h4 class="client-name">{{ getClientName(booking) }}</h4>
            <div class="appointment-details">
              @if (booking.data) {
                <div class="detail-item">
                  <span class="detail-icon">📅</span>
                  <span class="detail-text">{{ formatDate(booking.data) }}</span>
                </div>
              }
              @if (booking.hora) {
                <div class="detail-item">
                  <span class="detail-icon">🕐</span>
                  <span class="detail-text">{{ formatTime(booking.hora) }}</span>
                </div>
              }
            </div>
          </div>

          <div class="service-info">
            @if (getServiceName(booking)) {
              <div
                class="service-badge"
                [style.background]="serviceColor().color"
                [ngClass]="serviceTextCssClass()"
              >
                <span class="service-icon">✂️</span>
                <span class="service-name">{{ getServiceName(booking) }}</span>
              </div>
            }
            @if (booking.duration) {
              <div class="duration-info">
                <span class="duration-icon">⏱️</span>
                <span class="duration-text">{{ booking.duration }} min</span>
              </div>
            }
          </div>

          @if (booking.notes) {
            <div class="notes-section">
              <span class="notes-icon">📝</span>
              <span class="notes-text">{{ booking.notes }}</span>
            </div>
          }
        </div>

        <div class="appointment-actions">
          <button class="btn btn-primary" (click)="onViewDetail.emit(booking)">
            👁️ {{ 'APPOINTMENTS.VIEW_DETAIL' | translate }}
          </button>
        </div>
      </div>
    } @else {
      <div class="no-next-appointment">
        <div class="no-appointment-icon">📅</div>
        <h3>{{ 'APPOINTMENTS.MESSAGES.NO_NEXT_APPOINTMENT' | translate }}</h3>
        <p>{{ 'APPOINTMENTS.MESSAGES.NO_NEXT_APPOINTMENT_MESSAGE' | translate }}</p>
      </div>
    }
  `,
  styles: [
    `
      .next-appointment-card {
        background: var(--surface-color);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: var(--box-shadow);
        border: 2px solid var(--border-color);
        transition: all 0.3s ease;
        margin-bottom: 1rem;
      }

      .next-appointment-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-hover);
      }

      .appointment-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .header-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .header-content {
        flex: 1;
      }

      .title {
        margin: 0 0 0.25rem 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-color);
      }

      .subtitle {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-color-light);
      }

      .appointment-content {
        margin-bottom: 1.5rem;
      }

      .client-info {
        margin-bottom: 1rem;
      }

      .client-name {
        margin: 0 0 0.75rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .appointment-details {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-color-light);
      }

      .detail-icon {
        font-size: 1rem;
      }

      .service-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .service-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .service-icon {
        font-size: 1rem;
      }

      .service-name {
        font-weight: 600;
      }

      .duration-info {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        color: var(--text-color-light);
        padding: 0.25rem 0.75rem;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 15px;
      }

      .duration-icon {
        font-size: 0.8rem;
      }

      .notes-section {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        border-left: 3px solid var(--primary-color);
      }

      .notes-icon {
        font-size: 1rem;
        margin-top: 0.1rem;
      }

      .notes-text {
        font-size: 0.875rem;
        color: var(--text-color-light);
        line-height: 1.4;
      }

      .appointment-actions {
        display: flex;
        justify-content: flex-end;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-primary {
        background: var(--gradient-primary);
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .btn-primary:hover {
        background: linear-gradient(
          135deg,
          var(--primary-color-dark) 0%,
          var(--primary-color) 100%
        );
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .no-next-appointment {
        text-align: center;
        padding: 3rem 2rem;
        background: var(--surface-color);
        border-radius: 16px;
        box-shadow: var(--box-shadow);
        border: 2px solid var(--border-color);
      }

      .no-appointment-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.6;
      }

      .no-next-appointment h3 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .no-next-appointment p {
        margin: 0;
        font-size: 1rem;
        color: var(--text-color-light);
        line-height: 1.5;
      }

      @media (max-width: 768px) {
        .next-appointment-card {
          padding: 1rem;
        }

        .appointment-header {
          flex-direction: column;
          text-align: center;
          gap: 0.75rem;
        }

        .header-icon {
          width: 40px;
          height: 40px;
          font-size: 1.25rem;
        }

        .client-name {
          font-size: 1.25rem;
        }

        .appointment-details {
          flex-direction: column;
          gap: 0.5rem;
        }

        .service-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .appointment-actions {
          justify-content: center;
        }

        .no-next-appointment {
          padding: 2rem 1rem;
        }

        .no-appointment-icon {
          font-size: 3rem;
        }
      }
    `,
  ],
})
export class NextAppointmentComponent {
  readonly bookings = input.required<Booking[]>();

  readonly onViewDetail = output<Booking>();

  constructor(private serviceColorsService: ServiceColorsService) {}

  readonly nextBooking = computed(() => {
    const bookings = this.bookings();
    if (!bookings || bookings.length === 0) {
      return null;
    }

    const now = new Date();
    const futureBookings = bookings.filter(booking => {
      // Only show confirmed bookings with dates
      if (booking.status !== 'confirmed' || !booking.data) {
        return false;
      }

      // Create date in local timezone to avoid UTC conversion issues
      const [hours, minutes] = (booking.hora || '23:59').split(':').map(Number);
      const bookingDateTime = new Date(booking.data);
      bookingDateTime.setHours(hours, minutes, 0, 0);
      return bookingDateTime > now;
    });

    if (futureBookings.length === 0) {
      return null;
    }

    // Ordenar per data i hora i retornar la primera
    return futureBookings.sort((a, b) => {
      // Create dates in local timezone to avoid UTC conversion issues
      const createLocalDateTime = (dateStr: string, timeStr: string) => {
        const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
        const date = new Date(dateStr);
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      const dateA = createLocalDateTime(a.data || '', a.hora || '00:00');
      const dateB = createLocalDateTime(b.data || '', b.hora || '00:00');
      return dateA.getTime() - dateB.getTime();
    })[0];
  });

  readonly serviceColor = computed(() => {
    const booking = this.nextBooking();
    if (!booking) {
      return this.serviceColorsService.getDefaultColor();
    }

    const serviceName = this.getServiceName(booking);
    return this.serviceColorsService.getServiceColor(serviceName || '');
  });

  readonly serviceCssClass = computed(() => {
    const booking = this.nextBooking();
    if (!booking) {
      return this.serviceColorsService.getServiceCssClass('');
    }

    const serviceName = this.getServiceName(booking);
    return this.serviceColorsService.getServiceCssClass(serviceName);
  });

  readonly serviceTextCssClass = computed(() => {
    const booking = this.nextBooking();
    if (!booking) {
      return this.serviceColorsService.getServiceTextCssClass('');
    }

    const serviceName = this.getServiceName(booking);
    return this.serviceColorsService.getServiceTextCssClass(serviceName);
  });

  getServiceName(booking: Booking): string {
    return booking.serviceName || booking.servei || 'Servei general';
  }

  getClientName(booking: Booking): string {
    return booking.nom || booking.title || booking.clientName || 'Client';
  }

  formatDate(dateString: string): string {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ca });
    } catch {
      return dateString;
    }
  }

  formatTime(timeString: string): string {
    return timeString;
  }
}
