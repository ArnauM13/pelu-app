import { Component, input, output, forwardRef, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DatePickerModule } from 'primeng/datepicker';

export interface InputDateConfig {
  helpText?: string;
  errorText?: string;
  successText?: string;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
}

@Component({
  selector: 'pelu-input-date',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, DatePickerModule],
  templateUrl: './input-date.component.html',
  styleUrls: ['./input-date.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDateComponent),
      multi: true,
    },
  ],
})
export class InputDateComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<Date | string | null>(null);
  readonly formControlName = input<string>('');

  // Component inputs
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly enabled = input<boolean>(true);

  // DatePicker specific properties
  readonly dateFormat = input<string>('dd/mm/yy');
  readonly showIcon = input<boolean>(true);
  readonly showButtonBar = input<boolean>(false);
  readonly showTime = input<boolean>(false);
  readonly timeOnly = input<boolean>(false);
  readonly hourFormat = input<'12' | '24'>('24');
  readonly selectionMode = input<'single' | 'multiple' | 'range'>('single');
  readonly numberOfMonths = input<number>(1);
  readonly inline = input<boolean>(false);
  readonly readonlyInput = input<boolean>(false);
  readonly showOnFocus = input<boolean>(true);
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly preventPastMonths = input<boolean>(false);

  // Computed minDate that prevents past months when enabled or applies minDate restriction
  readonly computedMinDate = computed(() => {
    if (this.preventPastMonths()) {
      // Set to today's date to prevent selecting past dates
      return new Date();
    }
    // Always apply minDate restriction if it's provided
    const minDate = this.minDate();
    return minDate;
  });

  // Unique ID generated once
  private readonly uniqueId = 'date-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<Date | string | null>();

  // ControlValueAccessor callbacks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (value: Date | string | null) => {};
  private onTouched = () => {};

  // Computed value that handles empty strings and converts them to null
  readonly displayValue = computed(() => {
    const currentValue = this.value();

    // Handle all falsy values and empty strings
    if (!currentValue || currentValue === '' || currentValue === null || currentValue === undefined) {
      return null;
    }

    // If it's already a Date object, return it
    if (currentValue instanceof Date) {
      return currentValue;
    }

    // If it's a string, try to parse it as a date
    if (typeof currentValue === 'string') {
      const parsedDate = new Date(currentValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      } else {
        return null;
      }
    }

    return null;
  });

  constructor() {
    // No need for complex synchronization - let PrimeNG handle it natively
  }

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for date changes
  onDateChange(date: Date | string | null) {
    // Don't allow changes if component is not enabled
    if (!this.enabled()) {
      return;
    }

    // Validate against minDate if provided
    if (date instanceof Date && this.minDate()) {
      const minDate = this.minDate();
      if (minDate && date < minDate) {
        // If selected date is before minDate, don't emit the change
        return;
      }
    }

    this.onChange(date);
    this.valueChange.emit(date);
  }



  // ControlValueAccessor methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeValue(value: Date | string | null): void {
    // PrimeNG handles this automatically through the input signal
  }

  registerOnChange(fn: (value: Date | string | null) => void): void {
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
