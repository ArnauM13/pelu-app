import { Component, input, output, signal, computed, effect, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
  group?: string;
  color?: string;
}

export interface InputSelectConfig {
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
  tabindex?: number;
  name?: string;
  id?: string;
  class?: string;
  style?: string;
  helpText?: string;
  errorText?: string;
  successText?: string;
  showLabel?: boolean;
  showHelpText?: boolean;
  showErrorText?: boolean;
  showSuccessText?: boolean;
  loading?: boolean;
  value?: any;
  options: SelectOption[];
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  size?: 'small' | 'medium' | 'large';
  maxVisibleOptions?: number;
  optionLabel?: string;
  optionValue?: string;
  optionDisabled?: string;
  optionGroup?: string;
}

@Component({
  selector: 'pelu-input-select',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true
    }
  ]
})
export class InputSelectComponent implements ControlValueAccessor {
  // Input signals
  readonly config = input.required<InputSelectConfig>();
  readonly value = input<any>(null);
  readonly formControlName = input<string>('');

  // Output signals
  readonly valueChange = output<any>();
  readonly focus = output<FocusEvent>();
  readonly blur = output<FocusEvent>();
  readonly change = output<Event>();
  readonly open = output<Event>();
  readonly close = output<Event>();

  // Internal state
  private readonly internalValue = signal<any>(null);
  private readonly isFocused = signal<boolean>(false);
  private readonly isTouched = signal<boolean>(false);
  readonly isOpen = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  private readonly componentId = signal<string>('select-' + Math.random().toString(36).substr(2, 9));
  private readonly dropdownPosition = signal<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});

  // Computed properties
  readonly displayValue = computed(() => this.value() ?? this.internalValue());
  readonly hasError = computed(() => !!this.config().errorText);
  readonly hasSuccess = computed(() => !!this.config().successText);
  readonly hasHelp = computed(() => !!this.config().helpText);
  readonly showLabel = computed(() => this.config().showLabel !== false && !!this.config().label);
  readonly showHelpText = computed(() => this.config().showHelpText !== false && this.hasHelp());
  readonly showErrorText = computed(() => this.config().showErrorText !== false && this.hasError());
  readonly showSuccessText = computed(() => this.config().showSuccessText !== false && this.hasSuccess());
  readonly size = computed(() => this.config().size || 'medium');
  readonly isClearable = computed(() => this.config().clearable && !!this.displayValue() && !this.config().disabled);
  readonly isSearchable = computed(() => this.config().searchable || false);
  readonly isMultiple = computed(() => this.config().multiple || false);
  readonly elementId = computed(() => this.config().id || this.componentId());

  readonly dropdownStyle = computed(() => {
    const pos = this.dropdownPosition();
    return {
      position: 'fixed' as const,
      top: `${pos.top}px`,
      left: `${pos.left}px`,
      width: `${pos.width}px`,
      zIndex: 99999
    };
  });

  readonly selectClasses = computed(() => {
    const classes = ['input-select'];

    if (this.config().class) {
      classes.push(this.config().class || '');
    }

    if (this.isFocused()) {
      classes.push('focused');
    }

    if (this.isOpen()) {
      classes.push('open');
    }

    if (this.hasError()) {
      classes.push('error');
    }

    if (this.hasSuccess()) {
      classes.push('success');
    }

    if (this.config().disabled) {
      classes.push('disabled');
    }

    classes.push(`size-${this.size()}`);

    return classes.join(' ');
  });

  readonly filteredOptions = computed(() => {
    const options = this.config().options || [];
    const search = this.searchTerm().toLowerCase();

    if (!search) return options;

    return options.filter(option =>
      option.label.toLowerCase().includes(search) ||
      String(option.value).toLowerCase().includes(search)
    );
  });

  readonly selectedOption = computed(() => {
    const value = this.displayValue();
    const options = this.config().options || [];
    return options.find(option => option.value === value);
  });

  readonly selectedOptions = computed(() => {
    const value = this.displayValue();
    if (!Array.isArray(value)) return [];

    const options = this.config().options || [];
    return value.map(v => options.find(option => option.value === v)).filter(Boolean);
  });

  readonly displayText = computed(() => {
    if (this.isMultiple()) {
      const selected = this.selectedOptions();
      if (selected.length === 0) return this.config().placeholder || '';
      if (selected.length === 1) return selected[0]?.label || '';
      return `${selected.length} elements seleccionats`;
    } else {
      const selected = this.selectedOption();
      // Si l'opció té icona, només mostrar el label sense la icona
      if (selected?.icon) {
        return selected.label || this.config().placeholder || '';
      }
      return selected?.label || this.config().placeholder || '';
    }
  });

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    effect(() => {
      const value = this.value();
      if (value !== undefined && value !== null) {
        this.internalValue.set(value);
      }
    }, { allowSignalWrites: true });

        // Tancar el dropdown quan es clica fora
    effect(() => {
      if (this.isOpen()) {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const container = document.querySelector(`[data-select-id="${this.elementId()}"]`);
          if (container && !container.contains(target)) {
            this.isOpen.set(false);
          }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }
      return undefined;
    });
  }



  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = this.isMultiple() ?
      Array.from(target.selectedOptions).map(option => option.value) :
      target.value;

    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.change.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focus.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.isTouched.set(true);
    this.onTouched();
    this.blur.emit(event);
  }

      onToggleOpen(): void {
    if (this.config().disabled) return;

    const newOpenState = !this.isOpen();
    this.isOpen.set(newOpenState);

    if (newOpenState) {
      // Calcular la posició del dropdown
      setTimeout(() => {
        // Buscar el container del select en lloc del select natiu
        const container = document.querySelector(`[data-select-id="${this.elementId()}"]`);
        if (container) {
          const rect = container.getBoundingClientRect();
          const dropdownHeight = 200; // Altura aproximada del dropdown
          const windowHeight = window.innerHeight;

          // Determinar si el dropdown ha d-anar cap avall o cap amunt
          const spaceBelow = windowHeight - rect.bottom;
          const spaceAbove = rect.top;

          let top: number;
          if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
            // Posar el dropdown sota l'element
            top = rect.bottom + 4;
          } else {
            // Posar el dropdown sobre l'element
            top = rect.top - dropdownHeight - 4;
          }

          const position = {
            top: Math.max(0, top),
            left: rect.left,
            width: rect.width
          };
          this.dropdownPosition.set(position);
        }
      }, 0);
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onClear(): void {
    this.internalValue.set(this.isMultiple() ? [] : null);
    this.onChange(this.isMultiple() ? [] : null);
    this.valueChange.emit(this.isMultiple() ? [] : null);
  }

  onOptionClick(option: SelectOption): void {
    if (option.disabled) return;

    if (this.isMultiple()) {
      const currentValue = this.displayValue() || [];
            const newValue = currentValue.includes(option.value)
        ? currentValue.filter((v: any) => v !== option.value)
        : [...currentValue, option.value];

      this.internalValue.set(newValue);
      this.onChange(newValue);
      this.valueChange.emit(newValue);
    } else {
      this.internalValue.set(option.value);
      this.onChange(option.value);
      this.valueChange.emit(option.value);
      this.isOpen.set(false);
    }
  }

  writeValue(value: any): void {
    this.internalValue.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }
}
