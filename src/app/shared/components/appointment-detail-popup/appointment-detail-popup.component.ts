import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { InfoItemComponent, InfoItemData } from '../info-item/info-item.component';
import { AuthService } from '../../../auth/auth.service';

interface Appointment {
  id: string;
  nom: string;
  data: string;
  hora: string;
  notes?: string;
  servei?: string;
  preu?: number;
  duration?: number;
  serviceName?: string;
  serviceId?: string;
  userId?: string;
}

@Component({
  selector: 'pelu-appointment-detail-popup',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TranslateModule,
    InfoItemComponent
  ],
  templateUrl: './appointment-detail-popup.component.html',
  styleUrls: ['./appointment-detail-popup.component.scss']
})
export class AppointmentDetailPopupComponent {
  // Input signals
  readonly open = input<boolean>(false);
  readonly appointment = input<Appointment | null>(null);

  // Output signals
  readonly closed = output<void>();

  // Inject services
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Computed properties
  readonly appointmentInfoItems = computed(() => {
    const cita = this.appointment();
    if (!cita) return [];

    const items: InfoItemData[] = [
      {
        icon: '👤',
        label: 'Client',
        value: cita.nom
      },
      {
        icon: '📅',
        label: 'Data',
        value: this.formatDate(cita.data)
      }
    ];

    if (cita.hora) {
      items.push({
        icon: '⏰',
        label: 'Hora',
        value: this.formatTime(cita.hora)
      });
    }

    if (cita.serviceName) {
      items.push({
        icon: '✂️',
        label: 'Servei',
        value: cita.serviceName
      });
    } else if (cita.servei) {
      items.push({
        icon: '✂️',
        label: 'Servei',
        value: cita.servei
      });
    }

    if (cita.duration) {
      items.push({
        icon: '⏱️',
        label: 'Durada',
        value: `${cita.duration} min`
      });
    }

    if (cita.preu) {
      items.push({
        icon: '💰',
        label: 'Preu',
        value: `${cita.preu}€`
      });
    }

    if (cita.notes) {
      items.push({
        icon: '📝',
        label: 'Notes',
        value: cita.notes
      });
    }

    return items;
  });

  readonly isToday = computed(() => {
    const cita = this.appointment();
    if (!cita) return false;
    return this.isTodayDate(cita.data);
  });

  readonly isPast = computed(() => {
    const cita = this.appointment();
    if (!cita) return false;
    return this.isPastDate(cita.data);
  });

  readonly statusBadge = computed(() => {
    if (this.isToday()) return { text: 'Avui', class: 'today' };
    if (this.isPast()) return { text: 'Passada', class: 'past' };
    return { text: 'Propera', class: 'upcoming' };
  });

  // Methods
  onClose() {
    this.closed.emit();
  }

  onViewFullDetail() {
    const cita = this.appointment();
    if (!cita) return;

    const user = this.authService.user();
    if (!user?.uid) {
      console.error('No hi ha usuari autenticat');
      return;
    }

    // Generem un ID únic combinant clientId i appointmentId
    const clientId = user.uid;
    const uniqueId = `${clientId}-${cita.id}`;

    console.log('🔗 Navigating to appointment detail:', uniqueId);
    this.router.navigate(['/appointments', uniqueId]);
    this.onClose();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  // Utility methods
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

  isTodayDate(dateString: string): boolean {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dateString === today;
  }

  isPastDate(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    return appointmentDate < today;
  }
}
