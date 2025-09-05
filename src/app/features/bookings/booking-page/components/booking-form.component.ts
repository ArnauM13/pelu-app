import { Component, computed, inject, output, signal, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputTextComponent } from '../../../../shared/components/inputs/input-text/input-text.component';
import { InputTextareaComponent } from '../../../../shared/components/inputs/input-textarea/input-textarea.component';
import { InputDateComponent } from '../../../../shared/components/inputs/input-date/input-date.component';
import { InputSelectComponent, SelectOption } from '../../../../shared/components/inputs/input-select/input-select.component';
import { BookingService } from '../../../../core/services/booking.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoaderService } from '../../../../shared/services/loader.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Booking } from '../../../../core/interfaces/booking.interface';
import { BookingStateService } from '../services/booking-state.service';
import { SystemParametersService } from '../../../../core/services/system-parameters.service';
import { BookingValidationService } from '../../../../core/services/booking-validation.service';
import { UserService } from '../../../../core/services/user.service';
import { DateTimeAvailabilityService } from '../../../../core/services/date-time-availability.service';

@Component({
  selector: 'pelu-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
    InputTextComponent,
    InputTextareaComponent,
    InputDateComponent,
    InputSelectComponent,
  ],
  template: `
    <div class="booking-form">
      <pelu-card variant="default">
        <div class="booking-form-header">
          <div class="header-content">
            <h3>📝 {{ displayTitle() | translate }}</h3>
            <p class="booking-form-subtitle">{{ displaySubtitle() | translate }}</p>
          </div>

          @if (showActions() && actionButtons().length > 0) {
            <div class="header-actions">
              @for (action of actionButtons(); track action.label) {
                <pelu-button
                  [icon]="action.icon || ''"
                  [severity]="action.severity || 'secondary'"
                  (clicked)="action.onClick()"
                  [raised]="false"
                  [size]="'small'"
                >
                </pelu-button>
              }
            </div>
          }
        </div>

        <div class="booking-form-content">

          <!-- Service Selection -->
          <pelu-input-select
            [label]="'BOOKING.SERVICE'"
            [placeholder]="'BOOKING.SELECT_SERVICE'"
            [required]="true"
            [options]="serviceOptions()"
            [value]="selectedServiceId()"
            [searchable]="true"
            [clearable]="false"
            [disabled]="inputsDisabled()"
            (valueChange)="onServiceChange($event)"
          >
          </pelu-input-select>

          <!-- Date Selection -->
          <pelu-input-date
            [label]="'BOOKING.DATE'"
            [required]="true"
            [value]="selectedDateString()"
            [minDate]="minDate"
            [preventPastMonths]="true"
            [disabled]="inputsDisabled()"
            (valueChange)="onDateChange($event)"
          >
          </pelu-input-date>

          <!-- Time Selection -->
          <pelu-input-select
            [label]="'BOOKING.TIME'"
            [placeholder]="'BOOKING.SELECT_TIME'"
            [required]="true"
            [options]="timeSlotOptions()"
            [value]="selectedTime()"
            [searchable]="true"
            [clearable]="false"
            [disabled]="inputsDisabled() || (!selectedService() || !selectedDate())"
            (valueChange)="onTimeChange($event)"
          >
          </pelu-input-select>

          <!-- Client Name -->
          <pelu-input-text
            [label]="'BOOKING.CLIENT_NAME'"
            [placeholder]="'BOOKING.CLIENT_NAME_PLACEHOLDER'"
            [required]="true"
            [value]="clientName()"
            [disabled]="inputsDisabled()"
            (valueChange)="onClientNameChange($event)"
          >
          </pelu-input-text>

          <!-- Client Email -->
          <pelu-input-text
            [label]="'COMMON.EMAIL'"
            [placeholder]="'BOOKING.EMAIL_PLACEHOLDER'"
            [required]="true"
            [type]="'email'"
            [value]="clientEmail()"
            [disabled]="inputsDisabled()"
            (valueChange)="onEmailChange($event)"
          >
          </pelu-input-text>

          <!-- Notes (Optional) -->
          <pelu-input-textarea
            [label]="'BOOKING.NOTES'"
            [placeholder]="'BOOKING.NOTES_PLACEHOLDER'"
            [rows]="3"
            [value]="notes()"
            [disabled]="inputsDisabled()"
            (valueChange)="onNotesChange($event)"
          >
          </pelu-input-textarea>

          <!-- Footer Actions -->
          @if (showFooterActions() && footerActionButtons().length > 0) {
            <div class="form-actions">
              @for (action of footerActionButtons(); track action.label) {
                <pelu-button
                  [label]="action.label"
                  [icon]="action.icon || ''"
                  [severity]="action.severity || 'primary'"
                  (clicked)="action.onClick()"
                  [disabled]="action.disabled || (action.severity === 'primary' && !canCreateBooking())"
                  [raised]="true"
                  [fluid]="true"
                >
                </pelu-button>
              }
            </div>
          } @else if (showDefaultSubmitButton()) {
            <!-- Default Submit Button -->
            <div class="form-actions">
              <pelu-button
                [label]="isEditMode() ? 'COMMON.ACTIONS.SAVE' : 'BOOKING.CREATE_MANUAL_BOOKING'"
                (clicked)="onSubmit()"
                [disabled]="!canCreateBooking()"
                severity="primary"
                [raised]="true"
                [fluid]="true"
              >
              </pelu-button>
            </div>
          }

          <!-- Validation Messages -->
          @if (validationMessage()) {
            <div class="validation-message" [class.error]="!canCreateBooking()">
              {{ validationMessage() | translate }}
            </div>
          }
        </div>
      </pelu-card>
    </div>
  `,
  styles: [`
    .booking-form {
      width: 375px;
      margin-bottom: 2rem;

      .booking-form-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        gap: 1rem;
        min-height: 60px; // Ensure consistent height

        .header-content {
          flex: 1;
          text-align: center;

          h3 {
            color: #0d47a1;
            margin: 0 0 0.5rem 0;
            font-size: 1.3rem;
            font-weight: 600;
          }

          .booking-form-subtitle {
            color: #666;
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.4;
          }
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          width: 120px; // Fixed width to maintain consistent layout
          justify-content: flex-end;
        }
      }

      .booking-form-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .form-actions {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
          justify-content: stretch;
          min-height: 48px; // Ensure consistent height for footer

          pelu-button {
            flex: 1;
          }
        }

        .validation-message {
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
          background: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;

          &.error {
            background: #fef2f2;
            color: #dc2626;
            border-color: #fecaca;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .manual-booking {
        max-width: 100%;
        margin-bottom: 1rem;

        .manual-booking-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;

          .header-content {
            h3 {
              font-size: 1.2rem;
            }
          }

          .header-actions {
            width: 100%;
            justify-content: center;
          }
        }
      }
    }
  `]
})
export class BookingFormComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly loaderService = inject(LoaderService);
  private readonly toastService = inject(ToastService);
  private readonly bookingStateService = inject(BookingStateService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly userService = inject(UserService);
  private readonly dateTimeAvailabilityService = inject(DateTimeAvailabilityService);

  // Inputs for hydration
  readonly appointmentData = input<Booking | null>(null);
  readonly isEditMode = input<boolean>(false);
  readonly isReadOnlyMode = input<boolean>(false);

  // Inputs for customization
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly showActions = input<boolean>(false);
  readonly actionButtons = input<Array<{label: string, icon?: string, severity?: 'primary' | 'secondary' | 'danger', onClick: () => void}>>([]);

  // Footer buttons configuration
  readonly showFooterActions = input<boolean>(false);
  readonly footerActionButtons = input<Array<{label: string, icon?: string, severity?: 'primary' | 'secondary' | 'danger', onClick: () => void, disabled?: boolean}>>([]);
  readonly showDefaultSubmitButton = input<boolean>(true);

  constructor() {
    effect(() => {
      const appointment = this.appointmentData();
      const services = this.availableServices();

      if (appointment && services.length > 0) {
        this.initializeWithAppointmentData(appointment);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // Ensure services cache is loaded
    await this.bookingStateService.loadServicesCache();
    this.initializeFormSignals();
  }

  private initializeFormSignals(): void {
    const appointment = this.appointmentData();

    if (appointment) {
      this.initializeWithAppointmentData(appointment);
    } else {
      this.initializeWithUserData();
    }
  }

  private initializeWithAppointmentData(appointment: Booking): void {
    this.clientNameSignal.set(appointment.clientName || '');
    this.clientEmailSignal.set(appointment.email || '');
    this.notesSignal.set(appointment.notes || '');

    if (appointment.data) {
      const date = new Date(appointment.data);
      this.selectedDateSignal.set(date);
    }

    if (appointment.hora) {
      this.selectedTimeSignal.set(appointment.hora);
    }

    if (appointment.serviceId) {
      this.selectedServiceIdSignal.set(appointment.serviceId);
    }
  }

  private initializeWithUserData(): void {
    this.resetFormSignals();

    const userDisplayName = this.authService.userDisplayName();
    const userEmail = this.authService.user()?.email;

    if (userDisplayName) {
      this.clientNameSignal.set(userDisplayName);
    }

    if (userEmail) {
      this.clientEmailSignal.set(userEmail);
    }
  }

  private resetFormSignals(): void {
    this.clientNameSignal.set('');
    this.clientEmailSignal.set('');
    this.notesSignal.set('');
    this.selectedServiceIdSignal.set('');
    this.selectedDateSignal.set(null);
    this.selectedTimeSignal.set('');
  }

  private resetForm(): void {
    // Reset all form fields and hydrate with user data
    this.resetFormSignals();
    this.initializeWithUserData();
  }

  // Output events
  bookingCreated = output<Booking>();

  // Signals for form state (completely independent)
  private readonly clientNameSignal = signal<string>('');
  private readonly clientEmailSignal = signal<string>('');
  private readonly notesSignal = signal<string>('');
  private readonly selectedServiceIdSignal = signal<string>('');
  private readonly selectedDateSignal = signal<Date | null>(null);
  private readonly selectedTimeSignal = signal<string>('');

  // Computed properties using services
  readonly availableServices = computed(() => this.bookingStateService.availableServices() || []);
  readonly selectedServiceId = computed(() => this.selectedServiceIdSignal() || '');
  readonly selectedService = computed(() => {
    const serviceId = this.selectedServiceId();
    const services = this.availableServices();
    return services.find(s => s.id === serviceId) || null;
  });
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly selectedDateString = computed(() => {
    const date = this.selectedDate();
    return date ? date.toISOString().split('T')[0] : '';
  });
  readonly selectedTime = computed(() => this.selectedTimeSignal());
  readonly clientName = computed(() => this.clientNameSignal());
  readonly clientEmail = computed(() => this.clientEmailSignal());
  readonly notes = computed(() => this.notesSignal());

  // Dynamic title and subtitle
  readonly displayTitle = computed(() => {
    const customTitle = this.title();
    if (customTitle) return customTitle;
    return this.isEditMode() ? 'APPOINTMENTS.EDIT_APPOINTMENT' : 'BOOKING.MANUAL_BOOKING_TITLE';
  });

  readonly displaySubtitle = computed(() => {
    const customSubtitle = this.subtitle();
    if (customSubtitle) return customSubtitle;
    return this.isEditMode() ? 'APPOINTMENTS.EDIT_APPOINTMENT_DESCRIPTION' : 'BOOKING.MANUAL_BOOKING_SUBTITLE';
  });

  // Minimum date (today)
  readonly minDate = new Date();

  // ===== FORM OPTIONS =====

  readonly serviceOptions = computed((): SelectOption[] => {
    const services = this.availableServices();
    if (!services || services.length === 0) {
      return [];
    }

    return services.filter(service => service && service.id).map(service => ({
      label: `${service.name || 'Unknown'} - ${service.price || 0}€ (${service.duration || 0}min)`,
      value: service.id || ''
    }));
  });

  readonly timeSlotOptions = computed(() => {
    const service = this.selectedService();
    const date = this.selectedDate();

    if (!service || !date || !service.id) {
      return [];
    }

    // Use the NEW centralized service for date/time management
    const timeSlots = this.dateTimeAvailabilityService.getAvailableTimeSlotsForDate(
      date,
      service.id
    );

    // Convert to SelectOption format (already filtered to available only)
    return timeSlots.map(slot => ({
      label: slot.time,
      value: slot.time
    }));
  });

  // Computed to determine if inputs should be disabled
  readonly inputsDisabled = computed(() => {
    return this.isReadOnlyMode() && !this.isEditMode();
  });

  // ===== EVENT HANDLERS =====

  onServiceChange(serviceId: any): void {
    this.selectedServiceIdSignal.set(serviceId || '');
    // Reset time when service changes (time slots will update automatically)
    this.selectedTimeSignal.set('');
  }

  onDateChange(dateString: any): void {
    if (dateString) {
      const date = new Date(dateString);
      this.selectedDateSignal.set(date);
      // Reset time when date changes (time slots will update automatically)
      this.selectedTimeSignal.set('');
    } else {
      this.selectedDateSignal.set(null);
      this.selectedTimeSignal.set('');
    }
  }

  onTimeChange(time: any): void {
    this.selectedTimeSignal.set(String(time || ''));
  }

  onClientNameChange(name: string): void {
    this.clientNameSignal.set(name);
  }

  onEmailChange(email: string): void {
    this.clientEmailSignal.set(email);
  }

  onNotesChange(notes: string): void {
    this.notesSignal.set(notes);
  }

  // ===== HELPER METHODS =====

  // Authentication and user state (same as mobile)
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Check if user has reached appointment limit
  readonly hasReachedAppointmentLimit = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Check if user should be blocked from booking
  readonly isUserBlockedFromBooking = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Main validation computed (same logic as mobile canConfirmBooking)
  readonly canCreateBooking = computed(() => {
    // First check authentication (if not authenticated, still allow but will prompt for login)
    // Check if user has reached appointment limit
    if (this.isAuthenticated() && !this.canUserBookMoreAppointments()) {
      return false;
    }

    // Get all required data
    const hasClientName = this.clientName() && this.clientName().trim().length > 0;
    const hasEmail = this.clientEmail() && this.clientEmail().trim().length > 0;
    const selectedService = this.selectedService();
    const selectedDate = this.selectedDate();
    const selectedTime = this.selectedTime();

    // Check if all required data is present
    if (!hasClientName || !hasEmail || !selectedService || !selectedDate || !selectedTime) {
      return false;
    }

    // Validate email format
    if (!this.isValidEmail(this.clientEmail())) {
      return false;
    }

    // Validate that the selected time slot is actually available using centralized service
    if (!selectedService.id) {
      return false;
    }

    return this.dateTimeAvailabilityService.isTimeSlotAvailable(
      selectedDate,
      selectedTime,
      selectedService.id
    );
  });

  readonly validationMessage = computed(() => {
    // Check user appointment limit first
    if (this.hasReachedAppointmentLimit()) {
      return 'BOOKING.USER_LIMIT_REACHED_MESSAGE';
    }

    if (!this.selectedService()) {
      return '';
    }

    // Check required fields
    if (!this.clientName() || !this.clientEmail()) {
      return 'BOOKING.INCOMPLETE_CLIENT_INFO';
    }

    // Check email format
    if (this.clientEmail() && !this.isValidEmail(this.clientEmail())) {
      return 'BOOKING.INVALID_EMAIL_FORMAT';
    }

    // Check if time slot is available using centralized service
    const selectedService = this.selectedService();
    const selectedDate = this.selectedDate();
    const selectedTime = this.selectedTime();

    if (selectedService && selectedDate && selectedTime && selectedService.id) {
      const isAvailable = this.dateTimeAvailabilityService.isTimeSlotAvailable(
        selectedDate,
        selectedTime,
        selectedService.id
      );

      if (!isAvailable) {
        return 'BOOKING.TIME_SLOT_NOT_AVAILABLE';
      }
    }

    return '';
  });

  async onSubmit(): Promise<void> {
    if (!this.canCreateBooking()) {
      return;
    }

    const isEdit = this.isEditMode();
    const appointment = this.appointmentData();

    this.loaderService.show({
      message: isEdit ? 'APPOINTMENTS.UPDATING_APPOINTMENT' : 'BOOKING.CREATING_BOOKING'
    });

    try {
      const service = this.selectedService();
      const selectedDate = this.selectedDate();

      if (!service || !selectedDate) {
        throw new Error('Service or date not found');
      }

      const formattedDate = selectedDate.toISOString().split('T')[0];

      const bookingData = {
        clientName: this.clientName(),
        email: this.clientEmail(),
        data: formattedDate,
        hora: this.selectedTime(),
        serviceId: service.id,
        notes: this.notes() || '',
        status: 'confirmed' as const,
      };

      let booking: Booking | null = null;

      if (isEdit && appointment) {
        const updatedBooking = await this.bookingService.updateBooking(appointment.id!, bookingData);
        booking = updatedBooking ? appointment : null;
      } else {
        booking = await this.bookingService.createBooking(bookingData, false);
      }

      if (booking) {
        await this.bookingService.refreshBookings();

        // Refresh services cache only if needed (when services might have changed)
        // Usually not needed for bookings, but useful for service management
        // await this.bookingStateService.refreshServicesCache();

        window.dispatchEvent(new CustomEvent('bookingUpdated'));

        if (isEdit) {
          this.toastService.showSuccess('APPOINTMENTS.UPDATE_SUCCESS');
        } else {
          this.toastService.showReservationCreated(booking.id);
        }

        this.bookingCreated.emit(booking);

        if (!isEdit) {
          this.resetForm();
        }
      } else {
        throw new Error(isEdit ? 'Appointment update failed' : 'Booking creation failed');
      }

    } catch (error) {
      this.toastService.showError(isEdit ? 'APPOINTMENTS.UPDATE_ERROR' : 'BOOKING.MANUAL_BOOKING_ERROR');
    } finally {
      this.loaderService.hide();
    }
  }

  // ===== AUXILIARY METHODS (same as mobile) =====

  // User appointment limit methods
  canUserBookMoreAppointments(): boolean {
    const currentBookings = this.bookingService.bookings();
    return this.bookingValidationService.canUserBookMoreAppointments(currentBookings);
  }

  getUserAppointmentCount(): number {
    const currentBookings = this.bookingService.bookings();
    return this.bookingValidationService.getUserAppointmentCount(currentBookings);
  }

  getMaxAppointmentsPerUser(): number {
    return this.systemParametersService.getMaxAppointmentsPerUser();
  }

  // Email validation
  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

}
