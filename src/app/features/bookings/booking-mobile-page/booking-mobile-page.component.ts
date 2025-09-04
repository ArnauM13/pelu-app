import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import {
  FirebaseServicesService,
  FirebaseService,
} from '../../../core/services/firebase-services.service';
import { UserService } from '../../../core/services/user.service';
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { NoAppointmentsMessageComponent } from '../../../shared/components/no-appointments-message/no-appointments-message.component';
import { TimeUtils, TimeSlot, DaySlot } from '../../../shared/utils/time.utils';
import { BookingDetails } from '../../../shared/components/booking-popup/booking-popup.component';
import { BookingValidationService } from '../../../core/services/booking-validation.service';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { IcsUtils } from '../../../shared/utils/ics.utils';
import { PeluTitleComponent } from '../../../shared/components/pelu-title/pelu-title.component';
import { LoaderService } from '../../../shared/services/loader.service';

type BookingStep = 'service' | 'datetime' | 'confirmation' | 'success';

@Component({
  selector: 'pelu-booking-mobile-page',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TranslateModule,
    InputTextComponent,
    NextAppointmentComponent,
    NoAppointmentsMessageComponent,
    ButtonComponent,
    ServiceCardComponent,
    CardComponent,
    PeluTitleComponent
  ],
  templateUrl: './booking-mobile-page.component.html',
  styleUrls: ['./booking-mobile-page.component.scss'],
})
export class BookingMobilePageComponent {
  // Inject services
  public readonly authService = inject(AuthService);
  public readonly firebaseServicesService = inject(FirebaseServicesService);
  public readonly bookingService = inject(BookingService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly timeUtils = inject(TimeUtils);
  private readonly bookingValidationService = inject(BookingValidationService);
  private readonly loaderService = inject(LoaderService);

  // Step management signals
  private readonly currentStepSignal = signal<BookingStep>('service');
  private readonly selectedTimeSlotSignal = signal<TimeSlot | null>(null);
  private readonly createdBookingSignal = signal<Booking | null>(null);

  // Internal state signals
  private readonly selectedDateSignal = signal<Date | null>(null);
  private readonly viewDateSignal = signal<Date>(new Date());
  private readonly selectedServiceSignal = signal<FirebaseService | null>(null);
  private readonly appointmentsSignal = signal<Booking[]>([]);
  private readonly viewModeSignal = signal<'week' | 'month'>('week');

  // Booking details signal - now reactive
  private readonly bookingDetailsSignal = signal<BookingDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });

  // Public computed signals
  readonly currentStep = computed(() => this.currentStepSignal());
  readonly selectedTimeSlot = computed(() => this.selectedTimeSlotSignal());
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly viewDate = computed(() => this.viewDateSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal() || undefined);
  readonly appointments = computed(() => this.appointmentsSignal());
  readonly userAppointments = computed(() =>
    this.appointments().filter(b => this.bookingService.isOwnBooking(b))
  );
  readonly viewMode = computed(() => this.viewModeSignal());
  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isAdmin = computed(() => this.userService.isAdmin());
  readonly createdBooking = computed(() => this.createdBookingSignal());

  // Check if user has reached appointment limit for first screen validation
  readonly hasReachedAppointmentLimit = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Check if user should be blocked from proceeding to next steps
  readonly isUserBlockedFromBooking = computed(() => {
    return this.isAuthenticated() && !this.canUserBookMoreAppointments();
  });

  // Step validation computed signals - now fully reactive
  readonly canProceedToDateTime = computed(() => {
    // If user has reached appointment limit, they cannot proceed
    if (this.isUserBlockedFromBooking()) {
      return false;
    }
    return !!this.selectedService();
  });

  readonly canProceedToConfirmation = computed(() => {
    // If user has reached appointment limit, they cannot proceed
    if (this.isUserBlockedFromBooking()) {
      return false;
    }

    const selectedService = this.selectedService();
    const selectedDate = this.selectedDate();
    const selectedTimeSlot = this.selectedTimeSlot();

    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      return false;
    }

    // Validate that the selected time slot is actually available
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
    // If user has reached appointment limit, they cannot proceed to any step
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
    // First check authentication
    if (!this.isAuthenticated()) {
      return false;
    }

    // Check if user has reached appointment limit
    if (!this.canUserBookMoreAppointments()) {
      return false;
    }

    // Get all required data
    const details = this.bookingDetails();
    const hasClientName = details.clientName && details.clientName.trim().length > 0;
    const hasEmail = details.email && details.email.trim().length > 0;
    const selectedService = this.selectedService();
    const selectedDate = this.selectedDate();
    const selectedTimeSlot = this.selectedTimeSlot();

    // Check if all required data is present
    if (!hasClientName || !hasEmail || !selectedService || !selectedDate || !selectedTimeSlot) {
      return false;
    }

    // Validate that the selected time slot is actually available
    return this.bookingValidationService.canBookServiceAtTime(
      selectedDate,
      selectedTimeSlot.time,
      selectedService.duration,
      this.appointments()
    );
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

    // Check if all time slots are occupied
    const availableSlots = daySlots.timeSlots.filter((slot: { available: boolean }) => slot.available);
    return availableSlots.length === 0 && daySlots.timeSlots.length > 0;
  });

  // Check if selected day has no available appointments
  readonly hasNoAvailableAppointmentsForSelectedDay = computed(() => {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return false;

    // Only show warning for working days that are fully booked for the selected service
    return this.isBusinessDay(selectedDate) && this.hasNoAvailableAppointmentsForDay(selectedDate);
  });

  // Check if there are no available time slots for the selected service on any day
  readonly hasNoAvailableTimeSlotsForService = computed(() => {
    const selectedService = this.selectedService();
    if (!selectedService) return false;

    const currentViewDays = this.currentViewDays();
    return currentViewDays.every((day: Date) => {
      const daySlots = this.daySlots().find((daySlot: { date: Date; timeSlots: unknown[] }) => this.timeUtils.isSameDay(daySlot.date, day));
      if (!daySlots) return true; // No slots means no appointments
      return daySlots.timeSlots.every((slot: { available: boolean }) => !slot.available);
    });
  });

  // Check if there are no available appointments in the current view
  readonly hasNoAvailableAppointments = computed(() => {
    const currentViewDays = this.currentViewDays();
    return currentViewDays.every((day: Date) => {
      const daySlots = this.daySlots().find((daySlot: { date: Date; timeSlots: unknown[] }) => this.timeUtils.isSameDay(daySlot.date, day));
      if (!daySlots) return true; // No slots means no appointments
      return daySlots.timeSlots.every((slot: { available: boolean }) => !slot.available);
    });
  });

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

    // Set default date when entering datetime step
    this.setDefaultDate();
  }

  // Step navigation methods
  goToStep(step: BookingStep) {
    this.currentStepSignal.set(step);
  }

  nextStep() {
    const currentStep = this.currentStep();

    if (currentStep === 'service' && this.canProceedToDateTime()) {
      this.goToStep('datetime');
      // Set default date when entering datetime step
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
  onServiceSelected(service: FirebaseService) {
    this.selectedServiceSignal.set(service);
    // Clear selected date and time when service changes, as available slots may change
    this.selectedDateSignal.set(null);
    this.selectedTimeSlotSignal.set(null);
  }

  onDateSelected(date: Date) {
    this.selectedDateSignal.set(date);
    this.selectedTimeSlotSignal.set(null); // Reset time slot when date changes
  }

  onDateClicked(date: Date) {
    if (this.canSelectDate(date)) {
      this.onDateSelected(date);
    }
  }

  onTimeSlotSelected(timeSlot: TimeSlot) {
    this.selectedTimeSlotSignal.set(timeSlot);
  }

  onTimeSlotClicked(timeSlot: TimeSlot) {
    // Use the same validation logic as selectTimeSlot
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
      this.toastService.showError('COMMON.ERROR', 'COMMON.INCOMPLETE_BOOKING_INFO');
      return;
    }

    // Final validation before creating the booking
    if (!this.bookingValidationService.canBookServiceAtTime(
      selectedDate,
      selectedTimeSlot.time,
      selectedService.duration,
      this.appointments()
    )) {
      this.toastService.showError('COMMON.ERROR', 'COMMON.TIME_SLOT_NO_LONGER_AVAILABLE');
      return;
    }

    this.loaderService.show({ message: 'BOOKING.CREATING_BOOKING' });

    try {
      // Create booking using the booking service
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
        // Store the created booking for the success page
        this.createdBookingSignal.set(booking);

        // Refresh appointments to show the new booking
        await this.loadAppointments();

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('bookingUpdated'));

        // Navigate to success step instead of showing toast
        this.goToStep('success');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      // Don't show toast - the booking service already handles success/error toasts
    } finally {
      this.loaderService.hide();
    }
  }

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
      // Load appointments from BookingService (Firebase)
      await this.bookingService.loadBookings();
      const bookings = this.bookingService.bookings();
      this.appointmentsSignal.set(bookings);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      this.loaderService.hide();
    }
  }













  /**
   * Get enabled time slots for a given date
   * Used for documentation and testing purposes
   */
  getEnabledTimeSlots(date: Date): string[] {
    const slots: string[] = [];

    // Check if it's a business day
    if (!this.bookingValidationService.canBookOnDate(date)) {
      return slots;
    }

    const businessHours = this.businessHours();
    const slotDuration = this.slotDuration();

    const startHour = businessHours.start;
    const endHour = businessHours.end;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    return slots;
  }

  onClientNameChanged(value: string | Event) {
    const name = typeof value === 'string' ? value : (value.target as HTMLInputElement).value;
    this.bookingDetailsSignal.update(details => ({ ...details, clientName: name.trim() }));
  }

  onEmailChanged(value: string | Event) {
    const email = typeof value === 'string' ? value : (value.target as HTMLInputElement).value;
    this.bookingDetailsSignal.update(details => ({ ...details, email: email.trim() }));
  }

  // Success page methods
  onViewBookingDetail() {
    const booking = this.createdBooking();
    if (booking) {
      this.router.navigate(['/appointments', booking.id]);
    }
  }

  onBackToHome() {
    this.router.navigate(['/booking']);
  }

  // Navigation
  goToPreviousWeek() {
    const currentDate = this.viewDate();
    const newDate = this.timeUtils.getPreviousWeek(currentDate);
    this.viewDateSignal.set(newDate);
    this.clearSelectedDate();
  }

  goToNextWeek() {
    const currentDate = this.viewDate();
    const newDate = this.timeUtils.getNextWeek(currentDate);
    this.viewDateSignal.set(newDate);
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
    // Check if user has reached appointment limit
    if (!this.canUserBookMoreAppointments()) {
      this.toastService.showError('COMMON.ERROR', 'COMMON.MAX_APPOINTMENTS_REACHED');
      return;
    }

    // Check if service is selected
    const selectedService = this.selectedService();
    if (!selectedService) {
      this.toastService.showError('COMMON.ERROR', 'COMMON.PLEASE_SELECT_SERVICE_FIRST');
      return;
    }

    // Check if date is selected
    const selectedDate = this.selectedDate();
    if (!selectedDate) {
      this.toastService.showError('COMMON.ERROR', 'COMMON.PLEASE_SELECT_DATE_FIRST');
      return;
    }

    // Use BookingValidationService to validate if the booking can be made at this specific time
    if (!this.bookingValidationService.canBookServiceAtTime(
      selectedDate,
      timeSlot.time,
      selectedService.duration,
      this.appointments()
    )) {
      this.toastService.showError('COMMON.ERROR', 'COMMON.TIME_SLOT_NOT_AVAILABLE');
      return;
    }

    this.onTimeSlotSelected(timeSlot);
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
    // In week view, all business days in the week should be selectable regardless of month
    // In month view, only days of the current month should be selectable

    // First check basic booking validation - this includes business days, advance booking limits, etc.
    if (!this.bookingValidationService.canBookOnDate(date) ||
        !this.bookingValidationService.canBookInAdvance(date) ||
        this.isPastDate(date)) {
      return false;
    }

    if (this.viewMode() === 'week') {
      return true; // All valid business days in the week should be selectable
    } else {
      // Month view - only current month days
      const currentDate = this.viewDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Check if date is in the current month and year
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
    // Use BookingValidationService to find next available date
    const today = new Date();
    const maxDaysToCheck = 30; // Limit to avoid infinite loops

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
      this.toastService.showInfo(
        'Data seleccionada',
        `S'ha seleccionat la propera data disponible: ${this.formatDay(nextAvailable)}`
      );
    } else {
      this.toastService.showWarning(
        'No hi ha dates disponibles',
        "No s'han trobat dates disponibles en els propers 30 dies"
      );
    }
  }

  getServiceColor(serviceName: string): string {
    const serviceColor = this.serviceColorsService.getServiceColor(serviceName);
    return serviceColor.color;
  }

  getServiceBackgroundColor(serviceName: string): string {
    const serviceColor = this.serviceColorsService.getServiceColor(serviceName);
    return serviceColor.backgroundColor;
  }

  // Helper methods for month view calendar alignment
  private getFirstBusinessDayOfWeek(date: Date): Date {
    const weekStart = this.timeUtils.getStartOfWeek(date);
    // Find the first business day in the week
    for (let i = 0; i < 7; i++) {
      const day = this.timeUtils.addDays(weekStart, i);
      if (this.bookingValidationService.canBookOnDate(day)) {
        return day;
      }
    }
    return weekStart; // Fallback
  }

  private getLastBusinessDayOfWeek(date: Date): Date {
    const weekEnd = this.timeUtils.getEndOfWeek(date);
    // Find the last business day in the week
    for (let i = 6; i >= 0; i--) {
      const day = this.timeUtils.addDays(weekEnd, -i);
      if (this.bookingValidationService.canBookOnDate(day)) {
        return day;
      }
    }
    return weekEnd; // Fallback
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

    // Preserve selected date if it's still valid in the new view
    if (currentSelectedDate && this.canSelectDate(currentSelectedDate)) {
      // Keep the selected date, just update the view to show the selected date
      this.viewDateSignal.set(currentSelectedDate);
    } else {
      // Clear selected date only if it's not valid in the new view
      this.clearSelectedDate();
    }
  }

  canGoToPreviousPeriod(): boolean {
    const currentDate = this.viewDate();
    const today = new Date();

    if (this.viewMode() === 'week') {
      // Check if the previous week would be before today
      const previousWeekStart = this.timeUtils.getPreviousWeek(currentDate);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return previousWeekStart >= todayStart;
    } else {
      // Check if the previous month would be before current month
      const previousMonth = this.timeUtils.getPreviousMonth(currentDate);
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return previousMonth >= currentMonth;
    }
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

  // Set default date when entering datetime step
  private setDefaultDate() {
    // Always start with the first business day of the current week
    const today = new Date();
    const firstBusinessDayOfWeek = this.getFirstBusinessDayOfWeek(today);

    // Set the view to the first business day of the week
    this.viewDateSignal.set(firstBusinessDayOfWeek);

    // Try to select the first business day if it's selectable
    if (this.canSelectDate(firstBusinessDayOfWeek)) {
      this.selectedDateSignal.set(firstBusinessDayOfWeek);
    } else {
      // If the first business day is not selectable, find the first available date
      const currentViewDays = this.currentViewDays();
      const firstAvailableDate = currentViewDays.find((day: Date) => this.canSelectDate(day));

      if (firstAvailableDate) {
        this.selectedDateSignal.set(firstAvailableDate);
      }
    }
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

    // Check if there's enough space for the selected service duration
    return !this.hasEnoughSpaceForService(day, selectedService);
  }

  // Check if there's enough space for the selected service on a given day
  private hasEnoughSpaceForService(day: Date, service: FirebaseService): boolean {
    const daySlots = this.bookingValidationService.generateTimeSlotsForService(
      day,
      service.duration,
      this.appointments()
    );

    // Check if there are any available slots
    return daySlots.some(slot => slot.available);
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

  goToServiceStep = () => {
    this.goToStep('service');
  };

  /**
   * Adds booking to user's calendar
   */
  async addToCalendar(): Promise<void> {
    const booking = this.createdBooking();

    if (!booking) {
      this.toastService.showError('COMMON.ERROR', 'COMMON.BOOKING_NOT_FOUND_FOR_CALENDAR');
      return;
    }

    this.loaderService.show({ message: 'BOOKING.ADDING_TO_CALENDAR' });

    try {
      // Get service details from the booking
      const service = await this.firebaseServicesService.getServiceById(booking.serviceId);

      if (!service) {
        this.toastService.showError('COMMON.ERROR', 'COMMON.SERVICE_NOT_FOUND_FOR_CALENDAR');
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

      // Try to add to calendar directly
      await IcsUtils.addToCalendar(icsContent, filename);
      this.toastService.showSuccess('COMMON.SUCCESS', 'COMMON.EVENT_ADDED_TO_CALENDAR');
    } catch (error) {
      console.error('Error adding to calendar:', error);

      // Show a more informative error message
      const errorMessage = error instanceof Error ? error.message : 'Error al afegir al calendari';

              if (errorMessage.includes('descarregat')) {
          this.toastService.showInfo('COMMON.FILE_DOWNLOADED', 'COMMON.CALENDAR_FILE_DOWNLOADED');
        } else {
          this.toastService.showError('COMMON.ERROR', 'COMMON.COULD_NOT_ADD_TO_CALENDAR');
        }
    } finally {
      this.loaderService.hide();
    }
  }
}
