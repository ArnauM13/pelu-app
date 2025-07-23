import { Component, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FloatingButtonComponent } from '../floating-button/floating-button.component';
import { InputTextComponent } from '../inputs/input-text/input-text.component';
import { InputDateComponent } from '../inputs/input-date/input-date.component';

@Component({
    selector: 'pelu-filters-popup',
    imports: [CommonModule, FormsModule, TranslateModule, FloatingButtonComponent, InputTextComponent, InputDateComponent],
    templateUrl: './filters-popup.component.html',
    styleUrls: ['./filters-popup.component.scss']
})
export class FiltersPopupComponent {
  // Input signals that can accept either values or signals
  readonly filterButtons = input.required<any[] | Signal<any[]>>();
  readonly filterDate = input<string | Signal<string>>('');
  readonly filterClient = input<string | Signal<string>>('');
  readonly showAdvancedFilters = input<boolean | Signal<boolean>>(false);

  // Callback inputs
  readonly onFilterClick = input<((index: number) => void) | undefined>();
  readonly onDateChange = input<((value: string) => void) | undefined>();
  readonly onClientChange = input<((value: string) => void) | undefined>();
  readonly onReset = input<(() => void) | undefined>();
  readonly onToggleAdvanced = input<(() => void) | undefined>();

  // Computed values that handle both signals and static values
  readonly filterButtonsValue = computed(() => {
    const value = this.filterButtons();
    return typeof value === 'function' ? value() : value;
  });

  readonly filterDateValue = computed(() => {
    const value = this.filterDate();
    return typeof value === 'function' ? value() : value;
  });

  readonly filterClientValue = computed(() => {
    const value = this.filterClient();
    return typeof value === 'function' ? value() : value;
  });

  readonly showAdvancedFiltersValue = computed(() => {
    const value = this.showAdvancedFilters();
    return typeof value === 'function' ? value() : value;
  });

  onFilterClickHandler(index: number) {
    // Check if it's the advanced filters button (last button)
    if (index === this.filterButtonsValue().length - 1) {
      this.onToggleAdvanced()?.();
    } else {
      this.onFilterClick()?.(index);
    }
  }

  onDateChangeHandler(value: string) {
    this.onDateChange()?.(value);
  }

  onClientChangeHandler(value: string | number) {
    this.onClientChange()?.(String(value));
  }

  onResetHandler() {
    this.onReset()?.();
  }
}
