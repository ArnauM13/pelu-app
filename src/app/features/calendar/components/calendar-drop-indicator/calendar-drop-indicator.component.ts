import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropIndicatorData {
  top: number;
  height: number;
  isValid: boolean;
}

@Component({
  selector: 'pelu-calendar-drop-indicator',
  imports: [CommonModule],
  template: `
    <div
      class="drop-indicator"
      [style.top.px]="data().top"
      [style.height.px]="data().height"
      [class.valid]="data().isValid"
      [class.invalid]="!data().isValid"
    ></div>
  `,
  styles: [
    `
      .drop-indicator {
        position: absolute;
        left: 0;
        right: 0;
        border: 2px dashed;
        border-radius: 4px;
        pointer-events: none;
        z-index: 15;
        transition: all 0.2s ease;
      }

      .drop-indicator.valid {
        border-color: #28a745;
        background: rgba(40, 167, 69, 0.1);
      }

      .drop-indicator.invalid {
        border-color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
      }
    `,
  ],
})
export class CalendarDropIndicatorComponent {
  readonly data = input.required<DropIndicatorData>();
}
