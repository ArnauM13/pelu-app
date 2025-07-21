import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface PopularBadgeConfig {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'filled';
  showIcon?: boolean;
  showText?: boolean;
  text?: string;
}

@Component({
  selector: 'pelu-popular-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span
      class="popular-badge"
      [class]="cssClasses()"
      [title]="config.text || ('COMMON.POPULAR' | translate)">
      @if (config.showIcon !== false) {
        <span class="popular-icon">⭐</span>
      }
      @if (config.showText !== false && config.text) {
        <span class="popular-text">{{ config.text }}</span>
      }
    </span>
  `,
  styles: [`
    .popular-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 500;
      border-radius: var(--border-radius-sm, 4px);
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .popular-badge-default {
      background: var(--success-color-light, #ecfdf5);
      color: var(--success-color, #059669);
      border: 1px solid var(--success-color-light, #d1fae5);
    }

    .popular-badge-outline {
      background: transparent;
      color: var(--success-color, #059669);
      border: 1px solid var(--success-color, #059669);
    }

    .popular-badge-filled {
      background: var(--success-color, #059669);
      color: white;
      border: 1px solid var(--success-color, #059669);
    }

    .popular-badge-small {
      padding: 0.125rem 0.375rem;
      font-size: 0.75rem;
    }

    .popular-badge-medium {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }

    .popular-badge-large {
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
    }

    .popular-icon {
      font-size: 0.9em;
    }

    .popular-text {
      font-weight: 500;
    }

    .popular-badge:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
    }
  `]
})
export class PopularBadgeComponent {
  @Input() config: PopularBadgeConfig = {
    size: 'medium',
    variant: 'default',
    showIcon: true,
    showText: false
  };

  readonly cssClasses = () => {
    const { size = 'medium', variant = 'default' } = this.config;
    return `popular-badge-${size} popular-badge-${variant}`;
  };
}
