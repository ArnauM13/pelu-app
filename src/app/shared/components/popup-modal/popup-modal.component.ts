import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup-modal',
  template: `
    <div class="popup-modal" *ngIf="isOpen">
      <div class="popup-backdrop" (click)="onBackdropClick($event)"></div>
      <div class="popup-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .popup-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
      }
      .popup-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
      }
      .popup-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
      }
    `,
  ],
  standalone: true,
})
export class PopupModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
