import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { CardComponent } from '../card/card.component';
import { CalendarComponent, AppointmentEvent } from '../../../features/calendar/calendar.component';
import { AppointmentStatusBadgeComponent } from '../appointment-status-badge/appointment-status-badge.component';

export interface Appointment {
  id: string;
  nom: string;
  data: string;
  hora?: string;
  servei?: string;
  serviceName?: string;
  duration?: number;
  userId: string;
}

@Component({
  selector: 'pelu-calendar-appointments-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TooltipModule,
    CardComponent,
    CalendarComponent,
    AppointmentStatusBadgeComponent
  ],
  template: `
    <pelu-card variant="large" class="calendar-view-card">
      <div class="card-header">
        <h3>📅 {{ 'COMMON.APPOINTMENTS_CALENDAR' | translate }}</h3>
        <p class="calendar-subtitle">{{ 'COMMON.VIEW_APPOINTMENTS' | translate }}</p>
      </div>

      <div class="calendar-container">
        @defer {
          <pelu-calendar-component
            [events]="calendarEvents()"
            [mini]="false"
            (dateSelected)="onDateSelected.emit($event)">
          </pelu-calendar-component>
        } @placeholder {
          <div class="calendar-placeholder">
            <div class="loading-spinner"></div>
            <p>{{ 'COMMON.LOADING' | translate }}</p>
          </div>
        }
      </div>

      <!-- Mostra la llista de cites o el missatge d'instrucció a sota del calendari -->
      @if (selectedDate()) {
        <div class="selected-date-appointments">
          <h4>📋 {{ 'COMMON.APPOINTMENTS_FOR_DATE' | translate }} {{ formatDate(formatDateForDisplay(selectedDate()!)) }}</h4>
          @if (getAppointmentsForDate(selectedDate()!).length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📅</div>
              <h3>{{ 'COMMON.NO_SCHEDULED_APPOINTMENTS' | translate }}</h3>
              <p>{{ 'COMMON.NO_APPOINTMENTS_MESSAGE' | translate }}</p>
            </div>
          } @else {
            <div class="appointments-list">
              @for (appointment of getAppointmentsForDate(selectedDate()!); track appointment.id) {
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
        </div>
      }
    </pelu-card>
  `,
  styles: [`
    .calendar-view-card {
      margin-bottom: 1rem;
    }

    .card-header {
      margin-bottom: 1.5rem;
    }

    .card-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .calendar-subtitle {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .calendar-container {
      margin-bottom: 2rem;
    }

    .calendar-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: var(--text-color-secondary);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--surface-border);
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .selected-date-appointments {
      border-top: 1px solid var(--surface-border);
      padding-top: 1.5rem;
    }

    .selected-date-appointments h4 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-color-secondary);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }

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
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .appointment-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .appointment-item.today {
      border-color: var(--primary-color);
      background: var(--primary-color-alpha-10);
    }

    .appointment-info {
      flex: 1;
    }

    .client-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .appointment-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .detail-icon {
      font-size: 1rem;
    }

    .appointment-actions-container {
      display: flex;
      align-items: center;
      gap: 1rem;
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
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, var(--primary-color-dark) 0%, var(--primary-color) 100%);
    }

    .btn-danger {
      background: var(--gradient-error);
      color: white;
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #B91C1C 0%, var(--error-color) 100%);
    }

    @media (max-width: 768px) {
      .appointment-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .appointment-actions-container {
        width: 100%;
        justify-content: space-between;
      }

      .appointment-details {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class CalendarAppointmentsViewComponent {
  appointments = input.required<Appointment[]>();
  selectedDate = input<string | null>(null);

  onDateSelected = output<{date: string, time: string}>();
  onViewAppointment = output<Appointment>();
  onDeleteAppointment = output<Appointment>();

  calendarEvents = computed((): AppointmentEvent[] => {
    return this.appointments().map(appointment => ({
      title: appointment.nom,
      start: appointment.data + (appointment.hora ? 'T' + appointment.hora : ''),
      duration: appointment.duration || 60,
      serviceName: appointment.serviceName,
      clientName: appointment.nom
    }));
  });

  getAppointmentsForDate(date: string): Appointment[] {
    return this.appointments().filter(appointment => appointment.data === date);
  }

  isToday(date: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  }

  formatTime(time: string): string {
    return time;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ca-ES');
  }

  formatDateForDisplay(date: string): string {
    return date;
  }
}
