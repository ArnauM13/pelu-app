import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { ca } from 'date-fns/locale';

import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AppointmentEvent } from '../../../features/calendar/core/calendar.component';
import { CalendarComponent } from '../../../features/calendar/core/calendar.component';
import { FooterComponent, FooterConfig } from '../../../shared/components/footer/footer.component';
import { FiltersInlineComponent } from '../../../shared/components/filters-inline/filters-inline.component';
import {
  AppointmentsStatsComponent,
  AppointmentStats,
} from '../components/appointments-stats/appointments-stats.component';
import { AppointmentsListComponent } from '../components/appointments-list/appointments-list.component';
import { AppointmentsViewControlsComponent } from '../components/appointments-view-controls/appointments-view-controls.component';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ActionContext } from '../../../core/services/actions.service';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { ToastService } from '../../../shared/services/toast.service';
import { BookingService, Booking } from '../../../core/services/booking.service';
import { ToastConfig } from '../../../shared/components/toast/toast.component';
import { BusinessSettingsService } from '../../../core/services/business-settings.service';

interface FilterState {
  date: string;
  client: string;
  service: string;
  quickFilter: 'all' | 'today' | 'upcoming' | 'mine';
}

interface ViewState {
  mode: 'list' | 'calendar';
  selectedDate: Date | null;
}

@Component({
  selector: 'pelu-appointments-page',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TooltipModule,
    TranslateModule,
    DatePickerModule,
    CalendarComponent,
    FooterComponent,
    CardComponent,
    FiltersInlineComponent,
    AppointmentsStatsComponent,
    AppointmentsListComponent,
    AppointmentsViewControlsComponent,
    NextAppointmentComponent,
    LoadingStateComponent,
  ],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss'],
})
export class AppointmentsPageComponent {
  // Inject services
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly appointmentService = inject(BookingService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly businessSettingsService = inject(BusinessSettingsService);

  // Core data
  readonly appointments = this.appointmentService.bookings;
  readonly loading = computed(() => this.appointmentService.isLoading());

  // State signals
  private readonly filterStateSignal = signal<FilterState>({
    date: '',
    client: '',
    service: '',
    quickFilter: 'all',
  });

  private readonly viewStateSignal = signal<ViewState>({
    mode: 'list',
    selectedDate: null,
  });

  // Public computed signals
  readonly filterState = computed(() => this.filterStateSignal());
  readonly viewState = computed(() => this.viewStateSignal());
  readonly viewMode = computed(() => this.viewState().mode);
  readonly selectedDate = computed(() => this.viewState().selectedDate);

  // Filter signals
  readonly filterDate = computed(() => this.filterState().date);
  readonly filterClient = computed(() => this.filterState().client);
  readonly filterService = computed(() => this.filterState().service);
  readonly quickFilter = computed(() => this.filterState().quickFilter);

  // View buttons
  readonly viewButtons = computed(() => [
    {
      icon: '📋',
      tooltip: 'COMMON.LIST_VIEW',
      ariaLabel: 'COMMON.LIST_VIEW_LABEL',
      isActive: this.viewMode() === 'list',
      variant: 'primary' as const,
      size: 'large' as const,
    },
    {
      icon: '📅',
      tooltip: 'COMMON.CALENDAR_VIEW',
      ariaLabel: 'COMMON.CALENDAR_VIEW_LABEL',
      isActive: this.viewMode() === 'calendar',
      variant: 'primary' as const,
      size: 'large' as const,
    },
  ]);

  // Filtered appointments
  readonly filteredAppointments = computed(() => {
    let appointments = this.appointments();
    appointments = this.applyQuickFilter(appointments);
    appointments = this.applyDateFilter(appointments);
    appointments = this.applyClientFilter(appointments);
    appointments = this.applyServiceFilter(appointments);
    return this.sortAppointmentsByDateTime(appointments);
  });

  // Calendar events
  readonly calendarEvents = computed((): AppointmentEvent[] => {
    return this.appointments().map(appointment => ({
      id: appointment.id || '',
      title: appointment.nom || 'Appointment',
      start: (appointment.data || '') + 'T' + (appointment.hora || '00:00'),
      duration: appointment.duration || 60,
      serviceName: appointment.serviceName || appointment.servei || '',
      clientName: appointment.nom || 'Client',
      isPublicBooking: false,
      isOwnBooking: true,
      canDrag: true,
      canViewDetails: true,
    }));
  });

  // Calendar footer configuration
  readonly calendarFooterConfig = computed((): FooterConfig => {
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const businessHours = this.businessSettingsService.getBusinessHours();
    const lunchBreak = this.businessSettingsService.getLunchBreakNumeric();

    return {
      showInfoNote: false, // Disabled since info note is now in header
      showBusinessHours: true,
      businessHours: {
        start: businessHours.start,
        end: businessHours.end
      },
      lunchBreak: {
        start: lunchBreak.start,
        end: lunchBreak.end
      },
      isWeekend: isWeekend,
      showWeekendInfo: true,
      variant: 'default',
      theme: 'light',
    };
  });

  // Appointment statistics
  readonly appointmentStats = computed((): AppointmentStats => {
    const appointments = this.appointments();
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentUserId = this.getCurrentUserId();

    return {
      total: appointments.length,
      today: appointments.filter(app => app.data === today).length,
      upcoming: appointments.filter(app => {
        if (!app.data) return false;
        const appointmentDate = parseISO(app.data);
        return isFuture(appointmentDate);
      }).length,
      mine: appointments.filter(app => app.uid === currentUserId).length,
    };
  });

  // Check if there are active filters
  readonly hasActiveFilters = computed(() => {
    const state = this.filterState();
    return state.date !== '' || state.client !== '' || state.service !== '' || state.quickFilter !== 'all';
  });

  // Filter methods
  private applyQuickFilter(appointments: Booking[]): Booking[] {
    switch (this.quickFilter()) {
      case 'today': {
        const today = format(new Date(), 'yyyy-MM-dd');
        return appointments.filter(appointment => appointment.data === today);
      }
      case 'upcoming': {
        return appointments.filter(appointment => {
          if (!appointment.data) return false;
          const appointmentDate = parseISO(appointment.data);
          return isFuture(appointmentDate);
        });
      }
      case 'mine': {
        const currentUserId = this.getCurrentUserId();
        return appointments.filter(appointment => appointment.uid === currentUserId);
      }
      default:
        return appointments;
    }
  }

  private applyDateFilter(appointments: Booking[]): Booking[] {
    const filterDate = this.filterDate();
    if (!filterDate) return appointments;
    return appointments.filter(appointment => appointment.data === filterDate);
  }

  private applyClientFilter(appointments: Booking[]): Booking[] {
    const filterClient = this.filterClient();
    if (!filterClient) return appointments;
    const searchTerm = filterClient.toLowerCase();
    return appointments.filter(appointment =>
      (appointment.nom || '').toLowerCase().includes(searchTerm)
    );
  }

  private applyServiceFilter(appointments: Booking[]): Booking[] {
    const filterService = this.filterService();
    if (!filterService) return appointments;
    return appointments.filter(appointment => appointment.data === filterService);
  }

  private sortAppointmentsByDateTime(appointments: Booking[]): Booking[] {
    return appointments.sort((a, b) => {
      const createLocalDateTime = (dateStr: string, timeStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hour, minute] = timeStr.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute);
      };

      const dateTimeA = createLocalDateTime(a.data || '', a.hora || '00:00');
      const dateTimeB = createLocalDateTime(b.data || '', b.hora || '00:00');
      return dateTimeB.getTime() - dateTimeA.getTime();
    });
  }

  // Action methods
  readonly setFilterDate = (value: string) => {
    this.filterStateSignal.update(state => ({ ...state, date: value }));
  };

  readonly setFilterClient = (value: string) => {
    this.filterStateSignal.update(state => ({ ...state, client: value }));
  };

  readonly setFilterService = (value: string) => {
    this.filterStateSignal.update(state => ({ ...state, service: value }));
  };

  readonly setQuickFilter = (filter: 'all' | 'today' | 'upcoming' | 'mine') => {
    this.filterStateSignal.update(state => ({ ...state, quickFilter: filter }));
  };

  readonly setViewMode = (mode: 'list' | 'calendar') => {
    this.viewStateSignal.update(state => ({ ...state, mode }));
  };

  readonly clearAllFilters = () => {
    this.filterStateSignal.set({
      date: '',
      client: '',
      service: '',
      quickFilter: 'all',
    });
  };

  // Appointment actions
  async deleteAppointment(appointment: AppointmentEvent): Promise<void> {
    try {
      const originalBooking = this.findOriginalBooking(appointment);
      if (originalBooking) {
        await this.appointmentService.deleteBooking(originalBooking.id || '');
        this.toastService.showAppointmentDeleted(originalBooking.nom || '');
      }
      window.dispatchEvent(new CustomEvent('appointmentDeleted'));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      this.toastService.showError('Error', 'No s\'ha pogut eliminar la cita');
    }
  }

  editAppointment(appointment: AppointmentEvent): void {
    const originalBooking = this.findOriginalBooking(appointment);
    if (originalBooking) {
      this.router.navigate(['/appointments', originalBooking.id, 'edit']);
    }
  }

  private findOriginalBooking(appointmentEvent: AppointmentEvent): Booking | null {
    return this.appointments().find(booking =>
      booking.id === appointmentEvent.id ||
      (booking.data + 'T' + (booking.hora || '00:00')) === appointmentEvent.start
    ) || null;
  }

  // Utility methods
  formatDate(dateString: string): string {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE, d MMMM yyyy', { locale: ca });
    } catch {
      return dateString;
    }
  }

  formatTime(timeString: string): string {
    return timeString || '--:--';
  }

  isToday(dateString: string | undefined): boolean {
    if (!dateString) return false;
    try {
      const date = parseISO(dateString);
      return isToday(date);
    } catch {
      return false;
    }
  }

  isPast(dateString: string): boolean {
    try {
      const date = parseISO(dateString);
      return !isFuture(date);
    } catch {
      return false;
    }
  }

  onDateSelect(event: { date: Date }): void {
    if (event && event.date) {
      const formattedDate = format(event.date, 'yyyy-MM-dd');
      this.setFilterDate(formattedDate);
    }
  }

  getEventColor(dateString: string): string {
    if (this.isToday(dateString)) {
      return this.serviceColorsService.getTodayColor();
    }
    if (this.isPast(dateString)) {
      return this.serviceColorsService.getPastColor();
    }
    return this.serviceColorsService.getFutureColor();
  }

  getAppointmentsForDate(date: Date): Booking[] {
    const dateString = format(date, 'yyyy-MM-dd');
    const appointmentsForDate = this.appointments().filter(appointment => appointment.data === dateString);
    return this.sortAppointmentsByDateTime(appointmentsForDate);
  }

  formatDateForDisplay(date: Date): string {
    return format(date, 'EEEE, d MMMM', { locale: ca });
  }

  private getCurrentUserId(): string {
    return this.authService.user()?.uid || '';
  }

  showToast(config: ToastConfig) {
    this.toastService.showToast(config);
  }

  onToastClick(event: { message?: { data?: { appointmentId?: string } } }) {
    if (event.message?.data?.appointmentId) {
      this.viewAppointmentDetail(event.message.data.appointmentId);
    }
  }

  viewAppointmentDetail(appointmentOrId: string | Booking) {
    let appointmentId: string;

    if (typeof appointmentOrId === 'string') {
      appointmentId = appointmentOrId;
    } else {
      appointmentId = appointmentOrId.id || '';
    }

    this.router.navigate(['/appointments', appointmentId]);
  }

  getActionContext(appointment: Booking): ActionContext {
    return {
      type: 'appointment',
      item: appointment,
      permissions: {
        canEdit: true,
        canDelete: true,
        canView: true,
      },
    };
  }

  get loadingConfig() {
    return {
      message: 'CARGANT.CITAS',
      showSpinner: true,
      overlay: false,
    };
  }
}
