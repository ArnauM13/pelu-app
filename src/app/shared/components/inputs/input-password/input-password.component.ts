import { Component, input, output, signal, computed, effect, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface InputPasswordConfig {
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autocomplete?: string;
  autofocus?: boolean;
  maxlength?: number;
  minlength?: number;
  spellcheck?: boolean;
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
  value?: string;
  showToggle?: boolean;
}

@Component({
  selector: 'pelu-input-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './input-password.component.html',
  styleUrls: ['./input-password.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPasswordComponent),
      multi: true,
    },
  ],
})
export class InputPasswordComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<InputPasswordConfig>();
  readonly value = input<string>('');
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<string>();
  readonly focusEvent = output<FocusEvent>();
  readonly blurEvent = output<FocusEvent>();
  readonly inputEvent = output<Event>();
  readonly changeEvent = output<Event>();
  readonly keydownEvent = output<KeyboardEvent>();
  readonly keyupEvent = output<KeyboardEvent>();
  readonly keypressEvent = output<KeyboardEvent>();

  // Internal state
  private readonly internalValue = signal<string>('');
  private readonly isFocused = signal<boolean>(false);
  private readonly isTouched = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  // Computed properties
  readonly displayValue = computed(() => this.value() || this.internalValue());
  readonly hasError = computed(() => !!this.config().errorText);
  readonly hasSuccess = computed(() => !!this.config().successText);
  readonly hasHelp = computed(() => !!this.config().helpText);
  readonly showLabel = computed(() => this.config().showLabel !== false && !!this.config().label);
  readonly showHelpText = computed(() => this.config().showHelpText !== false && this.hasHelp());
  readonly showErrorText = computed(() => this.config().showErrorText !== false && this.hasError());
  readonly showSuccessText = computed(
    () => this.config().showSuccessText !== false && this.hasSuccess()
  );
  readonly hasIcon = computed(() => !!this.config().icon);
  readonly isClearable = computed(() => this.config().clearable && !!this.displayValue());
  readonly showToggle = computed(() => this.config().showToggle !== false);
  readonly inputType = computed(() => (this.showPassword() ? 'text' : 'password'));
  readonly toggleIcon = computed(() => (this.showPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'));
  readonly inputClasses = computed(() => {
    const classes = ['input-password', 'p-inputtext'];

    if (this.config().class) {
      classes.push(this.config().class || '');
    }

    if (this.isFocused()) {
      classes.push('focused');
    }

    if (this.hasError()) {
      classes.push('error', 'p-invalid');
    }

    if (this.hasSuccess()) {
      classes.push('success', 'p-valid');
    }

    if (this.config().disabled) {
      classes.push('disabled');
    }

    if (this.hasIcon()) {
      classes.push(`icon-${this.config().iconPosition || 'left'}`);
    }

    // Afegir classe específica quan és text però prové de password
    if (this.showPassword()) {
      classes.push('password-as-text');
    }

    return classes.join(' ');
  });

  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor() {
    effect(
      () => {
        const currentValue = this.value();
        if (currentValue !== undefined && currentValue !== null) {
          this.internalValue.set(currentValue);
        }
      },
      { allowSignalWrites: true }
    );
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.inputEvent.emit(event);
  }

  onChangeHandler(event: Event): void {
    this.changeEvent.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.isTouched.set(true);
    this.onTouched();
    this.blurEvent.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    this.keydownEvent.emit(event);
  }

  onKeyup(event: KeyboardEvent): void {
    this.keyupEvent.emit(event);
  }

  onKeypress(event: KeyboardEvent): void {
    this.keypressEvent.emit(event);
  }

  onClear(): void {
    this.internalValue.set('');
    this.onChange('');
    this.valueChange.emit('');
  }

  onTogglePassword(): void {
    this.showPassword.update(show => !show);
  }

  writeValue(value: string): void {
    this.internalValue.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {
    // PrimeNG handles disabled state automatically
  }
}
