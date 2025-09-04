import { Component, computed, inject, output, signal, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/buttons/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputTextComponent } from '../../../../shared/components/inputs/input-text/input-text.component';
import { InputTextareaComponent } from '../../../../shared/components/inputs/input-textarea/input-textarea.component';
import { InputDateComponent } from '../../../../shared/components/inputs/input-date/input-date.component';
import { InputSelectComponent, SelectOption } from '../../../../shared/components/inputs/input-select/input-select.component';
import { FirebaseService, FirebaseServicesService } from '../../../../core/services/firebase-services.service';
import { BookingService } from '../../../../core/services/booking.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoaderService } from '../../../../shared/services/loader.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';
import { Booking } from '../../../../core/interfaces/booking.interface';

@Component({
  selector: 'pelu-manual-booking',
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
    <div class="manual-booking">
      <pelu-card variant="default">
        <div class="manual-booking-header">
          <div class="header-content">
            <h3>📝 {{ displayTitle() | translate }}</h3>
            <p class="manual-booking-subtitle">{{ displaySubtitle() | translate }}</p>
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

        <div class="manual-booking-form">

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
            <div class="validation-message" [class.error]="!isValidSelection()">
              {{ validationMessage() | translate }}
            </div>
          }
        </div>
      </pelu-card>
    </div>
  `,
  styles: [`
    .manual-booking {
      width: 375px;
      margin-bottom: 2rem;

      .manual-booking-header {
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

          .manual-booking-subtitle {
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

      .manual-booking-form {
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
export class ManualBookingComponent implements OnInit {
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly timeUtils = inject(TimeUtils);
  private readonly loaderService = inject(LoaderService);
  private readonly toastService = inject(ToastService);

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
    // Effect to re-hydrate when appointment data changes
    effect(() => {
      const appointment = this.appointmentData();
      const services = this.availableServices();

      // Only re-hydrate if we have both appointment data and services loaded
      if (appointment && services.length > 0) {
        console.log('Effect triggered: re-hydrating with appointment data');
        this.hydrateWithAppointmentData();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // Load services and appointments first
    await this.loadData();

    // Initialize form with appointment data if available, otherwise with user data
    // Use setTimeout to ensure data is loaded before hydration
    setTimeout(() => {
      if (this.appointmentData()) {
        this.hydrateWithAppointmentData();
      } else {
        this.resetForm();
      }
    }, 100);
  }

  private async loadData(): Promise<void> {
    try {
      // Load services
      const services = this.firebaseServicesService.services();
      this.availableServicesSignal.set(services);

      // Bookings are already loaded by BookingService and available via this.bookingService.bookings()
      // No need to store them separately since BookingService handles all booking logic
    } catch (error) {
      console.error('Error loading data for manual booking:', error);
    }
  }

  private resetForm(): void {
    // Reset all form fields
    this.selectedServiceSignal.set(null);
    this.selectedDateSignal.set(null);
    this.selectedTimeSignal.set('');
    this.clientNameSignal.set('');
    this.clientEmailSignal.set('');
    this.notesSignal.set('');

    // Auto-hydrate user data after reset
    this.hydrateUserData();
  }

  private hydrateWithAppointmentData(): void {
    const appointment = this.appointmentData();
    if (!appointment) {
      console.log('No appointment data available for hydration');
      return;
    }

    console.log('Hydrating with appointment data:', appointment);
    console.log('Available services:', this.availableServices());

    // Set all form fields with appointment data
    this.clientNameSignal.set(appointment.clientName || '');
    this.clientEmailSignal.set(appointment.email || '');
    this.notesSignal.set(appointment.notes || '');

    // Set date - convert to ISO string for pelu-input-date
    if (appointment.data) {
      const date = new Date(appointment.data);
      this.selectedDateSignal.set(date);
      console.log('Set date:', date, 'ISO string:', date.toISOString().split('T')[0]);
    }

    // Set time
    if (appointment.hora) {
      this.selectedTimeSignal.set(appointment.hora);
      console.log('Set time:', appointment.hora);
      console.log('Available time slots:', this.timeSlotOptions());
      console.log('Selected time after setting:', this.selectedTime());
    }

    // Set service - wait for services to be loaded
    if (appointment.serviceId) {
      const services = this.availableServices();
      console.log('Available services:', services);
      console.log('Looking for serviceId:', appointment.serviceId);
      const service = services.find(s => s.id === appointment.serviceId);
      this.selectedServiceSignal.set(service || null);
      console.log('Set service:', service);
      console.log('Selected service ID after setting:', this.selectedServiceId());
    }
  }

  private hydrateUserData(): void {
    // Use a timeout to ensure auth service is fully initialized
    setTimeout(() => {
      const userDisplayName = this.authService.userDisplayName();
      const userEmail = this.authService.user()?.email;

      console.log('Hydrating user data:', { userDisplayName, userEmail });

      if (userDisplayName && !this.clientNameSignal()) {
        this.clientNameSignal.set(userDisplayName);
        console.log('Set client name:', userDisplayName);
      }

      if (userEmail && !this.clientEmailSignal()) {
        this.clientEmailSignal.set(userEmail);
        console.log('Set client email:', userEmail);
      }
    }, 100);
  }

  // Output events
  bookingCreated = output<Booking>();

  // Signals for form state (completely independent)
  private readonly clientNameSignal = signal<string>('');
  private readonly clientEmailSignal = signal<string>('');
  private readonly notesSignal = signal<string>('');
  private readonly selectedDateSignal = signal<Date | null>(null);
  private readonly selectedTimeSignal = signal<string>('');
  private readonly selectedServiceSignal = signal<FirebaseService | null>(null);
  private readonly availableServicesSignal = signal<FirebaseService[]>([]);

  // Computed properties
  readonly availableServices = computed(() => this.availableServicesSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal());
  readonly selectedServiceId = computed(() => this.selectedService()?.id || '');
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
    return this.availableServices().map(service => ({
      label: `${service.name} - ${service.price}€ (${service.duration}min)`,
      value: service.id || ''
    }));
  });

  readonly timeSlotOptions = computed(() => {
    const service = this.selectedService();
    const date = this.selectedDate();

    if (!service || !date) {
      return [];
    }

    // Use BookingService to generate available time slots
    const timeSlots = this.bookingService.generateAvailableTimeSlots(service.id!, date);

    // Convert to SelectOption format and filter only available slots
    return timeSlots
      .filter(slot => slot.available)
      .map(slot => ({
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
    const service = this.availableServices().find(s => s.id === serviceId);
    this.selectedServiceSignal.set(service || null);

    // Reset time when service changes
    this.selectedTimeSignal.set('');
  }

  onDateChange(dateString: any): void {
    const date = dateString ? new Date(dateString) : null;
    this.selectedDateSignal.set(date);

    // Reset time when date changes
    this.selectedTimeSignal.set('');
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

  // Validation computed properties
  readonly canCreateBooking = computed(() => {
    return !!(
      this.selectedService() &&
      this.selectedDate() &&
      this.selectedTime() &&
      this.clientName() &&
      this.clientEmail()
    );
  });

  readonly isValidSelection = computed(() => {
    // Manual booking validation - independent from shared service
    return !!(
      this.selectedService() &&
      this.selectedDate() &&
      this.selectedTime() &&
      this.clientName() &&
      this.clientEmail()
    );
  });

  readonly validationMessage = computed(() => {
    if (!this.selectedService()) {
      return '';
    }

    // Manual booking has its own validation - don't use shared service validation
    // Only show validation if there are actual issues with the manual booking form
    if (!this.clientName() || !this.clientEmail()) {
      return 'COMMON.INCOMPLETE_CLIENT_INFO';
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

      // Use the same date formatting as other components
      const formattedDate = this.timeUtils.formatDateISO(selectedDate);

      const bookingData = {
        clientName: this.clientName(),
        email: this.clientEmail(),
        data: formattedDate,
        hora: this.selectedTime(),
        serviceId: service.id,
        notes: this.notes() || '',
        status: 'confirmed' as const,
      };

      console.log(isEdit ? 'Updating appointment:' : 'Creating manual booking:', bookingData);

      let booking: Booking | null = null;

      if (isEdit && appointment) {
        // Update existing appointment
        const updatedBooking = await this.bookingService.updateBooking(appointment.id!, bookingData);
        booking = updatedBooking ? appointment : null; // Return the original appointment if update successful
      } else {
        // Create new booking
        booking = await this.bookingService.createBooking(bookingData, false);
      }

      if (booking) {
        // Refresh appointments to include the changes
        await this.bookingService.refreshBookings();

        // Dispatch event to notify other components (like calendar)
        window.dispatchEvent(new CustomEvent('bookingUpdated'));

        if (isEdit) {
          this.toastService.showSuccess('APPOINTMENTS.UPDATE_SUCCESS');
        } else {
          this.toastService.showReservationCreated(booking.id);
        }

        this.bookingCreated.emit(booking);

        // Reset form and re-hydrate user data after successful booking
        if (!isEdit) {
          this.resetForm();
        }
      } else {
        throw new Error(isEdit ? 'Appointment update failed' : 'Booking creation failed');
      }

    } catch (error) {
      console.error(isEdit ? 'Error updating appointment:' : 'Error creating manual booking:', error);
      this.toastService.showError(isEdit ? 'APPOINTMENTS.UPDATE_ERROR' : 'BOOKING.MANUAL_BOOKING_ERROR');
    } finally {
      this.loaderService.hide();
    }
  }

}
