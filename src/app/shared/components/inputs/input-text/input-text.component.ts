import { Component, input, output, signal, computed, effect, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week';

export interface InputConfig {
  type: InputType;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
  autocomplete?: string;
  autofocus?: boolean;
  size?: number;
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
  value?: string | number;
}

@Component({
  selector: 'pelu-input-text',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
  ],
})
export class InputTextComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<InputConfig>();
  readonly value = input<string | number>('');
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<string | number>();
  readonly focusEvent = output<FocusEvent>();
  readonly blurEvent = output<FocusEvent>();
  readonly inputEvent = output<Event>();
  readonly changeEvent = output<Event>();
  readonly keydownEvent = output<KeyboardEvent>();
  readonly keyupEvent = output<KeyboardEvent>();
  readonly keypressEvent = output<KeyboardEvent>();

  // Internal state
  private readonly internalValue = signal<string | number>('');

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

  private onChange = (value: string | number) => {};
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
    const value = this.config().type === 'number' ? Number(target.value) : target.value;

    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.inputEvent.emit(event);
  }

  onChangeHandler(event: Event): void {
    this.changeEvent.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent): void {
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

  writeValue(value: string | number): void {
    this.internalValue.set(value || '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {
    // PrimeNG handles disabled state automatically
  }
}
