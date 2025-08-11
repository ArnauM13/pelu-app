import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '../../../features/calendar/core/calendar.component';
import { FooterConfig } from '../../../shared/components/footer/footer.component';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AppointmentsListComponent } from '../../appointments/components/appointments-list/appointments-list.component';
import { AppointmentsStatsComponent } from '../../appointments/components/appointments-stats/appointments-stats.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { FiltersInlineComponent } from '../../../shared/components/filters-inline/filters-inline.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { ca } from 'date-fns/locale';

import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ActionContext } from '../../../core/services/actions.service';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import { ToastConfig } from '../../../shared/components/toast/toast.component';
import { AppointmentEvent } from '../../../features/calendar/core/calendar.component';

interface FilterState {
  date: Date | null;
  status: string | null;
  service: string | null;
  client: string | null;
}

interface AppointmentStats {
  total: number;
  today: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  mine: number;
}

@Component({
  selector: 'pelu-appointments-page',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TooltipModule,
    DatePickerModule,
    TranslateModule,
    CalendarComponent,
    AppointmentsListComponent,
    AppointmentsStatsComponent,
    LoadingStateComponent,
    CardComponent,
    NextAppointmentComponent,
    FiltersInlineComponent,
  ],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss'],
})
export class AppointmentsPageComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly appointmentService = inject(BookingService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);

  // Core data
  readonly appointments = this.appointmentService.bookings;
  readonly loading = computed(() => this.appointmentService.isLoading());

  // Filter state
  private readonly filterStateSignal = signal<FilterState>({
    date: null,
    status: null,
    service: null,
    client: null,
  });

  // View state
  private readonly viewStateSignal = signal({
    mode: 'list' as 'list' | 'calendar',
    selectedDate: null as Date | null,
  });

  // Computed properties
  readonly filterState = computed(() => this.filterStateSignal());
  readonly viewState = computed(() => this.viewStateSignal());
  readonly viewMode = computed(() => this.viewState().mode);
  readonly selectedDate = computed(() => this.viewState().selectedDate);

  // Filter signals for template
  readonly filterDate = computed(() => this.filterState().date?.toISOString().split('T')[0] || '');
  readonly filterClient = computed(() => this.filterState().client || '');
  readonly filterService = computed(() => this.filterState().service || '');

  readonly filterStatus = computed(() => this.filterState().status || '');

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
    appointments = this.applyDateFilter(appointments);
    appointments = this.applyStatusFilter(appointments);
    appointments = this.applyServiceFilter(appointments);
    return this.sortAppointmentsByDateTime(appointments);
  });

  // Role helpers
  readonly isAdmin = computed(() => this.userService.isAdmin());

  // User-specific appointments
  readonly userAppointments = computed(() =>
    this.appointments().filter(b => this.appointmentService.isOwnBooking(b))
  );

  // List view data depending on role
  readonly listAppointments = computed(() =>
    this.isAdmin()
      ? this.filteredAppointments()
      : this.sortAppointmentsByDateTime(this.userAppointments())
  );

  // Calendar events
  readonly calendarEvents = computed((): AppointmentEvent[] => {
    const source = this.isAdmin() ? this.appointments() : this.userAppointments();
    return source.map(appointment => ({
      id: appointment.id || '',
      title: appointment.clientName || 'Appointment',
      start: (appointment.data || '') + 'T' + (appointment.hora || '00:00'),
      duration: 60, // Will be fetched from service service
      serviceName: 'Service', // Will be fetched from service service
      clientName: appointment.clientName || 'Client',
      isOwnBooking: this.appointmentService.isOwnBooking(appointment),
      canDrag: true,
      canViewDetails: true,
    }));
  });

  // Calendar footer configuration
  readonly calendarFooterConfig = computed((): FooterConfig => {
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const businessHours = this.systemParametersService.businessHours();
    const lunchBreak = this.systemParametersService.lunchBreak();

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

    return {
      total: appointments.length,
      today: appointments.filter(app => app.data === today).length,
      upcoming: appointments.filter(app => {
        if (!app.data) return false;
        const appointmentDate = parseISO(app.data);
        return isFuture(appointmentDate);
      }).length,
      completed: appointments.filter(app => app.status === 'completed').length,
      cancelled: appointments.filter(app => app.status === 'cancelled').length,
      mine: appointments.filter(app => app.email === this.authService.user()?.email).length,
    };
  });

  // Check if there are active filters
  readonly hasActiveFilters = computed(() => {
    const state = this.filterState();
    return state.date !== null || state.status !== null || state.service !== null;
  });

  // Filter methods
  readonly setFilterDate = (value: string | Date) => {
    const date = typeof value === 'string' ? new Date(value) : value;
    this.filterStateSignal.update(state => ({ ...state, date }));
  };

  readonly setFilterStatus = (value: string) => {
    this.filterStateSignal.update(state => ({ ...state, status: value }));
  };

  readonly setFilterService = (value: string) => {
    this.filterStateSignal.update(state => ({ ...state, service: value }));
  };

  readonly setViewMode = (mode: 'list' | 'calendar' | Event) => {
    // Handle both string and Event types
    const viewMode = typeof mode === 'string' ? mode : 'list';
    this.viewStateSignal.update(state => ({ ...state, mode: viewMode as 'list' | 'calendar' }));
  };

  readonly setQuickFilter = (filter: string) => {
    // Implementation for quick filter
    console.log('Quick filter:', filter);
  };

  readonly setFilterClient = (value: string) => {
    this.filterStateSignal.update(state => ({ ...state, client: value }));
  };

  readonly clearAllFilters = () => {
    this.filterStateSignal.set({ date: null, status: null, service: null, client: null });
  };

  // Filter methods
  private applyDateFilter(appointments: Booking[]): Booking[] {
    const filterDate = this.filterDate();
    if (!filterDate) return appointments;
    return appointments.filter(appointment => appointment.data === filterDate);
  }

  private applyStatusFilter(appointments: Booking[]): Booking[] {
    const filterStatus = this.filterStatus();
    if (!filterStatus) return appointments;
    return appointments.filter(appointment => appointment.status === filterStatus);
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

  // Appointment actions
  async deleteAppointment(appointment: AppointmentEvent): Promise<void> {
    // Always confirm before deleting
    const originalBooking = this.findOriginalBooking(appointment);
    if (!originalBooking || !originalBooking.id) return;

    // Delegate to calendar popup flow (the calendar emits delete on confirmation)
    // Here we can route to the detail page where confirmation is centralized or use a shared service.
    this.router.navigate(['/appointments', originalBooking.id], { queryParams: { confirmDelete: 'true' } });
  }

  editAppointment(appointment: AppointmentEvent): void {
    const originalBooking = this.findOriginalBooking(appointment);
    if (originalBooking) {
      this.router.navigate(['/appointments', originalBooking.id], {
        queryParams: { edit: 'true' }
      });
    }
  }

  // List actions (for Booking objects)
  async deleteBookingFromList(booking: Booking): Promise<void> {
    if (!booking.id) return;
    this.router.navigate(['/appointments', booking.id], { queryParams: { confirmDelete: 'true' } });
  }

  editBookingFromList(booking: Booking): void {
    if (booking.id) {
      this.router.navigate(['/appointments', booking.id], {
        queryParams: { edit: 'true' }
      });
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

  readonly onCalendarDateSelect = (event: { date: Date } | null) => {
    if (event && event.date) {
      this.setFilterDate(event.date);
    }
  };

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
