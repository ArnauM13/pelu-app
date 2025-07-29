import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PopupDialogComponent, PopupDialogConfig, PopupDialogActionType } from '../popup-dialog/popup-dialog.component';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'pelu-confirmation-popup',
  imports: [CommonModule, TranslateModule, PopupDialogComponent],
  template: `
    <pelu-popup-dialog
      [isOpen]="isOpen()"
      [config]="dialogConfig()"
      (closed)="onCancel()"
    >
      <div class="confirmation-content">
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
    </pelu-popup-dialog>
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

  // Dialog configuration
  readonly dialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.data()?.title || this.translateService.instant('COMMON.CONFIRMATION.TITLE'),
    size: 'small',
    showCloseButton: true,
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.data()?.cancelText || this.translateService.instant('COMMON.ACTIONS.CANCEL'),
        type: 'cancel' as const,
        action: () => this.onCancel()
      },
      {
        label: this.data()?.confirmText || this.translateService.instant('COMMON.ACTIONS.CONFIRM'),
        type: this.getConfirmButtonType(),
        action: () => this.onConfirm()
      }
    ]
  }));

  // Methods
  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  private getConfirmButtonType(): PopupDialogActionType {
    const severity = this.data()?.severity || 'info';
    switch (severity) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'primary';
      default:
        return 'confirm';
    }
  }
}
