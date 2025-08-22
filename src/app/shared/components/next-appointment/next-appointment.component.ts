import { Component, computed, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { ServicesService } from '../../../core/services/services.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'pelu-next-appointment',
  imports: [CommonModule, TranslateModule, ButtonModule],
  template: `
    @if (nextBooking(); as booking) {
      <div class="next-appointment-card" [ngClass]="serviceCssClass()" [class.collapsed]="isCollapsed()" (click)="isCollapsed() ? toggleCollapse() : null">
        <div class="appointment-header" (click)="toggleCollapse(); $event.stopPropagation()">
          <div class="header-icon" [style.background]="serviceColor().color">⏰</div>
          <div class="header-content">
            <h3 class="title">{{ 'APPOINTMENTS.MESSAGES.NEXT_APPOINTMENT' | translate }}</h3>
            <p class="subtitle">
              {{ 'APPOINTMENTS.MESSAGES.NEXT_APPOINTMENT_SUBTITLE' | translate }}
            </p>
          </div>
          <div class="header-right">
            <p-button
              [icon]="isCollapsed() ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"
              [text]="true"
              [rounded]="true"
              [ariaLabel]="isCollapsed() ? 'APPOINTMENTS.EXPAND' : 'APPOINTMENTS.COLLAPSE'"
            />
          </div>
        </div>

        @if (!isCollapsed()) {
          <div class="appointment-content" (click)="$event.stopPropagation()">
            <div class="client-info">
              <h4 class="client-name">{{ getClientName(booking) }}</h4>
            </div>

            <div class="appointment-main-info">
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

              <div class="service-info">
                <div class="service-info-left">
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

                  <div class="duration-info">
                    <span class="duration-icon">⏱️</span>
                    <span class="duration-text">{{ getServiceDuration(booking) }} min</span>
                  </div>
                </div>
              </div>

              <!-- Desktop view detail button -->
              <button class="btn btn-primary desktop-view-btn" (click)="onViewDetail(booking); $event.stopPropagation()">
                👁️ {{ 'APPOINTMENTS.VIEW_DETAIL' | translate }}
              </button>

              <!-- Mobile view detail button -->
              <button class="btn btn-primary mobile-view-btn" (click)="onViewDetail(booking); $event.stopPropagation()">
                👁️ {{ 'APPOINTMENTS.VIEW_DETAIL' | translate }}
              </button>
            </div>

            @if (booking.notes) {
              <div class="notes-section">
                <span class="notes-icon">📝</span>
                <span class="notes-text">{{ booking.notes }}</span>
              </div>
            }
          </div>
        }
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
      .next-appointment-card.collapsed {
        cursor: pointer;
      }

      .next-appointment-card.collapsed:hover {
        background-color: var(--surface-hover);
      }

      .appointment-content {
        padding-top: 1.5rem;
      }

      .next-appointment-card {
        background: var(--surface-color);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: var(--box-shadow);
        border: 2px solid var(--border-color);
        transition: all 0.3s ease;
      }

      .next-appointment-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-hover);
      }

      .appointment-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
        border-radius: 8px;
      }

      .appointment-header:hover {
        background-color: var(--surface-hover);
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

      .header-right {
        display: flex;
        align-items: center;
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

      .client-info {
        margin-bottom: 1rem;
      }

      .client-name {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .appointment-main-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: space-between;
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
      }

      .service-info-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
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

      /* Mobile view button - hidden on desktop */
      .mobile-view-btn {
        display: none;
      }

      /* Desktop view button - visible on desktop */
      .desktop-view-btn {
        display: flex;
        margin-left: auto;
      }

      /* Mobile styles - More compact */
      @media (max-width: 768px) {
        .appointment-content {
          padding-top: 0.5rem;
        }

        .next-appointment-card {
          padding: 1rem;
          border-radius: 12px;
        }

        .appointment-header {
          flex-direction: row;
          text-align: left;
          gap: 0.75rem;
        }

        .header-icon {
          width: 35px;
          height: 35px;
          font-size: 1rem;
        }

        .title {
          font-size: 1rem;
          margin-bottom: 0.125rem;
        }

        .subtitle {
          font-size: 0.75rem;
        }

        .client-name {
          font-size: 1.125rem;
        }

        .appointment-main-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .appointment-details {
          flex-direction: row;
          gap: 0.75rem;
          flex: none;
        }

        .detail-item {
          font-size: 0.8rem;
          gap: 0.25rem;
        }

        .detail-icon {
          font-size: 0.875rem;
        }

        .service-info {
          flex-direction: row;
          align-items: center;
          gap: 0.75rem;
          justify-content: space-between;
          width: 100%;
        }

        .service-info-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .service-badge {
          padding: 0.375rem 0.75rem;
          font-size: 0.8rem;
          gap: 0.25rem;
        }

        .service-icon {
          font-size: 0.875rem;
        }

        .duration-info {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }

        .duration-icon {
          font-size: 0.75rem;
        }

        .notes-section {
          padding: 0.5rem;
          gap: 0.375rem;
        }

        .notes-icon {
          font-size: 0.875rem;
        }

        .notes-text {
          font-size: 0.8rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          gap: 0.375rem;
        }

        /* Show mobile button, hide desktop button */
        .mobile-view-btn {
          display: flex;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          gap: 0.25rem;
          margin-left: auto;
        }

        .desktop-view-btn {
          display: none;
        }

        .no-next-appointment {
          padding: 1.5rem 1rem;
        }

        .no-appointment-icon {
          font-size: 2.5rem;
        }

        .no-next-appointment h3 {
          font-size: 1.25rem;
        }

        .no-next-appointment p {
          font-size: 0.875rem;
        }
      }

      /* Extra small mobile styles */
      @media (max-width: 480px) {
        .next-appointment-card {
          padding: 1rem;
        }

        .appointment-header {
          gap: 0.5rem;
        }

        .header-icon {
          width: 30px;
          height: 30px;
          font-size: 0.875rem;
        }

        .title {
          font-size: 0.875rem;
        }

        .subtitle {
          font-size: 0.7rem;
        }

        .client-name {
          font-size: 1rem;
        }

        .appointment-main-info {
          gap: 0.5rem;
        }

        .appointment-details {
          gap: 0.5rem;
        }

        .detail-item {
          font-size: 0.75rem;
        }

        .detail-icon {
          font-size: 0.8rem;
        }

        .service-info {
           gap: 0.5rem;
         }

         .service-info-left {
           gap: 0.5rem;
         }

        .service-badge {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .service-icon {
          font-size: 0.8rem;
        }

        .duration-info {
          font-size: 0.7rem;
          padding: 0.2rem 0.4rem;
        }

        .duration-icon {
          font-size: 0.7rem;
        }

        .notes-section {
          padding: 0.375rem;
        }

        .notes-icon {
          font-size: 0.8rem;
        }

        .notes-text {
          font-size: 0.75rem;
        }

        .btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }

        .mobile-view-btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.7rem;
          gap: 0.2rem;
        }

        .no-next-appointment {
          padding: 1rem 0.75rem;
        }

        .no-appointment-icon {
          font-size: 2rem;
        }

        .no-next-appointment h3 {
          font-size: 1.125rem;
        }

        .no-next-appointment p {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class NextAppointmentComponent {
  readonly bookings = input.required<Booking[]>();
  #servicesService = inject(ServicesService);
  #router = inject(Router);

  // Collapse state
  private readonly collapsedSignal = signal(true);
  readonly isCollapsed = computed(() => this.collapsedSignal());

  readonly toggleCollapse = () => {
    this.collapsedSignal.update(state => !state);
  };

  onViewDetail(booking: Booking) {
    if (booking?.id) {
      this.#router.navigate(['/appointments', booking.id]);
    }
  }

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
      return this.#servicesService.getDefaultColor();
    }

    // Get service from Firebase using serviceId
    const service = this.#servicesService.getAllServices().find(s => s.id === booking.serviceId);
    if (!service) {
      return this.#servicesService.getDefaultColor();
    }

    return this.#servicesService.getServiceColor(service);
  });

  readonly serviceCssClass = computed(() => {
    const booking = this.nextBooking();
    if (!booking) {
      return 'service-color-default';
    }

    // Get service from Firebase using serviceId
    const service = this.#servicesService.getAllServices().find(s => s.id === booking.serviceId);
    if (!service) {
      return 'service-color-default';
    }

    return this.#servicesService.getServiceCssClass(service);
  });

  readonly serviceTextCssClass = computed(() => {
    const booking = this.nextBooking();
    if (!booking) {
      return 'service-text-default';
    }

    // Get service from Firebase using serviceId
    const service = this.#servicesService.getAllServices().find(s => s.id === booking.serviceId);
    if (!service) {
      return 'service-text-default';
    }

    return this.#servicesService.getServiceTextCssClass(service);
  });

  getServiceName(booking: Booking): string {
    if (!booking.serviceId) {
      return 'Servei general';
    }

    // Get service from Firebase using serviceId
    const service = this.#servicesService.getAllServices().find(s => s.id === booking.serviceId);
    if (!service) {
      return 'Servei general';
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

  getClientName(booking: Booking): string {
    return booking.clientName || 'Client';
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
