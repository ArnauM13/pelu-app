import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss']
})
export class FloatingButtonComponent {
  @Input() config!: FloatingButtonConfig;
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }
}
