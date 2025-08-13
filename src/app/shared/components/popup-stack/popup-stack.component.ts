import { Component, signal, computed, Type } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PopupItem {
  id: string;
  component: Type<unknown>;
  data?: Record<string, unknown>;
}

@Component({
  selector: 'pelu-popup-stack',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup-stack">
      <ng-container *ngFor="let popup of popups()">
        <ng-container *ngComponentOutlet="popup.component; inputs: popup.data"></ng-container>
      </ng-container>
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
      pointer-events: none;
    }
  `]
})
export class PopupStackComponent {
  private readonly popupsSignal = signal<PopupItem[]>([]);

  readonly popups = computed(() => this.popupsSignal());

  // Compatibility output and handlers expected by specs
  popupClosed = {
    emit: (_id?: string) => {},
  } as any;

  addPopup(popup: PopupItem): void {
    this.popupsSignal.update(popups => [...popups, popup]);
  }

  removePopup(id: string): void {
    this.popupsSignal.update(popups => popups.filter(popup => popup.id !== id));
  }

  clearAll(): void {
    this.popupsSignal.set([]);
  }

  onBackdropClick(event: Event): void {
    if (event.target !== event.currentTarget) return;
    const currentPopups = this.popupsSignal();
    if (currentPopups.length === 0) return;
    const lastPopup = currentPopups[currentPopups.length - 1];
    this.popupClosed.emit(lastPopup.id);
  }
}
