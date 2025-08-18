import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'pelu-no-appointments-message',
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="no-appointments-card" [ngClass]="type()">
      <div class="message-header">
        <div class="header-icon" [style.background]="iconColor()">{{ icon() }}</div>
        <div class="header-content">
          <h3 class="title">{{ title() | translate }}</h3>
          <p class="subtitle">{{ subtitle() | translate }}</p>
        </div>
      </div>

      <div class="message-content">
        <p class="message-text">{{ message() | translate }}</p>
        
        @if (actionText() && actionCallback()) {
          <div class="message-actions">
            <button class="btn btn-primary" (click)="actionCallback()!()">
              {{ actionText() | translate }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .no-appointments-card {
        background: var(--surface-color);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: var(--box-shadow);
        border: 2px solid var(--border-color);
        transition: all 0.3s ease;
      }

      .no-appointments-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-hover);
      }

      .no-appointments-card.warning {
        border-color: #f59e0b;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      }

      .no-appointments-card.info {
        border-color: #3b82f6;
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      }

      .message-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .header-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .header-content {
        flex: 1;
      }

      .title {
        margin: 0 0 0.25rem 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-color);
      }

      .subtitle {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-color-light);
      }

      .message-content {
        margin-bottom: 1rem;
      }

      .message-text {
        font-size: 1rem;
        color: var(--text-color);
        line-height: 1.5;
      }

      .message-actions {
        display: flex;
        justify-content: flex-end;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-primary {
        background: var(--gradient-primary);
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .btn-primary:hover {
        background: linear-gradient(
          135deg,
          var(--primary-color-dark) 0%,
          var(--primary-color) 100%
        );
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      /* Mobile styles */
      @media (max-width: 768px) {
        .no-appointments-card {
          padding: 1rem;
          border-radius: 12px;
        }

        .message-header {
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .header-icon {
          width: 35px;
          height: 35px;
          font-size: 1rem;
        }

        .title {
          font-size: 1rem;
          margin-bottom: 0.125rem;
        }

        .subtitle {
          font-size: 0.75rem;
        }

        .message-text {
          font-size: 0.875rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          gap: 0.375rem;
        }

        .message-actions {
          justify-content: center;
        }
      }

      /* Extra small mobile styles */
      @media (max-width: 480px) {
        .no-appointments-card {
          padding: 1rem;
        }

        .message-header {
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .header-icon {
          width: 30px;
          height: 30px;
          font-size: 0.875rem;
        }

        .title {
          font-size: 0.875rem;
        }

        .subtitle {
          font-size: 0.7rem;
        }

        .message-text {
          font-size: 0.8rem;
        }

        .btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class NoAppointmentsMessageComponent {
  readonly type = input<'warning' | 'info'>('warning');
  readonly icon = input<string>('⚠️');
  readonly iconColor = input<string>('#f59e0b');
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly message = input.required<string>();
  readonly actionText = input<string>('');
  readonly actionCallback = input<(() => void) | undefined>(undefined);
}
