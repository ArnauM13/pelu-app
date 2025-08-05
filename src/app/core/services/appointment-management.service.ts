import { Injectable, inject, signal, computed } from '@angular/core';
import { BookingService } from './booking.service';
import { ServicesService } from './services.service';
import { Booking } from '../interfaces/booking.interface';
import { Service } from './services.service';
import { BookingForm } from '../interfaces/booking.interface';
import { BookingValidationService } from './booking-validation.service';
import { ToastService } from '../../shared/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

export interface AppointmentManagementState {
  appointment: Booking | null;
  service: Service | null;
  isLoading: boolean;
  isEditing: boolean;
  hasChanges: boolean;
  canEdit: boolean;
  canDelete: boolean;
  availableTimeSlots: string[];
  availableServices: Service[];
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentManagementService {
  // Inject services
  #bookingService = inject(BookingService);
  #servicesService = inject(ServicesService);
  #bookingValidationService = inject(BookingValidationService);
  #toastService = inject(ToastService);
  #translateService = inject(TranslateService);
  #router = inject(Router);

  // State signals
  private readonly appointmentSignal = signal<Booking | null>(null);
  private readonly serviceSignal = signal<Service | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly isEditingSignal = signal<boolean>(false);
  private readonly hasChangesSignal = signal<boolean>(false);
  private readonly availableTimeSlotsSignal = signal<string[]>([]);
  private readonly availableServicesSignal = signal<Service[]>([]);

  // Computed properties
  readonly appointment = computed(() => this.appointmentSignal());
  readonly service = computed(() => this.serviceSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly isEditing = computed(() => this.isEditingSignal());
  readonly hasChanges = computed(() => this.hasChangesSignal());
  readonly availableTimeSlots = computed(() => this.availableTimeSlotsSignal());
  readonly availableServices = computed(() => this.availableServicesSignal());

  readonly canEdit = computed(() => {
    const appointment = this.appointment();
    if (!appointment) return false;

    // Check if appointment is in the future
    const appointmentDate = new Date(appointment.data);
    const appointmentTime = appointment.hora;
    const now = new Date();

    if (appointmentTime) {
      const [hours, minutes] = appointmentTime.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    return appointmentDate > now;
  });

  readonly canDelete = computed(() => {
    const appointment = this.appointment();
    if (!appointment) return false;

    // Use validation service to check if cancellation is allowed
    if (appointment.data && appointment.hora) {
      const appointmentDate = new Date(appointment.data);
      return this.#bookingValidationService.canCancelBooking(appointmentDate, appointment.hora);
    }

    return false;
  });

  readonly state = computed<AppointmentManagementState>(() => ({
    appointment: this.appointment(),
    service: this.service(),
    isLoading: this.isLoading(),
    isEditing: this.isEditing(),
    hasChanges: this.hasChanges(),
    canEdit: this.canEdit(),
    canDelete: this.canDelete(),
    availableTimeSlots: this.availableTimeSlots(),
    availableServices: this.availableServices(),
  }));

  // Methods
  async loadAppointment(appointmentId: string): Promise<void> {
    try {
      this.isLoadingSignal.set(true);

      const appointment = await this.#bookingService.getBookingByIdWithToken(appointmentId);
      if (appointment) {
        this.appointmentSignal.set(appointment);

        // Load service data
        if (appointment.serviceId) {
          const service = await this.#servicesService.getServiceById(appointment.serviceId);
          this.serviceSignal.set(service);
        }

        // Load available services
        const allServices = this.#servicesService.getAllServices();
        this.availableServicesSignal.set(allServices);
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      this.#toastService.showGenericError('Error loading appointment');
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async loadAvailableTimeSlots(date: string): Promise<void> {
    try {
      // For now, return empty array since getAvailableTimeSlots doesn't exist
      // TODO: Implement when BookingService has this method
      this.availableTimeSlotsSignal.set([]);
    } catch (error) {
      console.error('Error loading available time slots:', error);
      this.availableTimeSlotsSignal.set([]);
    }
  }

  startEditing(): void {
    this.isEditingSignal.set(true);
    this.hasChangesSignal.set(false);
  }

  cancelEditing(): void {
    this.isEditingSignal.set(false);
    this.hasChangesSignal.set(false);
  }

  updateForm(field: keyof BookingForm, value: string | number): void {
    const appointment = this.appointment();
    if (!appointment) return;

    // Create updated appointment
    const updatedAppointment: Booking = {
      ...appointment,
      [field]: value,
    };

    this.appointmentSignal.set(updatedAppointment);
    this.hasChangesSignal.set(true);

    // If date or time changed, reload available time slots
    if (field === 'data' || field === 'hora') {
      this.loadAvailableTimeSlots(updatedAppointment.data);
    }
  }

  async saveAppointment(): Promise<boolean> {
    const appointment = this.appointment();
    if (!appointment) return false;

    try {
      this.isLoadingSignal.set(true);

      // For now, skip validation since validateBooking doesn't exist
      // TODO: Implement when BookingValidationService has this method

      // Update appointment in Firebase
      const success = await this.#bookingService.updateBooking(appointment.id!, appointment);

      if (success) {
        this.#toastService.showSuccess(
          this.#translateService.instant('APPOINTMENTS.UPDATE_SUCCESS')
        );
        this.isEditingSignal.set(false);
        this.hasChangesSignal.set(false);
        return true;
      } else {
        this.#toastService.showGenericError('Error updating appointment');
        return false;
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      this.#toastService.showGenericError('Error saving appointment');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async deleteAppointment(): Promise<boolean> {
    const appointment = this.appointment();
    if (!appointment?.id) return false;

    try {
      this.isLoadingSignal.set(true);

      const success = await this.#bookingService.deleteBooking(appointment.id);

      if (success) {
        this.#toastService.showSuccess(
          this.#translateService.instant('APPOINTMENTS.DELETE_SUCCESS')
        );
        return true;
      } else {
        this.#toastService.showGenericError('Error deleting appointment');
        return false;
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      this.#toastService.showGenericError('Error deleting appointment');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  navigateToAppointment(appointmentId: string): void {
    this.#router.navigate(['/appointments', appointmentId]);
  }

  goBack(): void {
    this.#router.navigate(['/appointments']);
  }

  // Reset state
  reset(): void {
    this.appointmentSignal.set(null);
    this.serviceSignal.set(null);
    this.isLoadingSignal.set(false);
    this.isEditingSignal.set(false);
    this.hasChangesSignal.set(false);
    this.availableTimeSlotsSignal.set([]);
    this.availableServicesSignal.set([]);
  }
}
