import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface CalendarFooterAlert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  icon: string;
  show: boolean;
}

@Component({
  selector: 'pelu-calendar-footer',
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="calendar-footer">
      <!-- Info note just below calendar -->
      <div class="footer-info">
        <p class="info-note">📅 {{ 'CALENDAR.FOOTER.INFO_NOTE' | translate }}</p>
      </div>

      <!-- Alerts section -->
      @if (hasAlerts()) {
        <div class="footer-alerts">
          @for (alert of visibleAlerts(); track alert.id) {
            <div class="alert-item" [class]="'alert-' + alert.type">
              <span class="alert-icon">{{ alert.icon }}</span>
              <span class="alert-message">{{ alert.message }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .footer-info {
        margin-top: 1rem;
        margin-bottom: 1rem;
      }

      .info-note {
        font-size: 0.9rem;
        color: var(--text-color-light);
        margin: 0;
        text-align: center;
        font-style: italic;
      }

      .footer-alerts {
        margin-top: 1rem;
        padding-bottom: 1rem;
      }

      .alert-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .alert-info {
        background: rgba(48, 109, 205, 0.1);
        border: 1px solid rgba(48, 109, 205, 0.2);
        color: var(--primary-color);
      }

      .alert-warning {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.2);
        color: #d97706;
      }

      .alert-success {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.2);
        color: #16a34a;
      }

      .alert-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #dc2626;
      }

      .alert-icon {
        font-size: 1rem;
        width: 20px;
        text-align: center;
      }

      .alert-message {
        flex: 1;
      }

      @media (max-width: 768px) {
        .calendar-footer {
          margin-top: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .footer-info {
          margin-bottom: 1rem;
        }

        .alert-item {
          padding: 0.5rem;
          font-size: 0.85rem;
        }

        .info-note {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class CalendarFooterComponent {
  // Input signals
  readonly alerts = input<CalendarFooterAlert[]>([]);

  // Computed signals
  readonly visibleAlerts = computed(() => this.alerts().filter(alert => alert.show));

  readonly hasAlerts = computed(() => this.visibleAlerts().length > 0);
}
