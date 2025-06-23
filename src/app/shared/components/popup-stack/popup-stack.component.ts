import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './popup-stack.component.html',
  styleUrls: ['./popup-stack.component.scss']
})
export class PopupStackComponent {
  @Input() popups: PopupItem[] = [];
  @Output() popupClosed = new EventEmitter<string>();

  closingPopups = new Set<string>();

  closePopup(popupId: string) {
    if (!this.closingPopups.has(popupId)) {
      this.closingPopups.add(popupId);
      setTimeout(() => {
        this.popupClosed.emit(popupId);
        this.closingPopups.delete(popupId);
      }, 300);
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      // Tanca el popup més alt (últim de la llista)
      if (this.popups.length > 0) {
        const lastPopup = this.popups[this.popups.length - 1];
        this.closePopup(lastPopup.id);
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
    return this.closingPopups.has(popupId);
  }

  getPopupStyle(index: number) {
    return {
      'margin-top': `${5 + (index * 8)}rem`,
      'z-index': 4000 + index
    };
  }
}
