import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent, AppointmentEvent } from './calendar.component';

@Component({
  selector: 'pelu-calendar-demo',
  standalone: true,
  imports: [CommonModule, CalendarComponent],
  template: `
    <div class="demo-container">
      <h2>Calendari Setmanal - Demostració</h2>
      <p class="demo-description">
        Aquest calendari mostra les millores implementades:
      </p>
      <ul class="demo-features">
        <li>✅ Franges de 30 minuts (08:00 - 20:00)</li>
        <li>✅ Càlcul correcte de posició i altura de cites</li>
        <li>✅ Bloqueig de franges amb solapaments parcials</li>
        <li>✅ Visualització similar a Google Calendar</li>
      </ul>

      <div class="demo-controls">
        <button (click)="addSampleAppointments()" class="demo-btn">
          Afegir Cites d'Exemple
        </button>
        <button (click)="clearAppointments()" class="demo-btn secondary">
          Netejar Cites Demo
        </button>
        <button (click)="clearAllAppointments()" class="demo-btn danger">
          🗑️ Netejar TOTES les Cites
        </button>
      </div>

      <div class="calendar-wrapper">
        <pelu-calendar-component
          [events]="demoEvents()"
          (dateSelected)="onDateSelected($event)">
        </pelu-calendar-component>
      </div>

      <div class="demo-info">
        <h3>Informació de la Demostració:</h3>
        <div class="info-grid">
          <div class="info-item">
            <strong>Franges:</strong> 30 minuts (08:00 - 20:00)
          </div>
          <div class="info-item">
            <strong>Dies:</strong> Dimarts a Dissabte
          </div>
          <div class="info-item">
            <strong>Pausa:</strong> 13:00 - 15:00
          </div>
          <div class="info-item">
            <strong>Escala:</strong> 1 minut = 1 píxel
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    h2 {
      color: #1f2937;
      margin-bottom: 1rem;
      font-size: 1.8rem;
    }

    .demo-description {
      color: #6b7280;
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .demo-features {
      background: #f3f4f6;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border-left: 4px solid #3b82f6;
    }

    .demo-features li {
      margin-bottom: 0.5rem;
      color: #374151;
      font-size: 0.95rem;
    }

    .demo-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .demo-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .demo-btn:first-child {
      background: #3b82f6;
      color: white;
    }

    .demo-btn:first-child:hover {
      background: #2563eb;
    }

    .demo-btn.secondary {
      background: #6b7280;
      color: white;
    }

         .demo-btn.secondary:hover {
       background: #4b5563;
     }

     .demo-btn.danger {
       background: #dc3545;
       color: white;
     }

     .demo-btn.danger:hover {
       background: #c82333;
     }

    .calendar-wrapper {
      margin-bottom: 2rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .demo-info {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .demo-info h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.2rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      padding: 0.75rem;
      background: white;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      font-size: 0.9rem;
    }

    .info-item strong {
      color: #3b82f6;
    }

    @media (max-width: 768px) {
      .demo-container {
        padding: 1rem;
      }

      .demo-controls {
        flex-direction: column;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CalendarDemoComponent {
  readonly demoEvents = signal<AppointmentEvent[]>([]);

  addSampleAppointments() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Ensure we start on a Tuesday (day 2)
    const daysUntilTuesday = (2 - tomorrow.getDay() + 7) % 7;
    const tuesday = new Date(tomorrow);
    tuesday.setDate(tomorrow.getDate() + daysUntilTuesday);

    const sampleAppointments: AppointmentEvent[] = [
      // Tuesday appointments
      {
        id: '1',
        title: 'Tall de cabell - Maria',
        start: `${this.formatDate(tuesday)}T09:00:00`,
        end: `${this.formatDate(tuesday)}T10:30:00`,
        duration: 90,
        serviceName: 'Tall de cabell',
        clientName: 'Maria'
      },
      {
        id: '2',
        title: 'Coloració - Anna',
        start: `${this.formatDate(tuesday)}T11:00:00`,
        end: `${this.formatDate(tuesday)}T13:00:00`,
        duration: 120,
        serviceName: 'Coloració',
        clientName: 'Anna'
      },
      {
        id: '3',
        title: 'Manicura - Laura',
        start: `${this.formatDate(tuesday)}T15:30:00`,
        end: `${this.formatDate(tuesday)}T16:30:00`,
        duration: 60,
        serviceName: 'Manicura',
        clientName: 'Laura'
      },

      // Wednesday appointments
      {
        id: '4',
        title: 'Perruqueria - Carles',
        start: `${this.formatDate(this.addDays(tuesday, 1))}T08:30:00`,
        end: `${this.formatDate(this.addDays(tuesday, 1))}T09:30:00`,
        duration: 60,
        serviceName: 'Perruqueria',
        clientName: 'Carles'
      },
      {
        id: '5',
        title: 'Tractament facial - Sofia',
        start: `${this.formatDate(this.addDays(tuesday, 1))}T10:00:00`,
        end: `${this.formatDate(this.addDays(tuesday, 1))}T11:30:00`,
        duration: 90,
        serviceName: 'Tractament facial',
        clientName: 'Sofia'
      },
      {
        id: '6',
        title: 'Depilació - Marta',
        start: `${this.formatDate(this.addDays(tuesday, 1))}T16:00:00`,
        end: `${this.formatDate(this.addDays(tuesday, 1))}T17:00:00`,
        duration: 60,
        serviceName: 'Depilació',
        clientName: 'Marta'
      },

      // Thursday appointments (overlapping)
      {
        id: '7',
        title: 'Tall de cabell - Joan',
        start: `${this.formatDate(this.addDays(tuesday, 2))}T09:00:00`,
        end: `${this.formatDate(this.addDays(tuesday, 2))}T10:00:00`,
        duration: 60,
        serviceName: 'Tall de cabell',
        clientName: 'Joan'
      },
      {
        id: '8',
        title: 'Coloració - Elena',
        start: `${this.formatDate(this.addDays(tuesday, 2))}T09:30:00`,
        end: `${this.formatDate(this.addDays(tuesday, 2))}T11:30:00`,
        duration: 120,
        serviceName: 'Coloració',
        clientName: 'Elena'
      },

      // Friday appointments
      {
        id: '9',
        title: 'Manicura - Patricia',
        start: `${this.formatDate(this.addDays(tuesday, 3))}T14:00:00`,
        end: `${this.formatDate(this.addDays(tuesday, 3))}T15:00:00`,
        duration: 60,
        serviceName: 'Manicura',
        clientName: 'Patricia'
      },
      {
        id: '10',
        title: 'Perruqueria - David',
        start: `${this.formatDate(this.addDays(tuesday, 3))}T17:00:00`,
        end: `${this.formatDate(this.addDays(tuesday, 3))}T18:30:00`,
        duration: 90,
        serviceName: 'Perruqueria',
        clientName: 'David'
      },

      // Saturday appointments
      {
        id: '11',
        title: 'Tall de cabell - Cristina',
        start: `${this.formatDate(this.addDays(tuesday, 4))}T10:00:00`,
        end: `${this.formatDate(this.addDays(tuesday, 4))}T11:00:00`,
        duration: 60,
        serviceName: 'Tall de cabell',
        clientName: 'Cristina'
      },
      {
        id: '12',
        title: 'Coloració - Rosa',
        start: `${this.formatDate(this.addDays(tuesday, 4))}T12:00:00`,
        end: `${this.formatDate(this.addDays(tuesday, 4))}T14:00:00`,
        duration: 120,
        serviceName: 'Coloració',
        clientName: 'Rosa'
      }
    ];

    this.demoEvents.set(sampleAppointments);
  }

  clearAppointments() {
    this.demoEvents.set([]);
  }

  clearAllAppointments() {
    // Clear demo events
    this.demoEvents.set([]);

    // Clear localStorage
    localStorage.removeItem('cites');

    console.log('Totes les cites han estat eliminades (Demo + localStorage)');
    alert('Totes les cites han estat eliminades!');
  }

  onDateSelected(selection: {date: string, time: string}) {
    console.log('Data seleccionada:', selection);
    alert(`Has seleccionat: ${selection.date} a les ${selection.time}`);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
