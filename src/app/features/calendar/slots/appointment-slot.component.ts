import { Component, input, output, computed, ChangeDetectionStrategy, inject, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentEvent } from '../core/calendar.component';
import { CalendarCoreService } from '../services/calendar-core.service';
import { ServiceColorsService } from '../../../core/services/service-colors.service';

export interface AppointmentSlotData {
  appointment: AppointmentEvent;
  date: Date;
}

@Component({
    selector: 'pelu-appointment-slot',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    @if (data()?.appointment) {
      <div class="appointment"
           [style.top.px]="position().top"
           [style.height.px]="position().height"
           [style.left.px]="0"
           [style.right.px]="0"
           [ngClass]="appointmentCssClass()"
           [class.dragging]="isBeingDragged()"
           [class.public-booking]="data()!.appointment!.isPublicBooking"
           [class.no-drag]="!data()!.appointment!.canDrag"
           (mousedown)="onMouseDown($event)"
           (mousemove)="onMouseMove($event)"
           (mouseup)="onMouseUp($event)"
           (mouseenter)="onMouseEnter($event)"
           (mouseleave)="onMouseLeave($event)">
        <div class="appointment-content">
          <div class="appointment-info">
            <div class="appointment-title" [ngClass]="textCssClass()">{{ data()!.appointment!.title }}</div>
            @if (data()!.appointment!.serviceName && !data()!.appointment!.isPublicBooking) {
              <div class="appointment-service" [ngClass]="textCssClass()">{{ data()!.appointment!.serviceName }}</div>
            }
          </div>
          @if (!data()!.appointment!.isPublicBooking) {
            <div class="appointment-duration" [ngClass]="textCssClass()">{{ formatDuration(data()!.appointment!.duration || 60) }}</div>
          }
        </div>
        @if (data()!.appointment!.canDrag) {
          <div class="drag-handle">
            <div class="drag-indicator"></div>
          </div>
        }
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
  private readonly calendarCoreService = inject(CalendarCoreService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly elementRef = inject(ElementRef);

  // Local state to track drag operations
  private readonly hasDragStarted = signal<boolean>(false);
  private readonly isMouseOver = signal<boolean>(false);

  // Click vs drag detection
  private clickTimeout: number | null = null;
  private mouseDownTime = 0;
  private mouseDownPosition = { x: 0, y: 0 };
  private readonly CLICK_THRESHOLD = 300; // ms - increased for better click detection
  private readonly DRAG_THRESHOLD = 8; // pixels - increased to prevent accidental drags
  private isDragging = false;

  // Computed position - this is stable and won't cause ExpressionChangedAfterItHasBeenCheckedError
  readonly position = computed(() => {
    if (!this.data() || !this.data()!.appointment) return { top: 0, height: 0 };
    return this.calendarCoreService.calculateAppointmentPosition(this.data()!.appointment!);
  });

  // Computed service color
  readonly serviceColor = computed(() => {
    if (!this.data() || !this.data()!.appointment) return this.serviceColorsService.getDefaultColor();
    const serviceName = this.data()!.appointment!.serviceName || '';
    return this.serviceColorsService.getServiceColor(serviceName);
  });

  // Computed appointment CSS class
  readonly appointmentCssClass = computed(() => {
    if (!this.data() || !this.data()!.appointment) return '';

    // If it's a public booking, use red styling
    if (this.data()!.appointment!.isPublicBooking) {
      return 'public-booking';
    }

    // Otherwise use service color
    const serviceName = this.data()!.appointment!.serviceName || '';
    return this.serviceColorsService.getServiceCssClass(serviceName);
  });

  // Computed text CSS class
  readonly textCssClass = computed(() => {
    if (!this.data() || !this.data()!.appointment) return '';

    // If it's a public booking, use red text
    if (this.data()!.appointment!.isPublicBooking) {
      return 'public-booking-text';
    }

    // Otherwise use service text color
    const serviceName = this.data()!.appointment!.serviceName || '';
    return this.serviceColorsService.getServiceTextCssClass(serviceName);
  });

  // Computed if this appointment is being dragged
  readonly isBeingDragged = computed(() => {
    if (!this.data() || !this.data()!.appointment) return false;
    const draggedAppointment = this.calendarCoreService.draggedAppointment();
    return draggedAppointment?.id === this.data()!.appointment!.id;
  });

  // Methods
  onAppointmentClick(event: Event) {
    event.stopPropagation();

    // Only emit click if not currently dragging and no drag has started
    // and if the appointment can be viewed
    if (!this.calendarCoreService.isDragging() && !this.hasDragStarted() && !this.isDragging &&
        this.data() && this.data()!.appointment && this.data()!.appointment!.canViewDetails) {
      this.clicked.emit(this.data()!.appointment!);
    }
  }

  onMouseDown(event: MouseEvent) {
    // Only start drag on left mouse button
    if (event.button !== 0) return;

    console.log('Mouse down on appointment:', this.data()?.appointment);
    console.log('Can drag:', this.data()?.appointment?.canDrag);

    // Check if this appointment can be dragged
    if (!this.data()?.appointment?.canDrag) {
      // If it can't be dragged, just handle as click
      this.onAppointmentClick(event);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Record mouse down time and position
    this.mouseDownTime = Date.now();
    this.mouseDownPosition = { x: event.clientX, y: event.clientY };
    this.isDragging = false;

    // Set a timeout for click detection
    this.clickTimeout = window.setTimeout(() => {
      // If we reach this timeout, it's likely a drag operation
      this.startDrag(event);
    }, this.CLICK_THRESHOLD);
  }

  onMouseMove(event: MouseEvent) {
    if (this.clickTimeout && !this.isDragging) {
      // Check if mouse has moved enough to be considered a drag
      const deltaX = Math.abs(event.clientX - this.mouseDownPosition.x);
      const deltaY = Math.abs(event.clientY - this.mouseDownPosition.y);

      if (deltaX > this.DRAG_THRESHOLD || deltaY > this.DRAG_THRESHOLD) {
        // Clear the click timeout and start drag
        if (this.clickTimeout) {
          clearTimeout(this.clickTimeout);
          this.clickTimeout = null;
        }
        this.startDrag(event);
      }
    }
  }

  onMouseUp(event: MouseEvent) {
    // Clear the click timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;

      // Check if it was a quick click (not a drag)
      const clickDuration = Date.now() - this.mouseDownTime;
      if (clickDuration < this.CLICK_THRESHOLD && !this.isDragging && !this.hasDragStarted()) {
        // It was a click, emit the click event
        this.onAppointmentClick(event);
      }
    }
  }

  private startDrag(event: MouseEvent) {
    // Mark that drag has started
    this.isDragging = true;
    this.hasDragStarted.set(true);

    const appointment = this.data()!.appointment!;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const originalPosition = {
      top: rect.top,
      left: rect.left
    };

    // Pass the original date for cross-day dragging support
    this.calendarCoreService.startDrag(appointment, originalPosition, this.data()!.date);

    // Add global mouse event listeners for cross-day dragging
    document.addEventListener('mousemove', this.onGlobalMouseMove);
    document.addEventListener('mouseup', this.onGlobalMouseUp);
  }

  onMouseEnter(event: MouseEvent) {
    this.isMouseOver.set(true);
  }

  onMouseLeave(event: MouseEvent) {
    this.isMouseOver.set(false);
  }

  private onGlobalMouseMove = (event: MouseEvent) => {
    if (this.calendarCoreService.isDragging()) {
      this.calendarCoreService.updateDragPosition({
        top: event.clientY,
        left: event.clientX
      });
    }
  };

  private onGlobalMouseUp = async (event: MouseEvent) => {
    // Remove global event listeners
    document.removeEventListener('mousemove', this.onGlobalMouseMove);
    document.removeEventListener('mouseup', this.onGlobalMouseUp);

    const success = await this.calendarCoreService.endDrag();

    if (!success) {
      // If the drop was invalid, the appointment will return to its original position
      // The drag service already handles the reset
    }

    // Reset the drag started flag after a short delay to prevent immediate clicks
    setTimeout(() => {
      this.hasDragStarted.set(false);
      this.isDragging = false;
    }, 100);
  };

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
