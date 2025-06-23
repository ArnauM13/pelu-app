import { Component, signal, computed } from '@angular/core';
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
    FloatingButtonComponent
  ],
  providers: [MessageService],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss']
})
export class AppointmentsPageComponent {
  cites = signal<any[]>([]);
  filterDate = signal<string>('');
  filterClient = signal<string>('');
  viewMode = signal<'list' | 'calendar'>('list');
  selectedDate = signal<Date | null>(null);
  quickFilter = signal<'all' | 'today' | 'upcoming' | 'past' | 'mine'>('all');
  showAdvancedFilters = signal<boolean>(false);

  // Floating button configurations
  viewButtons = computed(() => [
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

  filterButtons = computed(() => [
    {
      icon: '📋',
      tooltip: 'Totes',
      ariaLabel: 'Totes les cites',
      isActive: this.quickFilter() === 'all',
      variant: 'primary' as const,
      size: 'small' as const
    },
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
    }
  ]);

  actionButtons = computed(() => [
    {
      icon: '🔍',
      tooltip: 'Avançats',
      ariaLabel: 'Filtres avançats',
      isActive: this.showAdvancedFilters(),
      variant: 'success' as const,
      size: 'small' as const
    },
    {
      icon: '🗑️',
      tooltip: 'Netejar',
      ariaLabel: 'Netejar filtres',
      isActive: false,
      variant: 'danger' as const,
      size: 'small' as const
    }
  ]);

  // Getters and setters for ngModel
  get filterDateValue(): string {
    return this.filterDate();
  }

  set filterDateValue(value: string) {
    this.filterDate.set(value);
  }

  get filterClientValue(): string {
    return this.filterClient();
  }

  set filterClientValue(value: string) {
    this.filterClient.set(value);
  }

  // Filtered appointments
  filteredCites = computed(() => {
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
        // Assuming current user is stored somewhere, for now filter by a specific user
        const currentUser = localStorage.getItem('currentUser') || 'admin';
        filtered = filtered.filter(cita => cita.userId === currentUser || !cita.userId);
        break;
      default:
        // 'all' - no additional filtering
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

  // Calendar events
  calendarEvents = computed(() => {
    return this.cites().map(cita => ({
      id: cita.id,
      title: cita.nom,
      date: new Date(cita.data + 'T' + (cita.hora || '00:00')),
      data: cita,
      color: this.getEventColor(cita.data)
    }));
  });

  // Statistics
  totalAppointments = computed(() => this.cites().length);
  todayAppointments = computed(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.cites().filter(cita => cita.data === today).length;
  });
  upcomingAppointments = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.cites().filter(cita => {
      const appointmentDate = new Date(cita.data);
      return appointmentDate >= today;
    }).length;
  });

  constructor(private messageService: MessageService) {
    this.loadAppointments();
  }

  loadAppointments() {
    const dades = JSON.parse(localStorage.getItem('cites') || '[]');
    // Migrate existing appointments to have IDs
    const dadesAmbIds = dades.map((cita: any) => {
      if (!cita.id) {
        return { ...cita, id: uuidv4() };
      }
      return cita;
    });
    this.cites.set(dadesAmbIds);

    // Save migrated data back to localStorage
    if (dades.length > 0 && dadesAmbIds.length === dades.length) {
      localStorage.setItem('cites', JSON.stringify(dadesAmbIds));
    }
  }

  deleteAppointment(cita: any) {
    this.cites.update(cites => cites.filter(c => c.id !== cita.id));
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

  clearFilters() {
    this.filterDate.set('');
    this.filterClient.set('');
    this.quickFilter.set('all');
  }

  applyQuickFilter(filter: 'all' | 'today' | 'upcoming' | 'past' | 'mine') {
    this.quickFilter.set(filter);
    // Clear advanced filters when applying quick filters
    this.filterDate.set('');
    this.filterClient.set('');
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.update(show => !show);
  }

  toggleViewMode() {
    this.viewMode.update(mode => mode === 'list' ? 'calendar' : 'list');
  }

  onDateSelect(event: any) {
    this.selectedDate.set(event);
    // Filter appointments for selected date
    const selectedDateStr = format(event, 'yyyy-MM-dd');
    this.filterDate.set(selectedDateStr);
  }

  getEventColor(dateString: string): string {
    if (this.isToday(dateString)) {
      return '#3b82f6'; // Blue for today
    } else if (this.isPast(dateString)) {
      return '#6b7280'; // Gray for past
    } else {
      return '#10b981'; // Green for upcoming
    }
  }

  getAppointmentsForDate(date: Date): any[] {
    const dateStr = format(date, 'yyyy-MM-dd');
    return this.cites().filter(cita => cita.data === dateStr);
  }

  formatDateForDisplay(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  getQuickFilterLabel(filter: string): string {
    switch (filter) {
      case 'all': return 'Totes';
      case 'today': return 'Avui';
      case 'upcoming': return 'Pròximes';
      case 'past': return 'Passades';
      case 'mine': return 'Meves';
      default: return filter;
    }
  }

  // Floating button event handlers
  onViewButtonClick(index: number) {
    if (index === 0) {
      this.viewMode.set('list');
    } else {
      this.viewMode.set('calendar');
    }
  }

  onFilterButtonClick(index: number) {
    const filters: ('all' | 'today' | 'upcoming' | 'past' | 'mine')[] = ['all', 'today', 'upcoming', 'past', 'mine'];
    this.applyQuickFilter(filters[index]);
  }

  onActionButtonClick(index: number) {
    if (index === 0) {
      this.toggleAdvancedFilters();
    } else {
      this.clearFilters();
    }
  }
}
