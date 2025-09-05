import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { FirebaseService, FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { NoAppointmentsMessageComponent } from '../../../shared/components/no-appointments-message/no-appointments-message.component';
import { PeluTitleComponent } from '../../../shared/components/pelu-title/pelu-title.component';
import { LoaderService } from '../../../shared/services/loader.service';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { IcsUtils } from '../../../shared/utils/ics.utils';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { UserService } from '../../../core/services/user.service';
import { Booking } from '../../../core/interfaces/booking.interface';

// Import new components
import { ServiceSelectionStepComponent } from './components/service-selection-step.component';
import { DateTimeSelectionStepComponent } from './components/datetime-selection-step.component';
import { ConfirmationStepComponent } from './components/confirmation-step.component';
import { SuccessStepComponent } from './components/success-step.component';
import { MobileNavigationComponent } from './components/mobile-navigation.component';
import { DesktopLayoutComponent } from './components/desktop-layout.component';

// Import services
import { BookingStateService, BookingStep } from './services/booking-state.service';
import { BookingValidationService } from './services/booking-validation.service';

@Component({
  selector: 'pelu-booking-page',
  imports: [
    CommonModule,
    TranslateModule,
    BookingPopupComponent,
    ServiceSelectionPopupComponent,
    PopupDialogComponent,
    NoAppointmentsMessageComponent,
    PeluTitleComponent,
    NextAppointmentComponent,
    ServiceSelectionStepComponent,
    DateTimeSelectionStepComponent,
    ConfirmationStepComponent,
    SuccessStepComponent,
    MobileNavigationComponent,
    DesktopLayoutComponent,
  ],
  providers: [
    BookingStateService,
    BookingValidationService,
  ],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss'],
})
export class BookingPageComponent implements OnInit, OnDestroy {
  // ===== INJECTED SERVICES =====
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly translateService = inject(TranslateService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly responsiveService = inject(ResponsiveService);
  private readonly loaderService = inject(LoaderService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly userService = inject(UserService);
  private readonly firebaseServicesService = inject(FirebaseServicesService);

  // ===== COMPONENT SERVICES =====
  private readonly bookingStateService = inject(BookingStateService);
  private readonly bookingValidationService = inject(BookingValidationService);

  // ===== PRIVATE PROPERTIES =====
  private wasAutoCollapsed = false;

  // ===== COMPUTED PROPERTIES =====

  // Responsive detection
  readonly isMobile = computed(() => this.responsiveService.isMobile());
  readonly isDesktop = computed(() => !this.responsiveService.isMobile());

  // Desktop layout state
  readonly sidebarCollapsed = computed(() => this.bookingStateService.sidebarCollapsed());

  // Authentication and user state
  readonly isAuthenticated = computed(() => this.bookingValidationService.isAuthenticated());
  readonly userAppointments = computed(() => this.bookingValidationService.userAppointments());

  // Check if user has reached appointment limit for first screen validation
  readonly hasReachedAppointmentLimit = computed(() => this.bookingValidationService.hasReachedAppointmentLimit());

  // Check if user should be blocked from proceeding to next steps
  readonly isUserBlockedFromBooking = computed(() => this.bookingValidationService.isUserBlockedFromBooking());

  // Business configuration
  readonly businessHours = computed(() => this.bookingValidationService.businessHours());
  readonly lunchBreak = computed(() => this.bookingValidationService.lunchBreak());
  readonly businessDays = computed(() => this.bookingValidationService.businessDays());
  readonly slotDuration = computed(() => this.bookingValidationService.slotDuration());

  // Available services from centralized service
  readonly availableServices = computed(() => this.bookingStateService.availableServices());

  // Recently booked services (3 most recent unique services)
  readonly recentlyBookedServices = computed(() => this.bookingStateService.recentlyBookedServices());

  // Popular services (services with popular flag, but not recently booked)
  readonly popularServices = computed(() => this.bookingStateService.popularServices());

  // Other services (non-popular services and not recently booked)
  readonly otherServices = computed(() => this.bookingStateService.otherServices());

  // Mobile step validation computed signals
  readonly canProceedToDateTime = computed(() => this.bookingValidationService.canProceedToDateTime());
  readonly canProceedToConfirmation = computed(() => this.bookingValidationService.canProceedToConfirmation());
  readonly canGoBack = computed(() => this.bookingValidationService.canGoBack());
  readonly canProceedToNextStep = computed(() => this.bookingValidationService.canProceedToNextStep());
  readonly canConfirmBooking = computed(() => this.bookingValidationService.canConfirmBooking());

  // Week days computation - show all days of the week
  readonly weekDays = computed(() => this.bookingStateService.weekDays());

  // Month days computation - show all days of the month
  readonly monthDays = computed(() => this.bookingStateService.monthDays());

  // Current view days
  readonly currentViewDays = computed(() => this.bookingStateService.currentViewDays());

  // Day slots computation
  readonly daySlots = computed(() => this.bookingStateService.daySlots());

  readonly selectedDaySlots = computed(() => {
    const selectedDate = this.bookingStateService.selectedDate();
    if (!selectedDate) return null;
    return this.daySlots().find((daySlot: { date: Date; timeSlots: unknown[] }) =>
      this.isSameDay(daySlot.date, selectedDate)
    );
  });

  readonly isSelectedDayFullyBooked = computed(() => {
    const daySlots = this.selectedDaySlots();
    if (!daySlots) return false;

    const availableSlots = daySlots.timeSlots.filter((slot: { available: boolean }) => slot.available);
    return availableSlots.length === 0 && daySlots.timeSlots.length > 0;
  });

  // Check if selected day has no available appointments
  readonly hasNoAvailableAppointmentsForSelectedDay = computed(() => {
    const selectedDate = this.bookingStateService.selectedDate();
    if (!selectedDate) return false;

    return this.bookingValidationService.isBusinessDay(selectedDate) &&
           this.bookingValidationService.hasNoAvailableAppointmentsForDay(selectedDate);
  });

  // Check if there are no available time slots for the selected service on any day
  readonly hasNoAvailableTimeSlotsForService = computed(() => {
    const selectedService = this.bookingStateService.selectedService();
    if (!selectedService) return false;

    const currentViewDays = this.currentViewDays();
    return currentViewDays.every((day: Date) => {
      const daySlots = this.daySlots().find((daySlot: { date: Date; timeSlots: unknown[] }) =>
        this.isSameDay(daySlot.date, day)
      );
      if (!daySlots) return true;
      return daySlots.timeSlots.every((slot: { available: boolean }) => !slot.available);
    });
  });

  // Check if there are no available appointments in the current view
  readonly hasNoAvailableAppointments = computed(() => {
    const currentViewDays = this.currentViewDays();
    return currentViewDays.every((day: Date) => {
      const daySlots = this.daySlots().find((daySlot: { date: Date; timeSlots: unknown[] }) =>
        this.isSameDay(daySlot.date, day)
      );
      if (!daySlots) return true;
      return daySlots.timeSlots.every((slot: { available: boolean }) => !slot.available);
    });
  });

  // Desktop popup computed properties
  readonly showServiceSelectionPopup = computed(() => this.bookingStateService.showServiceSelectionPopup());
  readonly showBookingPopup = computed(() => this.bookingStateService.showBookingPopup());
  readonly serviceSelectionDetails = computed(() => this.bookingStateService.serviceSelectionDetails());
  readonly showLoginPrompt = computed(() => this.bookingStateService.showLoginPrompt());
  readonly todayDate = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Check if calendar should be blocked due to appointment limit
  readonly isCalendarBlocked = computed(() => this.bookingValidationService.isCalendarBlocked());

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

  readonly currentStep = computed(() => this.bookingStateService.currentStep());
  readonly selectedTimeSlot = computed(() => this.bookingStateService.selectedTimeSlot());
  readonly selectedDate = computed(() => this.bookingStateService.selectedDate());
  readonly viewDate = computed(() => this.bookingStateService.viewDate());
  readonly selectedService = computed(() => this.bookingStateService.selectedService());
  readonly appointments = computed(() => this.bookingStateService.appointments());
  readonly viewMode = computed(() => this.bookingStateService.viewMode());
  readonly bookingDetails = computed(() => this.bookingStateService.bookingDetails());
  readonly createdBooking = computed(() => this.bookingStateService.createdBooking());

  constructor() {
    console.log('=== BookingPageComponent constructor ===');
    console.log('isAuthenticated():', this.isAuthenticated());
    console.log('Current route:', this.router.url);

    // Wait for auth to be initialized before checking authentication
    this.waitForAuthAndInitialize();
  }

  private async waitForAuthAndInitialize() {
    console.log('Waiting for auth to be initialized...');

    // Wait for auth service to be initialized
    while (!this.authService.isInitialized()) {
      console.log('Auth not initialized yet, waiting...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Auth initialized, checking authentication...');
    console.log('isAuthenticated():', this.isAuthenticated());

    // Check authentication after auth is initialized
    if (!this.isAuthenticated()) {
      console.log('Not authenticated after initialization, redirecting to login...');
      this.router.navigate(['/login']);
      return;
    }

    console.log('User is authenticated, initializing component...');
    this.initializeComponent();
  }

  private initializeComponent() {
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

    // Ensure booking service is properly initialized
    this.initializeBookingService();
  }

  ngOnInit(): void {
    console.log('=== BookingPageComponent ngOnInit ===');
    console.log('isAuthenticated():', this.isAuthenticated());
    console.log('Current route:', this.router.url);
    // Component initialization is now handled in constructor

    // Set up responsive sidebar behavior
    this.setupResponsiveSidebar();
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('serviceUpdated', () => {
      this.loadServices();
    });
    window.removeEventListener('bookingUpdated', () => {
      this.loadAppointments();
    });
    window.removeEventListener('resize', this.handleResize);
  }

  // ===== SHARED METHODS =====

  // User appointment limit methods
  canUserBookMoreAppointments(): boolean {
    return this.bookingValidationService.canUserBookMoreAppointments();
  }

  getUserAppointmentCount(): number {
    return this.bookingValidationService.getUserAppointmentCount();
  }

  getMaxAppointmentsPerUser(): number {
    return this.bookingValidationService.getMaxAppointmentsPerUser();
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
    this.bookingStateService.setCurrentStep(step);
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
    this.bookingStateService.setSelectedService(service);
  }

  // Alias for template compatibility
  onServiceSelected(service: FirebaseService) {
    this.onServiceSelectedMobile(service);
  }

  onDateSelected(date: Date) {
    this.bookingStateService.setSelectedDate(date);
  }

  onDateClicked(date: Date) {
    if (this.bookingValidationService.canSelectDate(date)) {
      this.onDateSelected(date);
    }
  }

  onTimeSlotSelectedMobile(timeSlot: any) {
    this.bookingStateService.setSelectedTimeSlot(timeSlot);
  }

  onTimeSlotClicked(timeSlot: any) {
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

      this.bookingStateService.updateBookingDetails({
        clientName: displayName,
        email: email
      });
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

    this.loaderService.show({ message: 'BOOKING.CREATING_BOOKING' });

    try {
      const formattedDate = this.formatDateISO(selectedDate);

      const bookingData = {
        clientName: details.clientName,
        email: details.email,
        data: formattedDate,
        hora: selectedTimeSlot.time,
        serviceId: selectedService.id || '',
        notes: '',
        status: 'confirmed' as const,
      };

      console.log('=== BOOKING CREATION DEBUG ===');
      console.log('Selected date object:', selectedDate);
      console.log('Selected date string:', selectedDate.toDateString());
      console.log('Selected date ISO:', selectedDate.toISOString());
      console.log('Formatted date (local):', formattedDate);
      console.log('Time slot:', selectedTimeSlot.time);
      console.log('Full booking data:', bookingData);
      const booking = await this.bookingService.createBooking(bookingData, true);

      if (booking) {
        console.log('Booking created successfully:', booking);
        this.bookingStateService.setCreatedBooking(booking);

        // Force refresh appointments to ensure real-time updates work
        await this.bookingService.refreshBookings();

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('bookingUpdated'));

        this.goToStep('success');
      } else {
        console.error('Booking creation returned null');
        this.loaderService.show({ message: 'COMMON.ERROR' });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      this.loaderService.show({ message: 'COMMON.ERROR' });
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
    this.bookingStateService.setSelectedDate(selectedDate);

    this.bookingStateService.setServiceSelectionDetails({
      date: event.date,
      time: event.time,
      clientName: this.isAuthenticated() ? this.authService.userDisplayName() || '' : '',
      email: this.isAuthenticated() ? this.authService.user()?.email || '' : '',
    });

    this.bookingStateService.setShowServiceSelectionPopup(true);
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
        this.bookingStateService.setShowLoginPrompt(true);
      }

      this.bookingStateService.setShowBookingPopup(false);
      this.bookingStateService.setBookingDetails({ date: '', time: '', clientName: '', email: '' });
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      this.loaderService.hide();
    }
  }

  onServiceSelectedDesktop(event: { details: ServiceSelectionDetails; service: FirebaseService }) {
    this.bookingStateService.setShowServiceSelectionPopup(false);

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

    this.bookingStateService.setBookingDetails(bookingDetails);
    this.bookingStateService.setShowBookingPopup(true);
  }

  onServiceSelectionCancelled() {
    this.bookingStateService.setShowServiceSelectionPopup(false);
  }

  onBookingCancelled() {
    this.bookingStateService.setShowBookingPopup(false);
  }

  onClientNameChanged(name: string) {
    this.bookingStateService.updateBookingDetails({ clientName: name });
  }

  onEmailChanged(email: string) {
    this.bookingStateService.updateBookingDetails({ email: email });
  }

  onLoginPromptClose() {
    this.bookingStateService.setShowLoginPrompt(false);
  }

  onLoginPromptLogin() {
    this.bookingStateService.setShowLoginPrompt(false);
    this.router.navigate(['/auth/login']);
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

  // Desktop sidebar toggle (called from template)
  toggleSidebar() {
    this.bookingStateService.toggleSidebar();
  }

  // ===== RESPONSIVE SIDEBAR METHODS =====

  private handleResize = () => {
    const isSmallScreen = window.innerWidth < 1275;
    const currentCollapsed = this.sidebarCollapsed();

    console.log('Window width:', window.innerWidth, 'Is small screen:', isSmallScreen, 'Current collapsed:', currentCollapsed);

    // Auto-collapse only when going from large to small screen
    if (isSmallScreen && !currentCollapsed && !this.wasAutoCollapsed) {
      console.log('Auto-collapsing sidebar due to screen size');
      this.bookingStateService.setSidebarCollapsed(true);
      this.wasAutoCollapsed = true;
    }

    // Don't auto-expand when going from small to large screen
    // User should manually control the sidebar state
  };

  private setupResponsiveSidebar() {
    // Check initial screen size and auto-collapse if needed
    const isSmallScreen = window.innerWidth < 1275;
    if (isSmallScreen && !this.sidebarCollapsed()) {
      console.log('Initial setup: auto-collapsing sidebar for small screen');
      this.bookingStateService.setSidebarCollapsed(true);
      this.wasAutoCollapsed = true;
    }

    // Add resize listener
    window.addEventListener('resize', this.handleResize);
  }

  // ===== SHARED UTILITY METHODS =====

  private initializeBookingService() {
    // Ensure booking service is properly initialized and real-time listener is active
    if (this.isAuthenticated()) {
      console.log('Initializing booking service...');
      this.bookingService.loadBookings().then(() => {
        console.log('Booking service initialized successfully');
        console.log('Real-time listener active:', this.bookingService.isRealtimeWorking());
      }).catch(error => {
        console.error('Error initializing booking service:', error);
      });
    }
  }

  private async loadServices() {
    try {
      // Use cached services from booking state service
      await this.bookingStateService.loadServicesCache();
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  private async loadAppointments() {
    // Only show loader on mobile, not on desktop
    if (this.isMobile()) {
      this.loaderService.show({ message: 'BOOKING.LOADING_APPOINTMENTS' });
    }

    try {
      console.log('Loading appointments...');
      await this.bookingService.loadBookings();
      const bookings = this.bookingService.bookings();
      console.log('Loaded appointments:', bookings.length);
      this.bookingStateService.setAppointments(bookings);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      if (this.isMobile()) {
        this.loaderService.hide();
      }
    }
  }

  // ===== MOBILE UTILITY METHODS =====

  // Set default date when entering datetime step
  private setDefaultDate() {
    const today = new Date();
    const firstBusinessDayOfWeek = this.getFirstBusinessDayOfWeek(today);

    this.bookingStateService.setViewDate(firstBusinessDayOfWeek);

    if (this.bookingValidationService.canSelectDate(firstBusinessDayOfWeek)) {
      this.bookingStateService.setSelectedDate(firstBusinessDayOfWeek);
    } else {
      const currentViewDays = this.currentViewDays();
      const firstAvailableDate = currentViewDays.find((day: Date) =>
        this.bookingValidationService.canSelectDate(day)
      );

      if (firstAvailableDate) {
        this.bookingStateService.setSelectedDate(firstAvailableDate);
      }
    }
  }

  // Helper methods for month view calendar alignment
  private getFirstBusinessDayOfWeek(date: Date): Date {
    const weekStart = this.getStartOfWeek(date);
    for (let i = 0; i < 7; i++) {
      const day = this.addDays(weekStart, i);
      if (this.bookingValidationService.isBusinessDay(day)) {
        return day;
      }
    }
    return weekStart;
  }

  private getLastBusinessDayOfWeek(date: Date): Date {
    const weekEnd = this.getEndOfWeek(date);
    for (let i = 6; i >= 0; i--) {
      const day = this.addDays(weekEnd, -i);
      if (this.bookingValidationService.isBusinessDay(day)) {
        return day;
      }
    }
    return weekEnd;
  }

  // Helper methods for template conditions
  hasMorningSlots(daySlot: any): boolean {
    return daySlot.timeSlots.some((slot: any) => slot.time < '13:00' && slot.available);
  }

  hasAfternoonSlots(daySlot: any): boolean {
    return daySlot.timeSlots.some((slot: any) => slot.time >= '14:00' && slot.available);
  }

  getMorningSlots(daySlot: any): any[] {
    return daySlot.timeSlots.filter((slot: any) => slot.time < '13:00' && slot.available);
  }

  getAfternoonSlots(daySlot: any): any[] {
    return daySlot.timeSlots.filter((slot: any) => slot.time >= '14:00' && slot.available);
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

    this.bookingStateService.setViewMode(newMode);

    if (currentSelectedDate && this.bookingValidationService.canSelectDate(currentSelectedDate)) {
      this.bookingStateService.setViewDate(currentSelectedDate);
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
      this.bookingStateService.setViewDate(date);
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
      const newDate = this.getPreviousWeek(currentDate);
      this.bookingStateService.setViewDate(newDate);
    } else {
      const newDate = this.getPreviousMonth(currentDate);
      this.bookingStateService.setViewDate(newDate);
    }
    this.clearSelectedDate();
  }

  nextPeriod() {
    const currentDate = this.viewDate();
    if (this.viewMode() === 'week') {
      const newDate = this.getNextWeek(currentDate);
      this.bookingStateService.setViewDate(newDate);
    } else {
      const newDate = this.getNextMonth(currentDate);
      this.bookingStateService.setViewDate(newDate);
    }
    this.clearSelectedDate();
  }

  selectServiceFromList(service: FirebaseService) {
    this.bookingStateService.setSelectedService(service);
  }

  // Check if a specific day has no available appointments for the selected service
  hasNoAvailableAppointmentsForDay(day: Date): boolean {
    return this.bookingValidationService.hasNoAvailableAppointmentsForDay(day);
  }

  isFullyBookedWorkingDay(day: Date): boolean {
    return this.bookingValidationService.isFullyBookedWorkingDay(day);
  }

  // Check if a day is a fully booked working day for the selected service duration
  isFullyBookedWorkingDayForService(day: Date): boolean {
    return this.bookingValidationService.isFullyBookedWorkingDayForService(day);
  }

  // Navigation
  goToPreviousWeek() {
    const currentDate = this.viewDate();
    const newWeekDate = this.getPreviousWeek(currentDate);

    // Get the first business day of the new week
    const firstBusinessDay = this.getFirstBusinessDayOfWeek(newWeekDate);

    // Update the view date to the first business day of the week
    this.bookingStateService.setViewDate(firstBusinessDay);

    this.clearSelectedDate();
  }

  goToNextWeek() {
    const currentDate = this.viewDate();
    const newWeekDate = this.getNextWeek(currentDate);

    // Get the first business day of the new week
    const firstBusinessDay = this.getFirstBusinessDayOfWeek(newWeekDate);

    // Update the view date to the first business day of the week
    this.bookingStateService.setViewDate(firstBusinessDay);

    this.clearSelectedDate();
  }

  goToToday() {
    this.bookingStateService.setViewDate(new Date());
    this.clearSelectedDate();
  }

  // Helper method to clear selected date
  private clearSelectedDate() {
    this.bookingStateService.setSelectedDate(null);
    this.bookingStateService.setSelectedTimeSlot(null);
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

  selectTimeSlot(timeSlot: any) {
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

    this.onTimeSlotSelectedMobile(timeSlot);
  }

  // Format methods
  formatDay(date: Date): string {
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDayShort(date: Date): string {
    return date.toLocaleDateString('ca-ES', { weekday: 'short' });
  }

  formatTime(time: string): string {
    return time;
  }

  formatMonth(date: Date): string {
    return date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long' });
  }

  // State check methods
  isToday(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  }

  isSelected(date: Date): boolean {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return false;
    return this.isSameDay(date, selectedDate);
  }

  isBusinessDay(date: Date): boolean {
    return this.bookingValidationService.isBusinessDay(date);
  }

  isPastDate(date: Date): boolean {
    return this.bookingValidationService.isPastDate(date);
  }

  isCurrentMonth(date: Date): boolean {
    const currentDate = this.viewDate();
    return (
      date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()
    );
  }

  canSelectDate(date: Date): boolean {
    return this.bookingValidationService.canSelectDate(date);
  }

  // Quick date selection methods
  getToday(): Date {
    return new Date();
  }

  getTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  selectToday() {
    const today = new Date();
    if (this.canSelectDate(today)) {
      this.bookingStateService.setSelectedDate(today);
      this.bookingStateService.setViewDate(today);
    }
  }

  selectTomorrow() {
    const tomorrow = this.getTomorrow();
    if (this.canSelectDate(tomorrow)) {
      this.bookingStateService.setSelectedDate(tomorrow);
      this.bookingStateService.setViewDate(tomorrow);
    }
  }

  nextAvailableDate(): Date | null {
    const today = new Date();
    const maxDaysToCheck = 30;

    for (let i = 0; i < maxDaysToCheck; i++) {
      const dateToCheck = new Date(today);
      dateToCheck.setDate(today.getDate() + i);

      if (this.bookingValidationService.isBusinessDay(dateToCheck) &&
          !this.isPastDate(dateToCheck)) {
        return dateToCheck;
      }
    }

    return null;
  }

  selectNextAvailable() {
    const nextAvailable = this.nextAvailableDate();
    if (nextAvailable) {
      this.bookingStateService.setSelectedDate(nextAvailable);
      this.bookingStateService.setViewDate(nextAvailable);
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
    console.log('=== onBackToHome called ===');
    console.log('Current route before navigation:', this.router.url);

    // Only reset if we're coming from success step (after booking creation)
    if (this.currentStep() === 'success') {
      console.log('Resetting booking state after successful booking');
      this.bookingStateService.resetBookingState();
    } else {
      // Just go back to service step without resetting
      console.log('Going back to service step without resetting state');
      this.bookingStateService.setCurrentStep('service');
    }

    console.log('Navigating to /booking...');
    this.router.navigate(['/booking']).then(success => {
      console.log('Navigation result:', success);
      console.log('Current route after navigation:', this.router.url);
    }).catch(error => {
      console.error('Navigation error:', error);
    });
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
      // Get service details
      const service = this.availableServices().find(s => s.id === booking.serviceId);

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

  // ===== UTILITY METHODS =====

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  private formatDateISO(date: Date): string {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  private getEndOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getPreviousWeek(date: Date): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - 7);
    return result;
  }

  private getNextWeek(date: Date): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + 7);
    return result;
  }

  private getPreviousMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() - 1);
    return result;
  }

  private getNextMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    return result;
  }
}
