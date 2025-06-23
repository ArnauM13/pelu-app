import { Component, Input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatingButtonComponent } from '../floating-button/floating-button.component';

@Component({
  selector: 'pelu-filters-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, FloatingButtonComponent],
  template: `
    <div class="filters-popup">
      <!-- Quick Filters -->
      <div class="quick-filters">
        @for (button of filterButtons(); track button.icon; let i = $index) {
        <pelu-floating-button
          [config]="button"
          (clicked)="onFilterClickHandler(i)">
        </pelu-floating-button>
        }
      </div>

      <!-- Advanced Filters Section -->
      @if (showAdvancedFilters()) {
      <div class="advanced-filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label for="filterDate">Filtrar per data:</label>
            <input
              type="date"
              id="filterDate"
              [value]="filterDate()"
              (input)="onDateChangeHandler($any($event.target).value)"
              class="input">
          </div>
          <div class="filter-group">
            <label for="filterClient">Filtrar per client:</label>
            <input
              type="text"
              id="filterClient"
              [value]="filterClient()"
              (input)="onClientChangeHandler($any($event.target).value)"
              placeholder="Buscar per nom..."
              class="input">
          </div>
        </div>
        <div class="reset-section">
          <button class="reset-btn" (click)="onResetHandler()">
            🗑️ Netejar filtres
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
  // Internal signals that will be updated from inputs
  private filterButtonsSignal = signal<any[]>([]);
  private filterDateSignal = signal<string>('');
  private filterClientSignal = signal<string>('');
  private showAdvancedFiltersSignal = signal<boolean>(false);

  // Computed getters that return the current values
  filterButtons = computed(() => this.filterButtonsSignal());
  filterDate = computed(() => this.filterDateSignal());
  filterClient = computed(() => this.filterClientSignal());
  showAdvancedFilters = computed(() => this.showAdvancedFiltersSignal());

  // Input setters that update the signals
  @Input() set filterButtonsInput(value: any[]) {
    this.filterButtonsSignal.set(value);
  }
  @Input() set filterDateInput(value: string) {
    this.filterDateSignal.set(value);
  }
  @Input() set filterClientInput(value: string) {
    this.filterClientSignal.set(value);
  }
  @Input() set showAdvancedFiltersInput(value: boolean) {
    this.showAdvancedFiltersSignal.set(value);
  }

  // Callback inputs
  @Input() onFilterClick?: (index: number) => void;
  @Input() onDateChange?: (value: string) => void;
  @Input() onClientChange?: (value: string) => void;
  @Input() onReset?: () => void;
  @Input() onToggleAdvanced?: () => void;

  onFilterClickHandler(index: number) {
    // Check if it's the advanced filters button (last button)
    if (index === this.filterButtons().length - 1) {
      this.onToggleAdvanced?.();
    } else {
      this.onFilterClick?.(index);
    }
  }

  onDateChangeHandler(value: string) {
    this.onDateChange?.(value);
  }

  onClientChangeHandler(value: string) {
    this.onClientChange?.(value);
  }

  onResetHandler() {
    this.onReset?.();
  }
}
