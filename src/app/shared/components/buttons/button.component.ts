import { Component, input, output, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'pelu-button',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent {
  // Component inputs
  readonly label = input<string>('');
  readonly icon = input<string>('');
  readonly iconPos = input<'left' | 'right' | 'top' | 'bottom'>('left');
  readonly severity = input<'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'>('primary');
  readonly variant = input<'outlined' | 'text' | undefined>(undefined);
  readonly size = input<'small' | 'large' | 'mini' | 'micro' | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly raised = input<boolean>(false);
  readonly rounded = input<boolean>(false);
  readonly link = input<boolean>(false);
  readonly fluid = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly class = input<string>('');
  readonly ariaLabel = input<string>('');

  // Unique ID generated once
  private readonly uniqueId = 'pelu-button-' + Math.random().toString(36).substr(2, 9);

  // Outputs
  readonly clicked = output<Event>();

  // Computed property for CSS classes
  readonly buttonClasses = computed(() => {
    const classes = [this.class()];
    if (this.size() === 'mini') {
      classes.push('p-button-mini');
    }
    if (this.size() === 'micro') {
      classes.push('p-button-micro');
    }
    return classes.filter(Boolean).join(' ');
  });

  // Computed property for PrimeNG size (exclude mini and micro)
  readonly primeNgSize = computed(() => {
    const currentSize = this.size();
    if (currentSize === 'mini' || currentSize === 'micro') {
      return undefined; // Don't pass custom sizes to PrimeNG
    }
    return currentSize;
  });

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for button click
  onButtonClick(event: Event) {
    this.clicked.emit(event);
  }
}
