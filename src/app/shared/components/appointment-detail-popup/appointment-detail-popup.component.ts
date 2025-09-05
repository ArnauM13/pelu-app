import { Component, input, output, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PopupDialogComponent, PopupDialogConfig } from '../popup-dialog/popup-dialog.component';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../services/toast.service';

import { Booking } from '../../../core/interfaces/booking.interface';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/services/services.service';
import { isFutureAppointment } from '../../services';
import { BookingService } from '../../../core/services/booking.service';
import { TimeUtils } from '../../../shared/utils/time.utils';
// Import input components
import { InputTextComponent } from '../inputs/input-text/input-text.component';
import { InputDateComponent } from '../inputs/input-date/input-date.component';
import { InputTextareaComponent } from '../inputs/input-textarea/input-textarea.component';
import { FooterAction } from '../popup-dialog/popup-dialog.component';

@Component({
  selector: 'pelu-appointment-detail-popup',
  imports: [
    CommonModule,
    ButtonModule,
    TranslateModule,
    PopupDialogComponent,
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
  #bookingService = inject(BookingService);
  #timeUtils = inject(TimeUtils);

  // Input signals
  readonly open = input<boolean>(false);
  readonly booking = input<Booking | null>(null);
  readonly bookingId = input<string | null>(null); // Nou input
  readonly hideViewDetailButton = input<boolean>(false);
  readonly service = input<Service | null>(null); // Service data from parent

  // Output signals
  readonly closed = output<void>();
  readonly deleted = output<Booking>();
  readonly deleteRequested = output<Booking>(); // New output for delete request
  readonly viewDetailRequested = output<Booking>(); // New output for view detail

  // Internal state
  private isClosing = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<boolean>(false);
  private loadedBooking = signal<Booking | null>(null);
  private isEditingSignal = signal<boolean>(false);
  readonly isEditing = computed(() => this.isEditingSignal());

  // Edit form state signals
  editName = signal<string>('');
  editEmail = signal<string>('');
  editDate = signal<string | Date>('');
  editTime = signal<string>('');
  editNotes = signal<string>('');

  // Computed properties
  readonly isOpen = computed(() => {
    const open = this.open();
    const isClosing = this.isClosing();
    const result = open && !isClosing;
    console.log('🔍 AppointmentDetailPopup - isOpen computed:', { open, isClosing, result });
    return result;
  });
  readonly currentBooking = computed(() => {
    const booking = this.booking() || this.loadedBooking();
    console.log('🔍 AppointmentDetailPopup - currentBooking:', booking);
    return booking;
  });

  // Computed service name
  readonly serviceName = computed(() => {
    const service = this.service();
    if (service) {
      return this.#servicesService.getServiceName(service);
    }

    const booking = this.currentBooking();
    if (!booking?.serviceId) return 'N/A';

    // For now, return a placeholder since getServiceById is async
    // In a real implementation, you might want to use a signal to store the service data
    return 'N/A';
  });

  // Computed service duration
  readonly serviceDuration = computed(() => {
    const service = this.service();
    if (service?.duration) {
      return this.formatDuration(service.duration);
    }

    const booking = this.currentBooking();
    if (!booking?.serviceId) return 'N/A';

    // For now, return a placeholder since getServiceById is async
    return 'N/A';
  });

  // Computed service price
  readonly servicePrice = computed(() => {
    const service = this.service();
    if (service?.price) {
      return this.formatPrice(service.price);
    }

    const booking = this.currentBooking();
    if (!booking?.serviceId) return 'N/A';

    // For now, return a placeholder since getServiceById is async
    return 'N/A';
  });

  constructor() {
    // Reset isClosing when popup is opened
    effect(() => {
      const open = this.open();
      if (open && this.isClosing()) {
        console.log('🔄 AppointmentDetailPopup - Resetting isClosing flag');
        this.isClosing.set(false);
      }
    });
  }

  // Computed popup configuration
  readonly popupConfig = computed<PopupDialogConfig>(() => {
    const booking = this.currentBooking();
    if (!booking) {
      return {
        title: this.#translateService.instant('APPOINTMENTS.APPOINTMENT_DETAILS'),
        size: 'medium',
        showFooter: false,
      };
    }

    const actions: FooterAction[] = [];

    // Edit button removed as requested

    // Add delete button if user can delete
    if (this.canDeleteBooking(booking)) {
      actions.push({
        label: this.#translateService.instant('COMMON.ACTIONS.DELETE'),
        severity: 'danger',
        action: () => this.onDelete(),
      });
    }

    // Add view detail button if not hidden
    if (!this.hideViewDetailButton()) {
      actions.push({
        label: this.#translateService.instant('COMMON.ACTIONS.VIEW_DETAILS'),
        severity: 'secondary',
        action: () => this.onViewDetail(),
      });
    }

    return {
      title: this.#translateService.instant('APPOINTMENTS.APPOINTMENT_DETAILS'),
      size: 'medium',
      showFooter: true,
      footerActions: actions,
    };
  });

  // Methods
  async loadBooking(): Promise<void> {
    const bookingId = this.bookingId();
    if (!bookingId) return;

    this.isLoading.set(true);
    this.loadError.set(false);

    try {
      const booking = await this.#bookingService.getBookingById(bookingId);
      this.loadedBooking.set(booking);
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
    this.closed.emit();
  }


  onDelete(): void {
    const booking = this.currentBooking();
    if (booking) {
      console.log('🔄 AppointmentDetailPopup - Emitting delete request:', booking);
      this.deleteRequested.emit(booking);
    }
  }


  onViewDetail(): void {
    const booking = this.currentBooking();
    if (booking && booking.id) {
      this.viewDetailRequested.emit(booking);
      // Close popup when navigating to view detail
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
    return this.#timeUtils.formatDateString(date);
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
    return this.#timeUtils.formatDateString(date);
  }

  formatTime(time: string): string {
    return this.#timeUtils.formatTimeString(time);
  }


  private canDeleteBooking(booking: Booking): boolean {
    // Add your logic to determine if user can delete this booking
    return true; // Placeholder
  }


}
