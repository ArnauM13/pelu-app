import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FooterConfig } from '../../../shared/components/footer/footer.component';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AppointmentsListComponent } from '../../appointments/components/appointments-list/appointments-list.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { FiltersCollapsibleComponent } from '../../../shared/components/filters-collapsible/filters-collapsible.component';
import { ConfirmationPopupComponent } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
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
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationData } from '../../../shared/components/confirmation-popup/confirmation-popup.component';

interface FilterState {
  date: Date | null;
  status: string | null;
  service: string | null;
  client: string | null;
  quickFilters: Set<'today' | 'upcoming' | 'past' | 'mine'>;
}

interface AppointmentStats {
  total: number;
  today: number;
  upcoming: number;
  past: number;
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
    AppointmentsListComponent,
    LoadingStateComponent,
    NextAppointmentComponent,
    FiltersCollapsibleComponent,
    ConfirmationPopupComponent,
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
  private readonly translateService = inject(TranslateService);

  // Core data
  readonly appointments = this.appointmentService.bookings;
  readonly loading = computed(() => this.appointmentService.isLoading());

  // Filter state
  private readonly filterStateSignal = signal<FilterState>({
    date: null,
    status: null,
    service: null,
    client: null,
    quickFilters: new Set(),
  });

  // View state
  private readonly viewStateSignal = signal({
    mode: 'list' as 'list' | 'calendar',
    selectedDate: null as Date | null,
  });

  // Selection state
  private readonly selectionStateSignal = signal({
    isSelectionMode: false,
    selectedIds: new Set<string>(),
  });

  // Confirmation popup state
  private readonly confirmationPopupSignal = signal({
    isOpen: false,
    data: null as (ConfirmationData & { booking?: Booking; selectedIds?: string[] }) | null,
  });

  // Computed properties
  readonly filterState = computed(() => this.filterStateSignal());
  readonly viewState = computed(() => this.viewStateSignal());
  readonly viewMode = computed(() => this.viewState().mode);
  readonly selectedDate = computed(() => this.viewState().selectedDate);
  readonly confirmationPopup = computed(() => this.confirmationPopupSignal());
  readonly selectionState = computed(() => this.selectionStateSignal());

  // Selection computed properties
  readonly isSelectionMode = computed(() => this.selectionState().isSelectionMode);
  readonly selectedIds = computed(() => this.selectionState().selectedIds);
  readonly selectedCount = computed(() => this.selectedIds().size);
  readonly hasSelection = computed(() => this.selectedCount() > 0);
  readonly isAllSelected = computed(() => {
    const currentAppointments = this.listAppointments();
    return currentAppointments.length > 0 && this.selectedCount() === currentAppointments.length;
  });
  readonly isPartiallySelected = computed(() => {
    const currentAppointments = this.listAppointments();
    return this.selectedCount() > 0 && this.selectedCount() < currentAppointments.length;
  });

  // Filter signals for template
  readonly filterDate = computed(() => {
    const date = this.filterState().date;
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  });
  readonly filterClient = computed(() => this.filterState().client || '');
  readonly filterService = computed(() => this.filterState().service || '');
  readonly quickFilterString = computed(() => {
    const quickFilters = this.filterState().quickFilters;
    if (quickFilters.size === 0) return 'all';
    return Array.from(quickFilters).join(',');
  });

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
    appointments = this.applyClientFilter(appointments);
    appointments = this.applyQuickFilter(appointments);
    return this.sortAppointmentsByDateTime(appointments);
  });

  // Role helpers
  readonly isAdmin = computed(() => this.userService.isAdmin());

  // User-specific appointments
  readonly userAppointments = computed(() =>
    this.appointments().filter(b => this.appointmentService.isOwnBooking(b))
  );

  // List view data depending on role
  readonly listAppointments = computed(() => {
    return this.isAdmin()
      ? this.filteredAppointments()
      : this.sortAppointmentsByDateTime(this.userAppointments());
  });

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
      upcoming: appointments.filter(appointment => {
        if (!appointment.data || typeof appointment.data !== 'string') return false;
        try {
          const appointmentDate = new Date(appointment.data);
          const appointmentTime = appointment.hora || '00:00';
          const [hours, minutes] = appointmentTime.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);

          const now = new Date();
          return appointmentDate > now;
        } catch {
          return false;
        }
      }).length,
      past: appointments.filter(appointment => {
        if (!appointment.data || typeof appointment.data !== 'string') return false;
        try {
          const appointmentDate = new Date(appointment.data);
          const appointmentTime = appointment.hora || '00:00';
          const [hours, minutes] = appointmentTime.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);

          const now = new Date();
          return appointmentDate < now;
        } catch {
          return false;
        }
      }).length,
      completed: appointments.filter(app => app.status === 'completed').length,
      cancelled: appointments.filter(app => app.status === 'cancelled').length,
      mine: appointments.filter(app => app.email === this.authService.user()?.email).length,
    };
  });

  // Check if there are active filters
  readonly hasActiveFilters = computed(() => {
    const state = this.filterState();
    return state.date !== null || state.status !== null || state.service !== null || state.quickFilters.size > 0;
  });

  // Filter methods
  readonly setFilterDate = (value: string | Date) => {
    let date: Date | null = null;

    if (typeof value === 'string') {
      if (value.trim() === '') {
        date = null;
      } else {
        const parsedDate = new Date(value);
        date = isNaN(parsedDate.getTime()) ? null : parsedDate;
      }
    } else if (value instanceof Date) {
      date = isNaN(value.getTime()) ? null : value;
    }

    this.filterStateSignal.update(state => ({ ...state, date, quickFilters: new Set() }));
  };

  readonly setFilterStatus = (value: string) => {
    const status = value.trim() === '' ? null : value;
    this.filterStateSignal.update(state => ({ ...state, status, quickFilters: new Set() }));
  };

  readonly setFilterService = (value: string) => {
    const service = value.trim() === '' ? null : value;
    this.filterStateSignal.update(state => ({ ...state, service, quickFilters: new Set() }));
  };

  readonly setViewMode = (mode: 'list' | 'calendar' | Event) => {
    // Handle both string and Event types
    const viewMode = typeof mode === 'string' ? mode : 'list';
    this.viewStateSignal.update(state => ({ ...state, mode: viewMode as 'list' | 'calendar' }));
  };

  readonly setQuickFilter = (filter: 'all' | 'today' | 'upcoming' | 'past' | 'mine') => {
    this.filterStateSignal.update(state => {
      if (filter === 'all') {
        return {
          ...state,
          quickFilters: new Set(),
          date: null,
          status: null,
          service: null,
          client: null
        };
      }

      const newQuickFilters = new Set(state.quickFilters);
      if (newQuickFilters.has(filter)) {
        newQuickFilters.delete(filter);
      } else {
        newQuickFilters.add(filter);
      }

      return {
        ...state,
        quickFilters: newQuickFilters
      };
    });
  };

  readonly setFilterClient = (value: string) => {
    const client = value.trim() === '' ? null : value;
    this.filterStateSignal.update(state => ({ ...state, client, quickFilters: new Set() }));
  };

  readonly clearAllFilters = () => {
    this.filterStateSignal.set({ date: null, status: null, service: null, client: null, quickFilters: new Set() });
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
    return appointments.filter(appointment => appointment.serviceId === filterService);
  }

  private applyClientFilter(appointments: Booking[]): Booking[] {
    const filterClient = this.filterClient();
    if (!filterClient) return appointments;
    const lowerFilter = filterClient.toLowerCase();
    return appointments.filter(appointment =>
      appointment.clientName.toLowerCase().includes(lowerFilter)
    );
  }

  private applyQuickFilter(appointments: Booking[]): Booking[] {
    const quickFilters = this.filterState().quickFilters;

    if (quickFilters.size === 0) return appointments;

    const today = new Date().toISOString().split('T')[0];
    let filteredAppointments = appointments;

    // Apply each quick filter
    if (quickFilters.has('today')) {
      filteredAppointments = filteredAppointments.filter(appointment => appointment.data === today);
    }

    if (quickFilters.has('upcoming')) {
      filteredAppointments = filteredAppointments.filter(appointment => {
        if (!appointment.data || typeof appointment.data !== 'string') return false;
        try {
          const appointmentDate = new Date(appointment.data);
          const appointmentTime = appointment.hora || '00:00';
          const [hours, minutes] = appointmentTime.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);

          const now = new Date();
          return appointmentDate > now;
        } catch {
          return false;
        }
      });
    }

    if (quickFilters.has('past')) {
      filteredAppointments = filteredAppointments.filter(appointment => {
        if (!appointment.data || typeof appointment.data !== 'string') return false;
        try {
          const appointmentDate = new Date(appointment.data);
          const appointmentTime = appointment.hora || '00:00';
          const [hours, minutes] = appointmentTime.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);

          const now = new Date();
          return appointmentDate < now;
        } catch {
          return false;
        }
      });
    }

    if (quickFilters.has('mine')) {
      filteredAppointments = filteredAppointments.filter(appointment => this.appointmentService.isOwnBooking(appointment));
    }

    return filteredAppointments;
  }

  private sortAppointmentsByDateTime(appointments: Booking[]): Booking[] {
    return appointments.sort((a, b) => {
      const createLocalDateTime = (dateStr: string | undefined | null, timeStr: string | undefined | null) => {
        // Ensure we have valid string values
        const safeDateStr = typeof dateStr === 'string' ? dateStr : '';
        const safeTimeStr = typeof timeStr === 'string' ? timeStr : '00:00';

        // If no valid date, return a default date
        if (!safeDateStr) {
          return new Date(0); // Default to epoch time for invalid dates
        }

        try {
          const [year, month, day] = safeDateStr.split('-').map(Number);
          const [hour, minute] = safeTimeStr.split(':').map(Number);

          // Validate that we have valid numbers
          if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return new Date(0);
          }

          return new Date(year, month - 1, day, hour || 0, minute || 0);
        } catch {
          // If parsing fails, return default date
          return new Date(0);
        }
      };

      const dateTimeA = createLocalDateTime(a.data, a.hora);
      const dateTimeB = createLocalDateTime(b.data, b.hora);
      return dateTimeA.getTime() - dateTimeB.getTime(); // Changed to show oldest appointments first
    });
  }

  // Selection methods
  readonly toggleSelectionMode = () => {
    this.selectionStateSignal.update(state => ({
      ...state,
      isSelectionMode: !state.isSelectionMode,
      selectedIds: new Set() // Clear selection when toggling mode
    }));
  };

  readonly selectAll = () => {
    const currentAppointments = this.listAppointments();
    const allIds = currentAppointments
      .filter(appointment => appointment.id)
      .map(appointment => appointment.id!);

    this.selectionStateSignal.update(state => ({
      ...state,
      selectedIds: new Set(allIds)
    }));
  };

  readonly deselectAll = () => {
    this.selectionStateSignal.update(state => ({
      ...state,
      selectedIds: new Set()
    }));
  };

  readonly toggleAppointmentSelection = (appointmentId: string) => {
    this.selectionStateSignal.update(state => {
      const newSelectedIds = new Set(state.selectedIds);
      if (newSelectedIds.has(appointmentId)) {
        newSelectedIds.delete(appointmentId);
      } else {
        newSelectedIds.add(appointmentId);
      }
      return {
        ...state,
        selectedIds: newSelectedIds
      };
    });
  };

  readonly isAppointmentSelected = (appointmentId: string): boolean => {
    return this.selectedIds().has(appointmentId);
  };

  readonly bulkDeleteSelected = () => {
    const selectedIdsArray = Array.from(this.selectedIds());
    if (selectedIdsArray.length === 0) return;

    this.confirmationPopupSignal.set({
      isOpen: true,
      data: {
        title: 'COMMON.BULK_DELETE_CONFIRMATION',
        message: 'APPOINTMENTS.BULK_DELETE_CONFIRMATION_MESSAGE',
        confirmText: 'COMMON.ACTIONS.DELETE',
        cancelText: 'COMMON.ACTIONS.CANCEL',
        severity: 'danger',
        selectedIds: selectedIdsArray
      }
    });
  };

  readonly onBulkDeleteConfirmed = async () => {
    const popupData = this.confirmationPopup().data;
    if (popupData?.selectedIds) {
      await this.performBulkDelete(popupData.selectedIds);
    }
    this.closeConfirmationPopup();
  };

  private async performBulkDelete(selectedIds: string[]): Promise<void> {
    try {
      const deletePromises = selectedIds.map(id => this.appointmentService.deleteBooking(id));
      await Promise.all(deletePromises);

      // Clear selection after successful deletion
      this.selectionStateSignal.update(state => ({
        ...state,
        selectedIds: new Set(),
        isSelectionMode: false
      }));

      this.toastService.showSuccess('COMMON.SUCCESS', 'APPOINTMENTS.BULK_DELETE_SUCCESS');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'APPOINTMENTS.BULK_DELETE_ERROR');
    }
  };

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

    // Show confirmation popup
    this.confirmationPopupSignal.set({
      isOpen: true,
      data: {
        title: 'COMMON.DELETE_CONFIRMATION',
        message: 'APPOINTMENTS.DELETE_CONFIRMATION_MESSAGE_SIMPLE',
        confirmText: 'COMMON.ACTIONS.DELETE',
        cancelText: 'COMMON.ACTIONS.CANCEL',
        severity: 'danger',
        booking: booking
      }
    });
  }

  onDeleteConfirmed(): void {
    const popupData = this.confirmationPopup().data;
    if (popupData?.selectedIds) {
      // Bulk delete
      this.performBulkDelete(popupData.selectedIds);
    } else if (popupData?.booking?.id) {
      // Single delete
      this.performDelete(popupData.booking);
    }
    this.closeConfirmationPopup();
  }

  onDeleteCancelled(): void {
    this.closeConfirmationPopup();
  }

  private async performDelete(booking: Booking): Promise<void> {
    try {
      await this.appointmentService.deleteBooking(booking.id!);
      this.toastService.showSuccess('COMMON.SUCCESS', 'APPOINTMENTS.DELETE_SUCCESS');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'APPOINTMENTS.DELETE_ERROR');
    }
  }

  private closeConfirmationPopup(): void {
    this.confirmationPopupSignal.set({
      isOpen: false,
      data: null
    });
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

  isPast(dateString: string | undefined): boolean {
    if (!dateString) return false;
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

  // Translation helper method
  getTranslation(key: string): string {
    return this.translateService.instant(key);
  }

  // Handle bulk delete from appointments list
  onBulkDeleteRequested(selectedIds: string[]): void {
    if (selectedIds.length === 0) return;

    this.confirmationPopupSignal.set({
      isOpen: true,
      data: {
        title: 'COMMON.BULK_DELETE_CONFIRMATION',
        message: 'APPOINTMENTS.BULK_DELETE_CONFIRMATION_MESSAGE',
        confirmText: 'COMMON.ACTIONS.DELETE',
        cancelText: 'COMMON.ACTIONS.CANCEL',
        severity: 'danger',
        selectedIds: selectedIds
      }
    });
  }

  get loadingConfig() {
    return {
      message: 'CARGANT.CITAS',
      showSpinner: true,
      overlay: false,
    };
  }
}
