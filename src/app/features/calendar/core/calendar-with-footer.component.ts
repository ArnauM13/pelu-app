import { Component, input, output, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CalendarComponent, AppointmentEvent } from './calendar.component';
import {
  CalendarFooterComponent,
  CalendarFooterAlert,
} from '../components/calendar-footer/calendar-footer.component';
import { CalendarBusinessService } from '../services/calendar-business.service';

@Component({
  selector: 'pelu-calendar-with-footer',
  imports: [CommonModule, TranslateModule, CalendarComponent, CalendarFooterComponent],
  template: `
    <!-- Calendar Component -->
    <pelu-calendar-component
      [mini]="mini()"
      [events]="events()"
      (dateSelected)="dateSelected.emit($event)"
      (editAppointment)="editAppointment.emit($event)"
      (deleteAppointment)="deleteAppointment.emit($event)"
      (bookingsLoaded)="onBookingsLoaded($event)"
    >
    </pelu-calendar-component>

    <!-- Footer outside the calendar card - only show when calendar is loaded -->
    @if (isCalendarLoaded()) {
      <pelu-calendar-footer [alerts]="footerAlerts()"> </pelu-calendar-footer>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class CalendarWithFooterComponent {
  // Inject services
  private readonly translateService = inject(TranslateService);
  private readonly businessService = inject(CalendarBusinessService);

  // Input signals
  readonly mini = input<boolean>(false);
  readonly events = input<AppointmentEvent[]>([]);

  // Output signals
  readonly dateSelected = output<{ date: string; time: string }>();
  readonly editAppointment = output<any>();
  readonly deleteAppointment = output<any>();

  // Internal state
  private readonly calendarLoadedSignal = signal<boolean>(false);
  readonly isCalendarLoaded = computed(() => this.calendarLoadedSignal());

  // Event handlers
  onBookingsLoaded(loaded: boolean): void {
    this.calendarLoadedSignal.set(loaded);
  }

  // Footer alerts
  readonly footerAlerts = computed(() => {
    const alerts: CalendarFooterAlert[] = [];

    // Get real business configuration
    const businessConfig = this.businessService.getBusinessConfig();
    const startHour = businessConfig.hours.start;
    const endHour = businessConfig.hours.end;
    const lunchStart = businessConfig.lunchBreak.start;
    const lunchEnd = businessConfig.lunchBreak.end;

    // Add weekend info if it's weekend
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;

    if (isWeekend) {
      alerts.push({
        id: 'weekend-info',
        type: 'info',
        message: this.translateService.instant('CALENDAR.FOOTER.WEEKEND_INFO') as string,
        icon: '📅',
        show: true,
      });
    }

    // Add real business hours info
    alerts.push({
      id: 'business-hours-info',
      type: 'info',
      message: this.translateService.instant('CALENDAR.FOOTER.BUSINESS_HOURS_INFO', {
        startHour: startHour.toString().padStart(2, '0'),
        endHour: endHour.toString().padStart(2, '0'),
        lunchStart: lunchStart.toString().padStart(2, '0'),
        lunchEnd: lunchEnd.toString().padStart(2, '0'),
      }) as string,
      icon: '🕐',
      show: true,
    });

    return alerts;
  });
}
