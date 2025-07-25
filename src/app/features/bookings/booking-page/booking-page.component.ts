import { Component, signal, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { InfoItemData } from '../../../shared/components/info-item/info-item.component';
import { CalendarWithFooterComponent } from '../../../features/calendar/core/calendar-with-footer.component';
import {
  BookingPopupComponent,
  BookingDetails,
} from '../../../shared/components/booking-popup/booking-popup.component';
import {
  ServiceSelectionPopupComponent,
  ServiceSelectionDetails,
} from '../../../shared/components/service-selection-popup/service-selection-popup.component';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import {
  FirebaseServicesService,
  FirebaseService,
} from '../../../core/services/firebase-services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'pelu-booking-page',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    TranslateModule,
    CalendarWithFooterComponent,
    BookingPopupComponent,
    ServiceSelectionPopupComponent,
  ],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss'],
})
export class BookingPageComponent {
  @ViewChild('calendarComponent') calendarComponent!: CalendarWithFooterComponent;

  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);

  // Signals
  readonly showServiceSelectionPopupSignal = signal(false);
  readonly showBookingPopupSignal = signal(false);
  readonly serviceSelectionDetailsSignal = signal<ServiceSelectionDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });
  readonly bookingDetailsSignal = signal<BookingDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });
  readonly availableServicesSignal = signal<FirebaseService[]>([]);
  readonly showLoginPromptSignal = signal(false);

  // Computed properties
  readonly showServiceSelectionPopup = computed(() => this.showServiceSelectionPopupSignal());
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly serviceSelectionDetails = computed(() => this.serviceSelectionDetailsSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly availableServices = computed(() => this.availableServicesSignal());
  readonly showLoginPrompt = computed(() => this.showLoginPromptSignal());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Info items for the page
  readonly infoItems: InfoItemData[] = [
    {
      icon: '📅',
      label: 'BOOKING.SELECT_DATE',
      value: 'BOOKING.SELECT_DATE_DESCRIPTION',
    },
    {
      icon: '⏰',
      label: 'BOOKING.SELECT_TIME',
      value: 'BOOKING.SELECT_TIME_DESCRIPTION',
    },
    {
      icon: '✂️',
      label: 'BOOKING.SELECT_SERVICE',
      value: 'BOOKING.SELECT_SERVICE_DESCRIPTION',
    },
  ];

  constructor() {
    this.loadServices();

    // Listen for service updates to refresh services
    window.addEventListener('serviceUpdated', () => {
      this.loadServices();
    });
  }

  private async loadServices() {
    try {
      await this.firebaseServicesService.loadServices();
      const services = this.firebaseServicesService.activeServices();
      this.availableServicesSignal.set(services);
    } catch (error) {
      console.error('Error loading services:', error);
      // Don't show toast for loading errors - they're not user-initiated actions
    }
  }

  onTimeSlotSelected(event: { date: string; time: string }) {
    // Show service selection popup first
    const details: ServiceSelectionDetails = {
      date: event.date,
      time: event.time,
      clientName: this.isAuthenticated() ? this.authService.userDisplayName() || '' : '',
      email: this.isAuthenticated() ? this.authService.user()?.email || '' : '',
    };

    this.serviceSelectionDetailsSignal.set(details);
    this.showServiceSelectionPopupSignal.set(true);
  }

  onEditAppointment(event: any) {
    // Navigate to appointment detail or edit page
    if (event && event.id) {
      this.router.navigate(['/appointments', event.id]);
    }
  }

  onDeleteAppointment(event: any) {
    // Handle appointment deletion
    console.log('Delete appointment:', event);
  }

  async onBookingConfirmed(details: BookingDetails) {
    try {
      // Create booking using the booking service
      const bookingData = {
        nom: details.clientName,
        email: details.email,
        data: details.date,
        hora: details.time,
        serviceName: details.service?.name || '',
        serviceId: details.service?.id || '',
        duration: details.service?.duration || 60,
        price: details.service?.price || 0,
        notes: '',
        status: 'confirmed' as const,
        editToken: '', // Will be generated automatically
        uid: this.authService.user()?.uid || null,
      };

      const booking = await this.bookingService.createBooking(bookingData);

      if (booking) {
        // Show login prompt for anonymous users
        if (!this.isAuthenticated()) {
          this.showLoginPromptSignal.set(true);
        }
      }

      this.showBookingPopupSignal.set(false);
      this.bookingDetailsSignal.set({ date: '', time: '', clientName: '', email: '' });
    } catch (error) {
      console.error('Error creating booking:', error);
      // Don't show toast - the booking service already handles success/error toasts
    }
  }

  onServiceSelected(event: { details: ServiceSelectionDetails; service: FirebaseService }) {
    // Close service selection popup
    this.showServiceSelectionPopupSignal.set(false);

    // Show booking confirmation popup with selected service
    const bookingDetails: BookingDetails = {
      date: event.details.date,
      time: event.details.time,
      clientName: event.details.clientName,
      email: event.details.email,
      service: event.service,
    };

    this.bookingDetailsSignal.set(bookingDetails);
    this.showBookingPopupSignal.set(true);
  }

  onServiceSelectionCancelled() {
    this.showServiceSelectionPopupSignal.set(false);
    this.serviceSelectionDetailsSignal.set({ date: '', time: '', clientName: '', email: '' });
  }

  onBookingCancelled() {
    this.showBookingPopupSignal.set(false);
    this.bookingDetailsSignal.set({ date: '', time: '', clientName: '', email: '' });
  }

  onClientNameChanged(name: string) {
    this.bookingDetailsSignal.update(details => ({ ...details, clientName: name }));
  }

  onEmailChanged(email: string) {
    this.bookingDetailsSignal.update(details => ({ ...details, email: email }));
  }

  // Login prompt handlers
  onLoginPromptClose() {
    this.showLoginPromptSignal.set(false);
  }

  onLoginPromptLogin() {
    this.showLoginPromptSignal.set(false);
    this.router.navigate(['/login']);
  }

  // Removed test method
}
