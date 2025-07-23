import { Component, input, output, signal, computed, effect, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: string;
  group?: string;
  color?: string;
}

export interface InputSelectConfig {
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
  tabindex?: number;
  name?: string;
  id?: string;
  class?: string;
  style?: string;
  helpText?: string;
  errorText?: string;
  successText?: string;
  showLabel?: boolean;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
  loading?: boolean;
  value?: string | number | (string | number)[];
  options: SelectOption[];
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  size?: 'small' | 'medium' | 'large';
  maxVisibleOptions?: number;
  optionLabel?: string;
  optionValue?: string;
  optionDisabled?: string;
  optionGroup?: string;
  filter?: boolean;
  filterBy?: string;
  filterMatchMode?: string;
  filterPlaceholder?: string;
  showClear?: boolean;
  editable?: boolean;
  appendTo?: string;
  scrollHeight?: string;
  virtualScroll?: boolean;
  virtualScrollItemSize?: number;
  virtualScrollOptions?: any;
}

@Component({
  selector: 'pelu-input-select',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, InputTextModule],
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true,
    },
  ],
})
export class InputSelectComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<InputSelectConfig>();
  readonly value = input<string | undefined>(undefined);
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<string | undefined>();
  readonly focusEvent = output<FocusEvent>();
  readonly blurEvent = output<FocusEvent>();

  // Internal state
  private readonly internalValue = signal<string | undefined>(undefined);

  // Computed properties
  readonly displayValue = computed(() => this.value() ?? this.internalValue());
  readonly hasError = computed(() => !!this.config().errorText);
  readonly hasSuccess = computed(() => !!this.config().successText);
  readonly hasHelp = computed(() => !!this.config().helpText);
  readonly showLabel = computed(() => this.config().showLabel !== false && !!this.config().label);
  readonly showHelpText = computed(() => this.config().showHelpText !== false && this.hasHelp());
  readonly showErrorText = computed(() => this.config().showErrorText !== false && this.hasError());
  readonly showSuccessText = computed(
    () => this.config().showSuccessText !== false && this.hasSuccess()
  );
  readonly isMultiple = computed(() => this.config().multiple || false);
  readonly elementId = computed(
    () => this.config().id || `select-${Math.random().toString(36).substr(2, 9)}`
  );

  private onChange = (value: string | undefined) => {};
  private onTouched = () => {};

  constructor() {
    effect(() => {
      const currentValue = this.value();
      if (currentValue !== undefined && currentValue !== null) {
        this.internalValue.set(currentValue);
      }
    });
  }

  // Event handlers
  onValueChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value || undefined;
    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onFocus(event: FocusEvent) {
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.blurEvent.emit(event);
  }

  // ControlValueAccessor implementation
  registerOnChange(fn: (value: string | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: string | undefined): void {
    this.internalValue.set(value);
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
