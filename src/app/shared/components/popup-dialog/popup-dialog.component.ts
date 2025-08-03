import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../buttons/button.component';

// Footer action types interface
export type FooterActionType = 'confirm' | 'cancel' | 'close' | 'edit' | 'delete' | 'save' | 'login' | 'register';

// Footer action interface
export interface FooterAction {
  label: string;
  type: FooterActionType;
  action: () => void;
}

// Popup dialog configuration interface
export interface PopupDialogConfig {
  title: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  closeOnBackdropClick?: boolean;
  showFooter?: boolean;
  footerActions?: FooterAction[];
  customClass?: string;
}

@Component({
  selector: 'pelu-popup-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './popup-dialog.component.html',
  styleUrls: ['./popup-dialog.component.scss'],
})
export class PopupDialogComponent {
  // Input signals
  readonly isOpen = input<boolean>(false);
  readonly config = input<PopupDialogConfig>({
    title: '',
    size: 'medium',
    closeOnBackdropClick: true,
    showFooter: false,
    footerActions: [],
  });

  // Output signals
  readonly closed = output<void>();

  // Computed properties
  readonly showFooter = computed(() => this.config().showFooter ?? false);
  readonly footerActions = computed(() => this.config().footerActions ?? []);
  readonly customClass = computed(() => this.config().customClass ?? '');

  // Methods
  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    if (this.config().closeOnBackdropClick) {
      this.onClose();
    }
  }

  onActionClick(action: FooterAction): void {
    action.action();
  }

  getActionClass(action: FooterAction): string {
    switch (action.type) {
      case 'confirm':
      case 'save':
        return 'btn-primary';
      case 'edit':
        return 'btn-secondary';
      case 'delete':
        return 'btn-danger';
      case 'login':
      case 'register':
        return 'btn-primary';
      case 'cancel':
      case 'close':
      default:
        return 'btn-secondary';
    }
  }
}
