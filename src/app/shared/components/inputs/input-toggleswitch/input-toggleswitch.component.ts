import { Component, input, output, forwardRef, ViewEncapsulation, ContentChild, TemplateRef, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

export interface InputToggleSwitchConfig {
  helpText?: string;
  errorText?: string;
  successText?: string;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
}

@Component({
  selector: 'pelu-input-toggleswitch',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ToggleSwitchModule],
  templateUrl: './input-toggleswitch.component.html',
  styleUrls: ['./input-toggleswitch.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputToggleSwitchComponent),
      multi: true,
    },
  ],
})
export class InputToggleSwitchComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<boolean>(false);
  readonly formControlName = input<string>('');

  // Component inputs
  readonly label = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly errorText = input<string>('');
  readonly successText = input<string>('');

  // ToggleSwitch specific properties
  readonly name = input<string>('');
  readonly styleClass = input<string>('');
  readonly tabindex = input<number | null>(null);
  readonly inputId = input<string>('');
  readonly trueValue = input<boolean>(true);
  readonly falseValue = input<boolean>(false);

  // Internal disabled state for ControlValueAccessor
  private readonly internalDisabledSignal = signal<boolean>(false);

  // Unique ID generated once
  private readonly uniqueId = 'toggleswitch-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<boolean>();

  // Template content projections
  @ContentChild('handle') handleTemplate?: TemplateRef<{ checked: boolean }>;

  // ControlValueAccessor callbacks
  private onChange: (value: boolean) => void = () => {};
  private onTouched = () => {};

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

  // Event handler for toggle switch changes
  onToggleChange(checked: boolean) {
    this.onChange(checked);
    this.valueChange.emit(checked);
  }

  // Event handler for blur
  onBlurHandler() {
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(): void {
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
