import { Component, input, output, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyService } from '../../../core/services/currency.service';
import { ServicesService, Service } from '../../../core/services/services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../services/toast.service';

export interface BookingDetails {
  date: string;
  time: string;
  clientName: string;
  service?: any;
}

@Component({
  selector: 'pelu-booking-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, TranslateModule],
  templateUrl: './booking-popup.component.html',
  styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent {
  // Input signals
  readonly open = input<boolean>(false);
  readonly bookingDetails = input<BookingDetails>({date: '', time: '', clientName: ''});
  readonly availableServices = input<Service[]>([]);

  // Output signals
  readonly confirmed = output<BookingDetails>();
  readonly cancelled = output<void>();
  readonly clientNameChanged = output<string>();

  // Internal state
  readonly clientName = signal<string>('');
  readonly selectedService = signal<Service | null>(null);

  // Computed properties
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUserName = computed(() => this.authService.userDisplayName());

  readonly canConfirm = computed(() => {
    const details = this.bookingDetails();
    const name = this.clientName() || details.clientName;
    const hasService = details.service !== undefined || this.selectedService() !== null;
    return name.trim() !== '' && hasService;
  });

  readonly totalPrice = computed(() => {
    const service = this.bookingDetails().service || this.selectedService();
    return service ? service.price : 0;
  });

  // Services
  private readonly translate = inject(TranslateService);
  readonly currencyService = inject(CurrencyService);
  private readonly servicesService = inject(ServicesService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  constructor() {
    // Clean up state when popup opens
    effect(() => {
      if (this.open()) {
        this.selectedService.set(null);

        // Set client name based on authentication status
        if (this.isAuthenticated()) {
          this.clientName.set(this.currentUserName());
        } else {
          this.clientName.set('');
        }
      }
    }, {allowSignalWrites: true});
  }

  onClose() {
    this.selectedService.set(null);
    this.clientName.set('');
    this.cancelled.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  updateClientName(name: string) {
    this.clientName.set(name);
    this.clientNameChanged.emit(name);
  }

  formatDate(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }

  onServiceChange(event: any) {
    this.selectedService.set(event.value);
  }

  getServiceName(service: Service): string {
    return this.servicesService.getServiceName(service);
  }

  formatDuration(duration: number): string {
    return `${duration} min`;
  }

  formatPrice(price: number): string {
    return this.currencyService.formatPrice(price);
  }

  onConfirm() {
    const details = this.bookingDetails();
    const service = details.service || this.selectedService();
    const clientName = this.clientName() || details.clientName;

    if (!clientName.trim()) {
      this.toastService.showValidationError('nom del client');
      return;
    }

    if (!service) {
      this.toastService.showValidationError('servei');
      return;
    }

    const confirmedDetails: BookingDetails = {
      ...details,
      clientName: clientName.trim(),
      service: service
    };

    // Clean up state
    this.selectedService.set(null);
    this.clientName.set('');

    this.confirmed.emit(confirmedDetails);
  }
}
