import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { AppointmentStatusBadgeComponent } from '../../../../shared/components/appointment-status-badge';
import { CardComponent } from '../../../../shared/components/card/card.component';

export interface Appointment {
  id: string;
  nom: string;
  data: string;
  hora?: string;
  servei?: string;
  serviceName?: string;
  duration?: number;
  userId?: string;
}

@Component({
  selector: 'pelu-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TooltipModule,
    AppointmentStatusBadgeComponent,
    CardComponent
  ],
  template: `
    <pelu-card variant="large" style="view-transition-name: list-view">
      <div class="card-header">
        <h3>{{ 'COMMON.APPOINTMENTS_LIST' | translate }} ({{ appointments().length }})</h3>
      </div>

      @if (appointments().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>{{ 'COMMON.NO_APPOINTMENTS' | translate }}</h3>
        <p>{{ hasActiveFilters() ? ('COMMON.NO_APPOINTMENTS_FILTERED' | translate) : ('COMMON.NO_APPOINTMENTS_SCHEDULED' | translate) }}</p>
        @if (hasActiveFilters()) {
        <button class="btn btn-primary" (click)="onClearFilters.emit()">
          {{ 'COMMON.CLEAR_FILTERS' | translate }}
        </button>
        }
      </div>
      } @else {
      <div class="appointments-list">
        @for (appointment of appointments(); track appointment.id) {
        <div class="appointment-item clickable" [class.today]="isToday(appointment.data)" (click)="onViewAppointment.emit(appointment)">
          <!-- Informació de la cita (esquerra) -->
          <div class="appointment-info">
            <div class="client-info">
              <h4 class="client-name">{{ appointment.nom }}</h4>
              <div class="appointment-details">
                @if (appointment.hora) {
                <div class="detail-item">
                  <span class="detail-icon">⏰</span>
                  <span class="detail-text">{{ formatTime(appointment.hora) }}</span>
                </div>
                }
                @if (appointment.servei) {
                <div class="detail-item">
                  <span class="detail-icon">✂️</span>
                  <span class="detail-text">{{ appointment.servei }}</span>
                </div>
                }
                @if (appointment.serviceName) {
                <div class="detail-item">
                  <span class="detail-icon">✂️</span>
                  <span class="detail-text">{{ appointment.serviceName }}</span>
                </div>
                }
                @if (appointment.duration) {
                <div class="detail-item">
                  <span class="detail-icon">⏱️</span>
                  <span class="detail-text">{{ appointment.duration }} min</span>
                </div>
                }
              </div>
            </div>
          </div>

          <!-- Status i accions (dreta) -->
          <div class="appointment-actions-container">
            <div class="appointment-status">
              <pelu-appointment-status-badge
                [appointmentData]="{ date: appointment.data, time: appointment.hora }"
                [config]="{ size: 'small', variant: 'default', showIcon: false, showDot: true }">
              </pelu-appointment-status-badge>
            </div>

            <div class="appointment-actions" (click)="$event.stopPropagation()">
              <button
                class="btn btn-primary"
                (click)="onViewAppointment.emit(appointment)"
                [pTooltip]="'COMMON.CLICK_TO_VIEW' | translate"
                pTooltipPosition="left">
                👁️
              </button>
              <button
                class="btn btn-danger"
                (click)="onDeleteAppointment.emit(appointment)"
                [pTooltip]="'COMMON.DELETE_CONFIRMATION' | translate"
                pTooltipPosition="left">
                🗑️
              </button>
            </div>
          </div>
        </div>
        }
      </div>
      }
    </pelu-card>
  `,
  styles: [`
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .appointment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--surface-card);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .appointment-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .appointment-item.today {
      border-left: 4px solid var(--primary-color);
    }

    .appointment-info {
      flex: 1;
    }

    .client-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .appointment-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-icon {
      font-size: 0.875rem;
    }

    .detail-text {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .appointment-actions-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .appointment-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-600);
    }

    .btn-danger {
      background: var(--red-500);
      color: white;
    }

    .btn-danger:hover {
      background: var(--red-600);
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-color);
    }

    .empty-state p {
      margin: 0 0 1rem 0;
      color: var(--text-color-secondary);
    }
  `]
})
export class AppointmentsListComponent {
  appointments = input.required<Appointment[]>();
  hasActiveFilters = input.required<boolean>();

  onViewAppointment = output<Appointment>();
  onDeleteAppointment = output<Appointment>();
  onClearFilters = output<void>();

  isToday(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  formatTime(timeString: string): string {
    return timeString;
  }
}
