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
import { UserService } from '../../../core/services/user.service';

export interface AppointmentSlotData {
  appointment: AppointmentEvent;
  date: Date;
}

@Component({
  selector: 'pelu-appointment-slot',
  standalone: true,
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
            @if (appointment.serviceName && canShowServiceName()) {
              <div class="appointment-service" [ngClass]="textCssClass()">
                {{ appointment.serviceName }}
              </div>
            }
          </div>
          @if (canShowDuration()) {
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
  private readonly userService = inject(UserService);
  private readonly elementRef = inject(ElementRef);

  // Local state for drag detection
  private readonly isDragging = signal<boolean>(false);
  private mouseDownTime = 0;
  private mouseDownPosition = { x: 0, y: 0 };
  private readonly CLICK_THRESHOLD = 300; // ms
  private readonly DRAG_THRESHOLD = 8; // pixels

  // Admin check
  readonly isAdmin = computed(() => this.userService.isAdmin());

  // Computed position
  readonly position = computed(() => {
    if (!this.data()?.appointment) return { top: 0, height: 0 };

    const appointment = this.data()!.appointment!;
    return this.calendarCoreService.calculateReactiveAppointmentPosition(appointment);
  });

  // Simplified CSS classes
  readonly appointmentCssClass = computed(() => {
    const appointment = this.data()?.appointment;
    if (!appointment) return '';

    // For non-admin users, show other people's bookings in red
    if (!this.isAdmin() && !appointment.isOwnBooking) {
      return 'other-booking-red';
    }

    // Get service color based on service name
    const serviceName = appointment.serviceName;
    if (!serviceName) return 'service-color-default';

    const service = this.findService(serviceName);
    return service ? this.servicesService.getServiceCssClass(service) : 'service-color-default';
  });

  readonly textCssClass = computed(() => {
    const appointment = this.data()?.appointment;
    if (!appointment) return '';

    // Get service text color based on service name
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

  // Simplified visibility logic
  readonly canShowServiceName = computed(() => {
    const appointment = this.data()?.appointment;
    if (!appointment) return false;

    // Admin can see service name for all appointments
    // Non-admin can only see service name for their own appointments
    return this.isAdmin() || appointment.isOwnBooking;
  });

  readonly canShowDuration = computed(() => {
    const appointment = this.data()?.appointment;
    if (!appointment) return false;

    // Admin can see duration for all appointments
    // Non-admin can only see duration for their own appointments
    return this.isAdmin() || appointment.isOwnBooking;
  });

  // Methods
  onClick(event: Event): void {
    event.stopPropagation();

    const appointment = this.data()?.appointment;
    if (!appointment?.canViewDetails || this.isDragging()) return;

    this.clicked.emit(appointment);
  }

  onSlotClick(_event: Event): void {
    // Handle slot click if needed
    // Currently unused
  }

  onMouseDown(_event: MouseEvent): void {
    if (_event.button !== 0) return;

    const appointment = this.data()?.appointment;
    if (!appointment?.canDrag) {
      // If user clicks on a non-draggable appointment, ensure any drag state is cleared
      this.mouseDownTime = 0;
      this.isDragging.set(false);
      this.calendarCoreService.cancelDrag();
      return;
    }

    _event.preventDefault();
    _event.stopPropagation();

    this.mouseDownTime = Date.now();
    this.mouseDownPosition = { x: _event.clientX, y: _event.clientY };
    this.isDragging.set(false);
  }

  onMouseMove(_event: MouseEvent): void {
    if (!this.mouseDownTime) return;

    const deltaX = Math.abs(_event.clientX - this.mouseDownPosition.x);
    const deltaY = Math.abs(_event.clientY - this.mouseDownPosition.y);

    if (deltaX > this.DRAG_THRESHOLD || deltaY > this.DRAG_THRESHOLD) {
      this.startDrag(_event);
    }
  }

  onMouseUp(_event: MouseEvent): void {
    if (!this.mouseDownTime) return;

    const clickDuration = Date.now() - this.mouseDownTime;
    if (clickDuration < this.CLICK_THRESHOLD && !this.isDragging()) {
      this.onClick(_event);
    }

    this.mouseDownTime = 0;
  }

  private startDrag(_event: MouseEvent): void {
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

    // Immediately and deterministically clear local drag state to prevent auto re-grab on hover
    this.isDragging.set(false);
    this.mouseDownTime = 0;
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
