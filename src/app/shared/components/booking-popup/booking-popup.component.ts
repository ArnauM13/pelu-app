import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CalendarModule } from 'primeng/calendar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ServicesService, Service, ServiceCategory } from '../../../core/services/services.service';

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

  // Available services for dropdown (use provided services or defaults)
  readonly services = computed(() => {
    const providedServices = this.availableServices();
    return providedServices.length > 0 ? providedServices : this.servicesService.getAllServices();
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

  constructor(private servicesService: ServicesService) {
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
