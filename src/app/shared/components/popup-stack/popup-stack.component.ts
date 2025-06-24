import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersPopupComponent } from '../filters-popup/filters-popup.component';

export interface PopupItem {
  id: string;
  title?: string;
  size: 'small' | 'medium' | 'large';
  content: any;
  data?: any;
  onFilterClick?: (index: number) => void;
  onDateChange?: (value: string) => void;
  onClientChange?: (value: string) => void;
  onReset?: () => void;
  onToggleAdvanced?: () => void;
}

@Component({
  selector: 'pelu-popup-stack',
  standalone: true,
  imports: [CommonModule, FiltersPopupComponent],
  templateUrl: './popup-stack.component.html',
  styleUrls: ['./popup-stack.component.scss']
})
export class PopupStackComponent {
  // Input signals
  readonly popups = input<PopupItem[]>([]);

  // Output signals
  readonly popupClosed = output<string>();

  // Internal state
  private readonly closingPopups = signal<Set<string>>(new Set());

  // Computed properties
  readonly hasPopups = computed(() => this.popups().length > 0);
  readonly topPopup = computed(() => {
    const popups = this.popups();
    return popups.length > 0 ? popups[popups.length - 1] : null;
  });

  closePopup(popupId: string) {
    const currentClosing = this.closingPopups();
    if (!currentClosing.has(popupId)) {
      const newClosing = new Set(currentClosing);
      newClosing.add(popupId);
      this.closingPopups.set(newClosing);

      setTimeout(() => {
        this.popupClosed.emit(popupId);
        const updatedClosing = new Set(this.closingPopups());
        updatedClosing.delete(popupId);
        this.closingPopups.set(updatedClosing);
      }, 300);
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      const topPopup = this.topPopup();
      if (topPopup) {
        this.closePopup(topPopup.id);
      }
    }
  }

  getComponentInputs(popup: PopupItem): any {
    const inputs: any = { ...popup.data };

    // Only add callbacks that exist
    if (popup.onFilterClick) {
      inputs.onFilterClick = popup.onFilterClick;
    }
    if (popup.onDateChange) {
      inputs.onDateChange = popup.onDateChange;
    }
    if (popup.onClientChange) {
      inputs.onClientChange = popup.onClientChange;
    }
    if (popup.onReset) {
      inputs.onReset = popup.onReset;
    }
    if (popup.onToggleAdvanced) {
      inputs.onToggleAdvanced = popup.onToggleAdvanced;
    }

    return inputs;
  }

  isClosing(popupId: string): boolean {
    return this.closingPopups().has(popupId);
  }

  getPopupStyle(index: number) {
    return {
      'margin-top': `${5 + (index * 8)}rem`,
      'z-index': 4000 + index
    };
  }

  isFiltersPopup(popup: PopupItem): boolean {
    return popup.content === FiltersPopupComponent;
  }
}
