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
import { CalendarWithFooterComponent } from '../../../features/calendar/core/calendar-with-footer.component';
import { FiltersInlineComponent } from '../../../shared/components/filters-inline/filters-inline.component';
import { AppointmentStatusBadgeComponent } from '../../../shared/components/appointment-status-badge';
import {
  AppointmentsStatsComponent,
  AppointmentStats,
} from '../components/appointments-stats/appointments-stats.component';
import { AppointmentsListComponent } from '../components/appointments-list/appointments-list.component';
import { AppointmentsViewControlsComponent } from '../components/appointments-view-controls/appointments-view-controls.component';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ActionsButtonsComponent } from '../../../shared/components/actions-buttons';
import { ActionContext } from '../../../core/services/actions.service';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { ToastService } from '../../../shared/services/toast.service';
import { BookingService, Booking } from '../../../core/services/booking.service';
import { isFutureAppointment } from '../../../shared/services';
import { ToastConfig } from '../../../shared/components/toast/toast.component';

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
    CalendarWithFooterComponent,
    CardComponent,
    FiltersInlineComponent,
    AppointmentStatusBadgeComponent,
    AppointmentsStatsComponent,
    AppointmentsListComponent,
    AppointmentsViewControlsComponent,
    NextAppointmentComponent,
    LoadingStateComponent,
    ActionsButtonsComponent,
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

  // Core data signals - now using Firebase
  readonly appointments = this.appointmentService.bookings;

  // State signals - grouped by functionality
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

  // Individual filter signals
  readonly filterDate = computed(() => this.filterState().date);
  readonly filterClient = computed(() => this.filterState().client);
  readonly filterService = computed(() => this.filterState().service);
  readonly quickFilter = computed(() => this.filterState().quickFilter);

  // View state signals
  readonly viewMode = computed(() => this.viewState().mode);
  readonly selectedDate = computed(() => this.viewState().selectedDate);

  // Computed view buttons with enhanced reactivity
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

  // Enhanced filtered appointments with memoization
  readonly filteredAppointments = computed(() => {
    let filtered = this.appointments();

    // Apply quick filters first
    filtered = this.applyQuickFilter(filtered);

    // Apply individual filters
    filtered = this.applyDateFilter(filtered);
    filtered = this.applyClientFilter(filtered);
    filtered = this.applyServiceFilter(filtered);

    // Sort by date and time (newest first)
    filtered = this.sortAppointmentsByDateTime(filtered);

    return filtered;
  });

  // Calendar events with enhanced performance
  readonly calendarEvents = computed((): AppointmentEvent[] => {
    return this.filteredAppointments().map(appointment => ({
      id: appointment.id || `appointment-${Date.now()}`,
      title: appointment.nom || 'Client',
      start: appointment.data + 'T' + (appointment.hora || '00:00'),
      end: appointment.data + 'T' + (appointment.hora || '23:59'),
      allDay: false,
      data: appointment,
    }));
  });

  // Enhanced statistics with better performance
  readonly appointmentStats = computed((): AppointmentStats => {
    const appointments = this.appointments();
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();

    return {
      total: appointments.length,
      today: appointments.filter(a => a.data === today).length,
      upcoming: appointments.filter(a => {
        const appointmentDateTime = new Date(a.data + 'T' + (a.hora || '23:59'));
        return appointmentDateTime > now;
      }).length,
      mine: appointments.filter(a => a.uid === this.getCurrentUserId()).length,
    };
  });

  // Computed convenience signals
  readonly totalAppointments = computed(() => this.appointments().length);
  readonly todayAppointments = computed(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayAppointments = this.appointments().filter(a => a.data === today);
    return this.sortAppointmentsByDateTime(todayAppointments);
  });
  readonly upcomingAppointments = computed(() => {
    const now = new Date();
    const upcomingAppointments = this.appointments().filter(a => {
      const appointmentDateTime = new Date(a.data + 'T' + (a.hora || '23:59'));
      return appointmentDateTime > now;
    });
    return this.sortAppointmentsByDateTime(upcomingAppointments);
  });
  readonly myAppointments = computed(() => {
    const currentUserId = this.getCurrentUserId();
    const myAppointments = this.appointments().filter(a => a.uid === currentUserId);
    return this.sortAppointmentsByDateTime(myAppointments);
  });

  readonly hasActiveFilters = computed(() => {
    const filters = this.filterState();
    return filters.date !== '' ||
           filters.client !== '' ||
           filters.service !== '' ||
           filters.quickFilter !== 'all';
  });

  readonly loading = computed(() => this.appointmentService.isLoading());
  readonly isFutureAppointment = isFutureAppointment;

  // Enhanced filter methods with better performance
  private applyQuickFilter(appointments: Booking[]): Booking[] {
    switch (this.quickFilter()) {
      case 'today': {
        const today = format(new Date(), 'yyyy-MM-dd');
        return appointments.filter(appointment => appointment.data === today);
      }
      case 'upcoming': {
        const now = new Date();
        return appointments.filter(appointment => {
          const appointmentDateTime = new Date(
            appointment.data + 'T' + (appointment.hora || '23:59')
          );
          return appointmentDateTime > now;
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

    return appointments.filter(appointment => {
      const createLocalDateTime = (dateStr: string, timeStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hour, minute] = timeStr.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute);
      };

      const appointmentDateTime = createLocalDateTime(appointment.data || '', appointment.hora || '00:00');
      const serviceDateTime = createLocalDateTime(filterService, '00:00');

      return appointmentDateTime.getTime() === serviceDateTime.getTime();
    });
  }

  private sortAppointmentsByDateTime(appointments: Booking[]): Booking[] {
    return appointments.sort((a, b) => {
      // Create datetime objects for comparison
      const createLocalDateTime = (dateStr: string, timeStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hour, minute] = timeStr.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute);
      };

      const dateTimeA = createLocalDateTime(a.data || '', a.hora || '00:00');
      const dateTimeB = createLocalDateTime(b.data || '', b.hora || '00:00');

      // Sort in descending order (newest first)
      return dateTimeB.getTime() - dateTimeA.getTime();
    });
  }

  // Enhanced action methods
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

  // Enhanced utility methods
  async deleteAppointment(appointment: AppointmentEvent): Promise<void> {
    try {
      // Find the original booking from the appointment event
      const originalBooking = this.findOriginalBooking(appointment);
      if (originalBooking) {
        await this.appointmentService.deleteBooking(originalBooking.id || '');
        this.toastService.showAppointmentDeleted(originalBooking.nom || '');
      }

      // Dispatch custom event for silent refresh
      window.dispatchEvent(new CustomEvent('appointmentDeleted'));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      this.toastService.showError('Error', 'No s\'ha pogut eliminar la cita');
    }
  }

  editAppointment(appointment: AppointmentEvent): void {
    // Find the original booking from the appointment event
    const originalBooking = this.findOriginalBooking(appointment);
    if (originalBooking) {
      this.router.navigate(['/appointments', originalBooking.id, 'edit']);
    }
  }

  private findOriginalBooking(appointmentEvent: AppointmentEvent): Booking | null {
    // Try to find the original booking by matching the appointment event data
    return this.appointments().find(booking =>
      booking.id === appointmentEvent.id ||
      (booking.data + 'T' + (booking.hora || '00:00')) === appointmentEvent.start
    ) || null;
  }

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

  // Enhanced loading configuration
  get loadingConfig() {
    return {
      message: 'CARGANT.CITAS',
      showSpinner: true,
      overlay: false,
    };
  }
}
