import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LunchBreakData {
  top: number;
  height: number;
  timeRange: {
    start: string;
    end: string;
  };
}

@Component({
  selector: 'pelu-calendar-lunch-break',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="lunch-break-overlay"
      [style.top.px]="data().top"
      [style.height.px]="data().height"
      [title]="'Migdia: ' + data().timeRange.start + ' - ' + data().timeRange.end"
    >
      <div class="lunch-break-content">
        <i class="pi pi-coffee"></i>
      </div>
    </div>
  `,
  styles: [
    `
      .lunch-break-overlay {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(255, 243, 205, 0.6);
        border: 1px solid #fdcb6e;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5;
        pointer-events: none;
        backdrop-filter: blur(0.5px);
        opacity: 0.8;
      }

      .lunch-break-overlay::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(253, 203, 110, 0.3) 2px,
          rgba(253, 203, 110, 0.3) 4px
        );
        pointer-events: none;
      }

      .lunch-break-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #856404;
        font-size: 0.75rem;
        font-weight: 600;
        background: rgba(255, 243, 205, 0.9);
        padding: 2px 6px;
        border-radius: 4px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 1;
      }

      .lunch-break-content i {
        font-size: 0.9rem;
        color: #856404;
      }
    `,
  ],
})
export class CalendarLunchBreakComponent {
  readonly data = input.required<LunchBreakData>();
}
