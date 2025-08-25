import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface AppointmentStats {
  total: number;
  today: number;
  upcoming: number;
  past: number;
  mine: number;
}

@Component({
  selector: 'pelu-appointments-stats',
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="stats-grid" style="view-transition-name: stats-grid">
      <div class="stat-card clickable" [class.active]="isTodayActive()" (click)="toggleToday()">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats().today }}</div>
          <div class="stat-label">{{ 'APPOINTMENTS.TODAY_APPOINTMENTS' | translate }}</div>
        </div>
      </div>

      <div class="stat-card clickable" [class.active]="isUpcomingActive()" (click)="toggleUpcoming()">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats().upcoming }}</div>
          <div class="stat-label">{{ 'APPOINTMENTS.UPCOMING_APPOINTMENTS' | translate }}</div>
        </div>
      </div>

      <div class="stat-card clickable" [class.active]="isPastActive()" (click)="togglePast()">
        <div class="stat-icon">📜</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats().past }}</div>
          <div class="stat-label">{{ 'APPOINTMENTS.PAST_APPOINTMENTS' | translate }}</div>
        </div>
      </div>

      <div class="stat-card clickable" [class.active]="isMineActive()" (click)="toggleMine()">
        <div class="stat-icon">👨</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats().mine }}</div>
          <div class="stat-label">{{ 'APPOINTMENTS.MY_APPOINTMENTS' | translate }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .stats-grid {
        padding-top: 1rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        display: flex;
        align-items: center;
        padding: 1rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
        cursor: pointer;
        border: 1px solid #e5e7eb;
      }

      .stat-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      .stat-card.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .stat-card.active .stat-number {
        color: white;
      }

      .stat-card.active .stat-label {
        color: rgba(255, 255, 255, 0.8);
      }

      .stat-icon {
        font-size: 2rem;
        margin-right: 1rem;
      }

      .stat-content {
        flex: 1;
      }

      .stat-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--primary-color);
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--text-color-secondary);
        margin-top: 0.25rem;
      }

      /* Mobile styles */
      @media (max-width: 768px) {
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 0.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          cursor: pointer;
          border: 1px solid #e5e7eb;
          min-height: 80px;
        }

        .stat-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .stat-card.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .stat-card.active .stat-number {
          color: white;
        }

        .stat-card.active .stat-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .stat-icon {
          font-size: 1.25rem;
          margin-right: 0;
          margin-bottom: 0.25rem;
        }

        .stat-content {
          flex: 1;
          text-align: center;
        }

        .stat-number {
          font-size: 1rem;
          font-weight: bold;
          color: var(--primary-color);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-color-secondary);
          margin-top: 0.125rem;
          line-height: 1.2;
        }
      }

      /* Extra small mobile styles */
      @media (max-width: 480px) {
        .stats-grid {
          gap: 0.25rem;
        }

        .stat-card {
          padding: 0.5rem 0.25rem;
          min-height: 70px;
        }

        .stat-icon {
          font-size: 1rem;
        }

        .stat-number {
          font-size: 0.875rem;
        }

        .stat-label {
          font-size: 0.625rem;
        }
      }
    `,
  ],
})
export class AppointmentsStatsComponent {
  stats = input.required<AppointmentStats>();
  currentQuickFilters = input<string>('all');

  quickFilterChange = output<'all' | 'today' | 'upcoming' | 'past' | 'mine'>();

  // Computed properties to check if filters are active
  readonly isTodayActive = computed(() => this.currentQuickFilters().includes('today'));
  readonly isUpcomingActive = computed(() => this.currentQuickFilters().includes('upcoming'));
  readonly isPastActive = computed(() => this.currentQuickFilters().includes('past'));
  readonly isMineActive = computed(() => this.currentQuickFilters().includes('mine'));

  // Methods to handle filter toggling
  readonly toggleToday = () => this.quickFilterChange.emit('today');
  readonly toggleUpcoming = () => this.quickFilterChange.emit('upcoming');
  readonly togglePast = () => this.quickFilterChange.emit('past');
  readonly toggleMine = () => this.quickFilterChange.emit('mine');
}
