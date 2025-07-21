import { Component, input, output, signal, computed, effect, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface InputNumberConfig {
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
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
  icon?: string;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  loading?: boolean;
  value?: number;
  suffix?: string;
  prefix?: string;
  decimalPlaces?: number;
}

@Component({
  selector: 'pelu-input-number',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
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
  readonly value = input<number>(0);
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<number>();
  readonly focus = output<FocusEvent>();
  readonly blur = output<FocusEvent>();
  readonly input = output<Event>();
  readonly change = output<Event>();
  readonly keydown = output<KeyboardEvent>();
  readonly keyup = output<KeyboardEvent>();
  readonly keypress = output<KeyboardEvent>();

  // Internal state
  private readonly internalValue = signal<number>(0);
  private readonly isFocused = signal<boolean>(false);
  private readonly isTouched = signal<boolean>(false);

  // Computed properties
  readonly displayValue = computed(() => this.value() || this.internalValue());
  readonly hasError = computed(() => !!this.config().errorText);
  readonly hasSuccess = computed(() => !!this.config().successText);
  readonly hasHelp = computed(() => !!this.config().helpText);
  readonly showLabel = computed(() => this.config().showLabel !== false && !!this.config().label);
  readonly showHelpText = computed(() => this.config().showHelpText !== false && this.hasHelp());
  readonly showErrorText = computed(() => this.config().showErrorText !== false && this.hasError());
  readonly showSuccessText = computed(() => this.config().showSuccessText !== false && this.hasSuccess());
  readonly hasIcon = computed(() => !!this.config().icon);
  readonly isClearable = computed(() => this.config().clearable && this.displayValue() !== 0);
  readonly hasSuffix = computed(() => !!this.config().suffix);
  readonly hasPrefix = computed(() => !!this.config().prefix);
  readonly inputClasses = computed(() => {
    const classes = ['input-number'];

    if (this.config().class) {
      classes.push(this.config().class || '');
    }

    if (this.isFocused()) {
      classes.push('focused');
    }

    if (this.hasError()) {
      classes.push('error');
    }

    if (this.hasSuccess()) {
      classes.push('success');
    }

    if (this.config().disabled) {
      classes.push('disabled');
    }

    if (this.hasIcon()) {
      classes.push(`icon-${this.config().iconPosition || 'left'}`);
    }

    if (this.hasSuffix()) {
      classes.push('has-suffix');
    }

    if (this.hasPrefix()) {
      classes.push('has-prefix');
    }

    return classes.join(' ');
  });

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    // Initialize internal value when external value changes
    effect(() => {
      const value = this.value();
      if (value !== undefined && value !== null) {
        this.internalValue.set(value);
      }
    });
  }

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value === '' ? 0 : Number(target.value);

    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.input.emit(event);
  }

  onChangeHandler(event: Event): void {
    this.change.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focus.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.isTouched.set(true);
    this.onTouched();
    this.blur.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    this.keydown.emit(event);
  }

  onKeyup(event: KeyboardEvent): void {
    this.keyup.emit(event);
  }

  onKeypress(event: KeyboardEvent): void {
    this.keypress.emit(event);
  }

  onClear(): void {
    this.internalValue.set(0);
    this.onChange(0);
    this.valueChange.emit(0);
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.internalValue.set(value || 0);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // This will be handled by the config input
  }
}
