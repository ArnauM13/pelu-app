import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './ui/layout/header/header.component';
import { AuthService } from './core/auth/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { HybridEmailService } from './core/services/hybrid-email.service';
import { GlobalPopupService } from './core/services/global-popup.service';
import { AppointmentDetailPopupComponent } from './shared/components/appointment-detail-popup/appointment-detail-popup.component';
import { ConfirmationPopupComponent } from './shared/components/confirmation-popup/confirmation-popup.component';
import { ServiceSelectionPopupComponent } from './shared/components/service-selection-popup/service-selection-popup.component';
import { BookingPopupComponent } from './shared/components/booking-popup/booking-popup.component';
import { PopupDialogComponent } from './shared/components/popup-dialog/popup-dialog.component';
import { BookingService } from './core/services/booking.service';
import { Router } from '@angular/router';
import { Booking } from './core/interfaces/booking.interface';

@Component({
  selector: 'pelu-app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    TranslateModule,
    HeaderComponent,
    ToastComponent,
    LoaderComponent,
    AppointmentDetailPopupComponent,
    ConfirmationPopupComponent,
    ServiceSelectionPopupComponent,
    BookingPopupComponent,
    PopupDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // Core signals
  readonly title = signal('pelu-app');

  private readonly authService = inject(AuthService);
  private readonly emailService = inject(HybridEmailService);
  private readonly globalPopupService = inject(GlobalPopupService);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);

  // Computed signals - utilitzem AuthService
  readonly isLoading = computed(() => this.authService.isLoading());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly shouldShowHeader = computed(() => this.isAuthenticated() && !this.isLoading());

  // Global popup computed signals
  readonly appointmentDetailOpen = computed(() => this.globalPopupService.appointmentDetailOpen());
  readonly appointmentDetailBooking = computed(() => this.globalPopupService.appointmentDetailBooking());
  readonly appointmentDetailService = computed(() => this.globalPopupService.appointmentDetailService());

  readonly deleteConfirmOpen = computed(() => this.globalPopupService.deleteConfirmOpen());
  readonly deleteConfirmData = computed(() => this.globalPopupService.deleteConfirmData());
  readonly bookingToDelete = computed(() => this.globalPopupService.bookingToDelete());

  readonly serviceSelectionOpen = computed(() => this.globalPopupService.serviceSelectionOpen());
  readonly serviceSelectionDetails = computed(() => this.globalPopupService.serviceSelectionDetails());

  readonly bookingPopupOpen = computed(() => this.globalPopupService.bookingPopupOpen());
  readonly bookingDetails = computed(() => this.globalPopupService.bookingDetails());

  readonly popupDialogConfig = computed(() => this.globalPopupService.popupDialogConfig());

  ngOnInit() {
    injectSpeedInsights();
    // Initialize EmailJS for development
    this.emailService.initializeEmailJS();
  }

  // Appointment Detail Popup Events
  onAppointmentDetailClosed(): void {
    this.globalPopupService.closeAppointmentDetail();
  }

  async onAppointmentDeleted(booking: Booking): Promise<void> {
    try {
      await this.bookingService.deleteBooking(booking.id!);
      this.globalPopupService.closeAppointmentDetail();
      this.globalPopupService.hideDeleteConfirmation();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  }

  onDeleteRequested(booking: Booking): void {
    this.globalPopupService.showDeleteConfirmation(booking);
  }


  onViewDetailRequested(booking: Booking): void {
    this.router.navigate(['/appointments', booking.id]);
    this.globalPopupService.closeAppointmentDetail();
  }

  // Delete Confirmation Events
  async onDeleteConfirmed(): Promise<void> {
    const booking = this.bookingToDelete();
    if (booking) {
      await this.onAppointmentDeleted(booking);
    }
  }

  onDeleteCancelled(): void {
    this.globalPopupService.hideDeleteConfirmation();
  }

  // Service Selection Events
  onServiceSelected(service: any): void {
    // This will be handled by the current page that opened the popup
    const handler = this.globalPopupService.getEventHandler('serviceSelected');
    if (handler) {
      handler(service);
    }
    this.globalPopupService.closeServiceSelection();
  }

  onServiceSelectionCancelled(): void {
    const handler = this.globalPopupService.getEventHandler('serviceSelectionCancelled');
    if (handler) {
      handler();
    }
    this.globalPopupService.closeServiceSelection();
  }

  // Booking Popup Events
  onBookingConfirmed(bookingData: any): void {
    const handler = this.globalPopupService.getEventHandler('bookingConfirmed');
    if (handler) {
      handler(bookingData);
    }
    this.globalPopupService.closeBookingPopup();
  }

  onBookingCancelled(): void {
    const handler = this.globalPopupService.getEventHandler('bookingCancelled');
    if (handler) {
      handler();
    }
    this.globalPopupService.closeBookingPopup();
  }

  onClientNameChanged(name: string): void {
    const handler = this.globalPopupService.getEventHandler('clientNameChanged');
    if (handler) {
      handler(name);
    }
  }

  onEmailChanged(email: string): void {
    const handler = this.globalPopupService.getEventHandler('emailChanged');
    if (handler) {
      handler(email);
    }
  }

  // Popup Dialog Events
  onPopupDialogClosed(): void {
    const handler = this.globalPopupService.getEventHandler('popupDialogClosed');
    if (handler) {
      handler();
    }
    this.globalPopupService.closePopupDialog();
  }
}
