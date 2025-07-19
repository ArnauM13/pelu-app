import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { v4 as uuidv4 } from 'uuid';
import { TranslateModule } from '@ngx-translate/core';
import { addDays, format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BookingPopupComponent, BookingDetails } from '../../../shared/components/booking-popup/booking-popup.component';
import { ServiceSelectionPopupComponent, ServiceSelectionDetails } from '../../../shared/components/service-selection-popup/service-selection-popup.component';
import { ServicesService, Service } from '../../../core/services/services.service';
import { BookingService } from '../../../core/services/booking.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { ServiceTranslationService } from '../../../core/services/service-translation.service';

interface TimeSlot {
  time: string;
  available: boolean;
  isSelected: boolean;
  clientName?: string;
}

interface DaySlot {
  date: Date;
  timeSlots: TimeSlot[];
}

@Component({
  selector: 'pelu-booking-mobile-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TranslateModule,
    CardComponent,
    BookingPopupComponent,
    ServiceSelectionPopupComponent,
    CurrencyPipe,
  ],
  templateUrl: './booking-mobile-page.component.html',
  styleUrls: ['./booking-mobile-page.component.scss']
})
export class BookingMobilePageComponent {
  // Inject services
  public readonly authService = inject(AuthService);
  public readonly servicesService = inject(ServicesService);
  public readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Internal state signals
  private readonly selectedDateSignal = signal<Date>(new Date());
  private readonly selectedServiceSignal = signal<Service | null>(null);
  private readonly appointmentsSignal = signal<any[]>([]);
  private readonly showServiceSelectionPopupSignal = signal<boolean>(false);
  private readonly showBookingPopupSignal = signal<boolean>(false);
  private readonly serviceSelectionDetailsSignal = signal<ServiceSelectionDetails>({date: '', time: '', clientName: '', email: ''});
  private readonly bookingDetailsSignal = signal<BookingDetails>({date: '', time: '', clientName: '', email: ''});
  private readonly showLoginPromptSignal = signal<boolean>(false);

  // Public computed signals
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal() || undefined);
  readonly appointments = computed(() => this.appointmentsSignal());
  readonly showServiceSelectionPopup = computed(() => this.showServiceSelectionPopupSignal());
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly serviceSelectionDetails = computed(() => this.serviceSelectionDetailsSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly showLoginPrompt = computed(() => this.showLoginPromptSignal());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Business configuration
  readonly businessHours = { start: '08:00', end: '20:00' };
  readonly lunchBreak = { start: '13:00', end: '14:00' };
  readonly businessDays = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
  readonly slotDuration = 30;

  // Available services
  readonly availableServices = computed(() => this.servicesService.getAllServices());

  // Week days computation
  readonly weekDays = computed(() => {
    const start = startOfWeek(this.selectedDate(), { weekStartsOn: 1 });
    const end = endOfWeek(this.selectedDate(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  });

  // Day slots computation
  readonly daySlots = computed(() => {
    return this.weekDays().map(day => ({
      date: day,
      timeSlots: this.generateTimeSlots(day)
    }));
  });

  constructor() {
    this.loadServices();
    this.loadAppointments();
  }

  private async loadServices() {
    try {
      const services = this.servicesService.getAllServices();
      // Set first service as default if available
      if (services.length > 0) {
        this.selectedServiceSignal.set(services[0]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      this.toastService.showGenericError('Error loading services');
    }
  }

  private async loadAppointments() {
    try {
      // Load appointments from localStorage for now
      const appointments = this.loadAppointmentsFromStorage();
      this.appointmentsSignal.set(appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }

  private loadAppointmentsFromStorage(): any[] {
    try {
      const appointments = localStorage.getItem('cites');
      return appointments ? JSON.parse(appointments) : [];
    } catch (error) {
      console.error('Error loading appointments from storage:', error);
      return [];
    }
  }

  private generateTimeSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();

    // Check if it's a business day
    if (!this.businessDays.includes(dayOfWeek)) {
      return slots;
    }

    const startHour = parseInt(this.businessHours.start.split(':')[0]);
    const endHour = parseInt(this.businessHours.end.split(':')[0]);
    const lunchStart = parseInt(this.lunchBreak.start.split(':')[0]);
    const lunchEnd = parseInt(this.lunchBreak.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += this.slotDuration) {
        // Skip lunch break
        if (hour >= lunchStart && hour < lunchEnd) {
          continue;
        }

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);

        // Check if slot is available (not in the past and not booked)
        const isAvailable = slotDate > new Date() && !this.isSlotBooked(slotDate);

        slots.push({
          time: timeString,
          available: isAvailable,
          isSelected: false
        });
      }
    }

    return slots;
  }

  private isSlotBooked(date: Date): boolean {
    const appointments = this.appointments();
    return appointments.some(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, date) && appointment.time === format(date, 'HH:mm');
    });
  }

  onDateSelected(date: Date) {
    this.selectedDateSignal.set(date);
  }

  selectServiceFromList(service: Service) {
    this.selectedServiceSignal.set(service);
  }

  onTimeSlotSelected(timeSlot: TimeSlot, daySlot: DaySlot) {
    if (!timeSlot.available) return;

    // Show service selection popup first
    const details: ServiceSelectionDetails = {
      date: format(daySlot.date, 'yyyy-MM-dd'),
      time: timeSlot.time,
      clientName: this.isAuthenticated() ? this.authService.userDisplayName() || '' : '',
      email: this.isAuthenticated() ? this.authService.user()?.email || '' : ''
    };

    this.serviceSelectionDetailsSignal.set(details);
    this.showServiceSelectionPopupSignal.set(true);
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
        uid: this.authService.user()?.uid || null
      };

      const booking = await this.bookingService.createBooking(bookingData);

      if (booking) {
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

  onServiceSelected(event: {details: ServiceSelectionDetails, service: Service}) {
    // Close service selection popup
    this.showServiceSelectionPopupSignal.set(false);

    // Show booking confirmation popup with selected service
    const bookingDetails: BookingDetails = {
      date: event.details.date,
      time: event.details.time,
      clientName: event.details.clientName,
      email: event.details.email,
      service: event.service
    };

    this.bookingDetailsSignal.set(bookingDetails);
    this.showBookingPopupSignal.set(true);
  }

  onServiceSelectionCancelled() {
    this.showServiceSelectionPopupSignal.set(false);
    this.serviceSelectionDetailsSignal.set({date: '', time: '', clientName: '', email: ''});
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

  // Navigation
  goToPreviousWeek() {
    const newDate = addDays(this.selectedDate(), -7);
    this.selectedDateSignal.set(newDate);
  }

  goToNextWeek() {
    const newDate = addDays(this.selectedDate(), 7);
    this.selectedDateSignal.set(newDate);
  }

  goToToday() {
    this.selectedDateSignal.set(new Date());
  }

  // Template methods
  previousWeek() {
    this.goToPreviousWeek();
  }

  nextWeek() {
    this.goToNextWeek();
  }

  selectDate(date: Date) {
    this.onDateSelected(date);
  }

  selectService(service: Service) {
    this.selectServiceFromList(service);
  }

  selectTimeSlot(timeSlot: TimeSlot) {
    const daySlot = this.daySlots().find(slot =>
      slot.timeSlots.some(ts => ts.time === timeSlot.time)
    );
    if (daySlot) {
      this.onTimeSlotSelected(timeSlot, daySlot);
    }
  }

  // Format methods
  formatDay(date: Date): string {
    return format(date, 'EEEE, d MMMM', { locale: ca });
  }

  formatDayShort(date: Date): string {
    return format(date, 'EEE', { locale: ca });
  }

  formatTime(time: string): string {
    return time;
  }

  // State check methods
  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  isSelected(date: Date): boolean {
    return isSameDay(date, this.selectedDate());
  }

  isBusinessDay(date: Date): boolean {
    return this.businessDays.includes(date.getDay());
  }

  isPastDate(date: Date): boolean {
    return date < new Date() && !isSameDay(date, new Date());
  }

  canSelectDate(date: Date): boolean {
    return !this.isPastDate(date) && this.isBusinessDay(date);
  }
}
