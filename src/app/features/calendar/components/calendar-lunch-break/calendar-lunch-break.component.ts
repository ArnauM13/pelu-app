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
        <span>MIGDIA</span>
      </div>
    </div>
  `,
  styles: [
    `
      .lunch-break-overlay {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(255, 193, 7, 0.1);
        border: 1px dashed #ffc107;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5;
        pointer-events: none;
      }

      .lunch-break-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #856404;
        font-size: 0.8rem;
        font-weight: 500;
      }

      .lunch-break-content i {
        font-size: 1rem;
      }
    `,
  ],
})
export class CalendarLunchBreakComponent {
  readonly data = input.required<LunchBreakData>();
}
