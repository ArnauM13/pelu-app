import { Component, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { FloatingButtonComponent } from '../floating-button/floating-button.component';
import { ServiceColorsService, ServiceColor } from '../../../core/services/service-colors.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'pelu-filters-inline',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, DropdownModule, FloatingButtonComponent],
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
