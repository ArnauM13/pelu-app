import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule } from '@ngx-translate/core';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: 'haircut' | 'beard' | 'treatment' | 'styling';
  icon: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: 'haircut' | 'beard' | 'treatment' | 'styling';
  name: string;
  icon: string;
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
    DropdownModule,
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

  // Service categories configuration
  readonly serviceCategories: ServiceCategory[] = [
    { id: 'haircut', name: 'Cortes', icon: '✂️' },
    { id: 'beard', name: 'Barba', icon: '🧔' },
    { id: 'treatment', name: 'Tractaments', icon: '💆' },
    { id: 'styling', name: 'Peinats', icon: '💇' }
  ];

  // Helper method to get category icon
  getCategoryIcon(categoryId: string): string {
    const category = this.serviceCategories.find(cat => cat.id === categoryId);
    return category?.icon || '✂️';
  }

  // Default services if none provided
  readonly defaultServices: Service[] = [
    {
      id: '1',
      name: 'Corte de cabell masculí',
      description: 'Corte clàssic o modern segons les teves preferències',
      price: 25,
      duration: 30,
      category: 'haircut',
      icon: '✂️',
      popular: true
    },
    {
      id: '2',
      name: 'Corte + Afaitat',
      description: 'Corte complet amb afaitat de barba inclòs',
      price: 35,
      duration: 45,
      category: 'haircut',
      icon: '✂️'
    },
    {
      id: '3',
      name: 'Afaitat de barba',
      description: 'Afaitat tradicional amb navalla o màquina',
      price: 15,
      duration: 20,
      category: 'beard',
      icon: '🧔'
    },
    {
      id: '4',
      name: 'Arreglada de barba',
      description: 'Perfilat i arreglada de barba',
      price: 12,
      duration: 15,
      category: 'beard',
      icon: '🧔'
    },
    {
      id: '5',
      name: 'Lavada i tractament',
      description: 'Lavada professional amb productes de qualitat',
      price: 18,
      duration: 25,
      category: 'treatment',
      icon: '💆'
    },
    {
      id: '6',
      name: 'Coloració',
      description: 'Coloració completa o retocs',
      price: 45,
      duration: 60,
      category: 'treatment',
      icon: '💆'
    },
    {
      id: '7',
      name: 'Peinat especial',
      description: 'Peinat per a esdeveniments especials',
      price: 30,
      duration: 40,
      category: 'styling',
      icon: '💇'
    },
    {
      id: '8',
      name: 'Corte infantil',
      description: 'Corte especialitzat per a nens',
      price: 18,
      duration: 25,
      category: 'haircut',
      icon: '✂️'
    }
  ];

  // Available services for dropdown (use provided services or defaults)
  readonly services = computed(() => {
    const providedServices = this.availableServices();
    return providedServices.length > 0 ? providedServices : this.defaultServices;
  });

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

  constructor() {
    // Reset selected service when popup closes
    effect(() => {
      if (!this.open()) {
        this.selectedService.set(undefined);
      }
    }, { allowSignalWrites: true });
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
