import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PopupDialogComponent, PopupDialogConfig, FooterActionType } from '../popup-dialog/popup-dialog.component';
import { ConfirmationPopupComponent, type ConfirmationData } from '../confirmation-popup/confirmation-popup.component';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../services/toast.service';

import { Booking } from '../../../core/interfaces/booking.interface';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/services/services.service';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { isFutureAppointment } from '../../services';
// Import input components
import { InputTextComponent } from '../inputs/input-text/input-text.component';
import { InputDateComponent } from '../inputs/input-date/input-date.component';
import { InputTextareaComponent } from '../inputs/input-textarea/input-textarea.component';

@Component({
  selector: 'pelu-appointment-detail-popup',
  imports: [
    CommonModule,
    ButtonModule,
    TranslateModule,
    PopupDialogComponent,
    ConfirmationPopupComponent,
    // Add input components
    InputTextComponent,
    InputDateComponent,
    InputTextareaComponent
  ],
  templateUrl: './appointment-detail-popup.component.html',
  styleUrls: ['./appointment-detail-popup.component.scss'],
})
export class AppointmentDetailPopupComponent {
  // Inject services
  #authService = inject(AuthService);
  #userService = inject(UserService);
  #translateService = inject(TranslateService);
  #toastService = inject(ToastService);
  #servicesService = inject(ServicesService);

  // Input signals
  readonly open = input<boolean>(false);
  readonly booking = input<Booking | null>(null);
  readonly bookingId = input<string | null>(null); // Nou input
  readonly hideViewDetailButton = input<boolean>(false);
  readonly service = input<Service | null>(null); // Service data from parent

  // Output signals
  readonly closed = output<void>();
  readonly deleted = output<Booking>();
  readonly editRequested = output<Booking>();
  readonly viewDetailRequested = output<Booking>(); // New output for view detail

  // Internal state
  private isClosing = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<boolean>(false);
  private loadedBooking = signal<Booking | null>(null);
  private readonly showDeleteConfirmSignal = signal<boolean>(false);
  readonly showDeleteConfirm = computed(() => this.showDeleteConfirmSignal());
  readonly deleteConfirmData = computed<ConfirmationData>(() => ({
    title: this.#translateService.instant('COMMON.CONFIRMATION.TITLE'),
    message: this.#translateService.instant('COMMON.CONFIRMATION.MESSAGE'),
    confirmText: this.#translateService.instant('COMMON.ACTIONS.DELETE'),
    cancelText: this.#translateService.instant('COMMON.ACTIONS.CANCEL'),
    severity: 'danger'
  }));



  // Computed properties
  readonly isOpen = computed(() => this.open() && !this.isClosing());
  readonly currentBooking = computed(() => this.booking() || this.loadedBooking());

    // Computed service name
  readonly serviceName = computed(() => {
    const service = this.service();
    if (service) {
      return this.#servicesService.getServiceName(service);
    }

    const booking = this.currentBooking();
    if (!booking?.serviceId) return 'N/A';

    return 'N/A';
  });

  // Computed service duration
  readonly serviceDuration = computed(() => {
    const service = this.service();
    if (service) {
      return this.formatDuration(service.duration);
    }

    const booking = this.currentBooking();
    if (!booking?.serviceId) return 'N/A';

    return 'N/A';
  });

  // Computed service price
  readonly servicePrice = computed(() => {
    const service = this.service();
    if (service) {
      return this.formatPrice(service.price);
    }

    const booking = this.currentBooking();
    if (!booking?.serviceId) return 'N/A';

    return 'N/A';
  });

  readonly canEdit = computed(() => {
    const booking = this.currentBooking();
    if (!booking) return false;

    const currentUser = this.#authService.user();
    if (!currentUser?.uid) return false;

    const isAdmin = this.#userService.isAdmin();

    // Admin can edit any booking
    if (isAdmin) return true;

    // Check if user owns the booking or if it's an anonymous booking
    const isOwner = booking.email === currentUser.email || !booking.email;

    // Only allow editing if it's a future appointment and user owns the booking
    return isOwner && this.isFuture();
  });

  readonly canDelete = computed(() => {
    const booking = this.currentBooking();
    if (!booking) return false;

    const currentUser = this.#authService.user();
    if (!currentUser?.uid) return false;

    const isAdmin = this.#userService.isAdmin();

    // Admin can delete any booking
    if (isAdmin) return true;

    // Check if user owns the booking or if it's an anonymous booking
    const isOwner = booking.email === currentUser.email || !booking.email;

    // Only allow deletion if it's a future appointment and user owns the booking
    return isOwner && this.isFuture();
  });

  readonly isFuture = computed(() => {
    const booking = this.currentBooking();
    if (!booking) return false;

    return isFutureAppointment({ data: booking.data || '', hora: booking.hora || '' });
  });

  readonly showAdminWarning = computed(() => {
    const booking = this.currentBooking();
    if (!booking) return false;

    const currentUser = this.#authService.user();
    if (!currentUser?.uid) return false;

    const isAdmin = this.#userService.isAdmin();
    const isOwner = booking.email === currentUser.email || !booking.email;

    // Show warning if admin is viewing someone else's booking
    return isAdmin && !isOwner;
  });

  // Popup dialog configuration
  readonly dialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.#translateService.instant('COMMON.BOOKING_DETAILS'),
    size: 'medium',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      ...(this.canEdit() ? [{
        label: this.#translateService.instant('COMMON.ACTIONS.EDIT'),
        type: 'edit' as FooterActionType,
        action: () => this.onEdit()
      }] : []),
      ...(this.canDelete() ? [{
        label: this.#translateService.instant('COMMON.ACTIONS.DELETE'),
        type: 'delete' as FooterActionType,
        action: () => this.onDelete()
      }] : [])
    ]
  }));



  onClose(): void {
    if (this.isClosing()) return;

    this.isClosing.set(true);

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
    // Open confirmation popup
    this.showDeleteConfirmSignal.set(true);
  }

  onDeleteConfirmed(): void {
    const booking = this.currentBooking();
    if (!booking || !booking.id) {
      this.#toastService.showGenericError('Booking not found');
      this.onClose();
      this.showDeleteConfirmSignal.set(false);
      return;
    }
    this.deleted.emit(booking);
    this.showDeleteConfirmSignal.set(false);
    this.onClose();
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirmSignal.set(false);
  }



  onViewDetail(): void {
    const booking = this.currentBooking();
    if (booking && booking.id) {
      this.viewDetailRequested.emit(booking);
      this.onClose();
    }
  }

  // Helper methods
  getClientName(booking: Booking): string {
    return booking.clientName || 'N/A';
  }

  getClientEmail(booking: Booking): string {
    return booking.email || 'N/A';
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

  // Methods expected by specs
  formatDate(date: string): string {
    if (!date) return 'N/A';
    try {
      return format(parseISO(date), 'yyyy-MM-dd');
    } catch {
      return date;
    }
  }

  formatTime(time: string): string {
    return time;
  }
}
