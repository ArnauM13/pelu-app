import { Component, input, output, computed, ChangeDetectionStrategy, inject, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { AppointmentEvent } from './calendar.component';
import { CalendarPositionService } from './calendar-position.service';
import { ServiceColorsService } from '../../core/services/service-colors.service';
import { CalendarDragDropService } from './calendar-drag-drop.service';

export interface AppointmentSlotData {
  appointment: AppointmentEvent;
  date: Date;
}

@Component({
  selector: 'pelu-appointment-slot',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data()?.appointment) {
      <div class="appointment"
           cdkDrag
           [cdkDragData]="data()!.appointment"
           [style.top.px]="position().top"
           [style.height.px]="position().height"
           [style.left.px]="0"
           [style.right.px]="0"
           [ngClass]="serviceCssClass()"
           [class.dragging]="isBeingDragged()"
           (click)="onAppointmentClick($event)"
           (cdkDragStarted)="onDragStarted($event)"
           (cdkDragEnded)="onDragEnded($event)"
           (cdkDragMoved)="onDragMoved($event)">
        <div class="appointment-content">
          <div class="appointment-info">
            <div class="appointment-title" [ngClass]="serviceTextCssClass()">{{ data()!.appointment!.title }}</div>
            @if (data()!.appointment!.serviceName) {
              <div class="appointment-service" [ngClass]="serviceTextCssClass()">{{ data()!.appointment!.serviceName }}</div>
            }
          </div>
          <div class="appointment-duration" [ngClass]="serviceTextCssClass()">{{ formatDuration(data()!.appointment!.duration || 60) }}</div>
        </div>
        <div class="drag-handle" cdkDragHandle>
          <div class="drag-indicator"></div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./appointment-slot.component.scss']
})
export class AppointmentSlotComponent {
  // Input signals
  readonly data = input.required<AppointmentSlotData | null>();

  // Output signals
  readonly clicked = output<AppointmentEvent>();

  // Inject services
  private readonly positionService = inject(CalendarPositionService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly dragDropService = inject(CalendarDragDropService);
  private readonly elementRef = inject(ElementRef);

  // Local state to track drag operations
  private readonly hasDragStarted = signal<boolean>(false);

  // Computed position - this is stable and won't cause ExpressionChangedAfterItHasBeenCheckedError
  readonly position = computed(() => {
    if (!this.data() || !this.data()!.appointment) return { top: 0, height: 0 };
    return this.positionService.getAppointmentPosition(this.data()!.appointment!);
  });

  // Computed service color
  readonly serviceColor = computed(() => {
    if (!this.data() || !this.data()!.appointment) return this.serviceColorsService.getDefaultColor();
    const serviceName = this.data()!.appointment!.serviceName || '';
    return this.serviceColorsService.getServiceColor(serviceName);
  });

  // Computed service CSS class
  readonly serviceCssClass = computed(() => {
    if (!this.data() || !this.data()!.appointment) return '';
    const serviceName = this.data()!.appointment!.serviceName || '';
    return this.serviceColorsService.getServiceCssClass(serviceName);
  });

  // Computed service text CSS class
  readonly serviceTextCssClass = computed(() => {
    if (!this.data() || !this.data()!.appointment) return '';
    const serviceName = this.data()!.appointment!.serviceName || '';
    return this.serviceColorsService.getServiceTextCssClass(serviceName);
  });

  // Computed if this appointment is being dragged
  readonly isBeingDragged = computed(() => {
    if (!this.data() || !this.data()!.appointment) return false;
    const draggedAppointment = this.dragDropService.draggedAppointment();
    return draggedAppointment?.id === this.data()!.appointment!.id;
  });

  // Methods
  onAppointmentClick(event: Event) {
    event.stopPropagation();
    // Only emit click if not currently dragging and no drag has started
    if (!this.dragDropService.isDragging() && !this.hasDragStarted() && this.data() && this.data()!.appointment) {
      this.clicked.emit(this.data()!.appointment!);
    }
  }

  onDragStarted(event: any) {
    // Mark that drag has started
    this.hasDragStarted.set(true);

    const appointment = event.source.data;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const originalPosition = {
      top: rect.top,
      left: rect.left
    };

    this.dragDropService.startDrag(appointment, originalPosition);
  }

  onDragMoved(event: any) {
    const position = event.pointerPosition;
    this.dragDropService.updateDragPosition(position);
  }

  onDragEnded(event: any) {
    const success = this.dragDropService.endDrag();

    if (!success) {
      // If the drop was invalid, the appointment will return to its original position
      // The drag service already handles the reset
    }

    // Reset the drag started flag after a short delay to prevent immediate clicks
    setTimeout(() => {
      this.hasDragStarted.set(false);
    }, 100);
  }

  // Format duration for display
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}min`;
      }
    }
  }
}
