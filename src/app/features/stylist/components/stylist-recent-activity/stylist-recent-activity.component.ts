import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface ActivityItem {
  icon: string;
  message: string;
  time: string;
}

@Component({
  selector: 'pelu-stylist-recent-activity',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="recent-activity">
      <h2>{{ 'STYLIST.RECENT_ACTIVITY' | translate }}</h2>
      <div class="activity-list">
        @for (activity of activities(); track activity.time) {
        <div class="activity-item">
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <p>{{ activity.message | translate }}</p>
            <span class="activity-time">{{ activity.time | translate }}</span>
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .recent-activity {
      margin-bottom: 2rem;
    }

    .recent-activity h2 {
      margin-bottom: 1rem;
      color: var(--text-color);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: var(--surface-card);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .activity-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;
    }

    .activity-content p {
      margin: 0 0 0.25rem 0;
      color: var(--text-color);
    }

    .activity-time {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }
  `]
})
export class StylistRecentActivityComponent {
  activities = input.required<ActivityItem[]>();
}
