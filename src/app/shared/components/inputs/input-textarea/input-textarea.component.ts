import { Component, input, output, signal, computed, effect, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
            multi: true
        }
    ]
})
export class InputTextareaComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<TextareaConfig>();
  readonly value = input<string>('');
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<string>();
  readonly focus = output<FocusEvent>();
  readonly blur = output<FocusEvent>();
  readonly input = output<Event>();
  readonly change = output<Event>();
  readonly keydown = output<KeyboardEvent>();
  readonly keyup = output<KeyboardEvent>();
  readonly keypress = output<KeyboardEvent>();

  // Internal state
  private readonly internalValue = signal<string>('');
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
  readonly textareaClasses = computed(() => {
    const classes = ['input-textarea'];

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

    if (this.config().autoResize) {
      classes.push('auto-resize');
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
    }, { allowSignalWrites: true });
  }

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;

    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.input.emit(event);

    // Auto-resize if enabled
    if (this.config().autoResize) {
      this.autoResize(target);
    }
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

  // Auto-resize method
  private autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.internalValue.set(value || '');
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
