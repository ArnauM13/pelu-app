import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface QuickAction {
  icon: string;
  title: string;
  description: string;
  route: string;
}

@Component({
  selector: 'pelu-stylist-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="quick-actions">
      <h2>{{ 'STYLIST.QUICK_ACTIONS' | translate }}</h2>
      <div class="actions-grid">
        @for (action of actions(); track action.route) {
        <a [routerLink]="action.route" class="action-card">
          <div class="action-icon">{{ action.icon }}</div>
          <h3>{{ action.title | translate }}</h3>
          <p>{{ action.description | translate }}</p>
        </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .quick-actions {
      margin-bottom: 2rem;
    }

    .quick-actions h2 {
      margin-bottom: 1rem;
      color: var(--text-color);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      background: var(--surface-card);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      text-decoration: none;
      color: inherit;
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      text-align: center;
    }

    .action-card p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      text-align: center;
    }
  `]
})
export class StylistQuickActionsComponent {
  actions = input.required<QuickAction[]>();
}
