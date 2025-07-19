import { Component, signal, computed, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { v4 as uuidv4 } from 'uuid';
import { TranslateModule } from '@ngx-translate/core';
import { InfoItemData } from '../../../shared/components/info-item/info-item.component';
import { CalendarComponent, AppointmentEvent } from '../../../features/calendar/calendar.component';
import { BookingPopupComponent, BookingDetails } from '../../../shared/components/booking-popup/booking-popup.component';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { ServicesService, Service } from '../../../core/services/services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'pelu-booking-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    TranslateModule,
    CalendarComponent,
    BookingPopupComponent
  ],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent {
  @ViewChild('calendarComponent') calendarComponent!: CalendarComponent;

  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly servicesService = inject(ServicesService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);

  // Signals
  readonly showBookingPopupSignal = signal(false);
  readonly bookingDetailsSignal = signal<BookingDetails>({date: '', time: '', clientName: '', email: ''});
  readonly availableServicesSignal = signal<Service[]>([]);
  readonly showLoginPromptSignal = signal(false);

  // Computed properties
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly availableServices = computed(() => this.availableServicesSignal());
  readonly showLoginPrompt = computed(() => this.showLoginPromptSignal());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Info items for the page
  readonly infoItems: InfoItemData[] = [
    {
      icon: '📅',
      label: 'BOOKING.SELECT_DATE',
      value: 'BOOKING.SELECT_DATE_DESCRIPTION'
    },
    {
      icon: '⏰',
      label: 'BOOKING.SELECT_TIME',
      value: 'BOOKING.SELECT_TIME_DESCRIPTION'
    },
    {
      icon: '✂️',
      label: 'BOOKING.SELECT_SERVICE',
      value: 'BOOKING.SELECT_SERVICE_DESCRIPTION'
    }
  ];

  constructor() {
    this.loadServices();
  }

  private async loadServices() {
    try {
      const services = this.servicesService.getAllServices();
      this.availableServicesSignal.set(services);
    } catch (error) {
      console.error('Error loading services:', error);
      this.toastService.showGenericError('Error loading services');
    }
  }

  onTimeSlotSelected(event: {date: string, time: string}) {
    const details: BookingDetails = {
      date: event.date,
      time: event.time,
      clientName: this.isAuthenticated() ? this.authService.userDisplayName() || '' : '',
      email: this.isAuthenticated() ? this.authService.user()?.email || '' : ''
    };

    this.bookingDetailsSignal.set(details);
    this.showBookingPopupSignal.set(true);
  }

  onEditAppointment(event: AppointmentEvent) {
    // Navigate to appointment detail or edit page
    if (event.id) {
      this.router.navigate(['/appointments', event.id]);
    }
  }

  onDeleteAppointment(event: AppointmentEvent) {
    // Handle appointment deletion
    console.log('Delete appointment:', event);
  }

  async onBookingConfirmed(details: BookingDetails) {
    try {
      // Create booking using the new service
      const booking = await this.bookingService.createBooking(details);

      if (booking) {
        // Show success message
        this.toastService.showAppointmentCreated(details.clientName, booking.id || '');

        // Show login prompt for anonymous users
        if (!this.isAuthenticated()) {
          this.showLoginPromptSignal.set(true);
        }
      }

      this.showBookingPopupSignal.set(false);
      this.bookingDetailsSignal.set({date: '', time: '', clientName: '', email: ''});
    } catch (error) {
      console.error('Error creating booking:', error);
      this.toastService.showGenericError('Error creating booking');
    }
  }

  onBookingCancelled() {
    this.showBookingPopupSignal.set(false);
    this.bookingDetailsSignal.set({date: '', time: '', clientName: '', email: ''});
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
}
