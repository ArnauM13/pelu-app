import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AppointmentStatusBadgeComponent } from '../../../../shared/components/appointment-status-badge';
import { format } from 'date-fns';

export interface Appointment {
  id: string;
  nom: string;
  data: string;
  hora?: string;
  duration?: number;
  serviceName?: string;
  userId?: string;
  notes?: string;
  preu?: number;
}

@Component({
  selector: 'pelu-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    TooltipModule,
    AppointmentStatusBadgeComponent
  ],
  template: `
    <div class="appointments-list">
      <div class="list-header">
        <h3>{{ 'APPOINTMENTS.LIST_TITLE' | translate }}</h3>
        <span class="appointment-count">
          {{ appointments().length }} {{ 'APPOINTMENTS.COUNT' | translate }}
        </span>
      </div>

      <div class="appointments-container">
        <div
          *ngFor="let appointment of appointments()"
          class="appointment-item"
          [class.today]="isToday(appointment.data)"
          [class.past]="isPast(appointment.data)"
          (click)="onAppointmentClick.emit(appointment)"
          [pTooltip]="getAppointmentTooltip(appointment)"
          tooltipPosition="top">

          <div class="appointment-header">
            <div class="client-name">{{ appointment.nom }}</div>
            <pelu-appointment-status-badge
              [appointmentData]="{ date: appointment.data, time: appointment.hora }">
            </pelu-appointment-status-badge>
          </div>

          <div class="appointment-details">
            <div class="appointment-date">
              <span class="icon">📅</span>
              {{ formatDate(appointment.data) }}
            </div>

            <div class="appointment-time" *ngIf="appointment.hora">
              <span class="icon">⏰</span>
              {{ formatTime(appointment.hora) }}
            </div>

            <div class="appointment-service" *ngIf="appointment.serviceName">
              <span class="icon">✂️</span>
              {{ appointment.serviceName }}
            </div>

            <div class="appointment-duration" *ngIf="appointment.duration">
              <span class="icon">⏱️</span>
              {{ appointment.duration }} {{ 'APPOINTMENTS.MINUTES' | translate }}
            </div>
          </div>

          <div class="appointment-actions">
            <button
              (click)="onViewClick.emit(appointment); $event.stopPropagation()"
              class="action-button view-button"
              type="button"
              [pTooltip]="'COMMON.VIEW' | translate">
              👁️
            </button>

            <button
              (click)="onEditClick.emit(appointment); $event.stopPropagation()"
              class="action-button edit-button"
              type="button"
              [pTooltip]="'COMMON.EDIT' | translate">
              ✏️
            </button>

            <button
              (click)="onDeleteClick.emit(appointment); $event.stopPropagation()"
              class="action-button delete-button"
              type="button"
              [pTooltip]="'COMMON.DELETE' | translate">
              🗑️
            </button>
          </div>
        </div>

        <div *ngIf="appointments().length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <div class="empty-title">{{ 'APPOINTMENTS.NO_APPOINTMENTS' | translate }}</div>
          <div class="empty-message">{{ 'APPOINTMENTS.NO_APPOINTMENTS_MESSAGE' | translate }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .appointments-list {
      width: 100%;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0 0.5rem;
    }

    .list-header h3 {
      margin: 0;
      color: var(--text-color);
    }

    .appointment-count {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .appointments-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .appointment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .appointment-item:hover {
      background: var(--surface-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .appointment-item.today {
      border-left: 4px solid var(--primary-color);
      background: var(--primary-50);
    }

    .appointment-item.past {
      opacity: 0.7;
      background: var(--surface-ground);
    }

    .appointment-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .client-name {
      font-weight: 600;
      color: var(--text-color);
      font-size: 1.1rem;
    }

    .appointment-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 2;
      margin: 0 1rem;
    }

    .appointment-date,
    .appointment-time,
    .appointment-service,
    .appointment-duration {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .icon {
      font-size: 1rem;
    }

    .appointment-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-button {
      padding: 0.5rem;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1.2rem;
    }

    .action-button:hover {
      background: var(--surface-hover);
    }

    .view-button:hover {
      color: var(--primary-color);
    }

    .edit-button:hover {
      color: var(--warning-color);
    }

    .delete-button:hover {
      color: var(--danger-color);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-color-secondary);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .empty-message {
      font-size: 0.875rem;
    }
  `]
})
export class AppointmentsListComponent {
  // Inputs
  readonly appointments = input.required<Appointment[]>();

  // Outputs
  readonly onAppointmentClick = output<Appointment>();
  readonly onViewClick = output<Appointment>();
  readonly onEditClick = output<Appointment>();
  readonly onDeleteClick = output<Appointment>();

  // Utility methods
  formatDate(dateString: string): string {
    return format(new Date(dateString), 'EEEE, d MMMM yyyy', { locale: require('date-fns/locale/ca') });
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  isToday(dateString: string): boolean {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dateString === today;
  }

  isPast(dateString: string): boolean {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    return appointmentDate < today;
  }

  getAppointmentTooltip(appointment: Appointment): string {
    const date = this.formatDate(appointment.data);
    const time = appointment.hora ? this.formatTime(appointment.hora) : '';
    const service = appointment.serviceName || '';

    return `${date}${time ? ` - ${time}` : ''}${service ? ` - ${service}` : ''}`;
  }
}
