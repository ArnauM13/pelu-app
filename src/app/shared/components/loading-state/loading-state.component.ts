import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface LoadingStateConfig {
  message?: string;
  spinnerSize?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
  fullHeight?: boolean;
  overlay?: boolean;
}

@Component({
  selector: 'pelu-loading-state',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="loading-content" [class.full-height]="config.fullHeight" [class.overlay]="config.overlay">
      <div class="loading-spinner" [class]="'spinner-' + config.spinnerSize">
        <div class="spinner"></div>
      </div>
      @if (config.showMessage !== false && config.message) {
        <p class="loading-message">{{ config.message | translate }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    .loading-content.full-height {
      min-height: 100vh;
      height: 100vh;
    }

    .loading-content.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    .loading-spinner {
      margin-bottom: 1rem;
    }

    .spinner-small .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid var(--surface-border);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-medium .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--surface-border);
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-large .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--surface-border);
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-message {
      color: var(--text-color-light);
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .loading-content {
        padding: 1.5rem 1rem;
      }

      .loading-content.full-height {
        min-height: 100vh;
        height: 100vh;
      }

      .spinner-small .spinner {
        width: 25px;
        height: 25px;
        border-width: 2px;
      }

      .spinner-medium .spinner {
        width: 35px;
        height: 35px;
        border-width: 3px;
      }

      .spinner-large .spinner {
        width: 45px;
        height: 45px;
        border-width: 3px;
      }

      .loading-message {
        font-size: 0.9rem;
      }
    }
  `]
})
export class LoadingStateComponent {
  @Input() config: LoadingStateConfig = {
    message: 'COMMON.LOADING',
    spinnerSize: 'medium',
    showMessage: true,
    fullHeight: false,
    overlay: false
  };
}
