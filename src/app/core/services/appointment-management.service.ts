import { Injectable, inject, signal, computed } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Booking } from '../interfaces/booking.interface';
import { FirebaseServicesService, FirebaseService } from './firebase-services.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoggerService } from '../../shared/services/logger.service';
import { RoleService } from './role.service';
import { BookingValidationService } from './booking-validation.service';
import { BookingService } from './booking.service';
import { TimeSlot } from '../../shared/utils/time.utils';

export interface AppointmentWithService extends Booking {
  service?: FirebaseService;
  clientPhotoURL?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentManagementService {
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  private readonly servicesService = inject(FirebaseServicesService);
  private readonly toastService = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly roleService = inject(RoleService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly bookingService = inject(BookingService);

  // Internal state
  private readonly appointmentSignal = signal<AppointmentWithService | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly isEditingSignal = signal<boolean>(false);
  private readonly hasChangesSignal = signal<boolean>(false);
  private readonly canEditSignal = signal<boolean>(false);
  private readonly canDeleteSignal = signal<boolean>(false);
  private readonly availableTimeSlotsSignal = signal<TimeSlot[]>([]);
  private readonly availableServicesSignal = signal<FirebaseService[]>([]);
  private readonly availableDaysSignal = signal<Date[]>([]);

  // Public computed signals
  readonly appointment = computed(() => this.appointmentSignal());
  readonly service = computed(() => this.appointment()?.service);
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly isEditing = computed(() => this.isEditingSignal());
  readonly hasChanges = computed(() => this.hasChangesSignal());
  readonly canEdit = computed(() => this.canEditSignal());
  readonly canDelete = computed(() => this.canDeleteSignal());
  readonly availableTimeSlots = computed(() => this.availableTimeSlotsSignal());
  readonly availableServices = computed(() => this.availableServicesSignal());
  readonly availableDays = computed(() => this.availableDaysSignal());

  constructor() {
    // Load available services on initialization
    this.loadAvailableServices();
  }

  /**
   * Load appointment by ID with service details and client photo
   */
  async loadAppointment(appointmentId: string, autoEdit: boolean = false): Promise<void> {
    try {
      this.isLoadingSignal.set(true);

      const appointmentDocRef = doc(this.firestore, 'bookings', appointmentId);
      const appointmentDoc = await getDoc(appointmentDocRef);

      if (!appointmentDoc.exists()) {
        this.appointmentSignal.set(null);
        return;
      }

      const appointmentData = appointmentDoc.data() as Booking;

      // Load service details
      let service: FirebaseService | undefined;
      if (appointmentData.serviceId) {
        service = this.servicesService.services().find((s: FirebaseService) => s.id === appointmentData.serviceId);
      }

      // Load client profile photo if user has UID
      let clientPhotoURL: string | undefined;
      if (appointmentData.uid) {
        try {
          const photoURL = await this.roleService.getUserProfilePhoto(appointmentData.uid);
          clientPhotoURL = photoURL || undefined;
        } catch (error) {
          this.logger.warn('Could not load client photo', {
            component: 'AppointmentManagementService',
            method: 'loadAppointment',
            appointmentId,
            userId: appointmentData.uid,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const appointmentWithService: AppointmentWithService = {
        ...appointmentData,
        service,
        clientPhotoURL,
      };

            this.appointmentSignal.set(appointmentWithService);

      // Update permissions
      this.updatePermissions(appointmentWithService);

      // Auto-start editing if requested
      if (autoEdit) {
        this.startEditing();
      }

      this.logger.info('Appointment loaded', {
        component: 'AppointmentManagementService',
        method: 'loadAppointment',
        appointmentId,
        hasService: !!service,
        hasClientPhoto: !!clientPhotoURL,
      });
    } catch (error) {
      this.logger.error('Error loading appointment', {
        component: 'AppointmentManagementService',
        method: 'loadAppointment',
        appointmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.toastService.showError('APPOINTMENTS.LOAD_ERROR');
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async loadAvailableTimeSlots(): Promise<void> {
    try {
      const appointment = this.appointment();
      if (!appointment?.data || !appointment?.serviceId) {
        this.availableTimeSlotsSignal.set([]);
        return;
      }

      const service = this.servicesService.services().find(s => s.id === appointment.serviceId);
      if (!service) {
        this.availableTimeSlotsSignal.set([]);
        return;
      }

      const bookingDate = new Date(appointment.data);
      const allBookings = this.bookingService.bookings();

      // Filter out the current appointment to avoid showing it as occupied
      const otherBookings = allBookings.filter(booking => booking.id !== appointment.id);

      // Generate time slots for the selected date and service
      const timeSlots = this.bookingValidationService.generateTimeSlotsForService(
        bookingDate,
        service.duration,
        otherBookings
      );

      this.availableTimeSlotsSignal.set(timeSlots);
    } catch (error) {
      console.error('Error loading available time slots:', error);
      this.availableTimeSlotsSignal.set([]);
    }
  }

  async loadAvailableDays(): Promise<void> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 365); // 1 year ahead

      const availableDays = this.bookingValidationService.generateAvailableDays(startDate, endDate);
      this.availableDaysSignal.set(availableDays);
    } catch (error) {
      console.error('Error loading available days:', error);
      this.availableDaysSignal.set([]);
    }
  }

  private loadAvailableServices(): void {
    try {
      const allServices = this.servicesService.services();
      this.availableServicesSignal.set(allServices);
    } catch (error) {
      console.error('Error loading available services:', error);
      this.availableServicesSignal.set([]);
    }
  }

  private updatePermissions(appointment: AppointmentWithService): void {
    if (!appointment) {
      this.canEditSignal.set(false);
      this.canDeleteSignal.set(false);
      return;
    }

    // Check if appointment is in the future
    const appointmentDate = new Date(appointment.data);
    const appointmentTime = appointment.hora;
    const now = new Date();

    if (appointmentTime) {
      const [hours, minutes] = appointmentTime.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    const canEdit = appointmentDate > now;
    const canDelete = appointmentDate > now;

    this.canEditSignal.set(canEdit);
    this.canDeleteSignal.set(canDelete);
  }

  startEditing(): void {
    this.isEditingSignal.set(true);
    this.hasChangesSignal.set(true);
  }

  cancelEditing(): void {
    this.isEditingSignal.set(false);
    this.hasChangesSignal.set(false);
  }

  updateForm(field: keyof Booking, value: string | number): void {
    const appointment = this.appointment();
    if (!appointment) return;

    // Create updated appointment
    const updatedAppointment: AppointmentWithService = {
      ...appointment,
      [field]: value,
    };

    this.appointmentSignal.set(updatedAppointment);
    this.hasChangesSignal.set(true);

    // If date changed, reload available time slots and days
    if (field === 'data') {
      this.loadAvailableDays();
      // Load time slots with the new date immediately
      this.loadAvailableTimeSlotsForDate(value as string);
    }

    // If time changed, reload available time slots
    if (field === 'hora') {
      this.loadAvailableTimeSlotsForDate(appointment.data);
    }
  }

  async loadAvailableTimeSlotsForDate(date: string): Promise<void> {
    try {
      const appointment = this.appointment();
      if (!appointment?.serviceId) {
        this.availableTimeSlotsSignal.set([]);
        return;
      }

      const service = this.servicesService.services().find(s => s.id === appointment.serviceId);
      if (!service) {
        this.availableTimeSlotsSignal.set([]);
        return;
      }

      const bookingDate = new Date(date);
      const allBookings = this.bookingService.bookings();

      // Filter out the current appointment to avoid showing it as occupied
      const otherBookings = allBookings.filter(booking => booking.id !== appointment.id);

      // Generate time slots for the selected date and service using BookingValidationService
      const timeSlots = this.bookingValidationService.generateTimeSlotsForService(
        bookingDate,
        service.duration,
        otherBookings
      );

      this.availableTimeSlotsSignal.set(timeSlots);
    } catch (error) {
      console.error('Error loading available time slots for date:', error);
      this.availableTimeSlotsSignal.set([]);
    }
  }

  async saveAppointment(): Promise<boolean> {
    const appointment = this.appointment();
    if (!appointment?.id) return false;

    try {
      this.isLoadingSignal.set(true);

      // Update appointment in Firebase
      const appointmentDocRef = doc(this.firestore, 'bookings', appointment.id);
      await updateDoc(appointmentDocRef, {
        ...appointment,
        updatedAt: serverTimestamp(),
      });

      this.toastService.showSuccess('APPOINTMENTS.UPDATE_SUCCESS');
      this.isEditingSignal.set(false);
      this.hasChangesSignal.set(false);

      this.logger.info('Appointment saved', {
        component: 'AppointmentManagementService',
        method: 'saveAppointment',
        appointmentId: appointment.id,
      });

      return true;
    } catch (error) {
      this.logger.error('Error saving appointment', {
        component: 'AppointmentManagementService',
        method: 'saveAppointment',
        appointmentId: appointment.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.toastService.showError('APPOINTMENTS.UPDATE_ERROR');
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

      // Delete appointment from Firebase
      const appointmentDocRef = doc(this.firestore, 'bookings', appointment.id);
      await deleteDoc(appointmentDocRef);

      this.toastService.showSuccess('APPOINTMENTS.DELETE_SUCCESS');

      this.logger.info('Appointment deleted', {
        component: 'AppointmentManagementService',
        method: 'deleteAppointment',
        appointmentId: appointment.id,
      });

      return true;
    } catch (error) {
      this.logger.error('Error deleting appointment', {
        component: 'AppointmentManagementService',
        method: 'deleteAppointment',
        appointmentId: appointment.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.toastService.showError('APPOINTMENTS.DELETE_ERROR');
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  clearAppointment(): void {
    this.appointmentSignal.set(null);
    this.isEditingSignal.set(false);
    this.hasChangesSignal.set(false);
  }

  navigateToAppointment(appointmentId: string): void {
    this.router.navigate(['/appointments', appointmentId]);
  }

  navigateBack(): void {
    this.router.navigate(['/appointments']);
  }
}
