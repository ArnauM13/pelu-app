import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface FooterAlert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  icon: string;
  show: boolean;
}

export interface FooterConfig {
  // General settings
  showInfoNote?: boolean;
  infoNoteText?: string;
  infoNoteIcon?: string;

  // Alerts
  alerts?: FooterAlert[];

  // Business information
  showBusinessHours?: boolean;
  businessHours?: {
    start: number;
    end: number;
  };
  lunchBreak?: {
    start: number;
    end: number;
  };

  // Special conditions
  isWeekend?: boolean;
  showWeekendInfo?: boolean;

  // Custom content
  customContent?: string;

  // Styling
  variant?: 'default' | 'compact' | 'minimal';
  theme?: 'light' | 'dark' | 'auto';
}

@Component({
  selector: 'pelu-footer',
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="footer" [class]="'footer-' + config().variant + ' footer-' + config().theme">
      <!-- Info note -->
      @if (config().showInfoNote !== false) {
        <div class="footer-info">
          <p class="info-note">
            @if (config().infoNoteIcon) {
              <span class="info-icon">{{ config().infoNoteIcon }}</span>
            }
            {{ config().infoNoteText || ('FOOTER.INFO_NOTE' | translate) }}
          </p>
        </div>
      }

      <!-- Custom content -->
      @if (config().customContent) {
        <div class="footer-custom">
          <p class="custom-content">{{ config().customContent }}</p>
        </div>
      }

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

      <!-- Business hours info -->
      @if (showBusinessHoursInfo()) {
        <div class="business-hours-info">
          <div class="alert-item alert-info">
            <span class="alert-icon">🕐</span>
            <span class="alert-message">
              {{ 'FOOTER.BUSINESS_HOURS_INFO' | translate: {
                startHour: formatHour(config().businessHours?.start || 8),
                endHour: formatHour(config().businessHours?.end || 20),
                lunchStart: formatHour(config().lunchBreak?.start || 13),
                lunchEnd: formatHour(config().lunchBreak?.end || 15)
              } }}
            </span>
          </div>
        </div>
      }

      <!-- Weekend info -->
      @if (config().isWeekend && config().showWeekendInfo !== false) {
        <div class="weekend-info">
          <div class="alert-item alert-info">
            <span class="alert-icon">📅</span>
            <span class="alert-message">
              {{ 'FOOTER.WEEKEND_INFO' | translate }}
            </span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .footer {
        padding: 1rem;
        background: var(--background-color);
      }

      /* Variants */
      .footer-compact {
        padding: 0.75rem;
        margin-top: 0.75rem;
      }

      .footer-minimal {
        padding: 0.5rem;
        margin-top: 0.5rem;
        border-radius: var(--border-radius);
      }

      /* Themes */
      .footer-dark {
        background: var(--surface-color-dark);
        border-color: var(--border-color-dark);
        color: var(--text-color-light);
      }

      /* Info section */
      .footer-info {
        margin-bottom: 1rem;
      }

      .info-note {
        font-size: 0.9rem;
        color: var(--text-color-light);
        margin: 0;
        text-align: center;
        font-style: italic;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .info-icon {
        font-size: 1rem;
      }

      /* Custom content */
      .footer-custom {
        margin-bottom: 1rem;
      }

      .custom-content {
        font-size: 0.9rem;
        color: var(--text-color);
        margin: 0;
        text-align: center;
      }

      /* Alerts section */
      .footer-alerts {
        margin-bottom: 1rem;
      }

      .alert-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 8px;
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

      /* Responsive */
      @media (max-width: 768px) {
        .footer {
          margin-top: 0.75rem;
          padding: 0.75rem;
        }

        .footer-compact {
          padding: 0.5rem;
          margin-top: 0.5rem;
        }

        .footer-minimal {
          padding: 0.25rem;
          margin-top: 0.25rem;
        }

        .footer-info {
          margin-bottom: 0.75rem;
        }

        .alert-item {
          padding: 0.5rem;
          font-size: 0.85rem;
        }

        .info-note {
          font-size: 0.8rem;
        }

        .custom-content {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class FooterComponent {
  // Input signals
  readonly config = input<FooterConfig>({
    showInfoNote: true,
    alerts: [],
    showBusinessHours: false,
    businessHours: { start: 8, end: 20 },
    lunchBreak: { start: 13, end: 15 },
    isWeekend: false,
    showWeekendInfo: true,
    variant: 'default',
    theme: 'light',
  });

  // Computed signals
  readonly visibleAlerts = computed(() =>
    this.config().alerts?.filter(alert => alert.show) || []
  );

  readonly hasAlerts = computed(() => this.visibleAlerts().length > 0);

  readonly showBusinessHoursInfo = computed(() =>
    this.config().showBusinessHours && this.config().businessHours !== undefined
  );

  // Helper method to format hours
  formatHour(hour: number): string {
    return hour.toString().padStart(2, '0');
  }
}
