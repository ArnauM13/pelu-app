import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from './booking.service';
import { AuthService } from '../auth/auth.service';
import { RoleService } from './role.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoggerService } from '../../shared/services/logger.service';
import { Booking, BookingForm } from '../interfaces/booking.interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentDetailService {
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);

  // Signals
  private readonly bookingSignal = signal<Booking | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly canEditSignal = signal<boolean>(false);
  private readonly canDeleteSignal = signal<boolean>(false);
  private readonly isOwnerSignal = signal<boolean>(false);

  // Computed properties
  readonly booking = computed(() => this.bookingSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly canEdit = computed(() => this.canEditSignal());
  readonly canDelete = computed(() => this.canDeleteSignal());
  readonly isOwner = computed(() => this.isOwnerSignal());

  /**
   * Load booking by ID
   */
  async loadBookingById(uniqueId: string): Promise<void> {
    try {
      this.isLoadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Check if it's a UUID format (simple validation)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uniqueId);

      if (isUUID) {
        // Direct UUID lookup
        const booking = await this.bookingService.getBookingByIdWithToken(uniqueId);
        if (booking) {
          this.setBookingData(booking);
          return;
        }
      }

      // Legacy format support (for backward compatibility)
      if (uniqueId.includes('-') && !uniqueId.startsWith('booking-')) {
        const parts = uniqueId.split('-');
        if (parts.length === 2) {
          const [, appointmentId] = parts;
          const booking = await this.bookingService.getBookingById(appointmentId);
          if (booking) {
            this.setBookingData(booking);
            return;
          }
        }
      }

      // If we get here, booking not found
      this.errorSignal.set('Booking not found');
      this.bookingSignal.set(null);

    } catch (error) {
      this.logger.firebaseError(error, 'loadBookingById', {
        component: 'AppointmentDetailService',
        method: 'loadBookingById',
        uniqueId,
      });

      const errorMessage = error instanceof Error ? error.message : 'Error loading booking';
      this.errorSignal.set(errorMessage);
      this.bookingSignal.set(null);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Set booking data and compute permissions
   */
  private setBookingData(booking: Booking): void {
    const currentUser = this.authService.user();
    const isAdmin = this.roleService.isAdmin();
    const isOwner = booking.email === currentUser?.email;

    this.bookingSignal.set(booking);
    this.canEditSignal.set(isAdmin || isOwner);
    this.canDeleteSignal.set(isAdmin || isOwner);
    this.isOwnerSignal.set(isOwner);
  }

  /**
   * Check if form has changes
   */
  hasFormChanges(form: BookingForm): boolean {
    const booking = this.booking();
    if (!booking) return false;

    return (
      booking.clientName !== form.clientName ||
      booking.data !== form.data ||
      booking.hora !== form.hora ||
      booking.notes !== form.notes
    );
  }

  /**
   * Validate form
   */
  isFormValid(form: BookingForm): boolean {
    return form?.clientName.trim() !== '' && form?.data !== '';
  }

  /**
   * Create form from booking
   */
  createFormFromBooking(booking: Booking): BookingForm {
    return {
      clientName: booking.clientName || '',
      email: booking.email || '',
      data: booking.data || '',
      hora: booking.hora || '',
      notes: booking.notes || '',
      serviceId: booking.serviceId || '',
    };
  }

  /**
   * Update booking
   */
  async updateBooking(form: BookingForm): Promise<boolean> {
    try {
      const booking = this.booking();
      if (!booking) {
        throw new Error('No booking to update');
      }

      const updates: Partial<Booking> = {
        clientName: form.clientName.trim(),
        email: form.email.trim(),
        data: form.data,
        hora: form.hora,
        notes: form.notes || '',
        serviceId: form.serviceId,
      };

      const success = await this.bookingService.updateBooking(booking.id, updates);
      if (success) {
        // Update local state
        const updatedBooking = { ...booking, ...updates };
        this.setBookingData(updatedBooking);
        this.toastService.showAppointmentUpdated(updatedBooking.clientName || 'Client');
        return true;
      }

      return false;
    } catch (error) {
      this.logger.firebaseError(error, 'updateBooking', {
        component: 'AppointmentDetailService',
        method: 'updateBooking',
      });

      const errorMessage = error instanceof Error ? error.message : 'Error updating booking';
      this.errorSignal.set(errorMessage);
      return false;
    }
  }

  /**
   * Delete booking
   */
  async deleteBooking(): Promise<boolean> {
    try {
      const booking = this.booking();
      if (!booking) {
        throw new Error('No booking to delete');
      }

      const success = await this.bookingService.deleteBooking(booking.id);
      if (success) {
        this.toastService.showAppointmentDeleted(booking.clientName || 'Client');
        this.router.navigate(['/appointments']);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.firebaseError(error, 'deleteBooking', {
        component: 'AppointmentDetailService',
        method: 'deleteBooking',
      });

      const errorMessage = error instanceof Error ? error.message : 'Error deleting booking';
      this.errorSignal.set(errorMessage);
      return false;
    }
  }

  /**
   * Clear data
   */
  clearData(): void {
    this.bookingSignal.set(null);
    this.errorSignal.set(null);
    this.canEditSignal.set(false);
    this.canDeleteSignal.set(false);
    this.isOwnerSignal.set(false);
  }
}
