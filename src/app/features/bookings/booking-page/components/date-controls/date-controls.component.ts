import { Component, input, output, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../shared/components/buttons/button.component';
import { InputSelectComponent, SelectOption } from '../../../../../shared/components/inputs/input-select/input-select.component';
import { CalendarComponent } from '../../../../calendar/core/calendar.component';

export type CalendarViewType = 'daily' | 'weekly' | 'month' | 'week';

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
    <div class="date-controls" [class.mobile]="isMobile()">
      @if (isMobile()) {
        <!-- Mobile Layout: Two rows -->
        <!-- Row 1: Today button + View toggle button (hidden when hideHeaderButtons is true) -->
        @if (!hideHeaderButtons()) {
          <div class="mobile-row-1">
            <pelu-button
              [label]="'COMMON.TIME.TODAY' | translate"
              [icon]="'pi pi-calendar'"
              (clicked)="onTodayClicked()"
              size="small"
            ></pelu-button>

            <pelu-button
              [label]="mobileToggleButton().label"
              [icon]="mobileToggleButton().icon"
              (clicked)="onMobileViewToggle()"
              size="small"
              severity="secondary"
              [raised]="true"
            ></pelu-button>
          </div>
        }

        <!-- Row 2: Navigation arrows + Week indicator (centered) -->
        <div class="mobile-row-2">
          <pelu-button
            [icon]="'pi pi-chevron-left'"
            [rounded]="true"
            (clicked)="onPreviousClicked()"
            [ariaLabel]="'COMMON.ACTIONS.PREVIOUS' | translate"
            [disabled]="!canGoPrevious()"
            size="small"
          ></pelu-button>

          <div class="week-info">
            <span>{{ weekInfo() }}</span>
          </div>

          <pelu-button
            [icon]="'pi pi-chevron-right'"
            [rounded]="true"
            (clicked)="onNextClicked()"
            [ariaLabel]="'COMMON.ACTIONS.NEXT' | translate"
            size="small"
          ></pelu-button>
        </div>
      } @else {
        <!-- Desktop Layout: Single row -->
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
              [disabled]="!canGoPrevious()"
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

        <div class="right-controls">
          <pelu-input-select
            [options]="getViewOptions()"
            [value]="currentView()"
            [placeholder]="'CALENDAR.VIEW.SELECT_VIEW' | translate"
            [clearable]="false"
            [searchable]="false"
            [filter]="false"
            (valueChange)="onViewChanged($event)"
          ></pelu-input-select>
        </div>
      }
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

    .date-controls.mobile {
      flex-direction: column;
      gap: 0.75rem;
      padding: 0;
    }

    .mobile-row-1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 1rem;
    }

    .mobile-row-2 {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: 1rem;
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
  readonly isMobile = input<boolean>(false);
  readonly canGoPrevious = input<boolean>(true);
  readonly hideHeaderButtons = input<boolean>(false);

  // Output signals
  readonly todayClicked = output<void>();
  readonly previousClicked = output<void>();
  readonly nextClicked = output<void>();
  readonly viewChanged = output<CalendarViewType>();
  readonly viewModeToggle = output<void>();

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

  // Mobile toggle button logic - simplified
  readonly mobileToggleButton = computed(() => {
    // Get the current view directly from the input
    const currentView = this.currentView();

    // Simple logic: if it's week/weekly, show "Mes", otherwise show "Setmana"
    const isWeekView = currentView === 'week' || currentView === 'weekly';

    return {
      label: isWeekView
        ? this.translateService.instant('CALENDAR.VIEW.MONTHLY')
        : this.translateService.instant('CALENDAR.VIEW.WEEKLY'),
      icon: isWeekView ? 'pi pi-calendar' : 'pi pi-calendar-plus',
      nextView: isWeekView ? 'month' : 'week'
    };
  });

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
    // mobileViewOptions is now computed, no need to update it here
  }

  onTodayClicked(): void {
    this.todayClicked.emit();
  }

  onPreviousClicked(): void {
    if (this.canGoPrevious()) {
      this.previousClicked.emit();
    }
  }

  onNextClicked(): void {
    this.nextClicked.emit();
  }

  onViewChanged(view: string | number | undefined): void {
    if (view && (view === 'daily' || view === 'weekly' || view === 'month' || view === 'week')) {
      this.viewChanged.emit(view as CalendarViewType);
    }
  }

  getViewOptions(): SelectOption[] {
    return this.viewOptions();
  }

  onViewModeToggle(): void {
    this.viewModeToggle.emit();
  }

  onMobileViewToggle(): void {
    const currentView = this.currentView();
    const nextView = this.mobileToggleButton().nextView;

    console.log('=== MOBILE TOGGLE DEBUG ===');
    console.log('Current view:', currentView);
    console.log('Next view:', nextView);
    console.log('Button config:', this.mobileToggleButton());

    this.viewChanged.emit(nextView as CalendarViewType);
  }
}
