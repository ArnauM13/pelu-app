import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FirebaseService } from '../../../../core/services/firebase-services.service';
import { BookingStateService } from '../services/booking-state.service';
import { ServiceCardComponent } from '../../../../shared/components/service-card/service-card.component';

@Component({
  selector: 'pelu-service-selection-step',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ServiceCardComponent,
  ],
  template: `
    <div class="service-step">
      <!-- Recently Booked Services Section -->
      @if (recentlyBookedServices().length > 0) {
        <div class="services-section">
          <h4 class="section-title">🕒 {{ 'COMMON.SELECTION.RECENTLY_BOOKED' | translate }}</h4>
          <div class="services-grid">
            @for (service of recentlyBookedServices(); track service.id) {
              <pelu-service-card
                [service]="service"
                [selected]="selectedService()?.id === service.id"
                [simpleMode]="true"
                [clickable]="true"
                (cardClick)="onServiceSelected($event)"
              />
            }
          </div>
        </div>
      }

      <!-- Popular Services Section -->
      @if (popularServices().length > 0) {
        <div class="services-section">
          <h4 class="section-title">⭐ {{ 'COMMON.SELECTION.POPULAR_SERVICES' | translate }}</h4>
          <div class="services-grid">
            @for (service of popularServices(); track service.id) {
              <pelu-service-card
                [service]="service"
                [selected]="selectedService()?.id === service.id"
                [simpleMode]="true"
                [clickable]="true"
                (cardClick)="onServiceSelected($event)"
              />
            }
          </div>
        </div>
      }

      <!-- Other Services Section -->
      @if (otherServices().length > 0) {
        <div class="services-section">
          <h4 class="section-title">{{ 'COMMON.SELECTION.OTHER_SERVICES' | translate }}</h4>
          <div class="services-grid">
            @for (service of otherServices(); track service.id) {
              <pelu-service-card
                [service]="service"
                [selected]="selectedService()?.id === service.id"
                [simpleMode]="true"
                [clickable]="true"
                (cardClick)="onServiceSelected($event)"
              />
            }
          </div>
        </div>
      }

      <!-- No Services Available -->
      @if (availableServices().length === 0) {
        <div class="no-services">
          <p>{{ 'COMMON.SELECTION.NO_SERVICES_AVAILABLE' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .service-step {
      .services-section {
        margin-bottom: 2rem;

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color-primary);
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          border-bottom: 2px solid rgba(59, 130, 246, 0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;

          &:first-child {
            margin-top: 0;
          }
        }

        .services-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          // Service card styles for mobile booking
          pelu-service-card {
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
            }

            // Override service card styles for mobile booking context
            ::ng-deep .service-card {
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              background: white;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              transition: all 0.3s ease;

              &:hover {
                border-color: #3b82f6;
                background: #f8fafc;
              }

              &.selected {
                border-color: #3b82f6;
                background: white;
                color: #1e40af;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
                position: relative;

                &::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  border: 2px solid #3b82f6;
                  border-radius: 12px;
                  background: linear-gradient(
                    135deg,
                    rgba(59, 130, 246, 0.1) 0%,
                    rgba(59, 130, 246, 0.05) 100%
                  );
                  pointer-events: none;
                }
              }
            }
          }
        }
      }

      .no-services {
        text-align: center;
        padding: 2rem;
        color: var(--text-color-secondary);
        font-style: italic;
      }
    }
  `]
})
export class ServiceSelectionStepComponent {
  private readonly bookingStateService = inject(BookingStateService);

  // Output events
  serviceSelected = output<FirebaseService>();

  // ===== COMPUTED PROPERTIES =====

  readonly selectedService = computed(() => this.bookingStateService.selectedService());
  readonly availableServices = computed(() => this.bookingStateService.availableServices());
  readonly recentlyBookedServices = computed(() => this.bookingStateService.recentlyBookedServices());
  readonly popularServices = computed(() => this.bookingStateService.popularServices());
  readonly otherServices = computed(() => this.bookingStateService.otherServices());

  // ===== EVENT HANDLERS =====

  onServiceSelected(service: FirebaseService): void {
    this.bookingStateService.setSelectedService(service);
    this.serviceSelected.emit(service);
  }

  // ===== UTILITY METHODS =====

  trackByServiceId(index: number, service: FirebaseService): string {
    return service?.id || `service-${index}`;
  }
}
