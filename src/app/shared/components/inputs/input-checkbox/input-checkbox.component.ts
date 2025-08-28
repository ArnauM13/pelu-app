import { Component, input, output, forwardRef, ViewEncapsulation, computed, signal, effect } from '@angular/core';
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
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly variant = input<'outlined' | 'filled'>('outlined');
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);

  // Internal disabled state for ControlValueAccessor
  private readonly internalDisabledSignal = signal<boolean>(false);

  // Unique ID generated once
  private readonly uniqueId = 'checkbox-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<boolean>();

  // ControlValueAccessor callbacks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  // Computed property for readonly mode
  readonly isReadonlyMode = computed(() => this.readonly());

  // Computed property to determine the disabled state
  readonly isDisabled = computed(() => {
    // If using formControlName, use internal disabled state
    if (this.formControlName()) {
      return this.internalDisabledSignal();
    }
    // Otherwise, use the direct disabled input
    return this.disabled();
  });

  constructor() {
    // Watch for changes in the disabled input and update internal signal
    effect(() => {
      const directDisabled = this.disabled();
      if (directDisabled !== undefined && directDisabled !== null) {
        this.internalDisabledSignal.set(directDisabled);
      }
    });
  }

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    this.internalDisabledSignal.set(isDisabled);
  }
}
