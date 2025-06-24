import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ca } from 'date-fns/locale';
import { InfoItemComponent, InfoItemData } from '../../shared/components/info-item/info-item.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FloatingButtonComponent, FloatingButtonConfig } from '../../shared/components/floating-button/floating-button.component';
import { PopupStackComponent, PopupItem } from '../../shared/components/popup-stack/popup-stack.component';
import { FiltersPopupComponent } from '../../shared/components/filters-popup/filters-popup.component';

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
    InfoItemComponent,
    CardComponent,
    FloatingButtonComponent,
    PopupStackComponent,
    FiltersPopupComponent
  ],
  providers: [MessageService],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss']
})
export class AppointmentsPageComponent {
  // Core data signals
  private readonly citesSignal = signal<any[]>([]);
  private readonly viewModeSignal = signal<'list' | 'calendar'>('list');
  private readonly selectedDateSignal = signal<Date | null>(null);

  // Filter state signals
  private readonly filterDateSignal = signal<string>('');
  private readonly filterClientSignal = signal<string>('');
  private readonly quickFilterSignal = signal<'all' | 'today' | 'upcoming' | 'past' | 'mine'>('all');

  // UI state signals
  private readonly popupStackSignal = signal<PopupItem[]>([]);
  private readonly showAdvancedFiltersSignal = signal<boolean>(false);

  // Public computed signals
  readonly cites = computed(() => this.citesSignal());
  readonly viewMode = computed(() => this.viewModeSignal());
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly filterDate = computed(() => this.filterDateSignal());
  readonly filterClient = computed(() => this.filterClientSignal());
  readonly quickFilter = computed(() => this.quickFilterSignal());
  readonly popupStack = computed(() => this.popupStackSignal());
  readonly showAdvancedFilters = computed(() => this.showAdvancedFiltersSignal());

  // Computed popup data that updates automatically
  readonly popupData = computed(() => ({
    filterButtonsInput: this.filterButtons(),
    filterDateInput: this.filterDate(),
    filterClientInput: this.filterClient(),
    showAdvancedFiltersInput: this.showAdvancedFilters()
  }));

  // Computed filter buttons with reactive state
  readonly filterButtons = computed(() => [
    {
      icon: '🎯',
      tooltip: 'Avui',
      ariaLabel: 'Cites d\'avui',
      isActive: this.quickFilter() === 'today',
      variant: 'primary' as const,
      size: 'small' as const
    },
    {
      icon: '⏰',
      tooltip: 'Pròximes',
      ariaLabel: 'Pròximes cites',
      isActive: this.quickFilter() === 'upcoming',
      variant: 'primary' as const,
      size: 'small' as const
    },
    {
      icon: '📅',
      tooltip: 'Passades',
      ariaLabel: 'Cites passades',
      isActive: this.quickFilter() === 'past',
      variant: 'primary' as const,
      size: 'small' as const
    },
    {
      icon: '👤',
      tooltip: 'Meves',
      ariaLabel: 'Les meves cites',
      isActive: this.quickFilter() === 'mine',
      variant: 'primary' as const,
      size: 'small' as const
    },
    {
      icon: '🔍',
      tooltip: 'Avançats',
      ariaLabel: 'Filtres avançats',
      isActive: this.hasAdvancedFilters(),
      variant: 'success' as const,
      size: 'small' as const
    }
  ]);

  // Computed view buttons
  readonly viewButtons = computed(() => [
    {
      icon: '📋',
      tooltip: 'Llista',
      ariaLabel: 'Vista llista',
      isActive: this.viewMode() === 'list',
      variant: 'primary' as const,
      size: 'large' as const
    },
    {
      icon: '📅',
      tooltip: 'Calendari',
      ariaLabel: 'Vista calendari',
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
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(cita => {
          const appointmentDate = new Date(cita.data);
          return appointmentDate >= todayDate;
        });
        break;
      case 'past':
        const todayPast = new Date();
        todayPast.setHours(0, 0, 0, 0);
        filtered = filtered.filter(cita => {
          const appointmentDate = new Date(cita.data);
          return appointmentDate < todayPast;
        });
        break;
      case 'mine':
        const currentUser = localStorage.getItem('currentUser') || 'admin';
        filtered = filtered.filter(cita => cita.userId === currentUser || !cita.userId);
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.cites().filter(cita => {
      const appointmentDate = new Date(cita.data);
      return appointmentDate >= today;
    }).length;
  });

  // Computed helper methods
  readonly hasAdvancedFilters = computed(() =>
    this.filterDate() !== '' || this.filterClient() !== ''
  );

  constructor(private messageService: MessageService) {
    this.loadAppointments();

    // Effect to automatically show advanced filters when they're active
    effect(() => {
      if (this.hasAdvancedFilters()) {
        this.showAdvancedFiltersSignal.set(true);
      }
    });
  }

  // Filter management methods
  applyQuickFilter(filter: 'all' | 'today' | 'upcoming' | 'past' | 'mine') {
    if (this.quickFilter() === filter) {
      this.quickFilterSignal.set('all');
    } else {
      this.quickFilterSignal.set(filter);
      // Clear advanced filters when applying quick filter
      this.filterDateSignal.set('');
      this.filterClientSignal.set('');
    }
  }

  clearFilters() {
    this.filterDateSignal.set('');
    this.filterClientSignal.set('');
    this.quickFilterSignal.set('all');
    this.showAdvancedFiltersSignal.set(false);
  }

  toggleAdvancedFilters() {
    this.showAdvancedFiltersSignal.update(show => !show);
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

  onDateChange(value: string) {
    this.filterDateSignal.set(value);
  }

  onClientChange(value: string) {
    this.filterClientSignal.set(value);
  }

  onViewButtonClick(index: number) {
    this.viewModeSignal.set(index === 0 ? 'list' : 'calendar');
  }

  // Popup management
  openFiltersPopup() {
    const filtersPopup: PopupItem = {
      id: 'filters',
      size: 'small',
      content: FiltersPopupComponent,
      data: this.popupData(),
      onFilterClick: (index: number) => this.onFilterClick(index),
      onDateChange: (value: string) => this.onDateChange(value),
      onClientChange: (value: string) => this.onClientChange(value),
      onReset: () => this.onResetFilters(),
      onToggleAdvanced: () => this.toggleAdvancedFilters()
    };

    this.popupStackSignal.set([filtersPopup]);
  }

  closePopup(popupId: string) {
    this.popupStackSignal.update(stack => stack.filter(popup => popup.id !== popupId));
  }

  onResetFilters() {
    this.clearFilters();
    this.closePopup('filters');
  }

  // Utility methods
  loadAppointments() {
    const dades = localStorage.getItem('cites');
    if (dades) {
      const parsedData = JSON.parse(dades);
      const dadesAmbIds = parsedData.map((cita: any) => {
        if (!cita.id) {
          return { ...cita, id: uuidv4() };
        }
        return cita;
      });
      this.citesSignal.set(dadesAmbIds);

      if (parsedData.length > 0 && dadesAmbIds.length === parsedData.length) {
        localStorage.setItem('cites', JSON.stringify(dadesAmbIds));
      }
    }
  }

  deleteAppointment(cita: any) {
    this.citesSignal.update(cites => cites.filter(c => c.id !== cita.id));
    this.saveAppointments();

    this.messageService.add({
      severity: 'success',
      summary: 'Cita eliminada',
      detail: `S'ha eliminat la cita de ${cita.nom}`,
      life: 3000
    });
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
    const dateStr = format(date, 'yyyy-MM-dd');
    return this.cites().filter(cita => cita.data === dateStr);
  }

  formatDateForDisplay(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }
}

