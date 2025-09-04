import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextComponent } from '../../../../shared/components/inputs/input-text/input-text.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BookingStateService } from '../services/booking-state.service';
import { DateTimeSelectionService } from '../services/date-time-selection.service';
import { BookingDetails } from '../../../../shared/components/booking-popup/booking-popup.component';

@Component({
  selector: 'pelu-confirmation-step',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputTextComponent,
    CardComponent,
  ],
  template: `
    <div class="confirmation-step">
      <!-- Booking Summary -->
      <div class="booking-summary">
        <!-- Date and Time Summary -->
        <div class="selection-summary">
          <div class="summary-item">
            <span class="summary-label">📅 {{ 'COMMON.DATE' | translate }}:</span>
            <span class="summary-value">{{ selectedDate() ? formatDay(selectedDate()!) : '' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">⏰ {{ 'COMMON.HOURS' | translate }}:</span>
            <span class="summary-value">{{ selectedTimeSlot()?.time || '' }}</span>
          </div>
        </div>

        <!-- Service Display -->
        @if (selectedService()) {
          <pelu-card variant="default">
            <div class="summary-section">
              <h3>{{ 'COMMON.SELECTION.SELECTED_SERVICE' | translate }}</h3>
              <div class="service-card selected">
                <div class="service-header">
                  <div class="service-icon">{{ selectedService()!.icon }}</div>
                  <div class="service-info">
                    <div class="service-name">{{ selectedService()!.name }}</div>
                    <div class="service-description">
                      {{ selectedService()!.duration }} {{ 'COMMON.UNITS.MINUTES' | translate }}
                    </div>
                  </div>
                  <div class="service-price">{{ selectedService()!.price | currency }}</div>
                </div>
                <div class="service-details">
                  <div class="service-meta">
                    <span class="service-duration">
                      ⏱️ {{ selectedService()!.duration }} {{ 'COMMON.UNITS.MINUTES' | translate }}
                    </span>
                    @if (selectedService()!.isPopular) {
                      <div class="popular-badge">
                        <span class="badge-icon">🔥</span>
                        <span class="badge-text">{{ 'SERVICES.POPULAR' | translate }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </pelu-card>
        }

        <!-- Client Information Section -->
        <pelu-card variant="default">
          <div class="summary-section">
            <h3>{{ 'COMMON.CLIENT_INFORMATION' | translate }}</h3>
            <div class="client-info-form">
              <pelu-input-text
                [label]="'COMMON.NAME'"
                [placeholder]="'COMMON.NAME_PLACEHOLDER'"
                [required]="true"
                [value]="bookingDetails().clientName || ''"
                (valueChange)="onClientNameChanged($event)"
              >
              </pelu-input-text>

              <pelu-input-text
                [label]="'COMMON.EMAIL'"
                [placeholder]="'COMMON.EMAIL_PLACEHOLDER'"
                type="email"
                [required]="true"
                [value]="bookingDetails().email || ''"
                (valueChange)="onEmailChanged($event)"
              >
              </pelu-input-text>
            </div>
          </div>
        </pelu-card>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-step {
      .selection-summary {
        background: #f8fafc;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 24px;
        border: 1px solid #e2e8f0;

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .summary-label {
            font-weight: 500;
            color: #64748b;
            font-size: 0.9rem;
          }

          .summary-value {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.9rem;
          }
        }
      }

      .summary-section {
        h3 {
          color: #0d47a1;
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .service-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          background: white;

          &.selected {
            border-color: #3b82f6;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
          }

          .service-header {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;

            .service-icon {
              font-size: 1.5rem;
              margin-right: 1rem;
              width: 40px;
              text-align: center;
            }

            .service-info {
              flex: 1;

              .service-name {
                font-weight: 600;
                font-size: 1rem;
                margin-bottom: 0.25rem;
              }

              .service-description {
                font-size: 0.9rem;
                opacity: 0.7;
              }
            }

            .service-price {
              font-weight: 700;
              font-size: 1.1rem;
              color: #10b981;
            }
          }

          .service-details {
            .service-meta {
              display: flex;
              align-items: center;
              gap: 1rem;

              .service-duration {
                font-size: 0.9rem;
                opacity: 0.7;
              }

              .popular-badge {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 600;

                .badge-icon {
                  font-size: 0.7rem;
                }
              }
            }
          }
        }

        .client-info-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      }
    }
  `]
})
export class ConfirmationStepComponent {
  private readonly bookingStateService = inject(BookingStateService);
  private readonly dateTimeSelectionService = inject(DateTimeSelectionService);

  // Output events
  clientNameChanged = output<string>();
  emailChanged = output<string>();

  // ===== COMPUTED PROPERTIES =====

  readonly selectedDate = computed(() => this.dateTimeSelectionService.selectedDate());
  readonly selectedTimeSlot = computed(() => {
    const selectedTime = this.dateTimeSelectionService.selectedTime();
    const availableSlots = this.dateTimeSelectionService.availableTimeSlots();
    return availableSlots.find(slot => slot.time === selectedTime) || null;
  });
  readonly selectedService = computed(() => this.bookingStateService.selectedService());
  readonly bookingDetails = computed(() => this.bookingStateService.bookingDetails());

  // ===== EVENT HANDLERS =====

  onClientNameChanged(name: string): void {
    this.bookingStateService.updateBookingDetails({ clientName: name });
    this.clientNameChanged.emit(name);
  }

  onEmailChanged(email: string): void {
    this.bookingStateService.updateBookingDetails({ email: email });
    this.emailChanged.emit(email);
  }

  // ===== UTILITY METHODS =====

  formatDay(date: Date): string {
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
