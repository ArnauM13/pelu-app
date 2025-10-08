import { Component, inject, signal, computed, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputSelectComponent, SelectOption } from '../inputs/input-select/input-select.component';
import { BookingService } from '../../../core/services/booking.service';

export interface ClientOption {
  name: string;
  email: string;
  appointmentCount: number;
}

@Component({
  selector: 'pelu-client-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    InputSelectComponent,
  ],
  template: `
    <div class="client-search-filter">
      <h4 class="search-title">{{ 'CALENDAR.CLIENT_FILTER.TITLE' | translate }}</h4>

      <pelu-input-select
        [options]="selectOptions()"
        [value]="selectedClient()?.email"
        (valueChange)="onClientChange($event)"
        [placeholder]="'CALENDAR.CLIENT_FILTER.SEARCH_PLACEHOLDER' | translate"
        [filter]="true"
        [showClear]="true"
        [filterPlaceholder]="'CALENDAR.CLIENT_FILTER.SEARCH_PLACEHOLDER' | translate"
        [optionLabel]="'label'"
        [optionValue]="'value'"
      ></pelu-input-select>
    </div>
  `,
  styles: [`
    .client-search-filter {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .search-title {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-color);
    }
  `]
})
export class ClientSearchFilterComponent {
  // Outputs
  readonly clientSelected = output<ClientOption | null>();
  readonly clientFiltered = output<string | null>(); // Emit email for filtering

  // Services
  private readonly bookingService = inject(BookingService);

  // Internal state
  private readonly selectedClientSignal = signal<ClientOption | null>(null);

  // Computed properties
  readonly selectedClient = computed(() => this.selectedClientSignal());

  // Client data
  private readonly allClientsSignal = signal<ClientOption[]>([]);

  readonly selectOptions = computed(() => {
    const clients = this.allClientsSignal();
    return clients.map(client => ({
      label: `${client.name} (${client.appointmentCount} visita${client.appointmentCount !== 1 ? 's' : ''})`,
      value: client.email
    } as SelectOption));
  });

  constructor() {
    // Load clients initially
    this.loadClients();

    // React to changes in bookings
    effect(() => {
      const bookings = this.bookingService.bookings();
      if (bookings.length > 0) {
        this.loadClients();
      }
    });
  }

  onClientChange(email: string | number | undefined): void {
    if (!email) {
      this.selectedClientSignal.set(null);
      this.clientSelected.emit(null);
      this.clientFiltered.emit(null); // Clear filter
      return;
    }

    const client = this.allClientsSignal().find(c => c.email === email);
    this.selectedClientSignal.set(client || null);
    this.clientSelected.emit(client || null);
    this.clientFiltered.emit(client?.email || null); // Emit email for filtering
  }

  private loadClients(): void {
    // Get all bookings to extract unique clients
    const bookings = this.bookingService.bookings();

    // Group bookings by client email - only confirmed bookings
    const clientMap = new Map<string, { name: string; email: string; appointmentCount: number }>();

    bookings.forEach(booking => {
      // Only include confirmed bookings (visits)
      if (booking.clientName && booking.email && booking.status === 'confirmed') {
        const email = booking.email.toLowerCase();
        const existing = clientMap.get(email);

        if (existing) {
          existing.appointmentCount++;
        } else {
          clientMap.set(email, {
            name: booking.clientName,
            email: booking.email,
            appointmentCount: 1
          });
        }
      }
    });

    // Convert to array and sort by appointment count (descending), then by name
    const clients: ClientOption[] = Array.from(clientMap.values())
      .sort((a, b) => {
        // First sort by appointment count (descending)
        if (b.appointmentCount !== a.appointmentCount) {
          return b.appointmentCount - a.appointmentCount;
        }
        // Then sort by name (ascending)
        return a.name.localeCompare(b.name);
      });

    this.allClientsSignal.set(clients);
  }
}
