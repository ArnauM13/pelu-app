import { Injectable, signal, computed } from '@angular/core';
import { Booking } from '../interfaces/booking.interface';
import { Service } from './services.service';
import { ConfirmationData } from '../../shared/components/confirmation-popup/confirmation-popup.component';

export interface ServiceSelectionDetails {
  date: string;
  time: string;
  clientName: string;
  email: string;
}

export interface BookingDetails {
  date: string;
  time: string;
  clientName: string;
  email: string;
  service?: Service;
}

export interface PopupDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  severity: 'info' | 'warning' | 'danger';
  footerActions: Array<{ label: string; action: () => void; style?: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalPopupService {

  // Appointment Detail Popup
  private readonly appointmentDetailOpenSignal = signal<boolean>(false);
  private readonly appointmentDetailBookingSignal = signal<Booking | null>(null);
  private readonly appointmentDetailServiceSignal = signal<Service | null>(null);
  readonly appointmentDetailOpen = computed(() => this.appointmentDetailOpenSignal());
  readonly appointmentDetailBooking = computed(() => this.appointmentDetailBookingSignal());
  readonly appointmentDetailService = computed(() => this.appointmentDetailServiceSignal());

  // Delete Confirmation Popup
  private readonly deleteConfirmOpenSignal = signal<boolean>(false);
  private readonly deleteConfirmDataSignal = signal<ConfirmationData | null>(null);
  private readonly bookingToDeleteSignal = signal<Booking | null>(null);
  readonly deleteConfirmOpen = computed(() => this.deleteConfirmOpenSignal());
  readonly deleteConfirmData = computed(() => this.deleteConfirmDataSignal());
  readonly bookingToDelete = computed(() => this.bookingToDeleteSignal());

  // Service Selection Popup (Booking Page)
  private readonly serviceSelectionOpenSignal = signal<boolean>(false);
  private readonly serviceSelectionDetailsSignal = signal<ServiceSelectionDetails | null>(null);
  readonly serviceSelectionOpen = computed(() => this.serviceSelectionOpenSignal());
  readonly serviceSelectionDetails = computed(() => this.serviceSelectionDetailsSignal());

  // Booking Confirmation Popup (Booking Page)
  private readonly bookingPopupOpenSignal = signal<boolean>(false);
  private readonly bookingDetailsSignal = signal<BookingDetails | null>(null);
  readonly bookingPopupOpen = computed(() => this.bookingPopupOpenSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());

  // Generic Popup Dialog
  private readonly popupDialogConfigSignal = signal<PopupDialogConfig>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    severity: 'info',
    footerActions: []
  });
  readonly popupDialogConfig = computed(() => this.popupDialogConfigSignal());

  // Event handlers storage for global callbacks
  private eventHandlers = new Map<string, (...args: any[]) => void>();

  // Appointment Detail Popup Methods
  openAppointmentDetail(booking: Booking, service?: Service): void {
    this.appointmentDetailBookingSignal.set(booking);
    this.appointmentDetailServiceSignal.set(service || null);
    this.appointmentDetailOpenSignal.set(true);
  }

  closeAppointmentDetail(): void {
    this.appointmentDetailOpenSignal.set(false);
    this.appointmentDetailBookingSignal.set(null);
    this.appointmentDetailServiceSignal.set(null);
  }

  // Delete Confirmation Methods
  showDeleteConfirmation(booking: Booking): void {
    const confirmData: ConfirmationData = {
      title: 'COMMON.CONFIRMATION.DELETE_TITLE',
      message: 'COMMON.CONFIRMATION.DELETE_MESSAGE',
      confirmText: 'COMMON.CONFIRMATION.YES',
      cancelText: 'COMMON.CONFIRMATION.NO',
      severity: 'danger',
      userName: booking.clientName || booking.email || 'N/A'
    };

    this.deleteConfirmDataSignal.set(confirmData);
    this.bookingToDeleteSignal.set(booking);
    this.deleteConfirmOpenSignal.set(true);
  }

  hideDeleteConfirmation(): void {
    this.deleteConfirmOpenSignal.set(false);
    this.deleteConfirmDataSignal.set(null);
    this.bookingToDeleteSignal.set(null);
  }

  // Service Selection Popup Methods
  openServiceSelection(details: ServiceSelectionDetails): void {
    this.serviceSelectionDetailsSignal.set(details);
    this.serviceSelectionOpenSignal.set(true);
  }

  closeServiceSelection(): void {
    this.serviceSelectionOpenSignal.set(false);
    this.serviceSelectionDetailsSignal.set(null);
  }

  // Booking Popup Methods
  openBookingPopup(details: BookingDetails): void {
    this.bookingDetailsSignal.set(details);
    this.bookingPopupOpenSignal.set(true);
  }

  closeBookingPopup(): void {
    this.bookingPopupOpenSignal.set(false);
    this.bookingDetailsSignal.set(null);
  }

  // Generic Popup Dialog Methods
  openPopupDialog(config: Partial<PopupDialogConfig>): void {
    this.popupDialogConfigSignal.set({
      isOpen: true,
      title: config.title || '',
      message: config.message || '',
      confirmText: config.confirmText || 'COMMON.CONFIRM',
      cancelText: config.cancelText || 'COMMON.CANCEL',
      severity: config.severity || 'info',
      footerActions: config.footerActions || []
    });
  }

  closePopupDialog(): void {
    this.popupDialogConfigSignal.update(config => ({
      ...config,
      isOpen: false
    }));
  }

  // Event Handler Management
  setEventHandler(key: string, handler: (...args: any[]) => void): void {
    this.eventHandlers.set(key, handler);
  }

  getEventHandler(key: string): ((...args: any[]) => void) | undefined {
    return this.eventHandlers.get(key);
  }

  removeEventHandler(key: string): void {
    this.eventHandlers.delete(key);
  }

  clearAllEventHandlers(): void {
    this.eventHandlers.clear();
  }
}
