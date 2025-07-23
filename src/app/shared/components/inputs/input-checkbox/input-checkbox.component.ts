import { Component, input, output, signal, computed, effect, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';

export interface InputCheckboxConfig {
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
  value?: boolean;
  binary?: boolean;
  indeterminate?: boolean;
  labelPosition?: 'left' | 'right';
}

@Component({
    selector: 'pelu-input-checkbox',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, CheckboxModule],
    templateUrl: './input-checkbox.component.html',
    styleUrls: ['./input-checkbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputCheckboxComponent),
            multi: true
        }
    ]
})
export class InputCheckboxComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<InputCheckboxConfig>();
  readonly value = input<boolean>(false);
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<boolean>();
  readonly focusEvent = output<FocusEvent>();
  readonly blurEvent = output<FocusEvent>();

  // Internal state
  private readonly internalValue = signal<boolean>(false);

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
    () => this.config().id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  );

  private onChange = (value: boolean) => {};
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
  onCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    this.internalValue.set(checked);
    this.onChange(checked);
    this.valueChange.emit(checked);
  }

  onFocus(event: FocusEvent) {
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.blurEvent.emit(event);
  }

  writeValue(value: boolean): void {
    this.internalValue.set(value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {
    // PrimeNG handles disabled state automatically
  }
}
