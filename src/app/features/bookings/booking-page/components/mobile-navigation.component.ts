import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { BookingStateService, BookingStep } from '../services/booking-state.service';
import { BookingValidationService } from '../services/booking-validation.service';

@Component({
  selector: 'pelu-mobile-navigation',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
  ],
  template: `
    <div class="bottom-navigation">
      <pelu-button
        [label]="'COMMON.ACTIONS.BACK'"
        [icon]="'pi pi-chevron-left'"
        iconPos="left"
        [disabled]="!canGoBack()"
        (clicked)="canGoBack() ? onGoBack() : null"
        severity="secondary"
        variant="outlined"
        [fluid]="true"
      >
      </pelu-button>

      <pelu-button
        [label]="getContinueButtonLabel()"
        [icon]="'pi pi-chevron-right'"
        iconPos="right"
        [disabled]="!canProceedToNextStep()"
        (clicked)="canProceedToNextStep() ? onNextStep() : null"
        [severity]="getContinueButtonSeverity()"
        [raised]="true"
        [fluid]="true"
        [class.disabled-button]="currentStep() === 'confirmation' && !canProceedToNextStep()"
      >
      </pelu-button>
    </div>
  `,
  styles: [`
    .bottom-navigation {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      background: transparent;
      backdrop-filter: none;
      border: none;
      padding: 0;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      z-index: 1000;
      pointer-events: none; // Allow clicks to pass through container

      pelu-button {
        flex: 1;
        pointer-events: auto; // Re-enable clicks on buttons
        margin: 0 0.5rem;

        // Bottom navigation buttons styling - floating appearance
        ::ng-deep .p-button {
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
          }

          &:active {
            transform: translateY(0);
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.15);
          }
        }

        &.disabled-button {
          opacity: 0.6;
          cursor: not-allowed;

          ::ng-deep .p-button {
            &:hover {
              transform: none !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .bottom-navigation {
        bottom: 0.75rem;
        left: 0.75rem;
        right: 0.75rem;
        gap: 0.75rem;

        pelu-button {
          margin: 0 0.25rem;

          ::ng-deep .p-button {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);

            &:hover {
              box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            }
          }
        }
      }
    }
  `]
})
export class MobileNavigationComponent {
  private readonly bookingStateService = inject(BookingStateService);
  private readonly bookingValidationService = inject(BookingValidationService);

  // Output events
  goBack = output<void>();
  nextStep = output<void>();

  // ===== COMPUTED PROPERTIES =====

  readonly currentStep = computed(() => this.bookingStateService.currentStep());
  readonly canGoBack = computed(() => this.bookingValidationService.canGoBack());
  readonly canProceedToNextStep = computed(() => this.bookingValidationService.canProceedToNextStep());

  // ===== EVENT HANDLERS =====

  onGoBack(): void {
    this.goBack.emit();
  }

  onNextStep(): void {
    this.nextStep.emit();
  }

  // ===== UTILITY METHODS =====

  getContinueButtonLabel(): string {
    const step = this.currentStep();
    if (step === 'confirmation') {
      return 'Confirmar';
    }
    return 'COMMON.ACTIONS.CONTINUE';
  }

  getContinueButtonSeverity(): 'primary' | 'secondary' {
    const step = this.currentStep();
    if (step === 'confirmation' && !this.canProceedToNextStep()) {
      return 'secondary';
    }
    return 'primary';
  }
}
