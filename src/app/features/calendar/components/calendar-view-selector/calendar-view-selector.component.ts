import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components';
export type CalendarViewType = 'daily' | 'weekly';

@Component({
  selector: 'pelu-calendar-view-selector',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
  ],
  template: `
    <div class="view-selector">
      <div class="view-buttons">
        <pelu-button
          [label]="'CALENDAR.VIEW.DAILY' | translate"
          [icon]="'pi pi-calendar'"
          [severity]="currentView() === 'daily' ? 'primary' : 'secondary'"
          [size]="'small'"
          (clicked)="onViewChange('daily')"
          [class.active]="currentView() === 'daily'"
        ></pelu-button>

        <pelu-button
          [label]="'CALENDAR.VIEW.WEEKLY' | translate"
          [icon]="'pi pi-calendar-plus'"
          [severity]="currentView() === 'weekly' ? 'primary' : 'secondary'"
          [size]="'small'"
          (clicked)="onViewChange('weekly')"
          [class.active]="currentView() === 'weekly'"
        ></pelu-button>
      </div>
    </div>
  `,
  styles: [`
    .view-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .view-buttons {
      display: flex;
      gap: 0.25rem;
      background: var(--surface-100);
      border-radius: 6px;
      padding: 0.25rem;
    }

    pelu-button {
      ::ng-deep .p-button {
        min-width: auto;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        border-radius: 4px;
        transition: all 0.2s ease;

        &.p-button-secondary {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-color-secondary);

          &:hover {
            background: var(--surface-200);
            border-color: var(--surface-300);
          }
        }

        &.p-button-primary {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }

    @media (max-width: 768px) {
      .view-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }

      pelu-button {
        ::ng-deep .p-button {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `]
})
export class CalendarViewSelectorComponent {
  // Input signals
  readonly currentView = input<CalendarViewType>('weekly');

  // Output signals
  readonly viewChanged = output<CalendarViewType>();

  onViewChange(view: CalendarViewType) {
    this.viewChanged.emit(view);
  }
}
