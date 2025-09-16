import { Component, computed, inject, output, signal, OnInit, OnDestroy, input, effect, ViewEncapsulation } from '@angular/core';
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
import { TimeUtils } from '../../../../shared/utils/time.utils';

@Component({
  selector: 'pelu-booking-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    TranslateModule,
    InputTextComponent,
    InputTextareaComponent,
    InputDateComponent,
    InputSelectComponent,
  ],
  template: `
    <div class="booking-form-inputs" [class.two-columns]="twoColumns()">
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
        [disabledDates]="disabledDates()"
        (valueChange)="onDateChange($event)"
      >
      </pelu-input-date>

      <!-- Time Selection -->
      <pelu-input-select
        [label]="'BOOKING.TIME'"
        [placeholder]="getTimePlaceholder()"
        [required]="true"
        [options]="timeSlotOptions()"
        [value]="selectedTime()"
        [searchable]="true"
        [clearable]="false"
        [disabled]="inputsDisabled() || !isTimeSelectorEnabled()"
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
    </div>
  `,
  styles: [`
    .booking-form-inputs {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;

      &.two-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto auto;
        gap: 1rem;

        // Row 1: Service (col 1) + Client Name (col 2)
        pelu-input-select:nth-child(1) { /* Service */
          grid-column: 1;
          grid-row: 1;
        }
        pelu-input-text:nth-child(4) { /* Client Name */
          grid-column: 2;
          grid-row: 1;
        }

        // Row 2: Date (col 1) + Client Email (col 2)
        pelu-input-date:nth-child(2) { /* Date */
          grid-column: 1;
          grid-row: 2;
        }
        pelu-input-text:nth-child(5) { /* Client Email */
          grid-column: 2;
          grid-row: 2;
        }

        // Row 3: Time (col 1) + Notes (col 2)
        pelu-input-select:nth-child(3) { /* Time */
          grid-column: 1;
          grid-row: 3;
        }
        pelu-input-textarea:nth-child(6) { /* Notes */
          grid-column: 2;
          grid-row: 3;
        }
      }

      // Ensure all input components take full width
      pelu-input-select,
      pelu-input-date,
      pelu-input-text,
      pelu-input-textarea {
        width: 100%;
      }
    }
  `]
})
export class BookingFormComponent implements OnInit, OnDestroy {
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly loaderService = inject(LoaderService);
  private readonly toastService = inject(ToastService);
  private readonly bookingStateService = inject(BookingStateService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly userService = inject(UserService);
  private readonly dateTimeAvailabilityService = inject(DateTimeAvailabilityService);
  private readonly timeUtils = inject(TimeUtils);

  // Event listener for booking updates
  private bookingUpdateListener?: () => void;

  // Inputs for hydration
  readonly appointmentData = input<Booking | null>(null);
  readonly isEditMode = input<boolean>(false);
  readonly isReadOnlyMode = input<boolean>(false);
  readonly twoColumns = input<boolean>(false);

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
    // Effect para hidratar datos cuando los servicios estén disponibles
    // Solo inicializar una vez cuando los datos estén disponibles
    let hasInitialized = false;

    effect(() => {
      const appointment = this.appointmentData();
      const services = this.availableServices();

      if (!hasInitialized && services.length > 0) {
        if (appointment) {
          this.initializeWithAppointmentData(appointment);
        } else {
          // Si no hay appointment, inicializar con datos del usuario
          this.initializeWithUserData();
        }
        hasInitialized = true;
      }
    });

  // Effect para hidratar tiempo cuando las opciones de tiempo estén disponibles
  // Solo ejecutar una vez cuando los datos estén disponibles
  let hasTimeInitialized = false;

  effect(() => {
    const appointment = this.appointmentData();
    const timeOptions = this.timeSlotOptions();
    const currentSelectedTime = this.selectedTimeSignal();

    // Debug logs removed for production

    if (!hasTimeInitialized && appointment && appointment.hora && timeOptions.length > 0) {
      // Buscar la opción que coincida con la hora del appointment
      // Usar comparación flexible para manejar diferentes formatos
      const matchingOption = timeOptions.find(option => {
        const optionValue = String(option.value).trim();
        const appointmentHora = String(appointment.hora).trim();

        // Debug logs removed for production

        // Comparación exacta
        return optionValue === appointmentHora;
      });

      const isTimeAvailable = !!matchingOption;
      // Debug logs removed for production

      // En modo edición, siempre mantener el tiempo de la reserva si está disponible
      if (this.isEditMode() && isTimeAvailable && matchingOption) {
        // Setting time in edit mode
        this.selectedTimeSignal.set(matchingOption.value);
      }
      // En modo visualización (detalle) o creación, establecer si está disponible y no está ya establecido
      else if (!this.isEditMode() && !currentSelectedTime && isTimeAvailable && matchingOption) {
        // Setting time in detail view or create mode
        this.selectedTimeSignal.set(matchingOption.value);
      }

      hasTimeInitialized = true;
    }
  });
  }

  async ngOnInit(): Promise<void> {
    // Ensure services cache is loaded
    await this.bookingStateService.loadServicesCache();
    // Los effects manejarán la hidratación automáticamente cuando los datos estén disponibles

    // Set up listener for booking updates from other sources
    this.setupBookingUpdateListener();
  }

  ngOnDestroy(): void {
    // Clean up event listener
    if (this.bookingUpdateListener) {
      window.removeEventListener('bookingUpdated', this.bookingUpdateListener);
    }
  }

  private setupBookingUpdateListener(): void {
    this.bookingUpdateListener = () => {
      // When a booking is created/updated from any source, invalidate the availability cache
      // This will force the time slots to be recalculated with the latest booking data
      this.dateTimeAvailabilityService.invalidateCache();

      // If we have a selected date and service, also invalidate cache for that specific date
      const selectedDate = this.selectedDate();
      const selectedService = this.selectedService();

      if (selectedDate && selectedService?.id) {
        this.dateTimeAvailabilityService.invalidateCache(selectedDate);
      }
    };

    // Add the event listener
    window.addEventListener('bookingUpdated', this.bookingUpdateListener);
  }

  private initializeWithAppointmentData(appointment: Booking): void {
    this.clientNameSignal.set(appointment.clientName || '');
    this.clientEmailSignal.set(appointment.email || '');
    this.notesSignal.set(appointment.notes || '');

    if (appointment.data) {
      // Parse the date safely to avoid invalid date errors
      const date = this.parseDateFlexible(appointment.data);
      if (date) {
        this.selectedDateSignal.set(date);
      }
    }

    if (appointment.hora) {
      this.selectedTimeSignal.set(appointment.hora);
    }

    if (appointment.serviceId) {
      this.selectedServiceIdSignal.set(appointment.serviceId);
    }
  }

  /**
   * Parse date from various formats (ISO, localized, etc.)
   */
  private parseDateFlexible(dateString: string): Date | null {
    if (!dateString) return null;

    // Try different parsing strategies
    let date: Date | null = null;

    // Strategy 1: Try parseISO first (for ISO format)
    date = this.timeUtils.parseDate(dateString);
    if (date) return date;

    // Strategy 2: Try new Date() for other formats
    date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;

    // Strategy 3: Try parsing as YYYY-MM-DD format manually
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }

    console.warn('Could not parse date:', dateString);
    return null;
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
  editCancelled = output<void>();

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
    if (!date) return '';

    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) {
      console.warn('Invalid date detected in selectedDateString:', date);
      return '';
    }

    return this.timeUtils.formatDateISO(date);
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
    const appointment = this.appointmentData();

    if (!service || !date || !service.id) {
      return [];
    }

    // Use the NEW centralized service for date/time management
    // When editing, we need to include the current appointment's time slot
    const timeSlots = this.dateTimeAvailabilityService.getAvailableTimeSlotsForDate(
      date,
      service.id,
      {
        includeUnavailable: this.isEditMode() && appointment ? true : false
      }
    );

    // Convert to SelectOption format
    let options = timeSlots.map(slot => ({
      label: slot.time,
      value: slot.time
    }));

    // When there's an appointment, ensure its time is always available in options
    if (appointment && appointment.hora) {
      const currentTimeExists = options.some(option => option.value === appointment.hora);
      if (!currentTimeExists) {
        // Adding current appointment time to options
        options.unshift({
          label: appointment.hora,
          value: appointment.hora
        });
      }
    }

    return options;
  });

  // Computed property to get disabled dates (days with no available hours)
  readonly disabledDates = computed(() => {
    const service = this.selectedService();
    if (!service || !service.id) {
      return [];
    }

    const disabledDates: Date[] = [];
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 90); // Check next 90 days

    // Check each day for availability
    for (let date = new Date(today); date <= maxDate; date.setDate(date.getDate() + 1)) {
      const timeSlots = this.dateTimeAvailabilityService.getAvailableTimeSlotsForDate(
        new Date(date),
        service.id
      );

      // If no available time slots, mark as disabled
      if (timeSlots.length === 0) {
        disabledDates.push(new Date(date));
      }
    }

    return disabledDates;
  });

  // Computed to determine if inputs should be disabled
  readonly inputsDisabled = computed(() => {
    return this.isReadOnlyMode() && !this.isEditMode();
  });

  // Computed to determine if time selector should be enabled
  readonly isTimeSelectorEnabled = computed(() => {
    return !!(this.selectedService() && this.selectedDate());
  });

  // Method to get appropriate placeholder for time selector
  getTimePlaceholder(): string {
    if (!this.selectedService()) {
      return 'BOOKING.SELECT_SERVICE_FIRST';
    }
    if (!this.selectedDate()) {
      return 'BOOKING.SELECT_DATE_FIRST';
    }
    return 'BOOKING.SELECT_TIME';
  }

  // ===== EVENT HANDLERS =====

  onServiceChange(serviceId: any): void {
    this.selectedServiceIdSignal.set(serviceId || '');
    // Only reset time when service changes if not in edit mode
    if (!this.isEditMode()) {
      this.selectedTimeSignal.set('');
    }
  }

  onDateChange(dateString: any): void {
    if (dateString) {
      // Handle both Date objects and string dates
      let date: Date;
      if (dateString instanceof Date) {
        // If it's already a Date object, use it directly
        date = dateString;
      } else {
        // If it's a string, parse it carefully to avoid timezone issues
        // Parse as local date to avoid timezone offset problems
        const dateStr = typeof dateString === 'string' ? dateString : dateString.toString();
        const [year, month, day] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
      }
      this.selectedDateSignal.set(date);
      // Only reset time when date changes if not in edit mode
      if (!this.isEditMode()) {
        this.selectedTimeSignal.set('');
      }
    } else {
      this.selectedDateSignal.set(null);
      // Only reset time when date is cleared if not in edit mode
      if (!this.isEditMode()) {
        this.selectedTimeSignal.set('');
      }
    }
  }

  onTimeChange(time: any): void {
    console.log('⏰ onTimeChange called with:', time);
    this.selectedTimeSignal.set(String(time || ''));
    console.log('⏰ selectedTimeSignal set to:', this.selectedTimeSignal());
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

    // In edit mode, don't validate availability for the current appointment's time
    if (this.isEditMode()) {
      const appointment = this.appointmentData();
      if (appointment && appointment.hora === selectedTime) {
        // Allow saving the current appointment's time without availability check
        return true;
      }
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

    // Time slot availability check removed - allow any time selection in edit mode

    return '';
  });

  async onSubmit(): Promise<void> {
    if (!this.canCreateBooking()) {
      return;
    }

    const isEdit = this.isEditMode();
    const appointment = this.appointmentData();

    // 1. Mostrar loader
    this.loaderService.show({
      message: isEdit ? 'APPOINTMENTS.UPDATING_APPOINTMENT' : 'BOOKING.CREATING_BOOKING'
    });

    let putSuccess = false;
    let getSuccess = false;
    let updatedBooking: Booking | null = null;

    try {
      const service = this.selectedService();
      const selectedDate = this.selectedDate();

      if (!service || !selectedDate) {
        throw new Error('Service or date not found');
      }

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

      console.log('💾 onSubmit - bookingData to save:', bookingData);
      console.log('🔍 onSubmit - selectedTimeSignal value:', this.selectedTimeSignal());
      console.log('🔍 onSubmit - selectedTime computed value:', this.selectedTime());

      // 2. Fer el PUT per actualitzar les dades de la reserva
      if (isEdit && appointment) {
        putSuccess = await this.bookingService.updateBooking(appointment.id!, bookingData);
        console.log('📤 onSubmit - PUT result:', putSuccess);

        if (!putSuccess) {
          // 3. Si hi ha error al PUT: parar loader i mostrar toast d'error
          this.loaderService.hide();
          this.toastService.showError('APPOINTMENTS.UPDATE_ERROR');
          return;
        }
      } else {
        // Per a creació de nova reserva
        updatedBooking = await this.bookingService.createBooking(bookingData, false);
        putSuccess = !!updatedBooking;
        console.log('📤 onSubmit - CREATE result:', putSuccess);

        if (!putSuccess) {
          // 3. Si hi ha error al CREATE: parar loader i mostrar toast d'error
          this.loaderService.hide();
          this.toastService.showError('BOOKING.MANUAL_BOOKING_ERROR');
          return;
        }
      }

      // 4. Si no hi ha error al PUT: continuar mostrant loader
      // 5. Fer el GET per recuperar les dades actualitzades
      if (isEdit && appointment) {
        try {
          updatedBooking = await this.bookingService.getBookingByIdDirect(appointment.id!);
          getSuccess = !!updatedBooking;
          console.log('📥 onSubmit - GET result:', getSuccess, updatedBooking);
        } catch (getError) {
          console.error('❌ Error al fer GET després del PUT:', getError);
          getSuccess = false;
        }
      }

    } catch (error) {
      console.error('❌ Error general al onSubmit:', error);
      // 3. Si hi ha error general: parar loader i mostrar toast d'error
      this.loaderService.hide();
      this.toastService.showError(isEdit ? 'APPOINTMENTS.UPDATE_ERROR' : 'BOOKING.MANUAL_BOOKING_ERROR');
      return;
    } finally {
      // 6. Treure el loader (sempre)
      this.loaderService.hide();
    }

    // 7. Si no hi ha error: actualitzar dades i mostrar toast d'èxit
    if (putSuccess && (isEdit ? getSuccess : true)) {
      if (isEdit && updatedBooking) {
        // Emitir l'event per actualitzar la UI amb les dades fresques
        this.bookingCreated.emit(updatedBooking);
        this.toastService.showSuccess('APPOINTMENTS.UPDATE_SUCCESS');
      } else if (!isEdit && updatedBooking) {
        // Per a nova reserva
        this.bookingCreated.emit(updatedBooking);
        this.toastService.showReservationCreated(updatedBooking.id);
        this.resetForm();
      }
    } else {
      // 8. Si hi ha error al GET: mostrar toast d'error
      this.toastService.showError(isEdit ? 'APPOINTMENTS.UPDATE_ERROR' : 'BOOKING.MANUAL_BOOKING_ERROR');
    }
  }

  onCancelEdit(): void {
    // Reset form to original appointment data
    const appointment = this.appointmentData();
    if (appointment) {
      this.initializeWithAppointmentData(appointment);
    }

    // Emit cancel event to parent component
    this.editCancelled.emit();
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
