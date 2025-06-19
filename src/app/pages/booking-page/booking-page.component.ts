import { Component } from '@angular/core';
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
  nouClient = { nom: '', data: '' };
  cites: any[] = [];

  afegirCita() {
    const nova = { ...this.nouClient };
    this.cites.push(nova);
    this.nouClient = { nom: '', data: '' };
    this.guardarCites();
  }

  esborrarCita(cita: any) {
    this.cites = this.cites.filter(c => c !== cita);
    this.guardarCites();
  }

  guardarCites() {
    localStorage.setItem('cites', JSON.stringify(this.cites));
  }

  get events() {
    return this.cites.map(c => ({
      title: c.nom,
      start: c.data
    }));
  }

  constructor() {
    const dades = JSON.parse(localStorage.getItem('cites') || '[]');
    this.cites = dades;
  }
}
