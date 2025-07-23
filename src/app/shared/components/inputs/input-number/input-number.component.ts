import { Component, input, output, forwardRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';

export interface InputNumberConfig {
  helpText?: string;
  errorText?: string;
  successText?: string;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
}

@Component({
  selector: 'pelu-input-number',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, InputNumberModule],
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumberComponent),
      multi: true,
    },
  ],
})
export class InputNumberComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<number | null>(null);
  readonly formControlName = input<string>('');

  // Component inputs
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly errorText = input<string>('');
  readonly successText = input<string>('');

  // InputNumber specific properties
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly step = input<number>(1);
  readonly minFractionDigits = input<number | undefined>(undefined);
  readonly maxFractionDigits = input<number | undefined>(undefined);
  readonly mode = input<'decimal' | 'currency'>('decimal');
  readonly currency = input<string>('USD');
  readonly currencyDisplay = input<'symbol' | 'code'>('symbol');
  readonly locale = input<string>('en-US');
  readonly prefix = input<string>('');
  readonly suffix = input<string>('');
  readonly showButtons = input<boolean>(false);
  readonly buttonLayout = input<'horizontal' | 'vertical'>('horizontal');
  readonly useGrouping = input<boolean>(true);
  readonly showClear = input<boolean>(false);
  readonly autofocus = input<boolean>(false);

  // Unique ID generated once
  private readonly uniqueId = 'number-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<number | undefined>();

  // ControlValueAccessor callbacks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (value: number | undefined) => {};
  private onTouched = () => {};

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for number changes
  onNumberChange(value: number | string | null) {
    const numValue = typeof value === 'number' ? value : undefined;
    this.onChange(numValue);
    this.valueChange.emit(numValue);
  }

  // Event handler for blur
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlurHandler(event: Event) {
    this.onTouched();
  }

  // ControlValueAccessor methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeValue(value: number | null): void {
    // PrimeNG handles this automatically
  }

  registerOnChange(fn: (value: number | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setDisabledState(isDisabled: boolean): void {
    // PrimeNG handles disabled state automatically
  }
}
