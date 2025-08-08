import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface AppointmentStatusData {
  date: string;
  time?: string;
}

export type AppointmentStatusType = 'today' | 'past' | 'upcoming';

export interface AppointmentStatusConfig {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined' | 'minimal';
  showIcon?: boolean;
  showDot?: boolean;
}

@Component({
  selector: 'pelu-appointment-status-badge',
  imports: [CommonModule, TranslateModule],
  templateUrl: './appointment-status-badge.component.html',
  styleUrls: ['./appointment-status-badge.component.scss'],
})
export class AppointmentStatusBadgeComponent {
  @Input() appointmentData!: AppointmentStatusData;
  @Input() config: AppointmentStatusConfig = {
    size: 'medium',
    variant: 'default',
    showIcon: true,
    showDot: true,
  };

  readonly status = computed((): { type: AppointmentStatusType; text: string; icon: string } => {
    const { date } = this.appointmentData;
    if (!date) return { type: 'upcoming', text: 'COMMON.UPCOMING', icon: '⏰' };

    const today = new Date();
    const appointmentDate = new Date(date);

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) {
      return { type: 'today', text: 'COMMON.TIME.TODAY', icon: '🎯' };
    } else if (appointmentDate < today) {
      return { type: 'past', text: 'COMMON.TIME.PAST', icon: '📅' };
    } else {
      return { type: 'upcoming', text: 'COMMON.TIME.UPCOMING', icon: '⏰' };
    }
  });

  readonly cssClasses = computed(() => {
    const { size, variant } = this.config;
    const statusType = this.status().type;

    return {
      [`status-badge-${size}`]: true,
      [`status-badge-${variant}`]: true,
      [`status-badge-${statusType}`]: true,
    };
  });
}
