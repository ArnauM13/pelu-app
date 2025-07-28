import { Component, input, computed, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FloatingButtonComponent, FloatingButtonConfig } from '../floating-button/floating-button.component';
import { InputTextComponent } from '../inputs/input-text/input-text.component';
import { ButtonComponent } from '../buttons/button.component';
import { InputDateComponent } from '../inputs/input-date/input-date.component';

@Component({
  selector: 'pelu-filters-popup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FloatingButtonComponent,
    InputTextComponent,
    InputDateComponent,
    ButtonComponent,
  ],
  templateUrl: './filters-popup.component.html',
  styleUrls: ['./filters-popup.component.scss'],
})
export class FiltersPopupComponent {
  // Inject FormBuilder
  private readonly fb = inject(FormBuilder);

  // Input signals that can accept either values or signals
  readonly filterButtons = input.required<FloatingButtonConfig[] | Signal<FloatingButtonConfig[]>>();
  readonly filterDate = input<string | Signal<string>>('');
  readonly filterClient = input<string | Signal<string>>('');
  readonly showAdvancedFilters = input<boolean | Signal<boolean>>(false);

  // Callback inputs
  readonly onFilterClick = input<((index: number) => void) | undefined>();
  readonly onDateChange = input<((value: string) => void) | undefined>();
  readonly onClientChange = input<((value: string) => void) | undefined>();
  readonly onReset = input<(() => void) | undefined>();
  readonly onToggleAdvanced = input<(() => void) | undefined>();

  // Reactive Form
  readonly filtersForm: FormGroup;

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

  constructor() {
    // Initialize reactive form
    this.filtersForm = this.fb.group({
      date: [''],
      client: ['']
    });

    // Subscribe to form changes
    this.filtersForm.valueChanges.subscribe(values => {
      if (values.date !== this.filterDateValue()) {
        this.onDateChange()?.(values.date);
      }
      if (values.client !== this.filterClientValue()) {
        this.onClientChange()?.(values.client);
      }
    });
  }

  onFilterClickHandler(index: number) {
    // Check if it's the advanced filters button (last button)
    if (index === this.filterButtonsValue().length - 1) {
      this.onToggleAdvanced()?.();
    } else {
      this.onFilterClick()?.(index);
    }
  }

  onDateChangeHandler(value: string | Date | null) {
    if (typeof value === 'string') {
      this.filtersForm.patchValue({ date: value });
    } else if (value instanceof Date) {
      this.filtersForm.patchValue({ date: value.toISOString().split('T')[0] });
    } else {
      this.filtersForm.patchValue({ date: '' });
    }
  }

  onClientChangeHandler(value: string | number) {
    this.filtersForm.patchValue({ client: String(value) });
  }

  onResetHandler() {
    this.filtersForm.reset();
    this.onReset()?.();
  }
}
