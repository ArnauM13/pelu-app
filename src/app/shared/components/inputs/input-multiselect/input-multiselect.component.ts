import { Component, input, output, forwardRef, ViewEncapsulation, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';

export interface MultiSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: string;
  group?: string;
  color?: string;
  price?: number;
  duration?: number;
  description?: string;
  category?: string;
  new?: boolean;
  discount?: number;
  available?: boolean;
}

export interface InputMultiSelectConfig {
  helpText?: string;
  errorText?: string;
  successText?: string;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
}

@Component({
  selector: 'pelu-input-multiselect',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, MultiSelectModule],
  templateUrl: './input-multiselect.component.html',
  styleUrls: ['./input-multiselect.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputMultiSelectComponent),
      multi: true,
    },
  ],
})
export class InputMultiSelectComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<(string | number)[]>([]);

  // Internal value that ensures we always have an array
  private _internalValue: (string | number)[] = [];

  get safeValue(): (string | number)[] {
    // Use the input value if available, otherwise use internal value
    const inputValue = this.value();
    if (Array.isArray(inputValue)) {
      return inputValue;
    }
    return this._internalValue;
  }

  set safeValue(value: (string | number)[]) {
    this._internalValue = Array.isArray(value) ? value : [];
  }
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

  // MultiSelect specific properties
  readonly options = input.required<MultiSelectOption[]>();
  readonly loading = input<boolean>(false);
  readonly filter = input<boolean>(true);
  readonly filterBy = input<string>('label');
  readonly filterMatchMode = input<'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte'>('contains');
  readonly filterPlaceholder = input<string>('');
  readonly showClear = input<boolean>(false);
  readonly appendTo = input<string>('body');
  readonly scrollHeight = input<string>('200px');
  readonly virtualScroll = input<boolean>(false);
  readonly virtualScrollItemSize = input<number>(38);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string>('value');
  readonly optionDisabled = input<string>('disabled');
  readonly group = input<boolean>(false);
  readonly maxSelectedLabels = input<number>(3);
  readonly display = input<'comma' | 'chip'>('comma');

  // Unique ID generated once
  private readonly uniqueId = 'multiselect-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<(string | number)[]>();

  // Template content projections
  @ContentChild('item') itemTemplate?: TemplateRef<{ $implicit: MultiSelectOption }>;
  @ContentChild('selectedItems') selectedItemsTemplate?: TemplateRef<{ $implicit: (string | number)[], removeChip: (value: string | number) => void }>;
  @ContentChild('group') groupTemplate?: TemplateRef<{ $implicit: { label: string; value: string; items: MultiSelectOption[] } }>;
  @ContentChild('dropdownicon') dropdownIconTemplate?: TemplateRef<void>;
  @ContentChild('header') headerTemplate?: TemplateRef<void>;
  @ContentChild('footer') footerTemplate?: TemplateRef<void>;
  @ContentChild('emptyMessage') emptyMessageTemplate?: TemplateRef<void>;

  // ControlValueAccessor callbacks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (value: (string | number)[]) => {};
  private onTouched = () => {};

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for select changes
  onSelectChange(value: (string | number)[] | null) {
    const selectedValue = Array.isArray(value) ? value : [];
    this._internalValue = selectedValue;
    this.onChange(selectedValue);
    this.valueChange.emit(selectedValue);
  }

  // Event handler for blur
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlurHandler(event: Event | { originalEvent: Event }) {
    this.onTouched();
  }

  // Method to remove a chip/value
  removeChip(valueToRemove: string | number) {
    const newValue = this._internalValue.filter(val => val !== valueToRemove);
    this._internalValue = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  // ControlValueAccessor methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeValue(value: (string | number)[]): void {
    // Ensure value is always an array for PrimeNG MultiSelect
    const newValue = Array.isArray(value) ? value : [];
    this._internalValue = newValue;
  }

  registerOnChange(fn: (value: (string | number)[]) => void): void {
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
