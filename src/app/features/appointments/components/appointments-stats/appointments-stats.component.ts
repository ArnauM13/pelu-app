import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '../../../../shared/components/card/card.component';

export interface AppointmentStats {
  total: number;
  today: number;
  upcoming: number;
  mine: number;
}

@Component({
  selector: 'pelu-appointments-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule, CardComponent],
  template: `
    <div class="appointments-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats().total }}</div>
            <div class="stat-label">{{ 'APPOINTMENTS.TOTAL' | translate }}</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats().today }}</div>
            <div class="stat-label">{{ 'APPOINTMENTS.TODAY' | translate }}</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats().upcoming }}</div>
            <div class="stat-label">{{ 'APPOINTMENTS.UPCOMING' | translate }}</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">👤</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats().mine }}</div>
            <div class="stat-label">{{ 'APPOINTMENTS.MINE' | translate }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .appointments-stats {
      margin-bottom: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: var(--surface-card);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-icon {
      font-size: 2rem;
      margin-right: 1rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
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
  readonly stats = input.required<AppointmentStats>();
}
