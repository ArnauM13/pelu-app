import { Component, input, output, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyService } from '../../../core/services/currency.service';
import { ServicesService, Service } from '../../../core/services/services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../services/toast.service';

export interface BookingDetails {
  date: string;
  time: string;
  clientName: string;
  email: string;
  service?: any;
}

@Component({
  selector: 'pelu-booking-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, InputTextModule, TranslateModule],
  templateUrl: './booking-popup.component.html',
  styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent {
  // Input signals
  readonly open = input<boolean>(false);
  readonly bookingDetails = input<BookingDetails>({date: '', time: '', clientName: '', email: ''});
  readonly availableServices = input<Service[]>([]);

  // Output signals
  readonly confirmed = output<BookingDetails>();
  readonly cancelled = output<void>();
  readonly clientNameChanged = output<string>();
  readonly emailChanged = output<string>();

  // Internal state
  readonly clientName = signal<string>('');
  readonly email = signal<string>('');
  readonly selectedService = signal<Service | null>(null);

  // Computed properties
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUserName = computed(() => this.authService.userDisplayName());
  readonly currentUserEmail = computed(() => this.authService.user()?.email || '');

  readonly canConfirm = computed(() => {
    const details = this.bookingDetails();
    const name = this.clientName() || details.clientName;
    const email = this.email() || details.email;
    const hasService = details.service !== undefined || this.selectedService() !== null;

    // Email is always required (for both authenticated and anonymous users)
    const hasValidEmail = email.trim() !== '' && this.isValidEmail(email);

    return name.trim() !== '' && hasService && hasValidEmail;
  });

  readonly totalPrice = computed(() => {
    const service = this.bookingDetails().service || this.selectedService();
    return service ? service.price : 0;
  });

  // Services
  private readonly translate = inject(TranslateService);
  readonly currencyService = inject(CurrencyService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  constructor() {
    // Initialize form with authenticated user data if available
    effect(() => {
      if (this.isAuthenticated()) {
        this.clientName.set(this.currentUserName() || '');
        this.email.set(this.currentUserEmail() || '');
      }
    }, {allowSignalWrites: true});
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Update methods
  updateClientName(value: string) {
    this.clientName.set(value);
    this.clientNameChanged.emit(value);
  }

  updateEmail(value: string) {
    this.email.set(value);
    this.emailChanged.emit(value);
  }

  // Service selection
  onServiceChange(event: any) {
    this.selectedService.set(event.value);
  }

  // Format methods
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return this.currencyService.formatPrice(price);
  }

  formatDuration(duration: number): string {
    return `${duration} ${this.translate.instant('COMMON.UNITS.MINUTES')}`;
  }

  getServiceName(service: Service): string {
    return this.translate.instant(`SERVICES.${service.id.toUpperCase()}.NAME`) || service.name;
  }

  // Event handlers
  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose() {
    this.cancelled.emit();
  }

  onConfirm() {
    const details = this.bookingDetails();
    const service = details.service || this.selectedService();
    const clientName = this.clientName() || details.clientName;
    const email = this.email() || details.email;

    if (!clientName.trim()) {
      this.toastService.showValidationError('nom del client');
      return;
    }

    if (!email.trim()) {
      this.toastService.showValidationError('email');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.toastService.showValidationError('email vàlid');
      return;
    }

    if (!service) {
      this.toastService.showValidationError('servei');
      return;
    }

    const confirmedDetails: BookingDetails = {
      ...details,
      clientName: clientName.trim(),
      email: email.trim().toLowerCase(),
      service: service
    };

    // Clean up state
    this.selectedService.set(null);
    this.clientName.set('');
    this.email.set('');

    this.confirmed.emit(confirmedDetails);
  }
}
