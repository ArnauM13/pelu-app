import { Component, signal, computed, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
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
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { NoAppointmentsMessageComponent } from '../../../shared/components/no-appointments-message/no-appointments-message.component';
import { PeluTitleComponent } from '../../../shared/components/pelu-title/pelu-title.component';
import { TimeUtils } from '../../../shared/utils/time.utils';
import { startOfWeek, endOfWeek } from 'date-fns';
import { LoaderService } from '../../../shared/services/loader.service';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { IcsUtils } from '../../../shared/utils/ics.utils';
import { TimeSlot, DaySlot } from '../../../shared/utils/time.utils';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { UserService } from '../../../core/services/user.service';
import { Booking } from '../../../core/interfaces/booking.interface';

// Unified booking step type
type BookingStep = 'service' | 'datetime' | 'confirmation' | 'success';

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
    InputTextComponent,
    NoAppointmentsMessageComponent,
    PeluTitleComponent,
    ServiceCardComponent,
    CardComponent,
    NextAppointmentComponent,
  ],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss'],
})
export class BookingPageComponent implements OnInit, OnDestroy {
  @ViewChild('calendarComponent') calendarComponent!: CalendarComponent;

  // ===== INJECTED SERVICES =====
  private readonly router = inject(Router);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly translateService = inject(TranslateService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly responsiveService = inject(ResponsiveService);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly timeUtils = inject(TimeUtils);
  private readonly loaderService = inject(LoaderService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly userService = inject(UserService);

  // Responsive detection
  readonly isMobile = computed(() => this.responsiveService.isMobile());
  readonly isDesktop = computed(() => !this.responsiveService.isMobile());

  // ===== STATE SIGNALS =====

  // Step management signals (Mobile only)
  private readonly currentStepSignal = signal<BookingStep>('service');
  private readonly selectedTimeSlotSignal = signal<TimeSlot | null>(null);
  private readonly createdBookingSignal = signal<Booking | null>(null);

  // Internal state signals
  private readonly selectedDateSignal = signal<Date | null>(null);
  private readonly viewDateSignal = signal<Date>(new Date());
  private readonly selectedServiceSignal = signal<FirebaseService | null>(null);
  private readonly appointmentsSignal = signal<Booking[]>([]);
  private readonly viewModeSignal = signal<'week' | 'month'>('week');

  // Booking details signal
  private readonly bookingDetailsSignal = signal<BookingDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });

  // Desktop popup signals
  readonly showServiceSelectionPopupSignal = signal(false);
  readonly showBookingPopupSignal = signal(false);
  readonly serviceSelectionDetailsSignal = signal<ServiceSelectionDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });
  readonly showLoginPromptSignal = signal(false);

  // ===== COMPUTED PROPERTIES =====

  // Authentication and user state
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userAppointments = computed(() =>
    this.appointments().filter((b: Booking) => this.bookingService.isOwnBooking(b))
  );

  // Check if user has reached appointment limit for first screen validation
  readonly hasReachedAppointmentLimit = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Check if user should be blocked from proceeding to next steps
  readonly isUserBlockedFromBooking = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Business configuration
  readonly businessHours = computed(() => this.systemParametersService.getBusinessHours());
  readonly lunchBreak = computed(() => this.systemParametersService.getLunchBreak());
  readonly businessDays = computed(() => this.systemParametersService.getWorkingDays());
  readonly slotDuration = computed(() => this.systemParametersService.getAppointmentDuration());

  // Available services from centralized service
  readonly availableServices = computed(() => this.firebaseServicesService.activeServices());

  // Recently booked services (3 most recent unique services)
  readonly recentlyBookedServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.availableServices().filter(service =>
      recentServiceIds.includes(service.id || '')
    );
  });

  // Popular services (services with popular flag, but not recently booked)
  readonly popularServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.availableServices().filter(service =>
      service.isPopular === true &&
      !recentServiceIds.includes(service.id || '')
    );
  });

  // Other services (non-popular services and not recently booked)
  readonly otherServices = computed(() => {
    const recentServiceIds = this.bookingService.getRecentlyBookedServices();
    return this.availableServices().filter(service =>
      service.isPopular !== true &&
      !recentServiceIds.includes(service.id || '')
    );
  });

  // ===== MOBILE COMPUTED PROPERTIES =====

  // Mobile step validation computed signals
  readonly canProceedToDateTime = computed(() => {
    if (this.isUserBlockedFromBooking()) {
      return false;
    }
    return !!this.selectedService();
  });

  readonly canProceedToConfirmation = computed(() => {
    if (this.isUserBlockedFromBooking()) {
      return false;
    }

    const selectedService = this.selectedService();
    const selectedDate = this.selectedDate();
    const selectedTimeSlot = this.selectedTimeSlot();

    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      return false;
    }

    return this.bookingValidationService.canBookServiceAtTime(
      selectedDate,
      selectedTimeSlot.time,
      selectedService.duration,
      this.appointments()
    );
  });

  readonly canGoBack = computed(() => {
    const step = this.currentStep();
    return step === 'datetime' || step === 'confirmation';
  });

  readonly canProceedToNextStep = computed(() => {
    if (this.isUserBlockedFromBooking()) {
      return false;
    }

    const step = this.currentStep();
    if (step === 'service') {
      return this.canProceedToDateTime();
    } else if (step === 'datetime') {
      return this.canProceedToConfirmation();
    } else if (step === 'confirmation') {
      return this.canConfirmBooking();
    }
    return false;
  });

  // Fixed reactive computed for booking confirmation
  readonly canConfirmBooking = computed(() => {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (!this.canUserBookMoreAppointments()) {
      return false;
    }

    const details = this.bookingDetails();
    const hasClientName = details.clientName && details.clientName.trim().length > 0;
    const hasEmail = details.email && details.email.trim().length > 0;
    const selectedService = this.selectedService();
    const selectedDate = this.selectedDate();
    const selectedTimeSlot = this.selectedTimeSlot();

    if (!hasClientName || !hasEmail || !selectedService || !selectedDate || !selectedTimeSlot) {
      return false;
    }

    return this.bookingValidationService.canBookServiceAtTime(
      selectedDate,
      selectedTimeSlot.time,
      selectedService.duration,
      this.appointments()
    );
  });

  // Week days computation - show all days of the week
  readonly weekDays = computed(() => {
    const currentDate = this.viewDate();
    return this.timeUtils.getWeekDays(currentDate);
  });

  // Month days computation - show all days of the month
  readonly monthDays = computed(() => {
    const currentDate = this.viewDate();
    return this.timeUtils.getMonthDays(currentDate);
  });

  // Current view days
  readonly currentViewDays = computed(() => {
    return this.viewMode() === 'week' ? this.weekDays() : this.monthDays();
  });

  // Day slots computation
  readonly daySlots = computed(() => {
    const selectedService = this.selectedService();
    if (!selectedService) {
      return this.currentViewDays().map((day: Date) => ({
        date: day,
        timeSlots: [],
      }));
    }

    return this.currentViewDays().map((day: Date) => ({
      date: day,
      timeSlots: this.bookingValidationService.generateTimeSlotsForService(
        day,
        selectedService.duration,
        this.appointments()
      ),
    }));
  });

  readonly selectedDaySlots = computed(() => {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return null;
    return this.daySlots().find((daySlot: { date: Date; timeSlots: unknown[] }) => this.timeUtils.isSameDay(daySlot.date, selectedDate));
  });

  readonly isSelectedDayFullyBooked = computed(() => {
    const daySlots = this.selectedDaySlots();
    if (!daySlots) return false;

    const availableSlots = daySlots.timeSlots.filter((slot: { available: boolean }) => slot.available);
    return availableSlots.length === 0 && daySlots.timeSlots.length > 0;
  });

  // Check if selected day has no available appointments
  readonly hasNoAvailableAppointmentsForSelectedDay = computed(() => {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return false;

    return this.isBusinessDay(selectedDate) && this.hasNoAvailableAppointmentsForDay(selectedDate);
  });

  // Check if there are no available time slots for the selected service on any day
  readonly hasNoAvailableTimeSlotsForService = computed(() => {
    const selectedService = this.selectedService();
    if (!selectedService) return false;

    const currentViewDays = this.currentViewDays();
    return currentViewDays.every((day: Date) => {
      const daySlots = this.daySlots().find((daySlot: { date: Date; timeSlots: unknown[] }) => this.timeUtils.isSameDay(daySlot.date, day));
      if (!daySlots) return true;
      return daySlots.timeSlots.every((slot: { available: boolean }) => !slot.available);
    });
  });

  // Check if there are no available appointments in the current view
  readonly hasNoAvailableAppointments = computed(() => {
    const currentViewDays = this.currentViewDays();
    return currentViewDays.every((day: Date) => {
      const daySlots = this.daySlots().find((daySlot: { date: Date; timeSlots: unknown[] }) => this.timeUtils.isSameDay(daySlot.date, day));
      if (!daySlots) return true;
      return daySlots.timeSlots.every((slot: { available: boolean }) => !slot.available);
    });
  });

  // ===== DESKTOP COMPUTED PROPERTIES =====

  // Desktop popup computed properties
  readonly showServiceSelectionPopup = computed(() => this.showServiceSelectionPopupSignal());
  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());
  readonly serviceSelectionDetails = computed(() => this.serviceSelectionDetailsSignal());
  readonly showLoginPrompt = computed(() => this.showLoginPromptSignal());
  readonly todayDate = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Check if calendar should be blocked due to appointment limit
  readonly isCalendarBlocked = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Computed week info that updates when calendar view changes
  readonly weekInfo = computed(() => {
    const referenceDate = this.viewDate();
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
    const referenceDate = this.viewDate();
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

  // ===== MOBILE PUBLIC COMPUTED SIGNALS =====

  readonly currentStep = computed(() => this.currentStepSignal());
  readonly selectedTimeSlot = computed(() => this.selectedTimeSlotSignal());
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly viewDate = computed(() => this.viewDateSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal() || undefined);
  readonly appointments = computed(() => this.appointmentsSignal());
  readonly viewMode = computed(() => this.viewModeSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly createdBooking = computed(() => this.createdBookingSignal());

  constructor() {
    // Check authentication first
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadServices();
    this.loadAppointments();

    // Listen for service updates to refresh services
    window.addEventListener('serviceUpdated', () => {
      this.loadServices();
    });

    // Listen for booking updates to refresh appointments
    window.addEventListener('bookingUpdated', () => {
      this.loadAppointments();
    });

    // Set default date when entering datetime step (mobile)
    this.setDefaultDate();
  }

  ngOnInit(): void {
    // Check authentication first
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadServices();
    this.loadAppointments();

    // Listen for service updates to refresh services
    window.addEventListener('serviceUpdated', () => {
      this.loadServices();
    });

    // Listen for booking updates to refresh appointments
    window.addEventListener('bookingUpdated', () => {
      this.loadAppointments();
    });

    // Set default date when entering datetime step (mobile)
    this.setDefaultDate();
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('serviceUpdated', () => {
      this.loadServices();
    });
    window.removeEventListener('bookingUpdated', () => {
      this.loadAppointments();
    });
  }

  // ===== SHARED METHODS =====

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

  // Check if user is admin
  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  // Track by function for ngFor
  trackByServiceId(index: number, service: FirebaseService): string {
    return service?.id || `service-${index}`;
  }

  onViewMyAppointments = () => {
    this.router.navigate(['/appointments']);
  };

  // ===== MOBILE METHODS =====

  // Step navigation methods
  goToStep(step: BookingStep) {
    this.currentStepSignal.set(step);
  }

  nextStep() {
    const currentStep = this.currentStep();

    if (currentStep === 'service' && this.canProceedToDateTime()) {
      this.goToStep('datetime');
      this.setDefaultDate();
    } else if (currentStep === 'datetime' && this.canProceedToConfirmation()) {
      this.goToStep('confirmation');
      this.fillUserDataIfAuthenticated();
    } else if (currentStep === 'confirmation' && this.canConfirmBooking()) {
      this.confirmBookingDirectly();
    }
  }

  previousStep() {
    const currentStep = this.currentStep();

    if (currentStep === 'confirmation') {
      this.goToStep('datetime');
    } else if (currentStep === 'datetime') {
      this.goToStep('service');
    }
  }

  goBack() {
    this.previousStep();
  }

  // Step-specific methods
  onServiceSelectedMobile(service: FirebaseService) {
    this.selectedServiceSignal.set(service);
    this.selectedDateSignal.set(null);
    this.selectedTimeSlotSignal.set(null);
  }

  // Alias for template compatibility
  onServiceSelected(service: FirebaseService) {
    this.onServiceSelectedMobile(service);
  }

  onDateSelected(date: Date) {
    this.selectedDateSignal.set(date);
    this.selectedTimeSlotSignal.set(null);
  }

  onDateClicked(date: Date) {
    if (this.canSelectDate(date)) {
      this.onDateSelected(date);
    }
  }

  onTimeSlotSelectedMobile(timeSlot: TimeSlot) {
    this.selectedTimeSlotSignal.set(timeSlot);
  }

  onTimeSlotClicked(timeSlot: TimeSlot) {
    this.selectTimeSlot(timeSlot);
  }

  onContinueToConfirmation() {
    if (this.canProceedToConfirmation()) {
      this.nextStep();
    }
  }

  private fillUserDataIfAuthenticated() {
    if (this.isAuthenticated()) {
      const displayName = this.authService.userDisplayName() || '';
      const email = this.authService.user()?.email || '';

      this.bookingDetailsSignal.update(details => ({
        ...details,
        clientName: displayName,
        email: email
      }));
    }
  }

  async confirmBookingDirectly() {
    const selectedTimeSlot = this.selectedTimeSlot();
    const selectedDate = this.selectedDate();
    const selectedService = this.selectedService();
    const details = this.bookingDetails();

    if (!selectedTimeSlot || !selectedDate || !selectedService || !details.clientName || !details.email) {
      this.loaderService.show({ message: 'COMMON.ERROR' });
      return;
    }

    if (!this.bookingValidationService.canBookServiceAtTime(
      selectedDate,
      selectedTimeSlot.time,
      selectedService.duration,
      this.appointments()
    )) {
      this.loaderService.show({ message: 'COMMON.ERROR' });
      return;
    }

    this.loaderService.show({ message: 'BOOKING.CREATING_BOOKING' });

    try {
      const bookingData = {
        clientName: details.clientName,
        email: details.email,
        data: this.timeUtils.formatDateISO(selectedDate),
        hora: selectedTimeSlot.time,
        serviceId: selectedService.id || '',
        notes: '',
        status: 'confirmed' as const,
      };

      const booking = await this.bookingService.createBooking(bookingData, false);

      if (booking) {
        this.createdBookingSignal.set(booking);
        await this.loadAppointments();
        window.dispatchEvent(new CustomEvent('bookingUpdated'));
        this.goToStep('success');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      this.loaderService.hide();
    }
  }

  // ===== DESKTOP METHODS =====

  onTimeSlotSelectedDesktop(event: { date: string; time: string }) {
    if (!this.canUserBookMoreAppointments()) {
      this.translateService.get('BOOKING.USER_LIMIT_REACHED_MESSAGE').subscribe(message => {
        console.log(message);
      });
      return;
    }

    const selectedDate = new Date(event.date);
    this.selectedDateSignal.set(selectedDate);

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

  onServiceSelectedDesktop(event: { details: ServiceSelectionDetails; service: FirebaseService }) {
    this.showServiceSelectionPopupSignal.set(false);

    let clientName = event.details.clientName;
    let email = event.details.email;

    if (this.isAuthenticated()) {
      clientName = this.authService.userDisplayName() || '';
      email = event.details.email;
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

  // ===== DESKTOP METHODS =====

  // Desktop time slot selection (called from template)
  onDesktopTimeSlotSelected(event: { date: string; time: string }) {
    this.onTimeSlotSelectedDesktop(event);
  }

  // Desktop service selection (called from template)
  onDesktopServiceSelected(event: { details: ServiceSelectionDetails; service: FirebaseService }) {
    this.onServiceSelectedDesktop(event);
  }

  // Desktop booking confirmation (called from template)
  onDesktopBookingConfirmed(details: BookingDetails) {
    this.onBookingConfirmed(details);
  }

  // Desktop client name change (called from template)
  onDesktopClientNameChanged(name: string) {
    this.onClientNameChanged(name);
  }

  // Desktop email change (called from template)
  onDesktopEmailChanged(email: string) {
    this.onEmailChanged(email);
  }

  // Desktop booking details getter (called from template)
  desktopBookingDetails() {
    return this.bookingDetails();
  }

  // ===== SHARED UTILITY METHODS =====

  private async loadServices() {
    try {
      await this.firebaseServicesService.loadServices();
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  private async loadAppointments() {
    this.loaderService.show({ message: 'BOOKING.LOADING_APPOINTMENTS' });

    try {
      await this.bookingService.loadBookings();
      const bookings = this.bookingService.bookings();
      this.appointmentsSignal.set(bookings);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      this.loaderService.hide();
    }
  }

  // ===== MOBILE UTILITY METHODS =====

  // Set default date when entering datetime step
  private setDefaultDate() {
    const today = new Date();
    const firstBusinessDayOfWeek = this.getFirstBusinessDayOfWeek(today);

    this.viewDateSignal.set(firstBusinessDayOfWeek);

    if (this.canSelectDate(firstBusinessDayOfWeek)) {
      this.selectedDateSignal.set(firstBusinessDayOfWeek);
    } else {
      const currentViewDays = this.currentViewDays();
      const firstAvailableDate = currentViewDays.find((day: Date) => this.canSelectDate(day));

      if (firstAvailableDate) {
        this.selectedDateSignal.set(firstAvailableDate);
      }
    }
  }

  // Helper methods for month view calendar alignment
  private getFirstBusinessDayOfWeek(date: Date): Date {
    const weekStart = this.timeUtils.getStartOfWeek(date);
    for (let i = 0; i < 7; i++) {
      const day = this.timeUtils.addDays(weekStart, i);
      if (this.bookingValidationService.canBookOnDate(day)) {
        return day;
      }
    }
    return weekStart;
  }

  private getLastBusinessDayOfWeek(date: Date): Date {
    const weekEnd = this.timeUtils.getEndOfWeek(date);
    for (let i = 6; i >= 0; i--) {
      const day = this.timeUtils.addDays(weekEnd, -i);
      if (this.bookingValidationService.canBookOnDate(day)) {
        return day;
      }
    }
    return weekEnd;
  }

  // Helper methods for template conditions
  hasMorningSlots(daySlot: DaySlot): boolean {
    return daySlot.timeSlots.some(slot => slot.time < '13:00' && slot.available);
  }

  hasAfternoonSlots(daySlot: DaySlot): boolean {
    return daySlot.timeSlots.some(slot => slot.time >= '14:00' && slot.available);
  }

  getMorningSlots(daySlot: DaySlot): TimeSlot[] {
    return daySlot.timeSlots.filter(slot => slot.time < '13:00' && slot.available);
  }

  getAfternoonSlots(daySlot: DaySlot): TimeSlot[] {
    return daySlot.timeSlots.filter(slot => slot.time >= '14:00' && slot.available);
  }

  getSelectionMessage(): string {
    const hasService = !!this.selectedService();
    const hasDate = !!this.selectedDate();

    return !hasDate
      ? 'BOOKING.SELECT_DATE_FIRST'
      : !hasService
        ? 'BOOKING.SELECT_SERVICE_FIRST'
        : 'BOOKING.SELECTION_REQUIRED';
  }

  // View mode methods
  toggleViewMode() {
    const newMode = this.viewMode() === 'week' ? 'month' : 'week';
    const currentSelectedDate = this.selectedDate();

    this.viewModeSignal.set(newMode);

    if (currentSelectedDate && this.canSelectDate(currentSelectedDate)) {
      this.viewDateSignal.set(currentSelectedDate);
    } else {
      this.clearSelectedDate();
    }
  }

  // ===== DATE NAVIGATION METHODS =====

  /**
   * Handle date search input changes
   */
  onDateSearchChanged(date: Date | string | null) {
    if (date instanceof Date) {
      this.viewDateSignal.set(date);
      // Update the calendar view to show the selected date
      this.updateCalendarView();
    }
  }

  /**
   * Update calendar view based on current viewDate
   */
  private updateCalendarView() {
    // This method will be called when the view date changes
    // The calendar will automatically update based on the new viewDate
  }

  canGoToPreviousPeriod(): boolean {
    // Allow free navigation through all weeks - no restrictions
    return true;
  }

  previousPeriod() {
    if (!this.canGoToPreviousPeriod()) {
      return;
    }

    const currentDate = this.viewDate();
    if (this.viewMode() === 'week') {
      const newDate = this.timeUtils.getPreviousWeek(currentDate);
      this.viewDateSignal.set(newDate);
    } else {
      const newDate = this.timeUtils.getPreviousMonth(currentDate);
      this.viewDateSignal.set(newDate);
    }
    this.clearSelectedDate();
  }

  nextPeriod() {
    const currentDate = this.viewDate();
    if (this.viewMode() === 'week') {
      const newDate = this.timeUtils.getNextWeek(currentDate);
      this.viewDateSignal.set(newDate);
    } else {
      const newDate = this.timeUtils.getNextMonth(currentDate);
      this.viewDateSignal.set(newDate);
    }
    this.clearSelectedDate();
  }

  selectServiceFromList(service: FirebaseService) {
    this.selectedServiceSignal.set(service);
  }

  // Check if a specific day has no available appointments for the selected service
  hasNoAvailableAppointmentsForDay(day: Date): boolean {
    const selectedService = this.selectedService();
    if (!selectedService) {
      return false;
    }

    const daySlots = this.bookingValidationService.generateTimeSlotsForService(
      day,
      selectedService.duration,
      this.appointments()
    );
    return daySlots.every(slot => !slot.available);
  }

  isFullyBookedWorkingDay(day: Date): boolean {
    return this.isBusinessDay(day) && this.hasNoAvailableAppointmentsForDay(day);
  }

  // Check if a day is a fully booked working day for the selected service duration
  isFullyBookedWorkingDayForService(day: Date): boolean {
    if (!this.isBusinessDay(day)) return false;

    const selectedService = this.selectedService();
    if (!selectedService) return false;

    return !this.hasEnoughSpaceForService(day, selectedService);
  }

  // Check if there's enough space for the selected service on a given day
  private hasEnoughSpaceForService(day: Date, service: FirebaseService): boolean {
    const daySlots = this.bookingValidationService.generateTimeSlotsForService(
      day,
      service.duration,
      this.appointments()
    );

    return daySlots.some(slot => slot.available);
  }

  // Navigation
  goToPreviousWeek() {
    const currentDate = this.viewDate();
    const newWeekDate = this.timeUtils.getPreviousWeek(currentDate);

    // Get the first business day of the new week
    const firstBusinessDay = this.timeUtils.getFirstBusinessDayOfWeek(newWeekDate, [1, 2, 3, 4, 5, 6]);

    // Update the view date to the first business day of the week
    this.viewDateSignal.set(firstBusinessDay);

    // Update the calendar component to show the new week
    this.calendarComponent?.onDateChange(firstBusinessDay);

    this.clearSelectedDate();
  }

  goToNextWeek() {
    const currentDate = this.viewDate();
    const newWeekDate = this.timeUtils.getNextWeek(currentDate);

    // Get the first business day of the new week
    const firstBusinessDay = this.timeUtils.getFirstBusinessDayOfWeek(newWeekDate, [1, 2, 3, 4, 5, 6]);

    // Update the view date to the first business day of the week
    this.viewDateSignal.set(firstBusinessDay);

    // Update the calendar component to show the new week
    this.calendarComponent?.onDateChange(firstBusinessDay);

    this.clearSelectedDate();
  }

  goToToday() {
    this.viewDateSignal.set(new Date());
    this.clearSelectedDate();
  }

  // Helper method to clear selected date
  private clearSelectedDate() {
    this.selectedDateSignal.set(null);
    this.selectedTimeSlotSignal.set(null);
  }

  // Template methods
  previousWeek() {
    this.previousPeriod();
  }

  nextWeek() {
    this.nextPeriod();
  }

  selectDate(date: Date) {
    this.onDateSelected(date);
  }

  selectService(service: FirebaseService) {
    this.selectServiceFromList(service);
  }

  selectTimeSlot(timeSlot: TimeSlot) {
    if (!this.canUserBookMoreAppointments()) {
      this.loaderService.show({ message: 'COMMON.ERROR' });
      return;
    }

    const selectedService = this.selectedService();
    if (!selectedService) {
      this.loaderService.show({ message: 'COMMON.ERROR' });
      return;
    }

    const selectedDate = this.selectedDate();
    if (!selectedDate) {
      this.loaderService.show({ message: 'COMMON.ERROR' });
      return;
    }

    if (!this.bookingValidationService.canBookServiceAtTime(
      selectedDate,
      timeSlot.time,
      selectedService.duration,
      this.appointments()
    )) {
      this.loaderService.show({ message: 'COMMON.ERROR' });
      return;
    }

    this.onTimeSlotSelectedMobile(timeSlot);
  }

  // Format methods
  formatDay(date: Date): string {
    return this.timeUtils.formatDay(date);
  }

  formatDayShort(date: Date): string {
    return this.timeUtils.formatDayShort(date);
  }

  formatTime(time: string): string {
    return this.timeUtils.formatTime(time);
  }

  formatMonth(date: Date): string {
    return this.timeUtils.formatMonth(date);
  }

  // State check methods
  isToday(date: Date): boolean {
    return this.timeUtils.isToday(date);
  }

  isSelected(date: Date): boolean {
    const selectedDate = this.selectedDate();
    return this.timeUtils.isSelected(date, selectedDate);
  }

  isBusinessDay(date: Date): boolean {
    return this.bookingValidationService.canBookOnDate(date);
  }

  isPastDate(date: Date): boolean {
    return this.timeUtils.isPastDay(date);
  }

  isCurrentMonth(date: Date): boolean {
    const currentDate = this.viewDate();
    return (
      date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()
    );
  }

  canSelectDate(date: Date): boolean {
    if (!this.bookingValidationService.canBookOnDate(date) ||
        !this.bookingValidationService.canBookInAdvance(date) ||
        this.isPastDate(date)) {
      return false;
    }

    if (this.viewMode() === 'week') {
      return true;
    } else {
      const currentDate = this.viewDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const isInCurrentMonth =
        date.getMonth() === currentMonth && date.getFullYear() === currentYear;

      return isInCurrentMonth;
    }
  }

  // Quick date selection methods
  getToday(): Date {
    return new Date();
  }

  getTomorrow(): Date {
    return this.timeUtils.getTomorrow();
  }

  selectToday() {
    const today = new Date();
    if (this.canSelectDate(today)) {
      this.selectedDateSignal.set(today);
      this.viewDateSignal.set(today);
    }
  }

  selectTomorrow() {
    const tomorrow = this.getTomorrow();
    if (this.canSelectDate(tomorrow)) {
      this.selectedDateSignal.set(tomorrow);
      this.viewDateSignal.set(tomorrow);
    }
  }

  nextAvailableDate(): Date | null {
    const today = new Date();
    const maxDaysToCheck = 30;

    for (let i = 0; i < maxDaysToCheck; i++) {
      const dateToCheck = new Date(today);
      dateToCheck.setDate(today.getDate() + i);

      if (this.bookingValidationService.canBookOnDate(dateToCheck) &&
          this.bookingValidationService.canBookInAdvance(dateToCheck) &&
          !this.isPastDate(dateToCheck)) {
        return dateToCheck;
      }
    }

    return null;
  }

  selectNextAvailable() {
    const nextAvailable = this.nextAvailableDate();
    if (nextAvailable) {
      this.selectedDateSignal.set(nextAvailable);
      this.viewDateSignal.set(nextAvailable);
      this.loaderService.show({ message: 'Data seleccionada' });
    } else {
      this.loaderService.show({ message: 'No hi ha dates disponibles' });
    }
  }

  // Success page methods
  onViewBookingDetail() {
    const booking = this.createdBooking();
    if (booking) {
      this.router.navigate(['/appointments', booking.id]);
    }
  }

  onBackToHome() {
    this.router.navigate(['/bookings']);
  }

  // Service color methods
  getServiceColor(serviceName: string): string {
    const serviceColor = this.serviceColorsService.getServiceColor(serviceName);
    return serviceColor.color;
  }

  getServiceBackgroundColor(serviceName: string): string {
    const serviceColor = this.serviceColorsService.getServiceColor(serviceName);
    return serviceColor.backgroundColor;
  }

  // Calendar methods
  goToServiceStep = () => {
    this.goToStep('service');
  };

  /**
   * Adds booking to user's calendar
   */
  async addToCalendar(): Promise<void> {
    const booking = this.createdBooking();

    if (!booking) {
      this.loaderService.show({ message: 'COMMON.ERROR' });
      return;
    }

    this.loaderService.show({ message: 'BOOKING.ADDING_TO_CALENDAR' });

    try {
      const service = await this.firebaseServicesService.getServiceById(booking.serviceId);

      if (!service) {
        this.loaderService.show({ message: 'COMMON.ERROR' });
        return;
      }

      const icsData = {
        clientName: booking.clientName,
        email: booking.email,
        date: booking.data,
        time: booking.hora,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
        businessName: 'PeluApp',
        businessAddress: '',
        businessPhone: ''
      };

      const icsContent = IcsUtils.generateIcsContent(icsData);
      const filename = IcsUtils.generateFilename(
        booking.clientName,
        booking.data,
        service.name
      );

      await IcsUtils.addToCalendar(icsContent, filename);
      this.loaderService.show({ message: 'COMMON.SUCCESS' });
    } catch (error) {
      console.error('Error adding to calendar:', error);
      this.loaderService.show({ message: 'COMMON.ERROR' });
    } finally {
      this.loaderService.hide();
    }
  }
}
