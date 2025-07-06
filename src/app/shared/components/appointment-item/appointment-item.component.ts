import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentEvent } from '../../../features/calendar/calendar.component';

export interface AppointmentItemData {
  appointment: AppointmentEvent;
  top: number;
  height: number;
}

@Component({
  selector: 'pelu-appointment-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-item.component.html',
  styleUrls: ['./appointment-item.component.scss']
})
export class AppointmentItemComponent {
  // Input signals
  readonly data = input.required<AppointmentItemData>();

  // Output signals
  readonly clicked = output<AppointmentEvent>();

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
