import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentEvent } from '../../core/calendar.component';

export interface DragPreviewData {
  appointment: AppointmentEvent;
  position: {
    left: number;
    top: number;
  };
  serviceCssClass: string;
}

@Component({
  selector: 'pelu-calendar-drag-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="global-drag-preview"
         [style.left.px]="data().position.left"
         [style.top.px]="data().position.top">
      <div class="drag-preview-content"
           [ngClass]="data().serviceCssClass">
        <div class="drag-preview-title">{{ data().appointment.title }}</div>
        @if (data().appointment.serviceName) {
          <div class="drag-preview-service">{{ data().appointment.serviceName }}</div>
        }
        <div class="drag-preview-duration">{{ formatDuration(data().appointment.duration || 60) }}</div>
      </div>
    </div>
  `,
  styles: [`
    .global-drag-preview {
      position: fixed;
      pointer-events: none;
      z-index: 1000;
      transform: translate(-50%, -50%);
      opacity: 0.8;
    }

    .drag-preview-content {
      padding: 0.5rem;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      min-width: 120px;
      max-width: 200px;
      color: white;
      font-size: 0.8rem;
    }

    .drag-preview-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .drag-preview-service {
      font-size: 0.7rem;
      opacity: 0.9;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .drag-preview-duration {
      font-size: 0.7rem;
      opacity: 0.8;
    }
  `]
})
export class CalendarDragPreviewComponent {
  readonly data = input.required<DragPreviewData>();

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }
}
