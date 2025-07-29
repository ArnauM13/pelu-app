import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PopupDialogComponent, PopupDialogConfig, PopupDialogActionType } from '../popup-dialog/popup-dialog.component';

export interface AlertData {
  title?: string;
  message: string;
  emoji?: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'danger' | 'info' | 'success';
  showCancel?: boolean;
}

@Component({
  selector: 'pelu-alert-popup',
  imports: [CommonModule, TranslateModule, PopupDialogComponent],
  template: `
    <pelu-popup-dialog
      [isOpen]="isOpen()"
      [config]="dialogConfig()"
      (closed)="onCancel()"
    >
      <div class="alert-content">
        <div class="alert-icon">
          {{ getEmoji() }}
        </div>
        <p class="alert-message">
          {{ data()?.message }}
        </p>
      </div>
    </pelu-popup-dialog>
  `,
  styleUrls: ['./alert-popup.component.scss'],
})
export class AlertPopupComponent {
  // Input signals
  readonly isOpen = input<boolean>(false);
  readonly data = input<AlertData | null>(null);

  // Output signals
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  // Services
  private readonly translateService = inject(TranslateService);

  // Dialog configuration
  readonly dialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.getTitle(),
    size: 'small',
    showCloseButton: true,
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      ...(this.data()?.showCancel !== false ? [{
        label: this.getCancelText(),
        type: 'cancel' as const,
        action: () => this.onCancel()
      }] : []),
      {
        label: this.getConfirmText(),
        type: 'confirm' as const,
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

  // Helper methods
  getTitle(): string {
    const title = this.data()?.title;
    if (title) {
      return title;
    }

    const severity = this.data()?.severity || 'info';
    switch (severity) {
      case 'danger':
        return this.translateService.instant('COMMON.ALERT.DANGER_TITLE');
      case 'warning':
        return this.translateService.instant('COMMON.ALERT.WARNING_TITLE');
      case 'success':
        return this.translateService.instant('COMMON.ALERT.SUCCESS_TITLE');
      default:
        return this.translateService.instant('COMMON.ALERT.INFO_TITLE');
    }
  }

  getEmoji(): string {
    const emoji = this.data()?.emoji;
    if (emoji) {
      return emoji;
    }

    const severity = this.data()?.severity || 'info';
    switch (severity) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  }

  getConfirmText(): string {
    const confirmText = this.data()?.confirmText;
    if (confirmText) return confirmText;

    const translated = this.translateService.instant('COMMON.ACTIONS.YES');
    return translated !== 'COMMON.ACTIONS.YES' ? translated : 'Sí';
  }

  getCancelText(): string {
    const cancelText = this.data()?.cancelText;
    if (cancelText) return cancelText;

    const translated = this.translateService.instant('COMMON.ACTIONS.NO');
    return translated !== 'COMMON.ACTIONS.NO' ? translated : 'No';
  }
}
