import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { TranslateModule } from '@ngx-translate/core';
import { InfoItemData } from '../../../shared/components/info-item/info-item.component';
import { CalendarComponent, AppointmentEvent } from '../../../features/calendar/calendar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BookingPopupComponent, BookingDetails } from '../../../shared/components/booking-popup/booking-popup.component';



@Component({
  selector: 'pelu-booking-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    CalendarComponent,
    CardComponent,
    BookingPopupComponent,

  ],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent {
  // Inject services
  public readonly messageService = inject(MessageService);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  // Internal state signals
  private readonly nouClientSignal = signal({ nom: '', data: '', hora: '' });
  private readonly citesSignal = signal<any[]>([]);
  private readonly showBookingPopupSignal = signal<boolean>(false);
  private readonly bookingDetailsSignal = signal<BookingDetails>({date: '', time: '', clientName: ''});

  // Public computed signals
  readonly nouClient = computed(() => this.nouClientSignal());
  readonly cites = computed(() => this.citesSignal());
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());

  // Computed properties
  readonly events = computed((): AppointmentEvent[] => {
    return this.cites().map(c => ({
      title: c.nom,
      start: c.data + (c.hora ? 'T' + c.hora : ''),
      duration: c.duration || 60, // Default to 60 minutes if not specified
      serviceName: c.serviceName,
      clientName: c.nom
    }));
  });

  readonly canAddAppointment = computed(() => {
    const client = this.nouClient();
    return client.nom.trim() !== '' && client.data !== '';
  });



  constructor() {
    this.loadAppointments();
    this.setDefaultClientName();

    // Initialize user effect
    this.#initUserEffect();


  }

  #initUserEffect() {
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.setDefaultClientName();
      }
    }, { allowSignalWrites: true });
  }



  private loadAppointments() {
    const dades = JSON.parse(localStorage.getItem('cites') || '[]');

    // Only add IDs to appointments that don't have them (no migration of userId)
    const dadesAmbIds = dades.map((cita: any) => {
      if (!cita.id) {
        return { ...cita, id: uuidv4() };
      }
      return cita;
    });

    this.citesSignal.set(dadesAmbIds);

    // Save migrated data back to localStorage if there were changes
    if (dadesAmbIds.some((cita: any, index: number) =>
      cita.id !== dades[index]?.id
    )) {
      localStorage.setItem('cites', JSON.stringify(dadesAmbIds));
    }
  }

  private setDefaultClientName() {
    const user = this.authService.user();
    const defaultName = user?.displayName || user?.email || '';
    this.nouClientSignal.update(client => ({ ...client, nom: defaultName }));
  }

  updateNom(value: string) {
    this.nouClientSignal.update(client => ({ ...client, nom: value }));
  }

  updateData(value: string) {
    this.nouClientSignal.update(client => ({ ...client, data: value }));
  }

  updateHora(value: string) {
    this.nouClientSignal.update(client => ({ ...client, hora: value }));
  }

  onDateSelected(selection: {date: string, time: string}) {
    // Show popup for confirmation
    const user = this.authService.user();
    const defaultName = user?.displayName || user?.email || '';
    this.bookingDetailsSignal.set({date: selection.date, time: selection.time, clientName: defaultName});
    this.showBookingPopupSignal.set(true);
  }

  onBookingConfirmed(details: BookingDetails) {
    const user = this.authService.user();
    if (!user) {
      this.showToast('error', 'Error', 'No s\'ha pogut crear la reserva. Si us plau, inicia sessió.');
      return;
    }

    const nova = {
      nom: details.clientName,
      data: details.date,
      hora: details.time,
      id: uuidv4(),
      userId: user.uid,
      duration: details.service?.duration || 60,
      serviceName: details.service?.name,
      serviceId: details.service?.id
    };
    this.citesSignal.update(cites => [...cites, nova]);
    this.guardarCites();
    this.showBookingPopupSignal.set(false);
    this.bookingDetailsSignal.set({date: '', time: '', clientName: ''});

    const serviceInfo = details.service ? ` (${details.service.name} - ${details.service.duration} min)` : '';
    this.showToast('success', '✅ Reserva creada', `S'ha creat una reserva per ${nova.nom} el ${this.formatDate(nova.data)} a les ${nova.hora}${serviceInfo}`, nova.id, true);
  }

  onBookingCancelled() {
    this.showBookingPopupSignal.set(false);
    this.bookingDetailsSignal.set({date: '', time: '', clientName: ''});
  }



  afegirCita() {
    if (!this.canAddAppointment()) return;

    const user = this.authService.user();
    if (!user) {
      this.showToast('error', '❌ Error', 'No s\'ha pogut crear la reserva. Si us plau, inicia sessió.');
      return;
    }

    const nova = {
      ...this.nouClient(),
      id: uuidv4(),
      userId: user.uid
    };
    this.citesSignal.update(cites => [...cites, nova]);
    this.nouClientSignal.set({ nom: '', data: '', hora: '' });
    this.guardarCites();
    const timeStr = nova.hora ? ` a les ${nova.hora}` : '';
    this.showToast('success', '✅ Reserva creada', `S'ha creat una reserva per ${nova.nom} el ${this.formatDate(nova.data)}${timeStr}`, nova.id, true);
  }

  esborrarCita(cita: any) {
    this.citesSignal.update(cites => cites.filter(c => c.id !== cita.id));
    this.guardarCites();
    const timeStr = cita.hora ? ` a les ${cita.hora}` : '';
    this.showToast('info', '🗑️ Reserva eliminada', `S'ha eliminat la reserva de ${cita.nom} del ${this.formatDate(cita.data)}${timeStr}`, cita.id);
  }

  guardarCites() {
    localStorage.setItem('cites', JSON.stringify(this.cites()));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCitaInfoItem(cita: any): InfoItemData {
    const timeStr = cita.hora ? ` a les ${cita.hora}` : '';
    const dateStr = new Date(cita.data).toLocaleDateString('ca-ES');
    return {
      icon: '📅',
      label: cita.nom,
      value: `${dateStr}${timeStr}`
    };
  }

  showToast(severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string, appointmentId?: string, showViewButton: boolean = false) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 4000,
      closable: false,
      key: 'booking-toast',
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

  viewAppointmentDetail(appointmentId: string) {
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
