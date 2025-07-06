import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CalendarModule } from 'primeng/calendar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';

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

export interface TimeSlot {
  label: string;
  value: string;
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
    CalendarModule,
    TranslateModule,
    ToastModule
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
  readonly dateChanged = output<string>();
  readonly timeChanged = output<string>();

  // Local state for service selection
  readonly selectedService = signal<Service | undefined>(undefined);
  readonly selectedDate = signal<Date | undefined>(undefined);
  readonly selectedTime = signal<string>('');

  // Available time slots
  readonly timeSlots: TimeSlot[] = [
    { label: '08:00', value: '08:00' },
    { label: '08:30', value: '08:30' },
    { label: '09:00', value: '09:00' },
    { label: '09:30', value: '09:30' },
    { label: '10:00', value: '10:00' },
    { label: '10:30', value: '10:30' },
    { label: '11:00', value: '11:00' },
    { label: '11:30', value: '11:30' },
    { label: '12:00', value: '12:00' },
    { label: '12:30', value: '12:30' },
    { label: '15:00', value: '15:00' },
    { label: '15:30', value: '15:30' },
    { label: '16:00', value: '16:00' },
    { label: '16:30', value: '16:30' },
    { label: '17:00', value: '17:00' },
    { label: '17:30', value: '17:30' },
    { label: '18:00', value: '18:00' },
    { label: '18:30', value: '18:30' },
    { label: '19:00', value: '19:00' },
    { label: '19:30', value: '19:30' }
  ];

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
  readonly errorMessage = signal('');
  readonly canConfirm = computed(() => {
    const details = this.bookingDetails();
    return (
      details.clientName.trim() !== '' &&
      this.selectedService() !== undefined
    );
  });

  readonly totalPrice = computed(() => {
    const service = this.selectedService();
    return service ? service.price : 0;
  });

  readonly totalDuration = computed(() => {
    const service = this.selectedService();
    return service ? service.duration : 0;
  });

  // Getter for minimum date (today)
  get minDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private readonly translate = inject(TranslateService);

  readonly showErrorToast = signal(false);

  onClose() {
    this.cancelled.emit();
  }

  onConfirm() {
    const details = this.bookingDetails();
    const missing: string[] = [];
    if (!details.clientName.trim()) missing.push(this.translate.instant('COMMON.CLIENT_NAME'));
    if (!this.selectedService()) missing.push(this.translate.instant('COMMON.SERVICE'));
    if (missing.length > 0) {
      this.errorMessage.set(this.translate.instant('COMMON.MISSING_FIELDS') + ': ' + missing.join(', '));
      this.showErrorToast.set(true);
      setTimeout(() => this.showErrorToast.set(false), 3000);
      return;
    }
    const confirmedDetails = { ...details, service: this.selectedService() };
    this.confirmed.emit(confirmedDetails);
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
        this.selectedDate.set(undefined);
        this.selectedTime.set('');
      } else {
        // Initialize with booking details when popup opens
        const details = this.bookingDetails();
        if (details.date) {
          this.selectedDate.set(new Date(details.date));
        }
        if (details.time) {
          this.selectedTime.set(details.time);
        }
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

  // Helper per format input date (yyyy-MM-dd)
  formatDateInput(date: Date | undefined): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get todayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get selectedTimeValue(): string {
    return this.selectedTime();
  }
}
