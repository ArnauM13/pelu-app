import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface NotFoundStateConfig {
  icon: string;
  title: string;
  message: string;
  buttonText?: string;
  showButton?: boolean;
}

@Component({
    selector: 'pelu-not-found-state',
    imports: [CommonModule, TranslateModule],
    template: `
    <div class="not-found-content">
      <div class="not-found-icon">{{ config.icon }}</div>
      <h2>{{ config.title | translate }}</h2>
      <p>{{ config.message | translate }}</p>
      @if (config.showButton !== false && config.buttonText) {
        <button class="not-found-btn" (click)="onButtonClick.emit()">
          {{ config.buttonText | translate }}
        </button>
      }
    </div>
  `,
    styles: [`
    .not-found-content {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
    }

    .not-found-icon {
      font-size: 6rem;
      margin-bottom: 2rem;
      opacity: 0.6;
      animation: float 3s ease-in-out infinite;
      display: block;
      font-style: normal;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .not-found-content h2 {
      margin: 0 0 1rem 0;
      color: var(--text-color);
      font-size: 2rem;
      font-weight: 600;
    }

    .not-found-content p {
      margin: 0 0 2rem 0;
      color: var(--text-color-light);
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .not-found-btn {
      background: var(--gradient-primary);
      color: var(--text-color-white);
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: var(--box-shadow);

      &:hover {
        background: linear-gradient(135deg, var(--primary-color-dark) 0%, var(--primary-color) 100%);
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-hover);
      }
    }

    @media (max-width: 768px) {
      .not-found-content {
        padding: 1.5rem 1rem;
      }

      .not-found-icon {
        font-size: 4rem;
      }

      .not-found-content h2 {
        font-size: 1.5rem;
      }

      .not-found-content p {
        font-size: 1rem;
      }
    }
  `]
})
export class NotFoundStateComponent {
  @Input() config!: NotFoundStateConfig;
  @Output() onButtonClick = new EventEmitter<void>();
}
