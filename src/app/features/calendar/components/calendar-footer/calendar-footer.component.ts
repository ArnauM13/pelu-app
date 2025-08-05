import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface CalendarFooterAlert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  icon: string;
  show: boolean;
}

export interface CalendarFooterConfig {
  showInfoNote?: boolean;
  infoNoteText?: string;
  alerts?: CalendarFooterAlert[];
  businessHours?: {
    start: number;
    end: number;
  };
  lunchBreak?: {
    start: number;
    end: number;
  };
  isWeekend?: boolean;
}

@Component({
  selector: 'pelu-calendar-footer',
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="calendar-footer">
      <!-- Info note just below calendar -->
      @if (config().showInfoNote !== false) {
        <div class="footer-info">
          <p class="info-note">
            📅 {{ config().infoNoteText || ('CALENDAR.FOOTER.INFO_NOTE' | translate) }}
          </p>
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
              {{ 'CALENDAR.FOOTER.BUSINESS_HOURS_INFO' | translate: {
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
      @if (config().isWeekend) {
        <div class="weekend-info">
          <div class="alert-item alert-info">
            <span class="alert-icon">📅</span>
            <span class="alert-message">
              {{ 'CALENDAR.FOOTER.WEEKEND_INFO' | translate }}
            </span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .calendar-footer {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--surface-color);
        border-radius: var(--border-radius-lg);
        border: 1px solid var(--border-color);
        box-shadow: var(--box-shadow);
      }

      .footer-info {
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
        margin-bottom: 1rem;
      }

      .business-hours-info,
      .weekend-info {
        margin-bottom: 0.5rem;
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
          padding: 0.75rem;
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
      }
    `,
  ],
})
export class CalendarFooterComponent {
  // Input signals
  readonly config = input<CalendarFooterConfig>({
    showInfoNote: true,
    alerts: [],
    businessHours: { start: 8, end: 20 },
    lunchBreak: { start: 13, end: 15 },
    isWeekend: false,
  });

  // Computed signals
  readonly visibleAlerts = computed(() =>
    this.config().alerts?.filter(alert => alert.show) || []
  );

  readonly hasAlerts = computed(() => this.visibleAlerts().length > 0);

  readonly showBusinessHoursInfo = computed(() =>
    this.config().businessHours !== undefined
  );

  // Helper method to format hours
  formatHour(hour: number): string {
    return hour.toString().padStart(2, '0');
  }
}
