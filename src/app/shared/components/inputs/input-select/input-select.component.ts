import { Component, input, output, forwardRef, ViewEncapsulation, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';

export interface SelectOption {
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

export interface InputSelectConfig {
  helpText?: string;
  errorText?: string;
  successText?: string;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
}

@Component({
  selector: 'pelu-input-select',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, SelectModule, MultiSelectModule],
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true,
    },
  ],
})
export class InputSelectComponent implements ControlValueAccessor {
  // Reactive inputs (signals)
  readonly value = input<string | number | undefined>(undefined);
  readonly formControlName = input<string>('');

  // Component inputs
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly errorText = input<string>('');
  readonly successText = input<string>('');

  // Select specific properties
  readonly options = input.required<SelectOption[]>();
  readonly multiple = input<boolean>(false);
  readonly clearable = input<boolean>(false);
  readonly searchable = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly editable = input<boolean>(false);
  readonly checkmark = input<boolean>(false);
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

  // Unique ID generated once
  private readonly uniqueId = 'select-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly valueChange = output<string | number | undefined>();

  // Template content projections
  @ContentChild('selectedItem') selectedItemTemplate?: TemplateRef<{ $implicit: SelectOption }>;
  @ContentChild('item') itemTemplate?: TemplateRef<{ $implicit: SelectOption }>;
  @ContentChild('group') groupTemplate?: TemplateRef<{ $implicit: { label: string; value: string; items: SelectOption[] } }>;
  @ContentChild('dropdownicon') dropdownIconTemplate?: TemplateRef<void>;
  @ContentChild('header') headerTemplate?: TemplateRef<void>;
  @ContentChild('footer') footerTemplate?: TemplateRef<void>;
  @ContentChild('emptyMessage') emptyMessageTemplate?: TemplateRef<void>;

  // ControlValueAccessor callbacks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (value: string | number | undefined) => {};
  private onTouched = () => {};

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for select changes
  onSelectChange(value: string | number | null) {
    const selectedValue = value === null ? undefined : value;
    this.onChange(selectedValue);
    this.valueChange.emit(selectedValue);
  }

  // Event handler for blur
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlurHandler(event: Event | { originalEvent: Event }) {
    this.onTouched();
  }

  // ControlValueAccessor methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeValue(value: string | number | undefined): void {
    // PrimeNG handles this automatically
  }

  registerOnChange(fn: (value: string | number | undefined) => void): void {
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
