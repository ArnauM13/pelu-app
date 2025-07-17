import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { TranslateModule } from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CalendarComponent, AppointmentEvent } from '../../../features/calendar/calendar.component';
import { FiltersInlineComponent } from '../../../shared/components/filters-inline/filters-inline.component';
import { FloatingButtonComponent } from '../../../shared/components/floating-button/floating-button.component';
import { AppointmentStatusBadgeComponent } from '../../../shared/components/appointment-status-badge';
import { AppointmentsStatsComponent, AppointmentStats } from '../components/appointments-stats/appointments-stats.component';
import { AppointmentsListComponent, Appointment } from '../components/appointments-list/appointments-list.component';
import { AppointmentsViewControlsComponent, ViewButton } from '../components/appointments-view-controls/appointments-view-controls.component';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { ToastService } from '../../../shared/services/toast.service';
import { isFutureAppointment } from '../../../shared/services';

@Component({
  selector: 'pelu-appointments-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TooltipModule,
    TranslateModule,
    CalendarModule,
    CalendarComponent,
    CardComponent,
    FiltersInlineComponent,
    AppointmentStatusBadgeComponent,
    AppointmentsStatsComponent,
    AppointmentsListComponent,
    AppointmentsViewControlsComponent,
    NextAppointmentComponent
  ],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss']
})
export class AppointmentsPageComponent {
  // Inject services
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  // Core data signals
  private readonly appointmentsSignal = signal<any[]>([]);
  private readonly viewModeSignal = signal<'list' | 'calendar'>('list');
  private readonly selectedDateSignal = signal<Date | null>(null);

  // Filter state signals
  private readonly filterDateSignal = signal<string>('');
  private readonly filterClientSignal = signal<string>('');
  private readonly filterServiceSignal = signal<string>('');
  private readonly quickFilterSignal = signal<'all' | 'today' | 'upcoming' | 'mine'>('all');

  // Public computed signals
  readonly appointments = computed(() => this.appointmentsSignal());
  readonly viewMode = computed(() => this.viewModeSignal());
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly filterDate = computed(() => this.filterDateSignal());
  readonly filterClient = computed(() => this.filterClientSignal());
  readonly filterService = computed(() => this.filterServiceSignal());
  readonly quickFilter = computed(() => this.quickFilterSignal());

  // Computed view buttons
  readonly viewButtons = computed(() => [
    {
      icon: '📋',
      tooltip: 'COMMON.LIST_VIEW',
      ariaLabel: 'COMMON.LIST_VIEW_LABEL',
      isActive: this.viewMode() === 'list',
      variant: 'primary' as const,
      size: 'large' as const
    },
    {
      icon: '📅',
      tooltip: 'COMMON.CALENDAR_VIEW',
      ariaLabel: 'COMMON.CALENDAR_VIEW_LABEL',
      isActive: this.viewMode() === 'calendar',
      variant: 'primary' as const,
      size: 'large' as const
    }
  ]);

  // Computed filtered appointments - fully reactive
  readonly filteredAppointments = computed(() => {
    let filtered = this.appointments();

    // Apply quick filters
    switch (this.quickFilter()) {
      case 'today':
        const today = format(new Date(), 'yyyy-MM-dd');
        filtered = filtered.filter(appointment => appointment.data === today);
        break;
      case 'upcoming':
        const now = new Date();
        filtered = filtered.filter(appointment => {
          const appointmentDateTime = new Date(appointment.data + 'T' + (appointment.hora || '23:59'));
          return appointmentDateTime > now;
        });
        break;
      case 'mine':
        const currentUserId = this.getCurrentUserId();
        filtered = filtered.filter(appointment => appointment.userId === currentUserId);
        break;
      default:
        break;
    }

    // Apply date filter
    if (this.filterDate()) {
      const filterDateStr = this.filterDate();
      filtered = filtered.filter(appointment => appointment.data === filterDateStr);
    }

    // Apply client name filter
    if (this.filterClient()) {
      const searchTerm = this.filterClient().toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.nom.toLowerCase().includes(searchTerm)
      );
    }

    // Apply service filter
    if (this.filterService()) {
      const serviceFilter = this.filterService();
      filtered = filtered.filter(appointment => {
        const serviceName = appointment.serviceName || appointment.servei || '';
        const serviceColor = this.serviceColorsService.getServiceColor(serviceName);
        return serviceColor.id === serviceFilter;
      });
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      // Create dates in local timezone to avoid UTC conversion issues
      const createLocalDateTime = (dateStr: string, timeStr: string) => {
        const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
        const date = new Date(dateStr);
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      const dateA = createLocalDateTime(a.data, a.hora || '00:00');
      const dateB = createLocalDateTime(b.data, b.hora || '00:00');
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Computed calendar events
  readonly calendarEvents = computed((): AppointmentEvent[] => {
    return this.appointments().map(appointment => ({
      title: appointment.nom,
      start: appointment.data + (appointment.hora ? 'T' + appointment.hora : 'T00:00'),
      duration: appointment.duration || 60,
      serviceName: appointment.serviceName,
      clientName: appointment.nom
    }));
  });

  // Computed statistics
  readonly totalAppointments = computed(() => this.appointments().length);
  readonly todayAppointments = computed(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.appointments().filter(appointment => appointment.data === today).length;
  });
  readonly upcomingAppointments = computed(() => {
    const now = new Date();
    return this.appointments().filter(appointment => {
      // Create date in local timezone to avoid UTC conversion issues
      const [hours, minutes] = (appointment.hora || '23:59').split(':').map(Number);
      const appointmentDateTime = new Date(appointment.data);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      return appointmentDateTime > now;
    }).length;
  });
  readonly myAppointments = computed(() => {
    const currentUserId = this.getCurrentUserId();
    return this.appointments().filter(appointment => appointment.userId === currentUserId).length;
  });

  readonly hasActiveFilters = computed(() =>
    this.filterDate() !== '' || this.filterClient() !== '' || this.filterService() !== '' || this.quickFilter() !== 'all'
  );

  // Computed appointment stats for the stats component
  readonly appointmentStats = computed((): AppointmentStats => ({
    total: this.totalAppointments(),
    today: this.todayAppointments(),
    upcoming: this.upcomingAppointments(),
    mine: this.myAppointments()
  }));

  readonly isFutureAppointment = isFutureAppointment;

  constructor(private serviceColorsService: ServiceColorsService) {
    this.loadAppointments();

    // Reload appointments when user changes
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.loadAppointments();
      }
    }, { allowSignalWrites: true });
  }

  // Public methods for template binding
  readonly setFilterDate = (value: string) => this.filterDateSignal.set(value);
  readonly setFilterClient = (value: string) => this.filterClientSignal.set(value);
  readonly setFilterService = (value: string) => this.filterServiceSignal.set(value);
  readonly setQuickFilter = (filter: 'all' | 'today' | 'upcoming' | 'mine') => {
    if (this.quickFilter() === filter) {
      this.quickFilterSignal.set('all');
    } else {
      this.quickFilterSignal.set(filter);
    }
  };
  readonly setViewMode = (mode: 'list' | 'calendar') => this.viewModeSignal.set(mode);
  readonly clearAllFilters = () => {
    this.filterDateSignal.set('');
    this.filterClientSignal.set('');
    this.filterServiceSignal.set('');
    this.quickFilterSignal.set('all');
  };

  // Utility methods
  private loadAppointments(): void {
    const data = localStorage.getItem('cites');
    if (data) {
      const parsedData = JSON.parse(data);

      // Only add IDs to appointments that don't have them (no migration of userId)
      const appointmentsWithIds = parsedData.map((appointment: any) => {
        if (!appointment.id) {
          return { ...appointment, id: uuidv4() };
        }
        return appointment;
      });

      this.appointmentsSignal.set(appointmentsWithIds);

      // Save migrated data back to localStorage if there were changes
      if (appointmentsWithIds.some((appointment: any, index: number) =>
        appointment.id !== parsedData[index]?.id
      )) {
        localStorage.setItem('cites', JSON.stringify(appointmentsWithIds));
      }
    }
  }

  deleteAppointment(appointment: any): void {
    if (!isFutureAppointment({ data: appointment.data || '', hora: appointment.hora || '' })) {
      this.toastService.showError('No es pot eliminar una cita passada');
      return;
    }

    this.appointmentsSignal.update(appointments =>
      appointments.filter(a => a.id !== appointment.id)
    );
    this.saveAppointments();

    // Show success message with better fallback for client name
    const clientName = appointment.nom || appointment.title || appointment.clientName || 'Client';
    this.toastService.showAppointmentDeleted(clientName);
  }

  editAppointment(appointment: any): void {
    const user = this.authService.user();
    if (!user?.uid) {
      this.toastService.showError('No s\'ha pogut editar la cita. Si us plau, inicia sessió.');
      return;
    }

    // Generem un ID únic combinant clientId i appointmentId
    const clientId = user.uid;
    const uniqueId = `${clientId}-${appointment.id}`;

    // Naveguem a la pàgina de detall en mode edició
    this.router.navigate(['/appointments', uniqueId], { queryParams: { edit: 'true' } });
  }

  private saveAppointments(): void {
    localStorage.setItem('cites', JSON.stringify(this.appointments()));
  }

  formatDate(dateString: string): string {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: ca });
    } catch {
      return dateString;
    }
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString;
  }

  isToday(dateString: string): boolean {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dateString === today;
  }

  isPast(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    return appointmentDate < today;
  }

  onDateSelect(event: any): void {
    this.selectedDateSignal.set(event);
    const selectedDateStr = format(event, 'yyyy-MM-dd');
    this.filterDateSignal.set(selectedDateStr);
  }

  getEventColor(dateString: string): string {
    if (this.isToday(dateString)) {
      return '#3b82f6';
    } else if (this.isPast(dateString)) {
      return '#6b7280';
    } else {
      return '#10b981';
    }
  }

  getAppointmentsForDate(date: Date): any[] {
    if (!date || isNaN(date.getTime())) {
      return [];
    }
    const dateStr = format(date, 'yyyy-MM-dd');
    return this.appointments().filter(appointment => appointment.data === dateStr);
  }

  formatDateForDisplay(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  private getCurrentUserId(): string {
    const currentUser = this.authService.user();
    if (!currentUser?.uid) {
      throw new Error('No hi ha usuari autenticat');
    }
    return currentUser.uid;
  }

  showToast(severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string, appointmentId?: string, showViewButton: boolean = false) {
    this.toastService.showToast(severity, summary, detail, appointmentId, showViewButton);
  }

  onToastClick(event: any) {
    const appointmentId = event.message?.data?.appointmentId;
    if (appointmentId) {
      const user = this.authService.user();
      if (!user?.uid) {
        return;
      }

      // Generem un ID únic combinant clientId i appointmentId
      const clientId = user.uid;
      const uniqueId = `${clientId}-${appointmentId}`;

      this.router.navigate(['/appointments', uniqueId]);
    }
  }

  viewAppointmentDetail(appointmentOrId: string | any) {
    let appointmentId: string;

    if (typeof appointmentOrId === 'string') {
      appointmentId = appointmentOrId;
    } else if (appointmentOrId && appointmentOrId.id) {
      appointmentId = appointmentOrId.id;
    } else {
      return;
    }

    const user = this.authService.user();
    if (!user?.uid) {
      return;
    }

    // Generem un ID únic combinant clientId i appointmentId
    const clientId = user.uid;
    const uniqueId = `${clientId}-${appointmentId}`;

    this.router.navigate(['/appointments', uniqueId]);
  }
}

