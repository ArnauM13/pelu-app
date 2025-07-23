import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    imports: [CommonModule, TranslateModule],
    template: `
    @if (isOpen()) {
      <div class="alert-overlay" (click)="onBackdropClick($event)">
        <div class="alert-popup" (click)="$event.stopPropagation()">
          <div class="popup-header">
            <h3>{{ getTitle() }}</h3>
            <button class="close-btn" (click)="onCancel()">×</button>
          </div>

          <div class="popup-body">
            <div class="alert-icon">
              {{ getEmoji() }}
            </div>
            <p class="alert-message">
              {{ data()?.message }}
            </p>
          </div>

          <div class="popup-footer">
            @if (data()?.showCancel !== false) {
              <button
                class="btn btn-secondary"
                (click)="onCancel()">
                {{ getCancelText() }}
              </button>
            }
            <button
              class="btn"
              [class]="getConfirmButtonClass()"
              (click)="onConfirm()">
              {{ getConfirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styleUrls: ['./alert-popup.component.scss']
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

  getConfirmButtonClass(): string {
    const severity = this.data()?.severity || 'info';
    switch (severity) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      case 'success':
        return 'btn-success';
      default:
        return 'btn-primary';
    }
  }
}
