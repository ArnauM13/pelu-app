import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';

@Component({
  selector: 'pelu-appointments-page',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss']
})
export class AppointmentsPageComponent {
  cites = signal<any[]>([]);
  filterDate = signal<string>('');
  filterClient = signal<string>('');

  // Filtered appointments
  filteredCites = computed(() => {
    let filtered = this.cites();

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
  }

  trackByAppointment(index: number, appointment: any): string {
    return appointment.id;
  }
}
