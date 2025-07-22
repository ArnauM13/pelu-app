import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pelu-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  // Input signals
  readonly variant = input<'default' | 'compact' | 'large' | 'no-margin'>('default');

  // Computed CSS classes
  readonly cardClasses = computed(() => {
    const variant = this.variant();
    const classes: { [key: string]: boolean } = {
      'pelu-card': true
    };

    // Add variant-specific class
    if (variant !== 'default') {
      classes[variant] = true;
    }

    return classes;
  });
}
