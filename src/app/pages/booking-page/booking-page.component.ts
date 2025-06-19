import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

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
    CalendarComponent
  ],
  templateUrl: './booking-page.component.html',
})
export class BookingPageComponent {
  nouClient = signal({ nom: '', data: '' });
  cites = signal<any[]>([]);

  events = computed(() => {
    return this.cites().map(c => ({
      title: c.nom,
      start: c.data
    }));
  });

  constructor() {
    const dades = JSON.parse(localStorage.getItem('cites') || '[]');
    this.cites.set(dades);
  }

  updateNom(value: string) {
    this.nouClient.update(client => ({ ...client, nom: value }));
  }

  updateData(value: string) {
    this.nouClient.update(client => ({ ...client, data: value }));
  }

  afegirCita() {
    const nova = { ...this.nouClient() };
    this.cites.update(cites => [...cites, nova]);
    this.nouClient.set({ nom: '', data: '' });
    this.guardarCites();
  }

  esborrarCita(cita: any) {
    this.cites.update(cites => cites.filter(c => c !== cita));
    this.guardarCites();
  }

  guardarCites() {
    localStorage.setItem('cites', JSON.stringify(this.cites()));
  }
}
