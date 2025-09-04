import { Component, computed, inject, output, signal, OnInit } from '@angular/core';
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
          <h3>📝 {{ 'BOOKING.MANUAL_BOOKING_TITLE' | translate }}</h3>
          <p class="manual-booking-subtitle">{{ 'BOOKING.MANUAL_BOOKING_SUBTITLE' | translate }}</p>
        </div>

        <div class="manual-booking-form">

          <!-- Service Selection -->
          <pelu-input-select
            [label]="'BOOKING.SERVICE'"
            [placeholder]="'BOOKING.SELECT_SERVICE'"
            [required]="true"
            [options]="serviceOptions()"
            [searchable]="true"
            [clearable]="false"
            (valueChange)="onServiceChange($event)"
          >
          </pelu-input-select>

          <!-- Date Selection -->
          <pelu-input-date
            [label]="'BOOKING.DATE'"
            [required]="true"
            [minDate]="minDate"
            [preventPastMonths]="true"
            (valueChange)="onDateChange($event)"
          >
          </pelu-input-date>

          <!-- Time Selection -->
          <pelu-input-select
            [label]="'BOOKING.TIME'"
            [placeholder]="'BOOKING.SELECT_TIME'"
            [required]="true"
            [options]="timeSlotOptions()"
            [searchable]="true"
            [clearable]="false"
            [disabled]="!selectedService() || !selectedDate()"
            (valueChange)="onTimeChange($event)"
          >
          </pelu-input-select>

          <!-- Client Name -->
          <pelu-input-text
            [label]="'BOOKING.CLIENT_NAME'"
            [placeholder]="'BOOKING.CLIENT_NAME_PLACEHOLDER'"
            [required]="true"
            [value]="clientName()"
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
            (valueChange)="onEmailChange($event)"
          >
          </pelu-input-text>

          <!-- Notes (Optional) -->
          <pelu-input-textarea
            [label]="'BOOKING.NOTES'"
            [placeholder]="'BOOKING.NOTES_PLACEHOLDER'"
            [rows]="3"
            [value]="notes()"
            (valueChange)="onNotesChange($event)"
          >
          </pelu-input-textarea>

          <!-- Submit Button -->
          <div class="form-actions">
            <pelu-button
              [label]="'BOOKING.CREATE_MANUAL_BOOKING'"
              (clicked)="onSubmit()"
              [disabled]="!canCreateBooking()"
              severity="primary"
              [raised]="true"
              [fluid]="true"
            >
            </pelu-button>
          </div>

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
      width: 100%;
      margin-bottom: 2rem;

      .manual-booking-header {
        margin-bottom: 1.5rem;
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

      .manual-booking-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .form-actions {
          margin-top: 1rem;
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
          h3 {
            font-size: 1.2rem;
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

  ngOnInit(): void {
    // Load services and appointments
    this.loadData();
    // Initialize form with user data if available
    this.resetForm();
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
  readonly selectedTime = computed(() => this.selectedTimeSignal());
  readonly clientName = computed(() => this.clientNameSignal());
  readonly clientEmail = computed(() => this.clientEmailSignal());
  readonly notes = computed(() => this.notesSignal());

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
      return 'BOOKING.INCOMPLETE_CLIENT_INFO';
    }

    return '';
  });

  async onSubmit(): Promise<void> {
    if (!this.canCreateBooking()) {
      return;
    }

    this.loaderService.show({ message: 'BOOKING.CREATING_BOOKING' });

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

      console.log('Creating manual booking:', bookingData);

      // Create booking directly through the core booking service
      const booking = await this.bookingService.createBooking(bookingData, false);

      if (booking) {
        // Refresh appointments to include the new booking
        await this.bookingService.refreshBookings();

        // Dispatch event to notify other components (like calendar)
        window.dispatchEvent(new CustomEvent('bookingUpdated'));

        this.toastService.showReservationCreated(booking.id);
        this.bookingCreated.emit(booking);

        // Reset form and re-hydrate user data after successful booking
        this.resetForm();
      } else {
        throw new Error('Booking creation failed');
      }

    } catch (error) {
      console.error('Error creating manual booking:', error);
      this.toastService.showError('BOOKING.MANUAL_BOOKING_ERROR');
    } finally {
      this.loaderService.hide();
    }
  }

}
