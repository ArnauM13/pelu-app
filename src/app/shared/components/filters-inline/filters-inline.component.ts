import { Component, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FloatingButtonComponent } from '../floating-button/floating-button.component';

@Component({
  selector: 'pelu-filters-inline',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, FloatingButtonComponent],
  templateUrl: './filters-inline.component.html',
  styleUrls: ['./filters-inline.component.scss']
})
export class FiltersInlineComponent {
  // Input signals that can accept either values or signals
  readonly filterDate = input<string | Signal<string>>('');
  readonly filterClient = input<string | Signal<string>>('');

  // Callback inputs
  readonly onDateChange = input<((value: string) => void) | undefined>();
  readonly onClientChange = input<((value: string) => void) | undefined>();
  readonly onReset = input<(() => void) | undefined>();

  // Computed values that handle both signals and static values
  readonly filterDateValue = computed(() => {
    const value = this.filterDate();
    return typeof value === 'function' ? value() : value;
  });

  readonly filterClientValue = computed(() => {
    const value = this.filterClient();
    return typeof value === 'function' ? value() : value;
  });

  onDateChangeHandler(value: string) {
    this.onDateChange()?.(value);
  }

  onClientChangeHandler(value: string) {
    this.onClientChange()?.(value);
  }

  onResetHandler() {
    this.onReset()?.();
  }
}
