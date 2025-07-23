import { Component, input, output, signal, computed, effect, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';

export interface InputDateConfig {
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
  clearable?: boolean;
  value?: Date | string;
  min?: Date | string;
  max?: Date | string;
  dateFormat?: string;
  showIcon?: boolean;
  showButtonBar?: boolean;
  showTime?: boolean;
  timeOnly?: boolean;
  hourFormat?: 12 | 24;
  selectionMode?: 'single' | 'multiple' | 'range';
  numberOfMonths?: number;
  inline?: boolean;
  readonlyInput?: boolean;
  showOnFocus?: boolean;
}

@Component({
  selector: 'pelu-input-date',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, InputTextModule],
  templateUrl: './input-date.component.html',
  styleUrls: ['./input-date.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDateComponent),
      multi: true,
    },
  ],
})
export class InputDateComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<InputDateConfig>();
  readonly value = input<Date | string | null>(null);
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<Date | string | null>();
  readonly focusEvent = output<FocusEvent>();
  readonly blurEvent = output<FocusEvent>();

  // Internal state
  private readonly internalValue = signal<Date | string | null>(null);

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
  readonly elementId = computed(
    () => this.config().id || `date-${Math.random().toString(36).substr(2, 9)}`
  );

  private onChange = (value: Date | string | null) => {};
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
  onDateSelect(date: Date | string | null) {
    if (date === null) {
      this.internalValue.set(null);
      this.onChange(null);
      this.valueChange.emit(null);
      return;
    }

    const dateValue = typeof date === 'string' ? new Date(date) : date;
    this.internalValue.set(dateValue);
    this.onChange(dateValue);
    this.valueChange.emit(dateValue);
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value) {
      const dateValue = new Date(value);
      this.onDateSelect(dateValue);
    } else {
      this.onDateSelect(null);
    }
  }

  onChangeHandler(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value) {
      const dateValue = new Date(value);
      this.onDateSelect(dateValue);
    } else {
      this.onDateSelect(null);
    }
  }

  onFocus(event: FocusEvent) {
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.blurEvent.emit(event);
  }

  onClear(): void {
    this.internalValue.set(null);
    this.onChange(null);
    this.valueChange.emit(null);
  }

  writeValue(value: Date | string | null): void {
    this.internalValue.set(value);
  }

  registerOnChange(fn: (value: Date | string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {
    // PrimeNG handles disabled state automatically
  }
}
