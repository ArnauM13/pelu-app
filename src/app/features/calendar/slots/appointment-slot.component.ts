import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
  inject,
  ElementRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentEvent } from '../core/calendar.component';
import { CalendarCoreService } from '../services/calendar-core.service';
import { ServicesService } from '../../../core/services/services.service';

export interface AppointmentSlotData {
  appointment: AppointmentEvent;
  date: Date;
}

@Component({
  selector: 'pelu-appointment-slot',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data()?.appointment; as appointment) {
      <div
        class="appointment"
        [style.top.px]="position().top"
        [style.height.px]="position().height"
        [style.left.px]="0"
        [style.right.px]="0"
        [ngClass]="appointmentCssClass()"
        [class.dragging]="isBeingDragged()"
        [class.public-booking]="appointment.isPublicBooking"
        [class.no-drag]="!appointment.canDrag"
        [class.no-click]="!appointment.canViewDetails"
        (click)="onClick($event)"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp($event)"
      >
        <div class="appointment-content">
          <div class="appointment-info">
            <div class="appointment-title" [ngClass]="textCssClass()">
              {{ appointment.title }}
            </div>
            @if (appointment.serviceName && !appointment.isPublicBooking) {
              <div class="appointment-service" [ngClass]="textCssClass()">
                {{ appointment.serviceName }}
              </div>
            }
          </div>
          @if (!appointment.isPublicBooking) {
            <div class="appointment-duration" [ngClass]="textCssClass()">
              {{ formatDuration(appointment.duration || 60) }}
            </div>
          }
        </div>
        @if (appointment.canDrag) {
          <div class="drag-handle">
            <div class="drag-indicator"></div>
          </div>
        }
      </div>
    }
  `,
  styleUrls: ['./appointment-slot.component.scss'],
})
export class AppointmentSlotComponent {
  // Input signals
  readonly data = input.required<AppointmentSlotData | null>();

  // Output signals
  readonly clicked = output<AppointmentEvent>();

  // Inject services
  private readonly calendarCoreService = inject(CalendarCoreService);
  private readonly servicesService = inject(ServicesService);
  private readonly elementRef = inject(ElementRef);

  // Local state for drag detection
  private readonly isDragging = signal<boolean>(false);
  private mouseDownTime = 0;
  private mouseDownPosition = { x: 0, y: 0 };
  private readonly CLICK_THRESHOLD = 300; // ms
  private readonly DRAG_THRESHOLD = 8; // pixels

  // Computed position
  readonly position = computed(() => {
    if (!this.data()?.appointment) return { top: 0, height: 0 };

    const appointment = this.data()!.appointment!;
    const startDate = new Date(appointment.start);
    const timeString = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

    return this.calendarCoreService.calculateAppointmentPositionFromTime(
      timeString,
      appointment.duration || this.calendarCoreService.reactiveBookingDuration()
    );
  });

  // Computed CSS classes
  readonly appointmentCssClass = computed(() => {
    const appointment = this.data()?.appointment;
    if (!appointment) return '';

    if (appointment.isPublicBooking) return 'public-booking';

    const serviceName = appointment.serviceName;
    if (!serviceName) return 'service-color-default';

    const service = this.findService(serviceName);
    return service ? this.servicesService.getServiceCssClass(service) : 'service-color-default';
  });

  readonly textCssClass = computed(() => {
    const appointment = this.data()?.appointment;
    if (!appointment) return '';

    if (appointment.isPublicBooking) return 'public-booking-text';

    const serviceName = appointment.serviceName;
    if (!serviceName) return 'service-text-default';

    const service = this.findService(serviceName);
    return service ? this.servicesService.getServiceTextCssClass(service) : 'service-text-default';
  });

  readonly isBeingDragged = computed(() => {
    const appointment = this.data()?.appointment;
    if (!appointment) return false;

    const draggedAppointment = this.calendarCoreService.draggedAppointment();
    return draggedAppointment?.id === appointment.id;
  });

  // Methods
  onClick(event: Event): void {
    event.stopPropagation();

    const appointment = this.data()?.appointment;
    if (!appointment?.canViewDetails || this.isDragging()) return;

    this.clicked.emit(appointment);
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;

    const appointment = this.data()?.appointment;
    if (!appointment?.canDrag) return;

    event.preventDefault();
    event.stopPropagation();

    this.mouseDownTime = Date.now();
    this.mouseDownPosition = { x: event.clientX, y: event.clientY };
    this.isDragging.set(false);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.mouseDownTime) return;

    const deltaX = Math.abs(event.clientX - this.mouseDownPosition.x);
    const deltaY = Math.abs(event.clientY - this.mouseDownPosition.y);

    if (deltaX > this.DRAG_THRESHOLD || deltaY > this.DRAG_THRESHOLD) {
      this.startDrag(event);
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.mouseDownTime) return;

    const clickDuration = Date.now() - this.mouseDownTime;
    if (clickDuration < this.CLICK_THRESHOLD && !this.isDragging()) {
      this.onClick(event);
    }

    this.mouseDownTime = 0;
  }

  private startDrag(event: MouseEvent): void {
    const appointment = this.data()?.appointment;
    if (!appointment?.canDrag) return;

    this.isDragging.set(true);

    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const originalPosition = { top: rect.top, left: rect.left };

    this.calendarCoreService.startDrag(appointment, originalPosition, this.data()!.date);

    // Add global listeners for cross-day dragging
    document.addEventListener('mousemove', this.onGlobalMouseMove);
    document.addEventListener('mouseup', this.onGlobalMouseUp);
  }

  private onGlobalMouseMove = (event: MouseEvent): void => {
    if (this.calendarCoreService.isDragging()) {
      this.calendarCoreService.updateDragPosition({
        top: event.clientY,
        left: event.clientX,
      });
    }
  };

  private onGlobalMouseUp = async (): Promise<void> => {
    document.removeEventListener('mousemove', this.onGlobalMouseMove);
    document.removeEventListener('mouseup', this.onGlobalMouseUp);

    await this.calendarCoreService.endDrag();

    setTimeout(() => {
      this.isDragging.set(false);
    }, 100);
  };

  private findService(serviceName: string) {
    const allServices = this.servicesService.getAllServices();

    // Try exact name match first
    let service = allServices.find(s => s.name === serviceName);
    if (service) return service;

    // Try ID match
    service = allServices.find(s => s.id === serviceName);
    if (service) return service;

    // Try partial name match
    return allServices.find(s =>
      s.name.toLowerCase().includes(serviceName.toLowerCase()) ||
      serviceName.toLowerCase().includes(s.name.toLowerCase())
    );
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }
}
