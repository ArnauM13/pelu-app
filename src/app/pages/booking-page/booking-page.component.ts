import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';

import { CalendarComponent } from '../../features/calendar/calendar.component';

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
    CalendarComponent
  ],
  providers: [MessageService],
  templateUrl: './booking-page.component.html',
})
export class BookingPageComponent {
  nouClient = signal({ nom: '', data: '', hora: '' });
  cites = signal<any[]>([]);

  events = computed(() => {
    return this.cites().map(c => ({
      title: c.nom,
      start: c.data + (c.hora ? 'T' + c.hora : '')
    }));
  });

  constructor(private messageService: MessageService) {
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
    console.log('Booking component received selection:', selection);
    this.updateData(selection.date);
    this.updateHora(selection.time);
  }

  afegirCita() {
    const nova = {
      ...this.nouClient(),
      id: uuidv4()
    };
    this.cites.update(cites => [...cites, nova]);
    this.nouClient.set({ nom: '', data: '', hora: '' });
    this.guardarCites();

    // Show success toast
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

    // Show info toast
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

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
