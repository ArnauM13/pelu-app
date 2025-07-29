import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {
  ConfirmationPopupComponent,
  ConfirmationData,
} from '../confirmation-popup/confirmation-popup.component';
import { PopupDialogComponent, PopupDialogConfig, PopupDialogActionType } from '../popup-dialog/popup-dialog.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../services/toast.service';
import { BookingService, Booking } from '../../../core/services/booking.service';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { isFutureAppointment } from '../../services';

@Component({
  selector: 'pelu-appointment-detail-popup',
  imports: [CommonModule, ButtonModule, TranslateModule, ConfirmationPopupComponent, PopupDialogComponent],
  templateUrl: './appointment-detail-popup.component.html',
  styleUrls: ['./appointment-detail-popup.component.scss'],
})
export class AppointmentDetailPopupComponent implements OnInit {
  // Inject services
  #router = inject(Router);
  #authService = inject(AuthService);
  #translateService = inject(TranslateService);
  #toastService = inject(ToastService);
  #bookingService = inject(BookingService);

  // Input signals
  readonly open = input<boolean>(false);
  readonly booking = input<Booking | null>(null);
  readonly bookingId = input<string | null>(null); // Nou input
  readonly hideViewDetailButton = input<boolean>(false);

  // Output signals
  readonly closed = output<void>();
  readonly deleted = output<Booking>();
  readonly editRequested = output<Booking>();

  // Internal state
  private isClosing = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<boolean>(false);
  private loadedBooking = signal<Booking | null>(null);

  // Confirmation popup state
  readonly showConfirmationPopup = signal<boolean>(false);
  readonly confirmationData = signal<ConfirmationData | null>(null);

  // Computed properties
  readonly isOpen = computed(() => this.open() && !this.isClosing());
  readonly currentBooking = computed(() => this.booking() || this.loadedBooking());

  readonly canEdit = computed(() => {
    const booking = this.currentBooking();
    if (!booking) return false;

    const currentUser = this.#authService.user();
    if (!currentUser?.uid) return false;

    // Check if user owns the booking or if it's an anonymous booking
    const isOwner = booking.uid === currentUser.uid || !booking.uid;

    // Only allow editing if it's a future appointment
    return isOwner && this.isFuture();
  });

  readonly canDelete = computed(() => {
    const booking = this.currentBooking();
    if (!booking) return false;

    const currentUser = this.#authService.user();
    if (!currentUser?.uid) return false;

    // Check if user owns the booking or if it's an anonymous booking
    const isOwner = booking.uid === currentUser.uid || !booking.uid;

    // Only allow deletion if it's a future appointment
    return isOwner && this.isFuture();
  });

  readonly isFuture = computed(() => {
    const booking = this.currentBooking();
    if (!booking) return false;

    return isFutureAppointment({ data: booking.data || '', hora: booking.hora || '' });
  });

  // Popup dialog configuration
  readonly dialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.#translateService.instant('COMMON.BOOKING_DETAILS'),
    size: 'medium',
    showCloseButton: true,
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.#translateService.instant('COMMON.ACTIONS.CLOSE'),
        type: 'close' as const,
        action: () => this.onClose()
      },
      ...(this.canEdit() ? [{
        label: this.#translateService.instant('COMMON.ACTIONS.EDIT'),
        type: 'edit' as const,
        action: () => this.onEdit()
      }] : []),
      ...(this.canDelete() ? [{
        label: this.#translateService.instant('COMMON.ACTIONS.DELETE'),
        type: 'delete' as const,
        action: () => this.onDelete()
      }] : [])
    ]
  }));

  ngOnInit() {
    // Load booking from ID if provided
    if (this.bookingId()) {
      this.loadBookingFromFirebase();
    }
  }

  // Methods
  async loadBookingFromFirebase(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.loadError.set(false);

      const booking = await this.#bookingService.getBookingById(this.bookingId()!);
      if (booking && booking.id) {
        this.loadedBooking.set(booking);
      } else {
        this.loadError.set(true);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      this.loadError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  onClose(): void {
    if (this.isClosing()) return;

    this.isClosing.set(true);

    // Close confirmation popup if open
    this.showConfirmationPopup.set(false);
    this.confirmationData.set(null);

    // Emit immediately to avoid timing issues
    this.closed.emit();

    // Reset closing state after a short delay
    setTimeout(() => {
      this.isClosing.set(false);
    }, 100);
  }

  onEdit(): void {
    const booking = this.currentBooking();
    if (booking) {
      this.editRequested.emit(booking);
      this.onClose();
    }
  }

  onDelete(): void {
    const booking = this.currentBooking();
    if (!booking || !booking.id) {
      this.#toastService.showGenericError('Booking not found');
      this.onClose();
      return;
    }

    // Show confirmation popup
    this.confirmationData.set({
      title: this.#translateService.instant('COMMON.CONFIRMATION.DELETE_TITLE'),
      message: this.#translateService.instant('COMMON.CONFIRMATION.DELETE_MESSAGE', {
        name: booking.nom,
      }),
      confirmText: this.#translateService.instant('COMMON.CONFIRMATION.YES'),
      cancelText: this.#translateService.instant('COMMON.CONFIRMATION.NO'),
      severity: 'danger',
    });
    this.showConfirmationPopup.set(true);
  }

  async onConfirmDelete(): Promise<void> {
    const booking = this.currentBooking();
    if (!booking || !booking.id) {
      this.#toastService.showGenericError('Booking not found');
      this.onClose();
      return;
    }

    try {
      this.isLoading.set(true);

      // Delete from Firebase
      try {
        const success = await this.#bookingService.deleteBooking(booking.id);

        if (success) {
          // Show success message
          this.#toastService.showSuccess(
            this.#translateService.instant('COMMON.DELETE_SUCCESS', {
              name: booking.nom,
            })
          );

          // Close the confirmation popup first
          this.showConfirmationPopup.set(false);
          this.confirmationData.set(null);

          // Emit the deleted event immediately
          this.deleted.emit(booking);

          // Close the main popup immediately
          this.onClose();
        } else {
          // Show error message
          this.#toastService.showGenericError('Error deleting booking');

          // Close the confirmation popup on error
          this.showConfirmationPopup.set(false);
          this.confirmationData.set(null);
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        this.#toastService.showGenericError('Error deleting booking');
        // Close the confirmation popup on error
        this.showConfirmationPopup.set(false);
        this.confirmationData.set(null);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  onConfirmationCancelled(): void {
    this.showConfirmationPopup.set(false);
    this.confirmationData.set(null);
    // The main popup stays open when cancelling deletion
  }

  onViewDetail(): void {
    const booking = this.currentBooking();
    if (booking && booking.id) {
      this.#router.navigate(['/appointments', booking.id]);
      this.onClose();
    }
  }

  // Helper methods
  getClientName(booking: Booking): string {
    return booking.nom || booking.clientName || 'N/A';
  }

  getClientEmail(booking: Booking): string {
    return booking.email || 'N/A';
  }

  getServiceName(booking: Booking): string {
    return booking.serviceName || booking.servei || 'N/A';
  }

  formatBookingDate(date: string): string {
    if (!date) return 'N/A';
    try {
      return format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: ca });
    } catch {
      return date;
    }
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

  formatPrice(price: number): string {
    return `${price}€`;
  }

  onConfirmationConfirmed(): void {
    const booking = this.currentBooking();
    if (booking) {
      this.deleted.emit(booking);
    }
    this.showConfirmationPopup.set(false);
    this.confirmationData.set(null);
  }

  getNotes(booking: Booking): string {
    return booking.notes || '';
  }

  getStatus(booking: Booking): string {
    return booking.status || 'confirmed';
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed':
        return this.#translateService.instant('APPOINTMENTS.STATUSES.CONFIRMED');
      case 'cancelled':
        return this.#translateService.instant('APPOINTMENTS.STATUSES.CANCELLED');
      case 'completed':
        return this.#translateService.instant('APPOINTMENTS.STATUSES.COMPLETED');
      default:
        return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'var(--success-color)';
      case 'cancelled':
        return 'var(--error-color)';
      case 'completed':
        return 'var(--info-color)';
      default:
        return 'var(--text-color-light)';
    }
  }
}
