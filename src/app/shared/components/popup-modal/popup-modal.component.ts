import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pelu-popup-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-modal.component.html',
  styleUrls: ['./popup-modal.component.scss']
})
export class PopupModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() secondary = false;
  @Output() closed = new EventEmitter<void>();

  isClosing = false;

  onClose() {
    if (!this.isClosing) {
      this.isClosing = true;
      setTimeout(() => {
        this.closed.emit();
        this.isClosing = false;
      }, 300);
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
