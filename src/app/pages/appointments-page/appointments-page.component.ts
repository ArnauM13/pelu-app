import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { FloatingButtonComponent } from '../../shared/components/floating-button/floating-button.component';
import { FiltersInlineComponent } from '../../shared/components/filters-inline/filters-inline.component';
import { AuthService } from '../../auth/auth.service';

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
    CalendarModule,
    TranslateModule,
    CardComponent,
    FloatingButtonComponent,
    FiltersInlineComponent
  ],
  providers: [MessageService],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss']
})
export class AppointmentsPageComponent {
  // Inject services
  #messageService = inject(MessageService);
  #router = inject(Router);
  #authService = inject(AuthService);

  // Core data signals
  #citesSignal = signal<any[]>([]);
  #viewModeSignal = signal<'list' | 'calendar'>('list');
  #selectedDateSignal = signal<Date | null>(null);

  // Filter state signals
  #filterDateSignal = signal<string>('');
  #filterClientSignal = signal<string>('');
  #quickFilterSignal = signal<'all' | 'today' | 'upcoming' | 'past' | 'mine'>('all');

  // UI state signals
  #showAdvancedFiltersSignal = signal<boolean>(false);

  // Public computed signals
  readonly cites = computed(() => this.#citesSignal());
  readonly viewMode = computed(() => this.#viewModeSignal());
  readonly selectedDate = computed(() => this.#selectedDateSignal());
  readonly filterDate = computed(() => this.#filterDateSignal());
  readonly filterClient = computed(() => this.#filterClientSignal());
  readonly quickFilter = computed(() => this.#quickFilterSignal());
  readonly showAdvancedFilters = computed(() => this.#showAdvancedFiltersSignal());

  // Computed filter buttons with reactive state
  readonly filterButtons = computed(() => [
    {
      icon: '🗓️',
      tooltip: 'COMMON.TODAY_FILTER',
      ariaLabel: 'COMMON.TODAY_APPOINTMENTS_FILTER',
      isActive: this.quickFilter() === 'today',
      variant: 'primary' as const,
      size: 'small' as const
    },
    {
      icon: '⏰',
      tooltip: 'COMMON.UPCOMING_FILTER',
      ariaLabel: 'COMMON.UPCOMING_APPOINTMENTS_FILTER',
      isActive: this.quickFilter() === 'upcoming',
      variant: 'primary' as const,
      size: 'small' as const
    },
    {
      icon: '📅',
      tooltip: 'COMMON.PAST_FILTER',
      ariaLabel: 'COMMON.PAST_APPOINTMENTS_FILTER',
      isActive: this.quickFilter() === 'past',
      variant: 'primary' as const,
      size: 'small' as const
    },
    {
      icon: '👤',
      tooltip: 'COMMON.MINE_FILTER',
      ariaLabel: 'COMMON.MY_APPOINTMENTS_FILTER',
      isActive: this.quickFilter() === 'mine',
      variant: 'primary' as const,
      size: 'small' as const
    },
    {
      icon: '🔍',
      tooltip: 'COMMON.ADVANCED_FILTERS',
      ariaLabel: 'COMMON.ADVANCED_FILTERS_LABEL',
      isActive: this.showAdvancedFilters(),
      variant: 'success' as const,
      size: 'small' as const
    }
  ]);

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

  // Computed filtered appointments
  readonly filteredCites = computed(() => {
    let filtered = this.cites();

    // Apply quick filters
    switch (this.quickFilter()) {
      case 'today':
        const today = format(new Date(), 'yyyy-MM-dd');
        filtered = filtered.filter(cita => cita.data === today);
        break;
      case 'upcoming':
        const now = new Date();
        filtered = filtered.filter(cita => {
          const appointmentDateTime = new Date(cita.data + 'T' + (cita.hora || '23:59'));
          return appointmentDateTime > now;
        });
        break;
      case 'past':
        const nowPast = new Date();
        filtered = filtered.filter(cita => {
          const appointmentDateTime = new Date(cita.data + 'T' + (cita.hora || '00:00'));
          return appointmentDateTime < nowPast;
        });
        break;
      case 'mine':
        const currentUserId = this.getCurrentUserId();
        filtered = filtered.filter(cita => cita.userId === currentUserId);
        break;
      default:
        break;
    }

    // Apply advanced filters
    if (this.filterDate()) {
      filtered = filtered.filter(cita => cita.data === this.filterDate());
    }

    if (this.filterClient()) {
      const searchTerm = this.filterClient().toLowerCase();
      filtered = filtered.filter(cita =>
        cita.nom.toLowerCase().includes(searchTerm)
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
  readonly calendarEvents = computed(() => {
    return this.cites().map(cita => ({
      date: cita.data,
      color: this.getEventColor(cita.data),
      title: cita.nom,
      time: cita.hora
    }));
  });

  // Computed statistics
  readonly totalAppointments = computed(() => this.cites().length);
  readonly todayAppointments = computed(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.cites().filter(cita => cita.data === today).length;
  });
  readonly upcomingAppointments = computed(() => {
    const now = new Date();
    return this.cites().filter(cita => {
      const appointmentDateTime = new Date(cita.data + 'T' + (cita.hora || '23:59'));
      return appointmentDateTime > now;
    }).length;
  });
  readonly myAppointments = computed(() => {
    const currentUserId = this.getCurrentUserId();
    return this.cites().filter(cita => cita.userId === currentUserId).length;
  });
  readonly isMyAppointmentsActive = computed(() => this.quickFilter() === 'mine');

  readonly hasActiveFilters = computed(() =>
    this.filterDate() !== '' || this.filterClient() !== '' || this.quickFilter() !== 'all'
  );

  constructor() {
    this.loadAppointments();

    // Reload appointments when user changes
    effect(() => {
      const user = this.#authService.user();
      if (user) {
        this.loadAppointments();
      }
    }, { allowSignalWrites: true });
  }

  // Filter management methods
  applyQuickFilter(filter: 'all' | 'today' | 'upcoming' | 'past' | 'mine') {
    if (this.quickFilter() === filter) {
      // Deselect the filter
      this.#quickFilterSignal.set('all');
    } else {
      // Select the new filter
      this.#quickFilterSignal.set(filter);

      // Clear advanced filters when applying quick filter
      this.#filterDateSignal.set('');
      this.#filterClientSignal.set('');
      this.#showAdvancedFiltersSignal.set(false);
    }
  }

  clearFilters() {
    this.#filterDateSignal.set('');
    this.#filterClientSignal.set('');
    this.#quickFilterSignal.set('all');
  }

  clearDateFilter() {
    this.#filterDateSignal.set('');
  }

  clearClientFilter() {
    this.#filterClientSignal.set('');
  }

  clearAllFilters() {
    this.clearFilters();
  }

  toggleAdvancedFilters() {
    this.#showAdvancedFiltersSignal.set(!this.showAdvancedFilters());
  }

  // Event handlers
  onFilterClick(index: number) {
    const filters: ('today' | 'upcoming' | 'past' | 'mine' | 'advanced')[] =
      ['today', 'upcoming', 'past', 'mine', 'advanced'];
    const selected = filters[index];

    if (selected === 'advanced') {
      this.toggleAdvancedFilters();
    } else {
      this.applyQuickFilter(selected);
    }
  }

  onStatCardClick(filter: 'all' | 'today' | 'upcoming' | 'mine') {
    this.applyQuickFilter(filter);
  }

  onDateChange(value: string) {
    this.#filterDateSignal.set(value);

    // If applying an advanced filter, deselect quick filters and show advanced filters
    if (value) {
      this.#quickFilterSignal.set('all');
      this.#showAdvancedFiltersSignal.set(true);
    }
  }

  onClientChange(value: string) {
    this.#filterClientSignal.set(value);

    // If applying an advanced filter, deselect quick filters and show advanced filters
    if (value) {
      this.#quickFilterSignal.set('all');
      this.#showAdvancedFiltersSignal.set(true);
    }
  }

  onViewButtonClick(index: number) {
    this.#viewModeSignal.set(index === 0 ? 'list' : 'calendar');
  }

  onResetFilters() {
    this.clearFilters();
  }

  // Utility methods
  loadAppointments() {
    const dades = localStorage.getItem('cites');
    if (dades) {
      const parsedData = JSON.parse(dades);

      // Only add IDs to appointments that don't have them (no migration of userId)
      const dadesAmbIds = parsedData.map((cita: any) => {
        if (!cita.id) {
          return { ...cita, id: uuidv4() };
        }
        return cita;
      });

      this.#citesSignal.set(dadesAmbIds);

      // Save migrated data back to localStorage if there were changes
      if (dadesAmbIds.some((cita: any, index: number) =>
        cita.id !== parsedData[index]?.id
      )) {
        localStorage.setItem('cites', JSON.stringify(dadesAmbIds));
      }
    }
  }

  deleteAppointment(cita: any) {
    this.#citesSignal.update(cites => cites.filter(c => c.id !== cita.id));
    this.saveAppointments();

    this.#messageService.add({
      severity: 'success',
      summary: 'Cita eliminada',
      detail: `S'ha eliminat la cita de ${cita.nom}`,
      life: 3000
    });
  }

  viewAppointmentDetail(cita: any) {
    this.#router.navigate(['/appointments', cita.id]);
  }

  saveAppointments() {
    localStorage.setItem('cites', JSON.stringify(this.cites()));
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

  onDateSelect(event: any) {
    this.#selectedDateSignal.set(event);
    const selectedDateStr = format(event, 'yyyy-MM-dd');
    this.#filterDateSignal.set(selectedDateStr);
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
    return this.cites().filter(cita => cita.data === dateStr);
  }

  formatDateForDisplay(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  getCurrentUserId(): string {
    // Get the current user from Firebase Auth
    const currentUser = this.#authService.user();
    if (!currentUser?.uid) {
      throw new Error('No hi ha usuari autenticat');
    }
    return currentUser.uid;
  }
}

