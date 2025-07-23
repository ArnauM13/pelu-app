import { Component, input, output, signal, computed, effect, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface TextareaConfig {
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  cols?: number;
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
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  autoResize?: boolean;
  value?: string;
}

@Component({
  selector: 'pelu-input-textarea',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextareaComponent),
      multi: true,
    },
  ],
})
export class InputTextareaComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<TextareaConfig>();
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
    const target = event.target as HTMLTextAreaElement;
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
