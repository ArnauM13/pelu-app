import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface PopupItem {
  id: string;
  component: any;
  data?: any;
}

@Component({
  selector: 'app-popup-stack',
  template: `
    <div class="popup-stack" *ngIf="popups.length > 0">
      <div class="popup-stack-overlay" (click)="onBackdropClick($event)"></div>
      <div class="popup-stack-content">
        <ng-container *ngFor="let popup of popups">
          <ng-container *ngComponentOutlet="popup.component; inputs: popup.data"></ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .popup-stack {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
    }
    .popup-stack-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }
    .popup-stack-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  `],
  standalone: true
})
export class PopupStackComponent {
  @Input() popups: PopupItem[] = [];
  @Output() popupClosed = new EventEmitter<string>();

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      // Close the top popup
      if (this.popups.length > 0) {
        const topPopup = this.popups[this.popups.length - 1];
        this.popupClosed.emit(topPopup.id);
      }
    }
  }
}
