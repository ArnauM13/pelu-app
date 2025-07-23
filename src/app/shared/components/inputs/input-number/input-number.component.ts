import { Component, input, output, signal, computed, effect, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';

export interface InputNumberConfig {
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
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  mode?: 'decimal' | 'currency';
  currency?: string;
  currencyDisplay?: string;
  locale?: string;
  prefix?: string;
  suffix?: string;
  showButtons?: boolean;
  buttonLayout?: 'horizontal' | 'vertical';
  incrementButtonClass?: string;
  decrementButtonClass?: string;
  incrementButtonIcon?: string;
  decrementButtonIcon?: string;
  useGrouping?: boolean;
}

@Component({
    selector: 'pelu-input-number',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, InputNumberModule],
    templateUrl: './input-number.component.html',
    styleUrls: ['./input-number.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputNumberComponent),
            multi: true
        }
    ]
})
export class InputNumberComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<InputNumberConfig>();
  readonly value = input<number | undefined>(undefined);
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<number | undefined>();
  readonly focusEvent = output<FocusEvent>();
  readonly blurEvent = output<FocusEvent>();

  // Internal state
  private readonly internalValue = signal<number | undefined>(undefined);

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
    () => this.config().id || `number-${Math.random().toString(36).substr(2, 9)}`
  );

  private onChange = (value: number | undefined) => {};
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
  onNumberChange(value: number | undefined) {
    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value) {
      const numValue = parseFloat(value);
      this.onNumberChange(isNaN(numValue) ? undefined : numValue);
    } else {
      this.onNumberChange(undefined);
    }
  }

  onChangeHandler(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value) {
      const numValue = parseFloat(value);
      this.onNumberChange(isNaN(numValue) ? undefined : numValue);
    } else {
      this.onNumberChange(undefined);
    }
  }

  onFocus(event: FocusEvent) {
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.blurEvent.emit(event);
  }

  // ControlValueAccessor implementation
  registerOnChange(fn: (value: number | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: number | undefined): void {
    this.internalValue.set(value);
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
