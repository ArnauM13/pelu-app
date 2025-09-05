import { Component, input, output, computed, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

// Footer action interface
export interface FooterAction {
  label: string;
  severity?: 'primary' | 'secondary' | 'danger';
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

  // Debug computed for isOpen
  readonly debugVisible = computed(() => {
    const isOpen = this.isOpen();
    console.log('🔍 PopupDialog - visible:', isOpen, 'config:', this.config());
    return isOpen;
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

  getActionSeverity(action: FooterAction): 'secondary' | 'danger' | undefined {
    switch (action.severity) {
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'danger';
      case 'primary':
      default:
        return undefined; // primary
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
