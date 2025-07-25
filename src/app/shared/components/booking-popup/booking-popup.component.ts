import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputTextComponent } from '../inputs';
import { PopularBadgeComponent } from '../popular-badge/popular-badge.component';
import { CurrencyService } from '../../../core/services/currency.service';
import { FirebaseService } from '../../../core/services/firebase-services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../services/toast.service';
import { ServiceTranslationService } from '../../../core/services/service-translation.service';

export interface BookingDetails {
  date: string;
  time: string;
  clientName: string;
  email: string;
  service?: any;
}

@Component({
  selector: 'pelu-booking-popup',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    TranslateModule,
    InputTextComponent,
    PopularBadgeComponent,
  ],
  templateUrl: './booking-popup.component.html',
  styleUrls: ['./booking-popup.component.scss'],
})
export class BookingPopupComponent {
  // Inject services
  #translate = inject(TranslateService);
  #currencyService = inject(CurrencyService);
  #authService = inject(AuthService);
  #toastService = inject(ToastService);
  #serviceTranslationService = inject(ServiceTranslationService);

  // Input signals
  readonly open = input<boolean>(false);
  readonly bookingDetails = input<BookingDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });
  readonly availableServices = input<FirebaseService[]>([]);

  // Output signals
  readonly confirmed = output<BookingDetails>();
  readonly cancelled = output<void>();
  readonly clientNameChanged = output<string>();
  readonly emailChanged = output<string>();

  // Internal state signals
  readonly clientName = signal<string>('');
  readonly email = signal<string>('');

  // Computed properties
  readonly isAuthenticated = computed(() => this.#authService.isAuthenticated());
  readonly currentUserName = computed(() => this.#authService.userDisplayName());
  readonly currentUserEmail = computed(() => this.#authService.user()?.email || '');

  readonly canConfirm = computed(() => {
    const details = this.bookingDetails();
    const name = this.clientName() || details.clientName;
    const email = this.email() || details.email;
    const hasService = details.service !== undefined;

    // Email is always required (for both authenticated and anonymous users)
    const hasValidEmail = email.trim() !== '' && this.isValidEmail(email);

    return name.trim() !== '' && hasService && hasValidEmail;
  });

  readonly totalPrice = computed(() => {
    const service = this.bookingDetails().service;
    return service ? service.price : 0;
  });

  // Input configurations
  readonly clientNameConfig = {
    type: 'text' as const,
    label: 'COMMON.CLIENT_NAME',
    placeholder: 'COMMON.ENTER_CLIENT_NAME',
    required: true,
    icon: 'pi pi-user',
    iconPosition: 'left' as const,
  };

  readonly emailConfig = {
    type: 'email' as const,
    label: 'COMMON.EMAIL',
    placeholder: 'COMMON.ENTER_EMAIL',
    required: true,
    icon: 'pi pi-envelope',
    iconPosition: 'left' as const,
    autocomplete: 'email',
  };

  constructor() {
    // Initialize form with authenticated user data if available
    effect(
      () => {
        if (this.isAuthenticated()) {
          this.clientName.set(this.currentUserName() || '');
          this.email.set(this.currentUserEmail() || '');
        }
      }
    );
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

  // Format methods
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatPrice(price: number): string {
    return this.#currencyService.formatPrice(price);
  }

  formatDuration(duration: number): string {
    if (duration < 60) {
      return `${duration} min`;
    }
    const hours = Math.floor(duration / 60);
    const remainingMinutes = duration % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }

  getServiceName(service: FirebaseService): string {
    // Use the service translation service to get the translated name
    return this.#serviceTranslationService.translateServiceName(service.name);
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
    const service = details.service;
    const clientName = this.clientName() || details.clientName;
    const email = this.email() || details.email;

    if (!clientName.trim()) {
      this.#toastService.showValidationError('nom del client');
      return;
    }

    if (!email.trim()) {
      this.#toastService.showValidationError('email');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.#toastService.showValidationError('email vàlid');
      return;
    }

    if (!service) {
      this.#toastService.showValidationError('servei');
      return;
    }

    const confirmedDetails: BookingDetails = {
      ...details,
      clientName: clientName.trim(),
      email: email.trim().toLowerCase(),
      service: service,
    };

    // Clean up state
    this.clientName.set('');
    this.email.set('');

    this.confirmed.emit(confirmedDetails);
  }
}
