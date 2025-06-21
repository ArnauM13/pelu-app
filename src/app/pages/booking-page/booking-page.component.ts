import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';
import { InfoItemComponent, InfoItemData } from '../../shared/components/info-item/info-item.component';
import { CalendarComponent } from '../../features/calendar/calendar.component';
import { AuthService } from '../../auth/auth.service';
import { CardComponent } from '../../shared/components/card/card.component';

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
    InfoItemComponent,
    CalendarComponent,
    CardComponent
  ],
  providers: [MessageService],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent {
  nouClient = signal({ nom: '', data: '', hora: '' });
  cites = signal<any[]>([]);

  // Popup state
  showBookingPopup = signal<boolean>(false);
  bookingDetails = signal<{date: string, time: string, clientName: string}>({date: '', time: '', clientName: ''});

  events = computed(() => {
    return this.cites().map(c => ({
      title: c.nom,
      start: c.data + (c.hora ? 'T' + c.hora : '')
    }));
  });

  constructor(private messageService: MessageService, private authService: AuthService) {
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

    // Set default client name to current user
    const user = this.authService.user();
    const defaultName = user?.displayName || user?.email || '';
    this.nouClient.update(client => ({ ...client, nom: defaultName }));
  }

  updateNom(value: string) {
    this.nouClient.update(client => ({ ...client, nom: value }));
  }

  updateData(value: string) {
    this.nouClient.update(client => ({ ...client, data: value }));
  }

  updateHora(value: string) {
    this.nouClient.update(client => ({ ...client, hora: value }));
  }

  onDateSelected(selection: {date: string, time: string}) {
    // Show popup for confirmation
    const user = this.authService.user();
    const defaultName = user?.displayName || user?.email || '';
    this.bookingDetails.set({date: selection.date, time: selection.time, clientName: defaultName});
    this.showBookingPopup.set(true);
  }

  confirmBooking() {
    const details = this.bookingDetails();
    if (!details.clientName.trim()) return;
    const nova = {
      nom: details.clientName,
      data: details.date,
      hora: details.time,
      id: uuidv4()
    };
    this.cites.update(cites => [...cites, nova]);
    this.guardarCites();
    this.showBookingPopup.set(false);
    this.bookingDetails.set({date: '', time: '', clientName: ''});
    this.messageService.add({
      severity: 'success',
      summary: 'Reserva creada',
      detail: `S'ha creat una reserva per ${nova.nom} el ${this.formatDate(nova.data)} a les ${nova.hora}`,
      life: 3000
    });
  }

  closeBookingPopup() {
    this.showBookingPopup.set(false);
    this.bookingDetails.set({date: '', time: '', clientName: ''});
  }

  afegirCita() {
    const nova = {
      ...this.nouClient(),
      id: uuidv4()
    };
    this.cites.update(cites => [...cites, nova]);
    this.nouClient.set({ nom: '', data: '', hora: '' });
    this.guardarCites();
    const timeStr = nova.hora ? ` a les ${nova.hora}` : '';
    this.messageService.add({
      severity: 'success',
      summary: 'Reserva creada',
      detail: `S'ha creat una reserva per ${nova.nom} el ${this.formatDate(nova.data)}${timeStr}`,
      life: 3000
    });
  }

  esborrarCita(cita: any) {
    this.cites.update(cites => cites.filter(c => c.id !== cita.id));
    this.guardarCites();
    const timeStr = cita.hora ? ` a les ${cita.hora}` : '';
    this.messageService.add({
      severity: 'info',
      summary: 'Reserva eliminada',
      detail: `S'ha eliminat la reserva de ${cita.nom} del ${this.formatDate(cita.data)}${timeStr}`,
      life: 3000
    });
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
}
