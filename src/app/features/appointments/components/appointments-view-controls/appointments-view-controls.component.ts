import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { FiltersInlineComponent } from '../../../../shared/components/filters-inline/filters-inline.component';

export interface ViewMode {
  mode: 'list' | 'calendar';
  icon: string;
  tooltip: string;
  ariaLabel: string;
}

export interface FilterState {
  date: string;
  client: string;
  quickFilter: 'all' | 'today' | 'upcoming' | 'mine';
}

@Component({
  selector: 'pelu-appointments-view-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    CalendarModule,
    InputTextModule,
    FiltersInlineComponent
  ],
  template: `
    <div class="view-controls">
      <!-- View Mode Toggle -->
      <div class="view-mode-controls">
        <div class="view-buttons">
          <button
            *ngFor="let view of viewModes()"
            [class.active]="view.mode === currentViewMode()"
            (click)="onViewModeChange.emit(view.mode)"
            [attr.aria-label]="view.ariaLabel | translate"
            class="view-button"
            type="button">
            <span class="view-icon">{{ view.icon }}</span>
            <span class="view-tooltip">{{ view.tooltip | translate }}</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <pelu-filters-inline
          [filters]="filters()"
          (filterChange)="onFilterChange.emit($event)">
        </pelu-filters-inline>

        <!-- Quick Filters -->
        <div class="quick-filters">
          <button
            *ngFor="let filter of quickFilters()"
            [class.active]="filter.value === currentQuickFilter()"
            (click)="onQuickFilterChange.emit(filter.value)"
            class="quick-filter-button"
            type="button">
            {{ filter.label | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .view-controls {
      margin-bottom: 1rem;
    }

    .view-mode-controls {
      margin-bottom: 1rem;
    }

    .view-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .view-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--surface-border);
      background: var(--surface-card);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .view-button:hover {
      background: var(--surface-hover);
    }

    .view-button.active {
      background: var(--primary-color);
      color: var(--primary-color-text);
      border-color: var(--primary-color);
    }

    .view-icon {
      font-size: 1.2rem;
    }

    .view-tooltip {
      font-size: 0.875rem;
    }

    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .quick-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .quick-filter-button {
      padding: 0.5rem 1rem;
      border: 1px solid var(--surface-border);
      background: var(--surface-card);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .quick-filter-button:hover {
      background: var(--surface-hover);
    }

    .quick-filter-button.active {
      background: var(--primary-color);
      color: var(--primary-color-text);
      border-color: var(--primary-color);
    }
  `]
})
export class AppointmentsViewControlsComponent {
  // Inputs
  readonly currentViewMode = input.required<'list' | 'calendar'>();
  readonly currentQuickFilter = input.required<'all' | 'today' | 'upcoming' | 'mine'>();
  readonly filterState = input.required<FilterState>();

  // Outputs
  readonly onViewModeChange = output<'list' | 'calendar'>();
  readonly onQuickFilterChange = output<'all' | 'today' | 'upcoming' | 'mine'>();
  readonly onFilterChange = output<Partial<FilterState>>();

  // Computed
  readonly viewModes = computed((): ViewMode[] => [
    {
      mode: 'list',
      icon: '📋',
      tooltip: 'COMMON.LIST_VIEW',
      ariaLabel: 'COMMON.LIST_VIEW_LABEL'
    },
    {
      mode: 'calendar',
      icon: '📅',
      tooltip: 'COMMON.CALENDAR_VIEW',
      ariaLabel: 'COMMON.CALENDAR_VIEW_LABEL'
    }
  ]);

  readonly quickFilters = computed(() => [
    { value: 'all' as const, label: 'COMMON.ALL' },
    { value: 'today' as const, label: 'APPOINTMENTS.TODAY' },
    { value: 'upcoming' as const, label: 'APPOINTMENTS.UPCOMING' },
    { value: 'mine' as const, label: 'APPOINTMENTS.MINE' }
  ]);

  readonly filters = computed(() => [
    {
      key: 'date',
      label: 'COMMON.DATE',
      type: 'date',
      value: this.filterState().date
    },
    {
      key: 'client',
      label: 'APPOINTMENTS.CLIENT',
      type: 'text',
      value: this.filterState().client,
      placeholder: 'APPOINTMENTS.SEARCH_CLIENT'
    }
  ]);
}
