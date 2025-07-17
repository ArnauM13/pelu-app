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
  private readonly toastService = inject(ToastService);

  // Signals
  readonly showBookingPopupSignal = signal(false);
  readonly bookingDetailsSignal = signal<BookingDetails>({date: '', time: '', clientName: ''});
  readonly availableServicesSignal = signal<Service[]>([]);

  // Computed properties
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly availableServices = computed(() => this.availableServicesSignal());



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

  private loadServices() {
    this.servicesService.getServicesWithTranslatedNamesAsync().subscribe(services => {
      this.availableServicesSignal.set(services);
    });
  }



  onTimeSlotSelected(event: {date: string, time: string}) {
    this.bookingDetailsSignal.set({
      date: event.date,
      time: event.time,
      clientName: this.userService.userDisplayName() || ''
    });
    this.showBookingPopupSignal.set(true);
  }

  onBookingConfirmed(details: BookingDetails) {
    // Here you would typically save the booking to your backend
    console.log('Booking confirmed:', details);

    // Get current user
    const currentUser = this.authService.user();
    if (!currentUser?.uid) {
      this.toastService.showLoginRequired();
      return;
    }

    // Create a new appointment
    const appointment = {
      id: uuidv4(),
      data: details.date,
      hora: details.time,
      nom: details.clientName,
      serviceName: details.service?.name || 'General Service',
      duration: details.service?.duration || 60,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      userId: currentUser.uid
    };

    // Save to localStorage
    this.saveAppointmentToStorage(appointment);

    // Show success message
    this.toastService.showAppointmentCreated(details.clientName, appointment.id);

    this.showBookingPopupSignal.set(false);
    this.bookingDetailsSignal.set({date: '', time: '', clientName: ''});
  }

  private saveAppointmentToStorage(appointment: any): void {
    try {
      // Load existing appointments
      const existingAppointments = this.loadAppointmentsFromStorage();

      // Add new appointment
      existingAppointments.push(appointment);

      // Save to localStorage
      localStorage.setItem('cites', JSON.stringify(existingAppointments));

      console.log('Appointment saved to localStorage:', appointment);
    } catch (error) {
      console.error('Error saving appointment to localStorage:', error);
      this.toastService.showNetworkError();
    }
  }

  private loadAppointmentsFromStorage(): any[] {
    try {
      const stored = localStorage.getItem('cites');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading appointments from localStorage:', error);
      return [];
    }
  }



  onBookingCancelled() {
    this.showBookingPopupSignal.set(false);
    this.bookingDetailsSignal.set({date: '', time: '', clientName: ''});
  }

  onClientNameChanged(name: string) {
    const currentDetails = this.bookingDetails();
    this.bookingDetailsSignal.set({
      ...currentDetails,
      clientName: name
    });
  }

  onEditAppointment(appointment: any) {
    const user = this.authService.user();
    if (!user?.uid) {
      this.toastService.showError('No s\'ha pogut editar la cita. Si us plau, inicia sessió.');
      return;
    }

    // Generem un ID únic combinant clientId i appointmentId
    const clientId = user.uid;
    const uniqueId = `${clientId}-${appointment.id}`;

    // Naveguem a la pàgina de detall en mode edició
    this.router.navigate(['/appointments', uniqueId], { queryParams: { edit: 'true' } });
  }

  onDeleteAppointment(appointment: AppointmentEvent) {
    // Remove from localStorage
    try {
      const existingAppointments = this.loadAppointmentsFromStorage();
      const updatedAppointments = existingAppointments.filter((app: any) => app.id !== appointment.id);
      localStorage.setItem('cites', JSON.stringify(updatedAppointments));

      // Show success message with better fallback for client name
      const clientName = appointment.title || appointment.clientName || 'Client';
      this.toastService.showAppointmentDeleted(clientName);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      this.toastService.showNetworkError();
    }
  }




}
