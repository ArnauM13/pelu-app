import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'pelu-confirmation-popup',
  imports: [CommonModule, TranslateModule, ButtonModule],
  template: `
    @if (isOpen()) {
      <div class="confirmation-overlay" (click)="onBackdropClick($event)">
        <div class="confirmation-popup" (click)="$event.stopPropagation()">
          <div class="popup-header">
            <h3>{{ data()?.title || 'COMMON.CONFIRMATION.TITLE' | translate }}</h3>
            <button class="close-btn" (click)="onCancel()">×</button>
          </div>

          <div class="popup-body">
            <div class="confirmation-icon">
              @if (data()?.severity === 'danger') {
                ⚠️
              } @else if (data()?.severity === 'warning') {
                ⚠️
              } @else {
                ❓
              }
            </div>
            <p class="confirmation-message">
              {{ data()?.message || 'COMMON.CONFIRMATION.MESSAGE' | translate }}
            </p>
          </div>

          <div class="popup-footer">
            <button class="btn-secondary" (click)="onCancel()">
              {{ data()?.cancelText || 'COMMON.ACTIONS.CANCEL' | translate }}
            </button>
            <button
              class="btn-primary"
              [class.btn-danger]="data()?.severity === 'danger'"
              (click)="onConfirm()"
            >
              {{ data()?.confirmText || 'COMMON.ACTIONS.CONFIRM' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./confirmation-popup.component.scss'],
})
export class ConfirmationPopupComponent {
  // Input signals
  readonly isOpen = input<boolean>(false);
  readonly data = input<ConfirmationData | null>(null);

  // Output signals
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  // Services
  private readonly translateService = inject(TranslateService);

  // Methods
  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
