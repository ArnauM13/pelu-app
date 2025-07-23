import { Component, input, output, signal, computed, effect, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface InputCheckboxConfig {
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
  value?: boolean;
  indeterminate?: boolean;
  labelPosition?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
}

@Component({
    selector: 'pelu-input-checkbox',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
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
  readonly focus = output<FocusEvent>();
  readonly blur = output<FocusEvent>();
  readonly change = output<Event>();

  // Internal state
  private readonly internalValue = signal<boolean>(false);
  private readonly isFocused = signal<boolean>(false);
  private readonly isTouched = signal<boolean>(false);
  private readonly uniqueId = signal<string>('');

  // Computed properties
  readonly displayValue = computed(() => this.value() ?? this.internalValue());
  readonly hasError = computed(() => !!this.config().errorText);
  readonly hasSuccess = computed(() => !!this.config().successText);
  readonly hasHelp = computed(() => !!this.config().helpText);
  readonly showLabel = computed(() => this.config().showLabel !== false && !!this.config().label);
  readonly showHelpText = computed(() => this.config().showHelpText !== false && this.hasHelp());
  readonly showErrorText = computed(() => this.config().showErrorText !== false && this.hasError());
  readonly showSuccessText = computed(() => this.config().showSuccessText !== false && this.hasSuccess());
  readonly labelPosition = computed(() => this.config().labelPosition || 'right');
  readonly size = computed(() => this.config().size || 'medium');
  readonly isIndeterminate = computed(() => this.config().indeterminate || false);

  readonly checkboxClasses = computed(() => {
    const classes = ['input-checkbox'];

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

    classes.push(`label-${this.labelPosition()}`);
    classes.push(`size-${this.size()}`);

    return classes.join(' ');
  });

  // Computed ID that uses config ID or falls back to stable unique ID
  readonly checkboxId = computed(() => this.config().id || this.uniqueId());

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    // Generate a stable unique ID once during component initialization
    this.uniqueId.set('checkbox-' + Math.random().toString(36).substr(2, 9));

    // Initialize internal value when external value changes
    effect(() => {
      const value = this.value();
      if (value !== undefined && value !== null) {
        this.internalValue.set(value);
      }
    });
  }

  // Event handlers
  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.checked;

    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
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

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.internalValue.set(value || false);
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
