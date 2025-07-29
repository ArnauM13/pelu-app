import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../buttons/button.component';

export type PopupDialogActionType = 'primary' | 'secondary' | 'success' | 'danger' | 'cancel' | 'confirm' | 'close' | 'edit' | 'delete';

export interface PopupDialogConfig {
  title: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
  showHeader?: boolean;
  showFooter?: boolean;
  headerActions?: PopupDialogAction[];
  footerActions?: PopupDialogAction[];
  customClass?: string;
}

export interface PopupDialogAction {
  label: string;
  action: () => void;
  type: PopupDialogActionType;
  disabled?: boolean;
  icon?: string;
}

@Component({
  selector: 'pelu-popup-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div
        class="popup-dialog-overlay"
        [class]="config()?.customClass || ''"
        (click)="onBackdropClick($event)"
      >
        <div
          class="popup-dialog"
          [class]="getDialogClasses()"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          @if (config()?.showHeader !== false) {
            <div class="popup-header">
              <h2 class="popup-title">{{ config()?.title }}</h2>

              <!-- Header Actions -->
              @if (config()?.headerActions && config()?.headerActions!.length > 0) {
                <div class="header-actions">
                  @for (action of config()?.headerActions; track action.label) {
                    <pelu-button
                      [label]="action.label"
                      [severity]="getActionSeverity(action)"
                      [variant]="getActionVariant(action)"
                      [disabled]="action.disabled || false"
                      [icon]="action.icon || ''"
                      [rounded]="true"
                      (clicked)="action.action()"
                    >
                    </pelu-button>
                  }
                </div>
              }

              <!-- Close Button -->
              @if (config()?.showCloseButton !== false) {
                <pelu-button
                  label="×"
                  variant="text"
                  severity="secondary"
                  [rounded]="true"
                  class="close-btn"
                  (clicked)="onClose()"
                >
                </pelu-button>
              }
            </div>
          }

          <!-- Content -->
          <div class="popup-content">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (config()?.showFooter && config()?.footerActions && config()?.footerActions!.length > 0) {
            <div class="popup-footer">
              @for (action of config()?.footerActions; track action.label) {
                <pelu-button
                  [label]="action.label"
                  [severity]="getActionSeverity(action)"
                  [variant]="getActionVariant(action)"
                  [disabled]="action.disabled || false"
                  [icon]="action.icon || ''"
                  (clicked)="action.action()"
                >
                </pelu-button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrls: ['./popup-dialog.component.scss']
})
export class PopupDialogComponent {
  // Input signals
  readonly isOpen = input<boolean>(false);
  readonly config = input<PopupDialogConfig | null>(null);

  // Output signals
  readonly closed = output<void>();

  // Methods
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget && this.config()?.closeOnBackdropClick !== false) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  getDialogClasses(): string {
    const size = this.config()?.size || 'medium';
    return `popup-dialog-${size}`;
  }

  getActionSeverity(action: PopupDialogAction): 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast' {
    switch (action.type) {
      case 'primary':
      case 'confirm':
      case 'edit':
        return 'primary';
      case 'secondary':
      case 'close':
        return 'secondary';
      case 'success':
        return 'success';
      case 'danger':
      case 'delete':
        return 'danger';
      case 'cancel':
        return 'secondary';
      default:
        return 'primary';
    }
  }

  getActionVariant(action: PopupDialogAction): 'outlined' | 'text' | undefined {
    switch (action.type) {
      case 'secondary':
      case 'cancel':
      case 'close':
        return 'outlined';
      case 'danger':
      case 'delete':
        return undefined; // Default variant for danger
      case 'primary':
      case 'confirm':
      case 'edit':
      case 'success':
        return undefined; // Default variant for primary actions
      default:
        return undefined;
    }
  }
}
