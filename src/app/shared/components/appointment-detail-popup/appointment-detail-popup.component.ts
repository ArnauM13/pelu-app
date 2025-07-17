import { Component, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { InfoItemComponent, InfoItemData } from '../info-item/info-item.component';
import { AppointmentStatusBadgeComponent } from '../appointment-status-badge';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../services/toast.service';

interface Appointment {
  id: string;
  nom?: string;
  title?: string;
  data?: string;
  hora?: string;
  start?: string;
  notes?: string;
  servei?: string;
  preu?: number;
  duration?: number;
  serviceName?: string;
  serviceId?: string;
  userId?: string;
  clientName?: string;
  // Add any other properties that might exist in the actual data
  [key: string]: any;
}

@Component({
  selector: 'pelu-appointment-detail-popup',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TranslateModule,
    AppointmentStatusBadgeComponent
  ],
  templateUrl: './appointment-detail-popup.component.html',
  styleUrls: ['./appointment-detail-popup.component.scss']
})
export class AppointmentDetailPopupComponent implements OnInit {
  // Input signals
  readonly open = input<boolean>(false);
  readonly appointment = input<Appointment | null>(null);
  readonly appointmentId = input<string | null>(null); // Nou input
  readonly hideViewDetailButton = input<boolean>(false);

  // Output signals
  readonly closed = output<void>();
  readonly deleted = output<Appointment>();
  readonly editRequested = output<Appointment>();

  // Internal state
  private isClosing = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<boolean>(false);
  private loadedAppointment = signal<Appointment | null>(null);

  // Inject services
  constructor(
    private router: Router,
    private authService: AuthService,
    private translateService: TranslateService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (!this.appointment() && this.appointmentId()) {
      this.isLoading.set(true);
      this.loadError.set(false);
      // Intentar carregar la cita de localStorage
      try {
        const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
        const cita = appointments.find((c: any) => c.id === this.appointmentId());
        if (cita) {
          this.loadedAppointment.set(cita);
        } else {
          this.loadError.set(true);
        }
      } catch {
        this.loadError.set(true);
      }
      this.isLoading.set(false);
    }
  }

  // Computed properties
  readonly isClosingState = computed(() => this.isClosing());

  // Computed property per obtenir la cita a mostrar
  readonly appointmentToShow = computed(() => {
    return this.appointment() || this.loadedAppointment();
  });

  readonly appointmentInfoItems = computed(() => {
    const cita = this.appointmentToShow();
    if (!cita) return [];

    const items: InfoItemData[] = [
      {
        icon: '👤',
        label: this.translateService.instant('COMMON.CLIENT'),
        value: cita.nom || cita.title || cita.clientName || this.translateService.instant('APPOINTMENTS.NO_SPECIFIED')
      },
      {
        icon: '📅',
        label: this.translateService.instant('COMMON.DATE'),
        value: this.formatDate(cita.data || cita.start || '')
      }
    ];

    if (cita.hora) {
      items.push({
        icon: '⏰',
        label: this.translateService.instant('COMMON.HOURS'),
        value: this.formatTime(cita.hora)
      });
    } else if (cita.start) {
      // Extract time from start string
      const time = cita.start.split('T')[1]?.substring(0, 5);
      if (time) {
        items.push({
          icon: '⏰',
          label: this.translateService.instant('COMMON.HOURS'),
          value: this.formatTime(time)
        });
      }
    }

    if (cita.serviceName) {
      items.push({
        icon: '✂️',
        label: this.translateService.instant('COMMON.SERVICE'),
        value: cita.serviceName
      });
    } else if (cita.servei) {
      items.push({
        icon: '✂️',
        label: this.translateService.instant('COMMON.SERVICE'),
        value: cita.servei
      });
    }

    if (cita.duration) {
      items.push({
        icon: '⏱️',
        label: this.translateService.instant('APPOINTMENTS.DURATION'),
        value: `${cita.duration} ${this.translateService.instant('COMMON.UNITS.MINUTES')}`
      });
    }

    if (cita.preu) {
      items.push({
        icon: '💰',
        label: this.translateService.instant('APPOINTMENTS.PRICE'),
        value: `${cita.preu}${this.translateService.instant('APPOINTMENTS.EURO')}`
      });
    }

    if (cita.notes) {
      items.push({
        icon: '📝',
        label: this.translateService.instant('APPOINTMENTS.NOTES'),
        value: cita.notes
      });
    }

    return items;
  });

  readonly isToday = computed(() => {
    const cita = this.appointmentToShow();
    if (!cita) return false;
    const date = cita.data || cita.start?.split('T')[0] || '';
    return this.isTodayDate(date);
  });

  readonly isPast = computed(() => {
    const cita = this.appointmentToShow();
    if (!cita) return false;
    const date = cita.data || cita.start?.split('T')[0] || '';
    return this.isPastDate(date);
  });

  readonly statusBadge = computed(() => {
    if (this.isToday()) return { text: 'Avui', class: 'today' };
    if (this.isPast()) return { text: 'Passada', class: 'past' };
    return { text: 'Propera', class: 'upcoming' };
  });

  readonly appointmentDate = computed(() => {
    const cita = this.appointmentToShow();
    if (!cita) return '';

    if (cita.data) return cita.data;
    if (cita.start) return cita.start.split('T')[0];
    return '';
  });

  // Methods
  onClose() {
    if (this.isClosing()) return; // Prevent multiple close calls

    this.isClosing.set(true);

    // Use a more robust approach with animationend event
    setTimeout(() => {
      // Check if the animation has completed by looking at the computed styles
      const overlay = document.querySelector('.appointment-detail-popup-overlay.closing');
      const popup = document.querySelector('.appointment-detail-popup.closing');

      if (overlay && popup) {
        // Listen for animation end on both elements
        const handleAnimationEnd = () => {
          this.closed.emit();
          this.isClosing.set(false);
          overlay.removeEventListener('animationend', handleAnimationEnd);
          popup.removeEventListener('animationend', handleAnimationEnd);
        };

        overlay.addEventListener('animationend', handleAnimationEnd);
        popup.addEventListener('animationend', handleAnimationEnd);

        // Fallback timeout
        setTimeout(() => {
          if (this.isClosing()) {
            this.closed.emit();
            this.isClosing.set(false);
            overlay.removeEventListener('animationend', handleAnimationEnd);
            popup.removeEventListener('animationend', handleAnimationEnd);
          }
        }, 500);
      } else {
        // Fallback if elements not found
        setTimeout(() => {
          this.closed.emit();
          this.isClosing.set(false);
        }, 400);
      }
    }, 10); // Small delay to ensure DOM is updated
  }

      onViewFullDetail() {
    const appointment = this.appointmentToShow();
    const currentUser = this.authService.user();

    if (!appointment) {
      return;
    }

    if (!currentUser?.uid) {
      return;
    }

    const appointmentId = appointment.id;

    if (!appointmentId) {
      return;
    }

    // Assegurem-nos que l'appointment té l'userId correcte
    if (!appointment.userId) {
      appointment.userId = currentUser.uid;

      // Actualitzem localStorage per assegurar-nos que es guarda
      try {
        const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
        const updatedAppointments = appointments.map((cita: any) =>
          cita.id === appointmentId ? appointment : cita
        );
        localStorage.setItem('cites', JSON.stringify(updatedAppointments));
      } catch (error) {
        console.error('Error updating appointment in localStorage:', error);
      }
    }

    // Verifiquem que l'appointment pertany a l'usuari actual
    if (appointment.userId !== currentUser.uid) {
      console.warn('Appointment does not belong to current user');
      return;
    }

    // Generem un ID únic combinant clientId i appointmentId
    const clientId = currentUser.uid;
    const uniqueId = `${clientId}-${appointmentId}`;

    // Navigate instantly without animation
    this.router.navigate(['/appointments', uniqueId]);
    this.closed.emit();
  }

  onEditAppointment() {
    const appointment = this.appointmentToShow();
    if (!appointment) return;

    const currentUser = this.authService.user();
    if (!currentUser?.uid) return;

    const appointmentId = appointment.id;
    if (!appointmentId) return;

    // Ensure appointment has correct userId
    if (!appointment.userId) {
      appointment.userId = currentUser.uid;
      this.updateAppointmentInStorage(appointment);
    }

    // Verify appointment belongs to current user
    if (appointment.userId !== currentUser.uid) {
      console.warn('Appointment does not belong to current user');
      return;
    }

    // Generate unique ID combining clientId and appointmentId
    const clientId = currentUser.uid;
    const uniqueId = `${clientId}-${appointmentId}`;

    // Navigate instantly without animation
    this.router.navigate(['/appointments', uniqueId], { queryParams: { edit: 'true' } });
    this.closed.emit();
  }

  onDeleteAppointment() {
    const appointment = this.appointmentToShow();
    if (!appointment) return;

    const currentUser = this.authService.user();
    if (!currentUser?.uid) return;

    const appointmentId = appointment.id;
    if (!appointmentId) return;

    // Ensure appointment has correct userId
    if (!appointment.userId) {
      appointment.userId = currentUser.uid;
      this.updateAppointmentInStorage(appointment);
    }

    // Verify appointment belongs to current user
    if (appointment.userId !== currentUser.uid) {
      console.warn('Appointment does not belong to current user');
      return;
    }

    // Remove from localStorage
    try {
      const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
      const updatedAppointments = appointments.filter((cita: any) => cita.id !== appointmentId);
      localStorage.setItem('cites', JSON.stringify(updatedAppointments));

      // Show success message
      this.toastService.showAppointmentDeleted(appointment.nom || appointment.title || 'Cita');

      // Emit deleted event and close popup instantly
      this.deleted.emit(appointment);
      this.closed.emit();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      this.toastService.showError('Error al eliminar la cita', 'No s\'ha pogut eliminar la cita. Si us plau, torna-ho a provar.');
    }
  }

  private updateAppointmentInStorage(appointment: Appointment): void {
    try {
      const appointments = JSON.parse(localStorage.getItem('cites') || '[]');
      const updatedAppointments = appointments.map((cita: any) =>
        cita.id === appointment.id ? appointment : cita
      );
      localStorage.setItem('cites', JSON.stringify(updatedAppointments));
    } catch (error) {
      console.error('Error updating appointment in localStorage:', error);
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    if (!dateString) return this.translateService.instant('APPOINTMENTS.DATA_NOT_AVAILABLE');
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
    if (!dateString) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return dateString === today;
  }

  isPastDate(dateString: string): boolean {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    return appointmentDate < today;
  }
}
