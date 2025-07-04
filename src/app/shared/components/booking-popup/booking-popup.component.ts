import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: 'haircut' | 'beard' | 'treatment' | 'styling';
  popular?: boolean;
}

export interface BookingDetails {
  date: string;
  time: string;
  clientName: string;
  service?: Service;
}

@Component({
  selector: 'pelu-booking-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TranslateModule
  ],
  templateUrl: './booking-popup.component.html',
  styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent {
  // Input signals
  readonly open = input<boolean>(false);
  readonly bookingDetails = input<BookingDetails>({ date: '', time: '', clientName: '' });
  readonly availableServices = input<Service[]>([]);

  // Output signals
  readonly confirmed = output<BookingDetails>();
  readonly cancelled = output<void>();
  readonly clientNameChanged = output<string>();
  readonly serviceChanged = output<Service>();

  // Local state for service selection
  readonly selectedService = signal<Service | undefined>(undefined);

  // Available services for dropdown
  readonly services = computed(() => this.availableServices());

  // Computed properties
  readonly canConfirm = computed(() => {
    const details = this.bookingDetails();
    return details.clientName.trim() !== '' && this.selectedService() !== undefined;
  });

  readonly totalPrice = computed(() => {
    const service = this.selectedService();
    return service ? service.price : 0;
  });

  readonly totalDuration = computed(() => {
    const service = this.selectedService();
    return service ? service.duration : 0;
  });

  onClose() {
    this.cancelled.emit();
  }

  onConfirm() {
    if (this.canConfirm()) {
      const details = { ...this.bookingDetails(), service: this.selectedService() };
      this.confirmed.emit(details);
    }
  }

  onClientNameChange(value: string) {
    this.clientNameChanged.emit(value);
  }

  onServiceChange(service: Service) {
    this.selectedService.set(service);
    this.serviceChanged.emit(service);
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
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

  formatPrice(price: number): string {
    return `${price}€`;
  }

  formatDuration(duration: number): string {
    return `${duration} min`;
  }
}
