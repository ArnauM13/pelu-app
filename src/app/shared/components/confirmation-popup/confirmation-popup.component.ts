import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PopupModalComponent } from '../popup-modal/popup-modal.component';
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
  imports: [CommonModule, TranslateModule, PopupModalComponent, ButtonModule],
  template: `
    <pelu-popup-modal
      [isOpen]="isOpen()"
      (backdropClick)="onCancel()"
    >
      <div class="confirm-row">
        <span class="confirm-icon">
          @if (data()?.severity === 'danger') { ⚠️ } @else if (data()?.severity === 'warning') { ⚠️ } @else { ℹ️ }
        </span>
        <p class="confirm-text"
           [innerHTML]="(data()?.message || 'COMMON.CONFIRMATION.MESSAGE') | translate">
        </p>
      </div>

      <div class="popup-footer">
        <p-button
          [label]="cancelText()"
          severity="secondary"
          (onClick)="onCancel()"
        />
        <p-button
          [label]="confirmText()"
          [severity]="isDanger() ? 'danger' : undefined"
          (onClick)="onConfirm()"
        />
      </div>
    </pelu-popup-modal>
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

  // UI computed values
  readonly isDanger = computed(() => (this.data()?.severity || 'info') === 'danger');
  readonly cancelText = computed(() => this.translateService.instant(this.data()?.cancelText || 'COMMON.ACTIONS.CANCEL'));
  readonly confirmText = computed(() => this.translateService.instant(this.data()?.confirmText || 'COMMON.ACTIONS.CONFIRM'));

  // Methods
  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
