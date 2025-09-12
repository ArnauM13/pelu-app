import { Component, input, output, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../shared/components/buttons/button.component';
import { InputSelectComponent, SelectOption } from '../../../../../shared/components/inputs/input-select/input-select.component';
import { CalendarComponent } from '../../../../calendar/core/calendar.component';

export type CalendarViewType = 'daily' | 'weekly';

@Component({
  selector: 'pelu-date-controls',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    InputSelectComponent,
  ],
  template: `
    <div class="date-controls">
      <!-- Element 1: Left side - Today button, navigation arrows, week indicator -->
      <div class="left-controls">
        <pelu-button
          [label]="'COMMON.TIME.TODAY' | translate"
          [icon]="'pi pi-calendar'"
          (clicked)="onTodayClicked()"
        ></pelu-button>

        <div class="week-navigation">
          <pelu-button
            [icon]="'pi pi-chevron-left'"
            [rounded]="true"
            (clicked)="onPreviousClicked()"
            [ariaLabel]="'COMMON.ACTIONS.PREVIOUS' | translate"
          ></pelu-button>

          <pelu-button
            [icon]="'pi pi-chevron-right'"
            [rounded]="true"
            (clicked)="onNextClicked()"
            [ariaLabel]="'COMMON.ACTIONS.NEXT' | translate"
          ></pelu-button>
        </div>

        <div class="week-info">
          <span>{{ weekInfo() }}</span>
        </div>
      </div>

      <!-- Element 2: Right side - View type selector -->
      <div class="right-controls">
        <pelu-input-select
          [options]="viewOptions()"
          [value]="currentView()"
          [placeholder]="'CALENDAR.VIEW.SELECT_VIEW' | translate"
          [clearable]="false"
          [searchable]="false"
          [filter]="false"
          (valueChange)="onViewChanged($event)"
        ></pelu-input-select>
      </div>
    </div>
  `,
  styles: [`
    .date-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 0;
    }

    .left-controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .right-controls {
      display: flex;
      align-items: center;
    }

    .week-navigation {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .week-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: transparent;

        span {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.35rem 1rem;
          height: 2.75rem;
          background: var(--primary-color);
          color: #fff;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    }
  `]
})
export class DateControlsComponent {
  private readonly translateService = inject(TranslateService);

  // Input signals
  readonly currentView = input<CalendarViewType>('weekly');
  readonly weekInfo = input<string>('');

  // Output signals
  readonly todayClicked = output<void>();
  readonly previousClicked = output<void>();
  readonly nextClicked = output<void>();
  readonly viewChanged = output<CalendarViewType>();

  // View options signal that updates when language changes
  readonly viewOptions = signal<SelectOption[]>([
    {
      label: 'Dia',
      value: 'daily',
      icon: 'pi pi-calendar'
    },
    {
      label: 'Setmana',
      value: 'weekly',
      icon: 'pi pi-calendar-plus'
    }
  ]);

  constructor() {
    // Update view options when language changes
    effect(() => {
      this.updateViewOptions();
    });

    // Listen to language changes
    this.translateService.onLangChange.subscribe(() => {
      this.updateViewOptions();
    });

    // Initial update
    this.updateViewOptions();
  }

  private updateViewOptions(): void {
    this.viewOptions.set([
      {
        label: this.translateService.instant('CALENDAR.VIEW.DAILY'),
        value: 'daily',
        icon: 'pi pi-calendar'
      },
      {
        label: this.translateService.instant('CALENDAR.VIEW.WEEKLY'),
        value: 'weekly',
        icon: 'pi pi-calendar-plus'
      }
    ]);
  }

  onTodayClicked(): void {
    this.todayClicked.emit();
  }

  onPreviousClicked(): void {
    this.previousClicked.emit();
  }

  onNextClicked(): void {
    this.nextClicked.emit();
  }

  onViewChanged(view: string | number | undefined): void {
    if (view && (view === 'daily' || view === 'weekly')) {
      this.viewChanged.emit(view);
    }
  }
}
