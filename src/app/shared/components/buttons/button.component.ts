import { Component, input, output, ViewEncapsulation } from '@angular/core';
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
  readonly variant = input<'outlined' | 'text'>('outlined');
  readonly size = input<'small' | 'large'>('small');
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

  // Get unique ID
  getElementId(): string {
    return this.uniqueId;
  }

  // Event handler for button click
  onButtonClick(event: Event) {
    this.clicked.emit(event);
  }
}
