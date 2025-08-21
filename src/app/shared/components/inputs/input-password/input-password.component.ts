import { Component, input, output, forwardRef, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PasswordModule } from 'primeng/password';

export interface InputPasswordConfig {
  helpText?: string;
  errorText?: string;
  successText?: string;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
}

@Component({
  selector: 'pelu-input-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, PasswordModule],
  templateUrl: './input-password.component.html',
  styleUrls: ['./input-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPasswordComponent),
      multi: true,
    },
  ],
})
export class InputPasswordComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<string>('');
  readonly formControlName = input<string>('');

  // Component inputs
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly size = input<'small' | 'large'>('small');
  readonly variant = input<'outlined' | 'filled'>('outlined');
  readonly invalid = input<boolean>(false);
  readonly fluid = input<boolean>(true);

  // Password specific properties
  readonly feedback = input<boolean>(true);
  readonly toggleMask = input<boolean>(true);
  readonly promptLabel = input<string>('INPUTS.PASSWORD_PROMPT_LABEL');
  readonly weakLabel = input<string>('INPUTS.PASSWORD_WEAK_LABEL');
  readonly mediumLabel = input<string>('INPUTS.PASSWORD_MEDIUM_LABEL');
  readonly strongLabel = input<string>('INPUTS.PASSWORD_STRONG_LABEL');

  // Unique ID generated once
  private readonly uniqueId = 'input-password-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<string>();

  // ControlValueAccessor callbacks
  private onChange = (_value: string) => {};
  private onTouched = () => {};

  // Computed property to get the appropriate placeholder
  readonly displayPlaceholder = computed(() => {
    const customPlaceholder = this.placeholder();

    // If a custom placeholder is provided, use it
    if (customPlaceholder && customPlaceholder.trim()) {
      return customPlaceholder;
    }

    // Otherwise, use the default password placeholder
    return 'INPUTS.PASSWORD_PLACEHOLDER';
  });

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for password changes
  onPasswordChange(_value: string) {
    this.onChange(_value);
    this.valueChange.emit(_value);
  }

  // Event handler for password blur
  onPasswordBlur() {
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(_value: string): void {
    // PrimeNG handles this automatically
  }

  registerOnChange(fn: (_value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // PrimeNG handles disabled state automatically
  }
}
