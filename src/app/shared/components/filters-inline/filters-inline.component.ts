import { Component, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { TranslationService } from '../../../core/services/translation.service';
import { InputTextComponent, InputDateComponent, InputSelectComponent } from '../inputs';

@Component({
    selector: 'pelu-filters-inline',
    imports: [CommonModule, FormsModule, TranslateModule, InputTextComponent, InputDateComponent, InputSelectComponent],
    templateUrl: './filters-inline.component.html',
    styleUrls: ['./filters-inline.component.scss']
})
export class FiltersInlineComponent {
  // Input signals that can accept either values or signals
  readonly filterDate = input<string | Signal<string>>('');
  readonly filterClient = input<string | Signal<string>>('');
  readonly filterService = input<string | Signal<string>>('');

  // Callback inputs
  readonly onDateChange = input<((value: string) => void) | undefined>();
  readonly onClientChange = input<((value: string) => void) | undefined>();
  readonly onServiceChange = input<((value: string) => void) | undefined>();
  readonly onReset = input<(() => void) | undefined>();

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
    const colors = this.serviceColorsService.getAllColors();
    return [
      { label: this.translationService.get('SERVICES.ALL_SERVICES'), value: '' },
      ...colors.map(color => ({
        label: this.serviceColorsService.getServiceColorName(color),
        value: color.id,
        color: color.color
      }))
    ];
  });

  // Input configurations for specific inputs
  readonly dateFilterConfig = {
    type: 'date' as const,
    label: 'COMMON.FILTERS.FILTER_BY_DATE',
    showLabel: true
  };

  readonly clientFilterConfig = {
    type: 'text' as const,
    label: 'COMMON.FILTERS.FILTER_BY_CLIENT',
    placeholder: 'COMMON.SEARCH.SEARCH_BY_NAME',
    showLabel: true
  };

  readonly serviceFilterConfig = computed(() => ({
    type: 'select' as const,
    label: 'COMMON.FILTERS.FILTER_BY_SERVICE',
    placeholder: 'COMMON.SELECTION.SELECT_SERVICE',
    options: this.serviceOptions(),
    showLabel: true,
    clearable: true
  }));

  constructor(
    private serviceColorsService: ServiceColorsService,
    private translationService: TranslationService
  ) {}

  onDateChangeHandler(value: string) {
    this.onDateChange()?.(value);
  }

  onClientChangeHandler(value: string) {
    this.onClientChange()?.(value);
  }

  onServiceChangeHandler(value: string) {
    this.onServiceChange()?.(value);
  }

  onResetHandler() {
    this.onReset()?.();
  }
}
