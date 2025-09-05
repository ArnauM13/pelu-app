import { Component, inject, OnInit, computed, signal, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { DetailViewComponent, DetailViewConfig } from '../../../shared/components/detail-view/detail-view.component';
import { AppointmentDetailPopupComponent } from '../../../shared/components/appointment-detail-popup/appointment-detail-popup.component';
import { ConfirmationPopupComponent, type ConfirmationData } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
import { CurrencyService } from '../../../core/services/currency.service';
import { AppointmentDetailData } from '../../../core/interfaces/booking.interface';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/services/services.service';
import { Booking, BookingForm } from '../../../core/interfaces/booking.interface';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { LoaderService } from '../../../shared/services/loader.service';
import { TimeUtils } from '../../../shared/utils/time.utils';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { CalendarBusinessService } from '../../calendar/services/calendar-business.service';
import { BookingStateService } from '../../bookings/booking-page/services/booking-state.service';

@Component({
  selector: 'pelu-appointment-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
    InputTextModule,
    DatePickerModule,
    TranslateModule,
    DetailViewComponent,
    AppointmentDetailPopupComponent,
    ConfirmationPopupComponent,
  ],
  providers: [
    BookingStateService,
  ],
  templateUrl: './appointment-detail-page.component.html',
  styleUrls: ['./appointment-detail-page.component.scss'],
})
export class AppointmentDetailPageComponent implements OnInit {
  // Input for receiving appointment data
  @Input() appointmentData?: AppointmentDetailData;

  // Inject services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private currencyService = inject(CurrencyService);
  private servicesService = inject(ServicesService);
  private responsiveService = inject(ResponsiveService);
  private loaderService = inject(LoaderService);
  private timeUtils = inject(TimeUtils);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private roleService = inject(RoleService);
  private toastService = inject(ToastService);
  private logger = inject(LoggerService);
  private calendarBusinessService = inject(CalendarBusinessService);
  private bookingStateService = inject(BookingStateService);

  // Local state signals
  private readonly bookingSignal = signal<Booking | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly canEditSignal = signal<boolean>(false);
  private readonly canDeleteSignal = signal<boolean>(false);
  private readonly isEditingInternalSignal = signal<boolean>(false);
  private readonly isSavingSignal = signal<boolean>(false);
  private readonly originalBookingSignal = signal<Booking | null>(null);
  private readonly originalFormValuesSignal = signal<any>(null);

  // Public computed signals
  readonly booking = computed(() => this.bookingSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly canEdit = computed(() => this.canEditSignal());
  readonly canDelete = computed(() => this.canDeleteSignal());
  readonly isSaving = computed(() => this.isSavingSignal());

  // Computed editing state based on query parameter and internal state
  readonly isEditing = computed(() => {
    const editParam = this.route.snapshot.queryParamMap.get('edit');
    const internalState = this.isEditingInternalSignal();
    console.log('editParam', editParam);
    console.log('internalState', internalState);
    return editParam === 'true' || internalState;
  });

  // Computed property to detect if form has changes
  readonly hasFormChanges = computed(() => {
    if (!this.isEditing() || !this.editForm) return false;

    const originalValues = this.originalFormValuesSignal();
    if (!originalValues) return false;

    const currentValues = this.editForm.value;

    // Compare each field
    return (
      currentValues.clientName !== originalValues.clientName ||
      currentValues.data !== originalValues.data ||
      currentValues.hora !== originalValues.hora ||
      currentValues.serviceId !== originalValues.serviceId ||
      currentValues.notes !== originalValues.notes
    );
  });

  // Mobile detection
  readonly isMobile = computed(() => this.responsiveService.isMobile());

  // Service data
  private loadedService = signal<Service | null>(null);
  readonly service = computed(() => this.loadedService());

  // Appointment ID for detail view
  readonly appointmentId = computed(() => this.route.snapshot.paramMap.get('id'));

  // UI state signals
  private showDeleteAlertSignal = signal<boolean>(false);
  private deleteAlertDataSignal = signal<ConfirmationData | null>(null);
  private hideDetailViewSignal = signal<boolean>(false);

  readonly showDeleteAlert = computed(() => this.showDeleteAlertSignal());
  readonly deleteAlertData = computed(() => this.deleteAlertDataSignal());
  readonly hideDetailView = computed(() => this.hideDetailViewSignal());

  // Form for editing
  editForm!: FormGroup;

  // Available services and time slots
  private readonly availableServicesSignal = signal<Service[]>([]);
  private readonly availableTimeSlotsSignal = signal<any[]>([]);
  readonly availableServices = computed(() => this.availableServicesSignal());
  readonly availableTimeSlots = computed(() => this.availableTimeSlotsSignal());

  ngOnInit(): void {
    this.initializeForm();
    this.loadAppointment();
    this.loadAvailableServices();
    this.initializeEditingState();

    // Listen to form value changes to update change detection
    this.editForm.valueChanges.subscribe(() => {
      // This will trigger the hasFormChanges computed property to recalculate
    });
  }

  /**
   * Initialize editing state based on query parameter
   */
  private initializeEditingState(): void {
    const editMode = this.route.snapshot.queryParamMap.get('edit');
    if (editMode === 'true' && this.canEdit()) {
      this.isEditingInternalSignal.set(true);
    }
  }

  /**
   * Initialize the edit form
   */
  private initializeForm(): void {
    this.editForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(2)]],
      data: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      serviceId: ['', [Validators.required]],
      notes: [''],
    });
  }

  /**
   * Load appointment data - OPTIMIZED for single booking
   */
  async loadAppointment(): Promise<void> {
    const appointmentId = this.appointmentId();
    if (!appointmentId) return;

    try {
      this.isLoadingSignal.set(true);

      // Use direct method to fetch only this booking (bypasses cache)
      const booking = await this.bookingService.getBookingByIdDirect(appointmentId);
      if (booking) {
        this.bookingSignal.set(booking);
        this.originalBookingSignal.set(booking); // Store original booking

        // Update permissions using simple logic with correct services
        const currentUser = this.authService.user();
        const isOwner = currentUser?.email === booking.email;
        const isAdmin = this.roleService.isAdmin();

        this.canEditSignal.set(isAdmin || isOwner);
        this.canDeleteSignal.set(isAdmin || isOwner);

        // Load service details
        if (booking.serviceId) {
          const service = await this.servicesService.getServiceById(booking.serviceId);
          this.loadedService.set(service || null);
        }

        // Populate form if in edit mode
        if (this.isEditing()) {
          this.populateForm(booking);
        }
      }
    } catch (error) {
      this.logger.error('Error loading appointment', {
        component: 'AppointmentDetailPageComponent',
        method: 'loadAppointment',
        appointmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Load available services - OPTIMIZED to use centralized cache
   */
  private async loadAvailableServices(): Promise<void> {
    try {
      // Use BookingStateService cache (same as booking-form)
      await this.bookingStateService.loadServicesCache();

      // Then get all services from cache
      const services = this.bookingStateService.availableServices();
      this.availableServicesSignal.set(services);
    } catch (error) {
      this.logger.error('Error loading services', {
        component: 'AppointmentDetailPageComponent',
        method: 'loadAvailableServices',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Load available time slots for a specific date and service using existing services
   */
  private async loadAvailableTimeSlots(date: string, serviceId: string): Promise<void> {
    try {
      // Use existing calendar business service to get available time slots
      const dateObj = new Date(date);
      const timeSlots = this.calendarBusinessService.getAvailableTimeSlots(dateObj);

      // Convert to the format expected by the component
      const formattedSlots = timeSlots.map((time: string) => ({
        time: time,
        available: true
      }));

      this.availableTimeSlotsSignal.set(formattedSlots);
    } catch (error) {
      this.logger.error('Error loading time slots', {
        component: 'AppointmentDetailPageComponent',
        method: 'loadAvailableTimeSlots',
        date,
        serviceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Fallback to default time slots if service fails
      const defaultTimeSlots = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '12:00', available: true },
        { time: '16:00', available: true },
        { time: '17:00', available: true },
        { time: '18:00', available: true },
      ];
      this.availableTimeSlotsSignal.set(defaultTimeSlots);
    }
  }

  /**
   * Populate form with existing data
   */
  private populateForm(booking: Booking): void {
    this.editForm.patchValue({
      clientName: booking.clientName || '',
      data: this.formatDateForInput(booking.data) || '',
      hora: booking.hora || '',
      serviceId: booking.serviceId || '',
      notes: booking.notes || '',
    });
  }

  /**
   * Format date for HTML input type="date"
   */
  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Computed properties for display
  readonly appointmentInfoItems = computed(() => {
    const booking = this.booking();
    if (!booking) return [];

    if (this.isEditing()) {
      // Return form fields for editing
      return [
        {
          icon: '👤',
          label: 'COMMON.CLIENT_NAME',
          value: this.editForm.get('clientName')?.value || '',
          field: 'clientName' as keyof BookingForm,
          type: 'text' as const,
          isEditable: true,
          formControl: this.editForm.get('clientName'),
        },
        {
          icon: '📅',
          label: 'COMMON.DATE',
          value: this.editForm.get('data')?.value || '',
          field: 'data' as keyof BookingForm,
          type: 'date' as const,
          isEditable: true,
          formControl: this.editForm.get('data'),
        },
        {
          icon: '⏰',
          label: 'COMMON.TIME.HOUR',
          value: this.editForm.get('hora')?.value || '',
          field: 'hora' as keyof BookingForm,
          type: 'select' as const,
          isEditable: true,
          formControl: this.editForm.get('hora'),
          options: this.availableTimeSlots().map(slot => ({
            label: slot.time,
            value: slot.time
          })),
        },
        {
          icon: '✂️',
          label: 'COMMON.SERVICE',
          value: this.editForm.get('serviceId')?.value || '',
          field: 'serviceId' as keyof BookingForm,
          type: 'select' as const,
          isEditable: true,
          formControl: this.editForm.get('serviceId'),
          options: this.availableServices().map(service => ({
            label: service.name,
            value: service.id
          })),
        },
        {
          icon: '📝',
          label: 'COMMON.NOTES',
          value: this.editForm.get('notes')?.value || '',
          field: 'notes' as keyof BookingForm,
          type: 'text' as const,
          isEditable: true,
          formControl: this.editForm.get('notes'),
        },
      ];
    } else {
      // Return display items for view mode
      const items = [
        {
          icon: '👤',
          label: 'COMMON.CLIENT_NAME',
          value: booking.clientName,
          field: 'clientName' as keyof BookingForm,
        },
        {
          icon: '📅',
          label: 'COMMON.DATE',
          value: this.timeUtils.formatDateString(booking.data),
          field: 'data' as keyof BookingForm,
        },
        {
          icon: '⏰',
          label: 'COMMON.TIME',
          value: this.timeUtils.formatTimeString(booking.hora),
          field: 'hora' as keyof BookingForm,
        },
        {
          icon: '✂️',
          label: 'COMMON.SERVICE',
          value: this.service()?.name || 'N/A',
          field: 'serviceId' as keyof BookingForm,
        },
        {
          icon: '💰',
          label: 'COMMON.PRICE',
          value: this.currencyService.formatPrice(this.service()?.price || 0),
          field: 'notes' as keyof BookingForm,
        },
      ];

      // Add notes if available (only in view mode)
      if (booking.notes) {
        items.push({
          icon: '📝',
          label: 'COMMON.NOTES',
          value: booking.notes,
          field: 'notes' as keyof BookingForm,
        });
      }

      return items;
    }
  });

  // Detail view configuration
  readonly detailConfig = computed((): DetailViewConfig => {
    const booking = this.booking();

    return {
      type: 'appointment',
      loading: this.isLoading(),
      notFound: !booking && !this.isLoading(),
      appointment: booking || undefined,
      infoSections: [
        {
          title: this.isEditing() ? 'APPOINTMENTS.EDIT_APPOINTMENT' : 'APPOINTMENTS.DETAILS',
          items: this.appointmentInfoItems(),
          isEditing: this.isEditing(),
          onEdit: () => this.startEditing(),
          onSave: () => this.saveChanges(),
          onCancel: () => this.cancelEditing(),
        }
      ],
      actions: [
        {
          label: 'COMMON.BACK',
          icon: '⬅️',
          type: 'secondary' as const,
          onClick: () => this.goBack(),
        },
        ...(this.canEdit() && !this.isEditing() ? [{
          label: 'COMMON.EDIT',
          icon: '✏️',
          type: 'primary' as const,
          onClick: () => this.startEditing(),
        }] : []),
        ...(this.canEdit() && this.isEditing() ? [{
          label: 'COMMON.SAVE',
          icon: '💾',
          type: 'primary' as const,
          onClick: () => this.saveChanges(),
        }] : []),
        ...(this.canEdit() && this.isEditing() ? [{
          label: 'COMMON.CANCEL',
          icon: '❌',
          type: 'secondary' as const,
          onClick: () => this.cancelEditing(),
        }] : []),
        ...(this.canDelete() && !this.isEditing() ? [{
          label: 'COMMON.DELETE',
          icon: '🗑️',
          type: 'danger' as const,
          onClick: () => this.showDeleteConfirmation(),
        }] : []),
      ],
      isEditing: this.isEditing(),
      hasChanges: this.hasFormChanges(),
      canSave: this.canEdit() && this.editForm?.valid,
    };
  });

    /**
   * Start editing mode - interact with internal state
   */
  startEditing(): void {
    if (!this.canEdit()) return;

    const booking = this.booking();
    if (booking) {
      // Store original booking values before editing
      this.originalBookingSignal.set({ ...booking });

      // Populate form with current data
      this.populateForm(booking);

      // Store original form values for change detection
      this.originalFormValuesSignal.set({
        clientName: this.editForm.get('clientName')?.value || '',
        data: this.editForm.get('data')?.value || '',
        hora: this.editForm.get('hora')?.value || '',
        serviceId: this.editForm.get('serviceId')?.value || '',
        notes: this.editForm.get('notes')?.value || '',
      });

      // Enable edit mode
      this.isEditingInternalSignal.set(true);
    }
  }

  /**
   * Cancel editing mode - interact with internal state
   */
  cancelEditing(): void {
    console.log('cancelEditing');

    // Restore original booking values
    const originalBooking = this.originalBookingSignal();
    if (originalBooking) {
      this.bookingSignal.set(originalBooking);
    }

    // Reset form and disable edit mode
    this.editForm.reset();
    this.isEditingInternalSignal.set(false);

    // Clear original form values
    this.originalFormValuesSignal.set(null);
  }

  /**
   * Save changes
   */
  async saveChanges(): Promise<void> {
    console.log('saveChanges');
    if (this.editForm.invalid) return;

    const appointmentId = this.appointmentId();
    if (!appointmentId) return;

    try {
      this.isSavingSignal.set(true);

      const formData = this.editForm.value;
      const updates: Partial<Booking> = {
        clientName: formData.clientName,
        data: this.timeUtils.formatDateString(formData.data),
        hora: formData.hora,
        serviceId: formData.serviceId,
        notes: formData.notes,
      };

      // Use existing validation methods from BookingService
      const success = await this.bookingService.updateBooking(appointmentId, updates);
      if (success) {
        this.toastService.showSuccess('APPOINTMENTS.UPDATE_SUCCESS');
        // Disable edit mode and reset form
        this.isEditingInternalSignal.set(false);
        this.editForm.reset();
        // Clear original form values
        this.originalFormValuesSignal.set(null);
        // Reload the appointment to get updated data
        await this.loadAppointment();
      } else {
        this.toastService.showError('APPOINTMENTS.UPDATE_ERROR');
      }
    } catch (error) {
      this.logger.error('Error updating appointment', {
        component: 'AppointmentDetailPageComponent',
        method: 'saveChanges',
        appointmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.toastService.showError('APPOINTMENTS.UPDATE_ERROR');
    } finally {
      this.isSavingSignal.set(false);
    }
  }

  /**
   * Delete appointment using BookingService
   */
  async deleteAppointment(): Promise<void> {
    const booking = this.booking();
    if (!booking?.id) return;

    try {
      this.loaderService.show({ message: 'APPOINTMENTS.DELETING_APPOINTMENT' });

      const success = await this.bookingService.deleteBooking(booking.id);
      if (success) {
        this.toastService.showSuccess('APPOINTMENTS.DELETE_SUCCESS');
        this.goBack();
      }
    } catch (error) {
      this.logger.error('Error deleting appointment', {
        component: 'AppointmentDetailPageComponent',
        method: 'deleteAppointment',
        appointmentId: booking.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.toastService.showError('APPOINTMENTS.DELETE_ERROR');
      // Resetar estat en cas d'error
      this.hideDetailViewSignal.set(false);
    } finally {
      this.loaderService.hide();
    }
  }

  /**
   * Handle edit request from detail view
   */
  onEditRequested(): void {
    this.startEditing();
  }

  /**
   * Handle view detail request from popup
   */
  onViewDetailRequested(event: any): void {
    // This method is called when view detail is requested from popup
    // Since we're already on the detail page, we can ignore this or handle navigation
    console.log('View detail requested:', event);
  }

  /**
   * Navigate back
   */
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/appointments']);
    }
  }

  /**
   * Show delete confirmation
   */
  showDeleteConfirmation(): void {
    const booking = this.booking();
    if (!booking) return;

    const alertData: ConfirmationData = {
      title: 'COMMON.CONFIRMATION.DELETE_TITLE',
      message: 'COMMON.CONFIRMATION.DELETE_MESSAGE',
      severity: 'danger',
      userName: booking.clientName || booking.email || 'N/A'
    };

    this.deleteAlertDataSignal.set(alertData);
    this.hideDetailViewSignal.set(true); // Amagar detail view primer
    this.showDeleteAlertSignal.set(true);
  }

  /**
   * Handle delete confirmation
   */
  onDeleteConfirmed(): void {
    this.showDeleteAlertSignal.set(false);
    this.deleteAlertDataSignal.set(null);
    // No resetar hideDetailView aquí perquè deleteAppointment navega cap enrere
    this.deleteAppointment();
  }

  /**
   * Handle delete cancellation
   */
  onDeleteCancelled(): void {
    this.showDeleteAlertSignal.set(false);
    this.deleteAlertDataSignal.set(null);
    this.hideDetailViewSignal.set(false); // Mostrar detail view de nou
  }

  onToastClick(event: { message?: { data?: { appointmentId?: string } } }): void {
    const appointmentId = event.message?.data?.appointmentId;
    if (appointmentId) {
      // Use the appointmentId directly as it should be a UUID
      this.router.navigate(['/appointments', appointmentId]);
    }
  }

  viewAppointmentDetail(appointmentId: string): void {
    // Use the appointmentId directly as it should be a UUID
    this.router.navigate(['/appointments', appointmentId]);
  }
}

