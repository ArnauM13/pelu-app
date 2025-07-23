import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface AppointmentStats {
  total: number;
  today: number;
  upcoming: number;
  mine: number;
}

@Component({
    selector: 'pelu-appointments-stats',
    imports: [CommonModule, TranslateModule],
    template: `
    <div class="stats-grid" style="view-transition-name: stats-grid">
      <div class="stat-card clickable" (click)="onQuickFilterChange.emit('all')">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats().total }}</div>
          <div class="stat-label">{{ 'APPOINTMENTS.TOTAL_APPOINTMENTS' | translate }}</div>
        </div>
      </div>

      <div class="stat-card clickable" (click)="onQuickFilterChange.emit('today')">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats().today }}</div>
          <div class="stat-label">{{ 'APPOINTMENTS.TODAY_APPOINTMENTS' | translate }}</div>
        </div>
      </div>

      <div class="stat-card clickable" (click)="onQuickFilterChange.emit('upcoming')">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats().upcoming }}</div>
          <div class="stat-label">{{ 'APPOINTMENTS.UPCOMING_APPOINTMENTS' | translate }}</div>
        </div>
      </div>

      <div class="stat-card clickable" (click)="onQuickFilterChange.emit('mine')">
        <div class="stat-icon">👨</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats().mine }}</div>
          <div class="stat-label">{{ 'APPOINTMENTS.MY_APPOINTMENTS' | translate }}</div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.2s ease;
      cursor: pointer;
      border: 1px solid #e5e7eb;
    }

    .stat-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
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
  `]
})
export class AppointmentsStatsComponent {
  stats = input.required<AppointmentStats>();

  onQuickFilterChange = output<'all' | 'today' | 'upcoming' | 'mine'>();
}
