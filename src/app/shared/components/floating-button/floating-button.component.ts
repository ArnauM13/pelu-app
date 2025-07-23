import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

export interface FloatingButtonConfig {
  icon: string;
  tooltip: string;
  ariaLabel: string;
  isActive?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

@Component({
  selector: 'pelu-floating-button',
  imports: [CommonModule, TooltipModule],
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss'],
})
export class FloatingButtonComponent {
  // Input signals
  readonly config = input.required<FloatingButtonConfig>();

  // Output signals
  readonly clicked = output<void>();

  // Computed properties
  readonly buttonClasses = computed(() => {
    const config = this.config();
    return {
      'floating-button': true,
      [`floating-button--${config.variant || 'primary'}`]: true,
      [`floating-button--${config.size || 'medium'}`]: true,
      'floating-button--active': config.isActive || false,
    };
  });

  readonly buttonStyle = computed(() => {
    const config = this.config();
    return {
      '--button-icon': `"${config.icon}"`,
    };
  });

  onClick() {
    this.clicked.emit();
  }
}
