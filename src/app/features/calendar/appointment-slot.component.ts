import { Component, input, output, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentEvent } from './calendar.component';
import { CalendarPositionService } from './calendar-position.service';
import { ServiceColorsService } from '../../core/services/service-colors.service';

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
    <div class="appointment"
         [style.top.px]="position().top"
         [style.height.px]="position().height"
         [style.left.px]="0"
         [style.right.px]="0"
         [ngClass]="serviceCssClass()"
         (click)="onAppointmentClick($event)">
      <div class="appointment-content">
        <div class="appointment-info">
          <div class="appointment-title" [ngClass]="serviceTextCssClass()">{{ data().appointment.title }}</div>
          @if (data().appointment.serviceName) {
            <div class="appointment-service" [ngClass]="serviceTextCssClass()">{{ data().appointment.serviceName }}</div>
          }
        </div>
        <div class="appointment-duration" [ngClass]="serviceTextCssClass()">{{ formatDuration(data().appointment.duration || 60) }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./appointment-slot.component.scss']
})
export class AppointmentSlotComponent {
  // Input signals
  readonly data = input.required<AppointmentSlotData>();

  // Output signals
  readonly clicked = output<AppointmentEvent>();

  // Inject the position service
  private readonly positionService = inject(CalendarPositionService);
  private readonly serviceColorsService = inject(ServiceColorsService);

  // Computed position - this is stable and won't cause ExpressionChangedAfterItHasBeenCheckedError
  readonly position = computed(() => {
    return this.positionService.getAppointmentPosition(this.data().appointment);
  });

  // Computed service color
  readonly serviceColor = computed(() => {
    const serviceName = this.data().appointment.serviceName || '';
    return this.serviceColorsService.getServiceColor(serviceName);
  });

  // Computed service CSS class
  readonly serviceCssClass = computed(() => {
    const serviceName = this.data().appointment.serviceName || '';
    return this.serviceColorsService.getServiceCssClass(serviceName);
  });

  // Computed service text CSS class
  readonly serviceTextCssClass = computed(() => {
    const serviceName = this.data().appointment.serviceName || '';
    return this.serviceColorsService.getServiceTextCssClass(serviceName);
  });

  // Methods
  onAppointmentClick(event: Event) {
    event.stopPropagation();
    this.clicked.emit(this.data().appointment);
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
