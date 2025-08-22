import { Component, input, output, computed, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../card/card.component';
import { AppointmentsStatsComponent } from '../../../features/appointments/components/appointments-stats/appointments-stats.component';
import { FiltersInlineComponent } from '../filters-inline/filters-inline.component';
import { AppointmentStats } from '../../../features/appointments/components/appointments-stats/appointments-stats.component';

interface FilterChip {
  id: string;
  type: 'quick' | 'date' | 'client' | 'service';
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'pelu-filters-collapsible',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    CardComponent,
    AppointmentsStatsComponent,
    FiltersInlineComponent,
  ],
  template: `
    <pelu-card [class.collapsed]="isCollapsed()" (click)="isCollapsed() ? toggleCollapse() : null">
      <div class="filters-header">
        <div class="header-left" (click)="toggleCollapse()">
          <span class="header-title">{{ 'COMMON.FILTERS.TITLE' | translate }}</span>
        </div>
        <div class="header-center" (click)="$event.stopPropagation()">
          <!-- Active Filters Chips -->
          @if (activeFiltersChips().length > 0) {
            <div class="active-filters-chips">
              @for (chip of activeFiltersChips(); track chip.id) {
                <div class="filter-chip" [ngClass]="chip.type">
                  <span class="chip-icon">{{ chip.icon }}</span>
                  <span class="chip-label">{{ chip.label | translate }}</span>
                  <button
                    class="chip-remove"
                    (click)="removeFilter(chip); $event.stopPropagation()"
                    [attr.aria-label]="'COMMON.REMOVE_FILTER' | translate"
                  >
                    ✕
                  </button>
                </div>
              }
            </div>
          }
        </div>
        <div class="header-right">
          <p-button
            [icon]="isCollapsed() ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"
            [text]="true"
            [rounded]="true"
            [ariaLabel]="isCollapsed() ? 'COMMON.FILTERS.EXPAND' : 'COMMON.FILTERS.COLLAPSE'"
            (onClick)="toggleCollapse(); $event.stopPropagation()"
          />
        </div>
      </div>

      @if (!isCollapsed()) {
        <div class="filters-content" (click)="$event.stopPropagation()">
          <!-- Quick Filters (Stats) -->
          <div class="quick-filters-section">
            <pelu-appointments-stats
              [stats]="stats()"
              [currentQuickFilters]="quickFilter()"
              (quickFilterChange)="quickFilterChange.emit($event)"
            />
          </div>

          <!-- Advanced Filters -->
          <div class="advanced-filters-section">
            <pelu-filters-inline
              [filterDate]="filterDate()"
              [filterClient]="filterClient()"
              [filterService]="filterService()"
              [onDateChange]="onDateChange()"
              [onClientChange]="onClientChange()"
              [onServiceChange]="onServiceChange()"
            />
          </div>

          <div class="reset-button-container">
            <p-button
              [label]="'COMMON.FILTERS.CLEAR_FILTERS_BUTTON' | translate"
              severity="danger"
              [icon]="'pi pi-trash'"
              [iconPos]="'right'"
              (onClick)="onReset()?.()"
            />
          </div>
        </div>
      }
    </pelu-card>
  `,
  styles: [`
    :host pelu-card.collapsed {
      cursor: pointer;
    }

    :host pelu-card.collapsed:hover {
      background-color: var(--surface-hover);
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      border-bottom: 1px solid var(--surface-border);
      transition: background-color 0.2s ease;
      gap: 1rem;
    }

    .filters-header:hover {
      background-color: var(--surface-hover);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .header-title {
      font-weight: 600;
      color: var(--text-color);
    }

    .header-center {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
    }

    .active-filters-badge {
      background-color: var(--primary-color);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .header-right {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .active-filters-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.5rem 0;
      width: 100%;
    }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
      transition: all 0.2s ease;
      cursor: default;
    }

    .filter-chip:hover {
      background: var(--surface-hover);
      border-color: var(--primary-color);
    }

    .filter-chip.quick {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .filter-chip.date {
      background: var(--blue-50);
      border-color: var(--blue-200);
      color: var(--blue-700);
    }

    .filter-chip.client {
      background: var(--green-50);
      border-color: var(--green-200);
      color: var(--green-700);
    }

    .filter-chip.service {
      background: var(--purple-50);
      border-color: var(--purple-200);
      color: var(--purple-700);
    }

    .chip-icon {
      font-size: 1rem;
    }

    .chip-label {
      font-weight: 500;
    }

    .chip-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border: none;
      background: transparent;
      color: inherit;
      font-size: 0.75rem;
      font-weight: bold;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .chip-remove:hover {
      background: rgba(0, 0, 0, 0.1);
      opacity: 1;
    }

    .filter-chip.quick .chip-remove:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .advanced-filters-section {
      border-top: 1px solid var(--surface-border);
      padding-top: 1.5rem;
      position: relative;
    }

    .reset-button-container {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .filters-header {
        padding-bottom: 0;
        gap: 0.5rem;
      }

      .header-left {
        flex-shrink: 0;
      }

      .header-center {
        flex: 1;
        min-width: 0;
      }

      .header-right {
        flex-shrink: 0;
      }

      .header-title {
        font-size: 0.9rem;
      }

      .active-filters-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.4rem;
      }

      .active-filters-chips {
        padding: 0.25rem 0;
        gap: 0.25rem;
      }

      .filter-chip {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        gap: 0.25rem;
      }

      .chip-icon {
        font-size: 0.875rem;
      }

      .chip-label {
        font-size: 0.75rem;
      }

      .advanced-filters-section {
        padding-top: 1rem;
        position: relative;
      }

      .reset-button-container {
        justify-content: center;
      }
    }

    /* Extra small mobile styles */
    @media (max-width: 480px) {
      .filters-header {
        gap: 0.25rem;
      }

      .header-title {
        font-size: 0.8rem;
      }

      .active-filters-chips {
        gap: 0.125rem;
      }

      .filter-chip {
        padding: 0.125rem 0.375rem;
        font-size: 0.7rem;
        gap: 0.125rem;
      }

      .chip-icon {
        font-size: 0.75rem;
      }

      .chip-label {
        font-size: 0.7rem;
      }

      .chip-remove {
        width: 14px;
        height: 14px;
        font-size: 0.7rem;
      }
    }
  `],
})
export class FiltersCollapsibleComponent {
  // Input signals
  readonly stats = input.required<AppointmentStats>();
  readonly filterDate = input<string | Signal<string>>('');
  readonly filterClient = input<string | Signal<string>>('');
  readonly filterService = input<string | Signal<string>>('');
  readonly hasActiveFilters = input<boolean>(false);
  readonly quickFilter = input<string>('');

  // Callback inputs
  readonly onDateChange = input<((value: string) => void) | undefined>();
  readonly onClientChange = input<((value: string) => void) | undefined>();
  readonly onServiceChange = input<((value: string) => void) | undefined>();
  readonly onReset = input<(() => void) | undefined>();

  // Output events
  readonly quickFilterChange = output<'all' | 'today' | 'upcoming' | 'past' | 'mine'>();

  // Internal state
  private readonly collapsedSignal = signal(true);
  readonly isCollapsed = computed(() => this.collapsedSignal());

  // Computed properties for filter values
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

  readonly activeFiltersChips = computed((): FilterChip[] => {
    const chips: FilterChip[] = [];

    // Quick filter chips - now supporting multiple
    const quickFilterValue = this.quickFilter();
    if (quickFilterValue && quickFilterValue !== 'all') {
      // Parse the quick filter value - it could be a comma-separated string or a single value
      const quickFilters = quickFilterValue.split(',').filter(f => f.trim() !== '');

      const quickFilterLabels = {
        'today': 'APPOINTMENTS.MESSAGES.TODAY_APPOINTMENTS_FILTER',
        'upcoming': 'APPOINTMENTS.MESSAGES.UPCOMING_APPOINTMENTS_FILTER',
        'past': 'APPOINTMENTS.MESSAGES.PAST_APPOINTMENTS_FILTER',
        'mine': 'APPOINTMENTS.MESSAGES.MY_APPOINTMENTS_FILTER'
      };
      const quickFilterIcons = {
        'today': '🎯',
        'upcoming': '⏰',
        'past': '📜',
        'mine': '👨'
      };

      quickFilters.forEach(filter => {
        const trimmedFilter = filter.trim();
        if (trimmedFilter && trimmedFilter !== 'all') {
          chips.push({
            id: `quick-${trimmedFilter}`,
            type: 'quick',
            icon: quickFilterIcons[trimmedFilter as keyof typeof quickFilterIcons] || '📊',
            label: quickFilterLabels[trimmedFilter as keyof typeof quickFilterLabels] || trimmedFilter,
            value: trimmedFilter
          });
        }
      });
    }

    // Date filter chip
    const filterDateValue = this.filterDateValue();
    if (filterDateValue) {
      chips.push({
        id: 'date-filter',
        type: 'date',
        icon: '📅',
        label: 'COMMON.FILTERS.DATE_FILTER',
        value: filterDateValue
      });
    }

    // Client filter chip
    const filterClientValue = this.filterClientValue();
    if (filterClientValue) {
      chips.push({
        id: 'client-filter',
        type: 'client',
        icon: '👤',
        label: 'COMMON.FILTERS.CLIENT_FILTER',
        value: filterClientValue
      });
    }

    // Service filter chip
    const filterServiceValue = this.filterServiceValue();
    if (filterServiceValue) {
      chips.push({
        id: 'service-filter',
        type: 'service',
        icon: '✂️',
        label: 'COMMON.FILTERS.SERVICE_FILTER',
        value: filterServiceValue
      });
    }

    return chips;
  });

  // Methods
  readonly toggleCollapse = () => {
    this.collapsedSignal.update(state => !state);
  };

  readonly removeFilter = (chip: FilterChip) => {
    switch (chip.type) {
      case 'quick':
        // For quick filters, we need to remove the specific filter
        // The parent component will handle the logic to remove from the Set
        this.quickFilterChange.emit(chip.value as 'today' | 'upcoming' | 'past' | 'mine');
        break;
      case 'date':
        this.onDateChange()?.('');
        break;
      case 'client':
        this.onClientChange()?.('');
        break;
      case 'service':
        this.onServiceChange()?.('');
        break;
    }
  };
}
