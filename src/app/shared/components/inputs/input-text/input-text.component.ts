import { Component, input, output, forwardRef, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';

export interface InputTextConfig {
  helpText?: string;
  errorText?: string;
  successText?: string;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
}

@Component({
  selector: 'pelu-input-text',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, InputTextModule],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
  ],
})
export class InputTextComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<string>('');
  readonly formControlName = input<string>('');

  // Component inputs
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly size = input<'small' | 'large'>('small');
  readonly variant = input<'outlined' | 'filled'>('outlined');
  readonly invalid = input<boolean>(false);
  readonly fluid = input<boolean>(true);

  // Unique ID generated once
  private readonly uniqueId = 'input-text-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<string>();

  // ControlValueAccessor callbacks
  private onChange = (_value: string) => {};
  private onTouched = () => {};

  // Computed property to get the appropriate placeholder based on type
  readonly displayPlaceholder = computed(() => {
    const customPlaceholder = this.placeholder();

    // If a custom placeholder is provided, use it
    if (customPlaceholder && customPlaceholder.trim()) {
      return customPlaceholder;
    }

    // Otherwise, use the default placeholder based on type
    const inputType = this.type();
    switch (inputType) {
      case 'email':
        return 'INPUTS.TEXT_EMAIL_PLACEHOLDER';
      case 'password':
        return 'INPUTS.TEXT_PASSWORD_PLACEHOLDER';
      case 'text':
      default:
        return 'INPUTS.TEXT_PLACEHOLDER';
    }
  });

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for input changes
  onInputChange(_value: string): void {
    this.onChange(_value);
    this.valueChange.emit(_value);
  }

  // Event handler for input blur
  onInputBlur(): void {
    this.onTouched();
  }



  // ControlValueAccessor methods
  writeValue(_value: string): void {
    // PrimeNG handles this automatically
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // PrimeNG handles disabled state automatically
  }
}
