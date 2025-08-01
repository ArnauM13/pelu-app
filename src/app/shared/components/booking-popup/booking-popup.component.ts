import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputTextComponent } from '../inputs';
import { PopularBadgeComponent } from '../popular-badge/popular-badge.component';
import { PopupDialogComponent, PopupDialogConfig, FooterActionType } from '../popup-dialog/popup-dialog.component';
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
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    TranslateModule,
    InputTextComponent,
    PopularBadgeComponent,
    PopupDialogComponent,
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
  #fb = inject(FormBuilder);

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

  // Reactive Form
  private readonly formSignal = signal<FormGroup | null>(null);
  readonly form = computed(() => this.formSignal());

  // Computed properties
  readonly isAuthenticated = computed(() => this.#authService.isAuthenticated());
  readonly currentUserName = computed(() => this.#authService.userDisplayName());
  readonly currentUserEmail = computed(() => this.#authService.user()?.email || '');

  readonly canConfirm = computed(() => {
    const form = this.form();
    const details = this.bookingDetails();
    const hasService = details.service !== undefined;

    return form?.valid && hasService;
  });

  readonly totalPrice = computed(() => {
    const service = this.bookingDetails().service;
    return service ? service.price : 0;
  });

  // Popup dialog configuration
  readonly dialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.#translate.instant('COMMON.ACTIONS.CONFIRM_BOOKING'),
    size: 'large',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.#translate.instant('COMMON.ACTIONS.CONFIRM'),
        type: 'confirm' as const,
        disabled: !this.canConfirm(),
        action: () => this.onConfirm()
      }
    ]
  }));

  constructor() {
    this.initializeForm();

    // Initialize form with authenticated user data if available
    effect(() => {
      if (this.isAuthenticated()) {
        const form = this.form();
        if (form) {
          form.patchValue({
            clientName: this.currentUserName() || '',
            email: this.currentUserEmail() || ''
          });
        }
      }
    });
  }

  private initializeForm() {
    const form = this.#fb.group({
      clientName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.formSignal.set(form);
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form()?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form()?.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Aquest camp és obligatori';
      if (field.errors['email']) return 'Format d\'email invàlid';
      if (field.errors['minlength']) return `Mínim ${field.errors['minlength'].requiredLength} caràcters`;
    }
    return '';
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

  onClientNameChange(value: string) {
    this.clientNameChanged.emit(value);
  }

  onEmailChange(value: string) {
    this.emailChanged.emit(value);
  }

  onConfirm() {
    const form = this.form();
    if (!form?.valid) {
      this.#toastService.showValidationError('formulari');
      return;
    }

    const details = this.bookingDetails();
    const service = details.service;
    const formValue = form.value;

    if (!service) {
      this.#toastService.showValidationError('servei');
      return;
    }

    const confirmedDetails: BookingDetails = {
      ...details,
      clientName: formValue.clientName.trim(),
      email: formValue.email.trim().toLowerCase(),
      service: service,
    };

    // Clean up form
    form.reset();

    this.confirmed.emit(confirmedDetails);
  }
}
