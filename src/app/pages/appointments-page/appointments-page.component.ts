import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { TranslateModule } from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

import { AuthService } from '../../auth/auth.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CalendarComponent, AppointmentEvent } from '../../features/calendar/calendar.component';
import { FiltersInlineComponent } from '../../shared/components/filters-inline/filters-inline.component';
import { FloatingButtonComponent } from '../../shared/components/floating-button/floating-button.component';
import { AppointmentStatusBadgeComponent } from '../../shared/components/appointment-status-badge';

@Component({
  selector: 'pelu-appointments-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    CalendarModule,
    CalendarComponent,
    CardComponent,
    FiltersInlineComponent,
    FloatingButtonComponent,
    AppointmentStatusBadgeComponent
  ],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss']
})
export class AppointmentsPageComponent {
  // Inject services
  public readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Core data signals
  private readonly appointmentsSignal = signal<any[]>([]);
  private readonly viewModeSignal = signal<'list' | 'calendar'>('list');
  private readonly selectedDateSignal = signal<Date | null>(null);

  // Filter state signals
  private readonly filterDateSignal = signal<string>('');
  private readonly filterClientSignal = signal<string>('');
  private readonly quickFilterSignal = signal<'all' | 'today' | 'upcoming' | 'mine'>('all');

  // Public computed signals
  readonly appointments = computed(() => this.appointmentsSignal());
  readonly viewMode = computed(() => this.viewModeSignal());
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly filterDate = computed(() => this.filterDateSignal());
  readonly filterClient = computed(() => this.filterClientSignal());
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

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(a.data + 'T' + (a.hora || '00:00'));
      const dateB = new Date(b.data + 'T' + (b.hora || '00:00'));
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
      const appointmentDateTime = new Date(appointment.data + 'T' + (appointment.hora || '23:59'));
      return appointmentDateTime > now;
    }).length;
  });
  readonly myAppointments = computed(() => {
    const currentUserId = this.getCurrentUserId();
    return this.appointments().filter(appointment => appointment.userId === currentUserId).length;
  });

  readonly hasActiveFilters = computed(() =>
    this.filterDate() !== '' || this.filterClient() !== '' || this.quickFilter() !== 'all'
  );

  constructor() {
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
    this.appointmentsSignal.update(appointments =>
      appointments.filter(a => a.id !== appointment.id)
    );
    this.saveAppointments();

    this.showToast('success', '🗑️ Cita eliminada', `S'ha eliminat la cita de ${appointment.nom}`, appointment.id);
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
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 4000,
      closable: false,
      key: 'appointments-toast',
      data: { appointmentId, showViewButton }
    });
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

