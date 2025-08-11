import { Component, input, output, computed, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

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
  imports: [CommonModule, TranslateModule, ConfirmDialogModule, ButtonModule],
  templateUrl: './popup-dialog.component.html',
  styleUrls: ['./popup-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
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

  // Inline style per size
  readonly dialogStyle = computed(() => {
    const size = this.config().size ?? 'medium';
    switch (size) {
      case 'small':
        return { width: '22rem', maxWidth: '95vw' } as const;
      case 'large':
        return { width: '44rem', maxWidth: '95vw' } as const;
      case 'full':
        return { width: '95vw', height: '90vh' } as const;
      case 'medium':
      default:
        return { width: '30rem', maxWidth: '95vw' } as const;
    }
  });

  // Methods
  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    if (this.config().closeOnBackdropClick) {
      this.onClose();
    }
  }

  onHide(): void {
    this.closed.emit();
  }

  onActionClick(action: FooterAction): void {
    action.action();
  }

  private getActionWeight(actionType: FooterActionType): number {
    switch (actionType) {
      case 'cancel':
      case 'close':
      case 'edit':
        return 1; // secondary
      case 'confirm':
      case 'save':
      case 'delete':
      case 'login':
      case 'register':
        return 2; // primary
      default:
        return 0; // tertiary
    }
  }

  readonly sortedFooterActions = computed(() => {
    const actions = [...(this.footerActions() ?? [])];
    return actions.sort((a, b) => this.getActionWeight(a.type) - this.getActionWeight(b.type));
  });

  getActionSeverity(action: FooterAction): 'secondary' | 'danger' | undefined {
    switch (action.type) {
      case 'confirm':
      case 'save':
      case 'login':
      case 'register':
        return undefined; // primary
      case 'delete':
        return 'danger';
      case 'edit':
      case 'cancel':
      case 'close':
      default:
        return 'secondary';
    }
  }

  // ESC key handler
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }
}
