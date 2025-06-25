import { Component, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FloatingButtonComponent } from '../floating-button/floating-button.component';

@Component({
  selector: 'pelu-filters-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, FloatingButtonComponent],
  template: `
    <div class="filters-popup">
      <!-- Quick Filters -->
      <div class="quick-filters">
        @for (button of filterButtonsValue(); track button.icon; let i = $index) {
        <pelu-floating-button
          [config]="button"
          (clicked)="onFilterClickHandler(i)">
        </pelu-floating-button>
        }
      </div>

      <!-- Advanced Filters Section -->
      @if (showAdvancedFiltersValue()) {
      <div class="advanced-filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label for="filterDate">{{ 'COMMON.FILTER_BY_DATE' | translate }}</label>
            <input
              type="date"
              id="filterDate"
              [value]="filterDateValue()"
              (input)="onDateChangeHandler($any($event.target).value)"
              class="input">
          </div>
          <div class="filter-group">
            <label for="filterClient">{{ 'COMMON.FILTER_BY_CLIENT' | translate }}</label>
            <input
              type="text"
              id="filterClient"
              [value]="filterClientValue()"
              (input)="onClientChangeHandler($any($event.target).value)"
              [placeholder]="'COMMON.SEARCH_BY_NAME' | translate"
              class="input">
          </div>
        </div>
        <div class="reset-section">
          <button class="reset-btn" (click)="onResetHandler()">
            {{ 'COMMON.CLEAR_FILTERS_BUTTON' | translate }}
          </button>
        </div>
      </div>
      }
    </div>
  `,
  styles: [`
    .filters-popup {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .quick-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .advanced-filters-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    .filters-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
    }

    .input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      background-color: white;
      color: #1f2937;
    }

    .input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .reset-section {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }

    .reset-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .reset-btn:hover {
      background: #dc2626;
    }
  `]
})
export class FiltersPopupComponent {
  // Input signals that can accept either values or signals
  readonly filterButtons = input.required<any[] | Signal<any[]>>();
  readonly filterDate = input<string | Signal<string>>('');
  readonly filterClient = input<string | Signal<string>>('');
  readonly showAdvancedFilters = input<boolean | Signal<boolean>>(false);

  // Callback inputs
  readonly onFilterClick = input<((index: number) => void) | undefined>();
  readonly onDateChange = input<((value: string) => void) | undefined>();
  readonly onClientChange = input<((value: string) => void) | undefined>();
  readonly onReset = input<(() => void) | undefined>();
  readonly onToggleAdvanced = input<(() => void) | undefined>();

  // Computed values that handle both signals and static values
  readonly filterButtonsValue = computed(() => {
    const value = this.filterButtons();
    return typeof value === 'function' ? value() : value;
  });

  readonly filterDateValue = computed(() => {
    const value = this.filterDate();
    return typeof value === 'function' ? value() : value;
  });

  readonly filterClientValue = computed(() => {
    const value = this.filterClient();
    return typeof value === 'function' ? value() : value;
  });

  readonly showAdvancedFiltersValue = computed(() => {
    const value = this.showAdvancedFilters();
    return typeof value === 'function' ? value() : value;
  });

  onFilterClickHandler(index: number) {
    // Check if it's the advanced filters button (last button)
    if (index === this.filterButtonsValue().length - 1) {
      this.onToggleAdvanced()?.();
    } else {
      this.onFilterClick()?.(index);
    }
  }

  onDateChangeHandler(value: string) {
    this.onDateChange()?.(value);
  }

  onClientChangeHandler(value: string) {
    this.onClientChange()?.(value);
  }

  onResetHandler() {
    this.onReset()?.();
  }
}
