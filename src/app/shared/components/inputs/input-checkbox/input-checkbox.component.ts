import { Component, input, output, forwardRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'pelu-input-checkbox',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, CheckboxModule],
    templateUrl: './input-checkbox.component.html',
    styleUrls: ['./input-checkbox.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputCheckboxComponent),
            multi: true
        }
    ]
})
export class InputCheckboxComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<boolean>(false);
  readonly formControlName = input<string>('');

  // Component inputs
  readonly label = input.required<string>();
  readonly size = input<'small' | 'large'>('small');
  readonly variant = input<'outlined' | 'filled'>('outlined');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);

  // Unique ID generated once
  private readonly uniqueId = 'checkbox-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<boolean>();

  // ControlValueAccessor callbacks
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for checkbox changes
  onCheckboxChange(checked: boolean) {
    this.onChange(checked);
    this.valueChange.emit(checked);
  }

  // ControlValueAccessor methods
  writeValue(value: boolean): void {
    // PrimeNG handles this automatically
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // PrimeNG handles disabled state automatically
  }
}
