import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pelu-popup-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-modal.component.html',
  styleUrls: ['./popup-modal.component.scss']
})
export class PopupModalComponent {
  // Input signals
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly secondary = input<boolean>(false);

  // Output signals
  readonly closed = output<void>();

  // Internal state
  private readonly isClosingSignal = signal<boolean>(false);

  // Computed properties
  readonly isClosing = computed(() => this.isClosingSignal());
  readonly modalClasses = computed(() => {
    const size = this.size();
    const secondary = this.secondary();
    return {
      'popup-modal': true,
      [`popup-modal--${size}`]: true,
      'popup-modal--secondary': secondary,
      'popup-modal--closing': this.isClosing()
    };
  });

  onClose() {
    if (!this.isClosing()) {
      this.isClosingSignal.set(true);
      setTimeout(() => {
        this.closed.emit();
        this.isClosingSignal.set(false);
      }, 300);
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
