import { Component, input, output, forwardRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'pelu-input-textarea',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, TextareaModule],
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextareaComponent),
      multi: true,
    },
  ],
})
export class InputTextareaComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<string>('');
  readonly formControlName = input<string>('');

  // Component inputs
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly rows = input<number>(3);
  readonly cols = input<number>();
  readonly maxlength = input<number>();
  readonly minlength = input<number>();
  readonly spellcheck = input<boolean>();
  readonly tabindex = input<number>();
  readonly name = input<string>('');
  readonly id = input<string>('');
  readonly class = input<string>('');
  readonly style = input<string>('');
  readonly size = input<'small' | 'large'>('small');
  readonly variant = input<'outlined' | 'filled'>('outlined');
  readonly invalid = input<boolean>(false);
  readonly fluid = input<boolean>(true);
  readonly autoResize = input<boolean>(false);
  readonly resize = input<'none' | 'both' | 'horizontal' | 'vertical'>('vertical');

  // Unique ID generated once
  private readonly uniqueId = 'input-textarea-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<string>();

  // ControlValueAccessor callbacks
  private onChange = (_value: string) => {};
  private onTouched = () => {};

  // Get unique ID
  getElementId(): string {
    return this.id() || this.uniqueId;
  }

  // Event handler for input changes
  onInputChange(_value: string) {
    this.onChange(_value);
    this.valueChange.emit(_value);
  }

  // Event handler for input blur
  onInputBlur() {
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
