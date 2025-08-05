import { Component, input, output, computed, Signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesService } from '../../../core/services/services.service';
import { TranslationService } from '../../../core/services/translation.service';
import { InputTextComponent, InputDateComponent, InputSelectComponent } from '../inputs';
import { ButtonComponent } from '../buttons/button.component';

@Component({
  selector: 'pelu-filters-inline',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    InputDateComponent,
    InputSelectComponent,
    ButtonComponent,
  ],
  templateUrl: './filters-inline.component.html',
  styleUrls: ['./filters-inline.component.scss'],
})
export class FiltersInlineComponent {
  // Inject services
  private readonly servicesService = inject(ServicesService);
  private readonly translationService = inject(TranslationService);
  private readonly fb = inject(FormBuilder);

  // Input signals that can accept either values or signals
  readonly filterDate = input<string | Signal<string>>('');
  readonly filterClient = input<string | Signal<string>>('');
  readonly filterService = input<string | Signal<string>>('');

  // Callback inputs
  readonly onDateChange = input<((value: string) => void) | undefined>();
  readonly onClientChange = input<((value: string) => void) | undefined>();
  readonly onServiceChange = input<((value: string) => void) | undefined>();
  readonly onReset = input<(() => void) | undefined>();

  // Output events
  readonly reset = output<void>();

  // Reactive Form
  readonly filtersForm: FormGroup;

  // Computed values that handle both signals and static values
  readonly filterDateValue = computed(() => {
    const value = this.filterDate();
    return typeof value === 'function' ? value() : value;
  });

  readonly filterClientValue = computed(() => {
    const value = this.filterClient();
    return typeof value === 'function' ? value() : value;
  });

  readonly filterServiceValue = computed(() => {
    const value = this.filterService();
    return typeof value === 'function' ? value() : value;
  });

  readonly serviceOptions = computed(() => {
    const services = this.servicesService.getAllServices();
    return [
      { label: this.translationService.get('SERVICES.ALL_SERVICES'), value: '' },
      ...services.map(service => ({
        label: this.servicesService.getServiceName(service),
        value: service.id || '',
        color: this.servicesService.getServiceColor(service).color,
      })),
    ];
  });

  // Input configurations for specific inputs
  readonly dateFilterConfig = {
    type: 'date' as const,
    label: 'COMMON.FILTERS.FILTER_BY_DATE',
    showLabel: true,
  };

  readonly clientFilterConfig = {
    type: 'text' as const,
    label: 'COMMON.FILTERS.FILTER_BY_CLIENT',
    placeholder: 'COMMON.SEARCH.SEARCH_BY_NAME',
    showLabel: true,
  };

  readonly serviceFilterConfig = computed(() => ({
    type: 'select' as const,
    label: 'COMMON.FILTERS.FILTER_BY_SERVICE',
    placeholder: 'COMMON.SELECTION.SELECT_SERVICE',
    options: this.serviceOptions(),
    showLabel: true,
    clearable: true,
  }));

  constructor() {
    // Initialize reactive form
    this.filtersForm = this.fb.group({
      date: [''],
      client: [''],
      service: ['']
    });

    // Subscribe to form changes
    this.filtersForm.valueChanges.subscribe(values => {
      if (values.date !== this.filterDateValue()) {
        this.onDateChange()?.(values.date);
      }
      if (values.client !== this.filterClientValue()) {
        this.onClientChange()?.(values.client);
      }
      if (values.service !== this.filterServiceValue()) {
        this.onServiceChange()?.(values.service);
      }
    });

    // Effect to sync external filter values with form
    effect(() => {
      const currentDate = this.filterDateValue();
      const currentClient = this.filterClientValue();
      const currentService = this.filterServiceValue();

      // Only update if values are different to avoid infinite loops
      const formValues = this.filtersForm.value;
      if (formValues.date !== currentDate ||
          formValues.client !== currentClient ||
          formValues.service !== currentService) {
        this.filtersForm.patchValue({
          date: currentDate,
          client: currentClient,
          service: currentService
        }, { emitEvent: false }); // Prevent triggering valueChanges
      }
    });
  }

  onDateChangeHandler(value: string | Date | null) {
    if (typeof value === 'string') {
      this.filtersForm.patchValue({ date: value });
    } else if (value instanceof Date) {
      this.filtersForm.patchValue({ date: value.toISOString().split('T')[0] });
    } else {
      this.filtersForm.patchValue({ date: '' });
    }
  }

  onClientChangeHandler(value: string) {
    this.filtersForm.patchValue({ client: value });
  }

  onServiceChangeHandler(value: string | undefined) {
    this.filtersForm.patchValue({ service: value || '' });
  }

  onResetHandler() {
    // Reset the form to initial state
    this.filtersForm.patchValue({
      date: '',
      client: '',
      service: ''
    }, { emitEvent: false });

    // Call the callback to notify parent component
    this.onReset()?.();

    // Emit the reset event
    this.reset.emit();

    // Force a manual reset of the form controls
    this.filtersForm.get('date')?.setValue('');
    this.filtersForm.get('client')?.setValue('');
    this.filtersForm.get('service')?.setValue('');
  }
}
