import { Component, signal, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CalendarComponent } from '../../../features/calendar/core/calendar.component';
import { FooterConfig } from '../../../shared/components/footer/footer.component';
import {
  BookingPopupComponent,
  BookingDetails,
} from '../../../shared/components/booking-popup/booking-popup.component';
import {
  ServiceSelectionPopupComponent,
  ServiceSelectionDetails,
} from '../../../shared/components/service-selection-popup/service-selection-popup.component';
import { PopupDialogComponent, PopupDialogConfig } from '../../../shared/components/popup-dialog/popup-dialog.component';
import {
  FirebaseServicesService,
  FirebaseService,
} from '../../../core/services/firebase-services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { BookingValidationService } from '../../../core/services/booking-validation.service';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { InputDateComponent } from '../../../shared/components/inputs/input-date/input-date.component';
import { BookingMobilePageComponent } from '../booking-mobile-page/booking-mobile-page.component';
import { CalendarStateService } from '../../calendar/services/calendar-state.service';
import { NoAppointmentsMessageComponent } from '../../../shared/components/no-appointments-message/no-appointments-message.component';
import { PeluTitleComponent } from '../../../shared/components/pelu-title/pelu-title.component';
import { TimeUtils } from '../../../shared/utils/time.utils';
import { startOfWeek, endOfWeek } from 'date-fns';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'pelu-booking-page',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CalendarComponent,
    BookingPopupComponent,
    ServiceSelectionPopupComponent,
    PopupDialogComponent,
    ButtonComponent,
    InputDateComponent,
    BookingMobilePageComponent,
    NoAppointmentsMessageComponent,
    PeluTitleComponent,
  ],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss'],
})
export class BookingPageComponent {
  @ViewChild('calendarComponent') calendarComponent!: CalendarComponent;

  private readonly router = inject(Router);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly translateService = inject(TranslateService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly responsiveService = inject(ResponsiveService);
  private readonly calendarStateService = inject(CalendarStateService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly timeUtils = inject(TimeUtils);
  private readonly loaderService = inject(LoaderService);

  // Mobile detection using centralized service
  readonly isMobile = computed(() => this.responsiveService.isMobile());

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
  readonly selectedDateSignal = signal<Date | null>(null);

  // Computed properties
  readonly showServiceSelectionPopup = computed(() => this.showServiceSelectionPopupSignal());
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly serviceSelectionDetails = computed(() => this.serviceSelectionDetailsSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly availableServices = computed(() => this.availableServicesSignal());
  readonly showLoginPrompt = computed(() => this.showLoginPromptSignal());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly todayDate = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Check if user has reached appointment limit for first screen validation
  readonly hasReachedAppointmentLimit = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Check if calendar should be blocked due to appointment limit
  readonly isCalendarBlocked = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Computed week info that updates when calendar view changes
  readonly weekInfo = computed(() => {
    const referenceDate = this.calendarStateService.viewDate();
    const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const end = endOfWeek(referenceDate, { weekStartsOn: 1 });

    const formatDate = (date: Date) =>
      date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });

    return `${formatDate(start)} - ${formatDate(end)}`;
  });

  // Calendar footer configuration
  readonly calendarFooterConfig = computed((): FooterConfig => {
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const businessHours = this.systemParametersService.businessHours();
    const lunchBreak = this.systemParametersService.lunchBreak();

    return {
      showInfoNote: false,
      showBusinessHours: true,
      businessHours: {
        start: businessHours.start,
        end: businessHours.end
      },
      lunchBreak: {
        start: lunchBreak.start,
        end: lunchBreak.end
      },
      isWeekend: isWeekend,
    };
  });

  // Available days for booking (consistent with mobile)
  readonly availableDays = computed(() => {
    const referenceDate = this.calendarStateService.viewDate();
    const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
    return this.bookingValidationService.generateAvailableDays(start, end);
  });

  // Login prompt dialog configuration
  readonly loginPromptDialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('BOOKING.LOGIN_PROMPT_TITLE'),
    size: 'medium',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.translateService.instant('AUTH.SIGN_IN'),
        type: 'login',
        action: () => this.onLoginPromptLogin()
      }
    ]
  }));

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
    }
  }

  onTimeSlotSelected(event: { date: string; time: string }) {
    // Check if user has reached appointment limit
    if (!this.canUserBookMoreAppointments()) {
      this.translateService.get('BOOKING.USER_LIMIT_REACHED_MESSAGE').subscribe(message => {
        // You can add a toast service here if needed
        console.log(message);
      });
      return;
    }

    const selectedDate = new Date(event.date);
    this.selectedDateSignal.set(selectedDate);

    // Show service selection popup
    this.serviceSelectionDetailsSignal.set({
      date: event.date,
      time: event.time,
      clientName: this.isAuthenticated() ? this.authService.userDisplayName() || '' : '',
      email: this.isAuthenticated() ? this.authService.user()?.email || '' : '',
    });

    this.showServiceSelectionPopupSignal.set(true);
  }

  async onBookingConfirmed(details: BookingDetails) {
    this.loaderService.show({ message: 'BOOKING.CREATING_BOOKING' });

    try {
      const bookingData = {
        clientName: details.clientName,
        email: details.email,
        data: details.date,
        hora: details.time,
        serviceId: details.service?.id || '',
        notes: '',
        status: 'confirmed' as const,
      };

      const booking = await this.bookingService.createBooking(bookingData);

      if (booking && !this.isAuthenticated()) {
        this.showLoginPromptSignal.set(true);
      }

      this.showBookingPopupSignal.set(false);
      this.bookingDetailsSignal.set({ date: '', time: '', clientName: '', email: '' });
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      this.loaderService.hide();
    }
  }

  onServiceSelected(event: { details: ServiceSelectionDetails; service: FirebaseService }) {
    this.showServiceSelectionPopupSignal.set(false);

    // Always fill from user if authenticated
    let clientName = event.details.clientName;
    let email = event.details.email;

    if (this.isAuthenticated()) {
      clientName = this.authService.userDisplayName() || '';
      email = this.authService.user()?.email || '';
    }

    const bookingDetails: BookingDetails = {
      date: event.details.date,
      time: event.details.time,
      clientName,
      email,
      service: event.service,
    };

    this.bookingDetailsSignal.set(bookingDetails);
    this.showBookingPopupSignal.set(true);
  }

  onServiceSelectionCancelled() {
    this.showServiceSelectionPopupSignal.set(false);
  }

  onBookingCancelled() {
    this.showBookingPopupSignal.set(false);
  }

  onClientNameChanged(name: string) {
    this.bookingDetailsSignal.update(details => ({ ...details, clientName: name }));
  }

  onEmailChanged(email: string) {
    this.bookingDetailsSignal.update(details => ({ ...details, email: email }));
  }

  onLoginPromptClose() {
    this.showLoginPromptSignal.set(false);
  }

  onLoginPromptLogin() {
    this.showLoginPromptSignal.set(false);
    this.router.navigate(['/auth/login']);
  }

  onTodayClicked() {
    // Always go to the first business day of the current week
    const today = new Date();
    const firstBusinessDayOfWeek = this.timeUtils.getFirstBusinessDayOfWeek(today, [1, 2, 3, 4, 5, 6]);

    this.selectedDateSignal.set(firstBusinessDayOfWeek);
    this.calendarComponent?.onDateChange(firstBusinessDayOfWeek);
  }

  onDateChange(event: Date | string | null): void {
    if (event instanceof Date) {
      this.selectedDateSignal.set(event);
      this.calendarComponent?.onDateChange(event);
    }
  }

  // User appointment limit methods
  canUserBookMoreAppointments(): boolean {
    const currentBookings = this.bookingService.bookings();
    return this.bookingValidationService.canUserBookMoreAppointments(currentBookings);
  }

  getUserAppointmentCount(): number {
    const currentBookings = this.bookingService.bookings();
    return this.bookingValidationService.getUserAppointmentCount(currentBookings);
  }

  getMaxAppointmentsPerUser(): number {
    return this.systemParametersService.getMaxAppointmentsPerUser();
  }

  onViewMyAppointments = () => {
    this.router.navigate(['/appointments']);
  };

}
