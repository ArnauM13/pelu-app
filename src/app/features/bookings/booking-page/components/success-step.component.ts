import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BookingStateService } from '../services/booking-state.service';
import { Booking } from '../../../../core/interfaces/booking.interface';

@Component({
  selector: 'pelu-success-step',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
  ],
  template: `
    <div class="success-step">
      <!-- Success Content Section -->
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h2>{{ 'BOOKING.SUCCESS_TITLE' | translate }}</h2>
        <p>{{ 'BOOKING.SUCCESS_MESSAGE' | translate }}</p>
        <p class="email-notice">{{ 'BOOKING.EMAIL_NOTICE' | translate }}</p>

        <div class="success-actions">
          <pelu-button
            [label]="'BOOKING.VIEW_DETAIL'"
            (clicked)="onViewBookingDetail()"
            severity="primary"
            [raised]="true"
            [fluid]="true"
          >
          </pelu-button>
          <pelu-button
            [label]="'BOOKING.BACK_TO_HOME'"
            (clicked)="onBackToHome()"
            severity="secondary"
            variant="outlined"
            [fluid]="true"
          >
          </pelu-button>
        </div>
      </div>

      <!-- Download ICS Section -->
      <div class="ics-section">
        <pelu-card variant="default">
          <div class="ics-content">
            <h3>📅 {{ 'BOOKING.ADD_TO_CALENDAR' | translate }}</h3>
            <p class="ics-description">{{ 'BOOKING.ADD_TO_CALENDAR_DESCRIPTION' | translate }}</p>
            <pelu-button
              [label]="'BOOKING.ADD_TO_CALENDAR'"
              [icon]="'pi pi-calendar-plus'"
              iconPos="left"
              (clicked)="onAddToCalendar()"
              severity="secondary"
              variant="outlined"
              [fluid]="true"
            >
            </pelu-button>
          </div>
        </pelu-card>
      </div>
    </div>
  `,
  styles: [`
    .success-step {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .success-content {
        text-align: center;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(13, 71, 161, 0.08);

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          animation: bounceIn 0.6s ease-out;
        }

        h2 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #10b981;
          margin: 0 0 1rem 0;
        }

        p {
          font-size: 1.1rem;
          color: #666;
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .email-notice {
          font-size: 0.9rem;
          color: #888;
          font-style: italic;
          margin-bottom: 2rem;
        }

        .success-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
        }
      }

      .ics-section {
        // ICS section wrapper
      }

      // ICS content styling
      .ics-content {
        h3 {
          color: #0d47a1;
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .ics-description {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 1rem;
          line-height: 1.4;
          font-style: italic;
        }

        pelu-button {
          margin-top: 0.5rem;
        }
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @media (max-width: 768px) {
      .success-step {
        .success-content {
          .success-icon {
            font-size: 3rem;
          }

          h2 {
            font-size: 1.5rem;
          }

          p {
            font-size: 1rem;
          }

          .success-actions {
            .btn-primary,
            .btn-secondary {
              padding: 0.75rem 1.5rem;
              font-size: 0.9rem;
            }
          }
        }
      }
    }
  `]
})
export class SuccessStepComponent {
  private readonly bookingStateService = inject(BookingStateService);

  // Output events
  viewBookingDetail = output<Booking>();
  backToHome = output<void>();
  addToCalendar = output<Booking>();

  // ===== COMPUTED PROPERTIES =====

  readonly createdBooking = computed(() => this.bookingStateService.createdBooking());

  // ===== EVENT HANDLERS =====

  onViewBookingDetail(): void {
    const booking = this.createdBooking();
    if (booking) {
      this.viewBookingDetail.emit(booking);
    }
  }

  onBackToHome(): void {
    this.backToHome.emit();
  }

  onAddToCalendar(): void {
    const booking = this.createdBooking();
    if (booking) {
      this.addToCalendar.emit(booking);
    }
  }
}
