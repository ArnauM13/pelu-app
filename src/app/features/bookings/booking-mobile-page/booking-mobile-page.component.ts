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
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { NextAppointmentComponent } from '../../../shared/components/next-appointment/next-appointment.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { NoAppointmentsMessageComponent } from '../../../shared/components/no-appointments-message/no-appointments-message.component';
import { TimeUtils, TimeSlot, DaySlot } from '../../../shared/utils/time.utils';
import { BookingDetails } from '../../../shared/components/booking-popup/booking-popup.component';
import { BookingValidationService } from '../../../core/services/booking-validation.service';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';

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
    CurrencyPipe,
    InputTextComponent,
    NextAppointmentComponent,
    LoadingStateComponent,
    NoAppointmentsMessageComponent,
    ButtonComponent
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
    return !!this.selectedService() && !!this.selectedDate() && !!this.selectedTimeSlot();
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
    const hasService = !!this.selectedService();
    const hasDate = !!this.selectedDate();
    const hasTimeSlot = !!this.selectedTimeSlot();
    
    // All conditions must be met
    return hasClientName && hasEmail && hasService && hasDate && hasTimeSlot;
  });

  // Business configuration
  readonly businessHours = computed(() => this.systemParametersService.getBusinessHours());
  readonly lunchBreak = computed(() => this.systemParametersService.getLunchBreak());
  readonly businessDays = computed(() => this.systemParametersService.getWorkingDays());
  readonly slotDuration = computed(() => this.systemParametersService.getAppointmentDuration());

  // Available services
  readonly availableServices = computed(() => this.firebaseServicesService.activeServices());

  // Popular services (services with popular flag)
  readonly popularServices = computed(() =>
    this.availableServices().filter(service => service.isPopular === true)
  );

  // Other services (non-popular services)
  readonly otherServices = computed(() =>
    this.availableServices().filter(service => service.isPopular !== true)
  );

  // Week days computation
  readonly weekDays = computed(() => {
    const currentDate = this.viewDate();
    return this.timeUtils.getWeekDays(currentDate);
  });

  // Month days computation
  readonly monthDays = computed(() => {
    const currentDate = this.viewDate();
    const workingDays = this.businessDays();
    return this.timeUtils.getMonthDays(currentDate, workingDays);
  });

  // Current view days
  readonly currentViewDays = computed(() => {
    return this.viewMode() === 'week' ? this.weekDays() : this.monthDays();
  });

  // Day slots computation
  readonly daySlots = computed(() => {
    return this.currentViewDays().map(day => ({
      date: day,
      timeSlots: this.generateTimeSlots(day),
    }));
  });

  readonly selectedDaySlots = computed(() => {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return null;
    return this.daySlots().find(daySlot => this.timeUtils.isSameDay(daySlot.date, selectedDate));
  });

  readonly isSelectedDayFullyBooked = computed(() => {
    const daySlots = this.selectedDaySlots();
    if (!daySlots) return false;

    // Check if all time slots are occupied
    const availableSlots = daySlots.timeSlots.filter(slot => slot.available);
    return availableSlots.length === 0 && daySlots.timeSlots.length > 0;
  });

  // Check if selected day has no available appointments
  readonly hasNoAvailableAppointmentsForSelectedDay = computed(() => {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return false;
    
    // Only show warning for working days that are fully booked for the selected service
    return this.isBusinessDay(selectedDate) && this.hasNoAvailableAppointmentsForDay(selectedDate);
  });

  // Check if there are no available appointments in the current view
  readonly hasNoAvailableAppointments = computed(() => {
    const currentViewDays = this.currentViewDays();
    return currentViewDays.every(day => {
      const daySlots = this.daySlots().find(daySlot => this.timeUtils.isSameDay(daySlot.date, day));
      if (!daySlots) return true; // No slots means no appointments
      return daySlots.timeSlots.every(slot => !slot.available);
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
    if (timeSlot.available) {
      this.onTimeSlotSelected(timeSlot);
    }
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
      this.toastService.showError('Informació incompleta per confirmar la reserva');
      return;
    }

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
    try {
      // Load appointments from BookingService (Firebase)
      await this.bookingService.loadBookings();
      const bookings = this.bookingService.bookings();
      this.appointmentsSignal.set(bookings);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }

  private generateTimeSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();

    // Check if it's a business day
    if (!this.businessDays().includes(dayOfWeek)) {
      return slots;
    }

    const businessHours = this.businessHours();
    const slotDuration = this.slotDuration();

    const startHour = businessHours.start;
    const endHour = businessHours.end;
    const now = new Date();
    const isToday = this.timeUtils.isSameDay(date, now);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);

        // Skip disabled time slots (lunch break, etc.)
        if (!this.isTimeSlotEnabled(hour)) {
          continue;
        }

        // Skip past hours (only for today)
        if (isToday && slotDate <= now) {
          continue;
        }

        // Check advance time validation - only show slots that can be booked with advance time
        if (!this.bookingValidationService.canBookWithAdvanceTime(date, timeString)) {
          continue;
        }

        // Check if slot is available (not booked)
        const isAvailable = !this.isSlotBooked(slotDate);

        // Get booking details if slot is occupied
        const booking = this.getBookingForSlot(date, timeString);

        slots.push({
          time: timeString,
          available: isAvailable,
          isSelected: false,
          clientName: booking?.clientName,
          serviceName: '', // Service name will be retrieved from service service
          serviceIcon: this.getServiceIcon(booking?.serviceId),
          bookingId: booking?.id,
          notes: booking?.notes,
        });
      }
    }

    return slots;
  }

  private isSlotBooked(date: Date): boolean {
    const bookings = this.bookingService.bookings();
    const _timeString = this.timeUtils.formatTime(date.toTimeString().slice(0, 5));
    const dateString = this.timeUtils.formatDateISO(date);
    const selectedService = this.selectedService();

    // Get the duration of the selected service (default to 60 minutes if no service selected)
    const serviceDuration = selectedService?.duration || 60;

    return bookings.some(booking => {
      // Check if booking is confirmed and matches the date
      if (booking.status !== 'confirmed' || booking.data !== dateString) {
        return false;
      }

      // Check if the booking time overlaps with the slot we're checking
      const bookingTime = booking.hora;
      if (!bookingTime) return false;

      // Get the service duration for this booking
      let bookingDuration = 60; // Default duration
      if (booking.serviceId) {
        const service = this.firebaseServicesService.services().find(s => s.id === booking.serviceId);
        if (service) {
          bookingDuration = service.duration;
        }
      }

      // Calculate time ranges
      const slotStart = new Date(date);
      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);

      const [bookingHour, bookingMinute] = bookingTime.split(':').map(Number);
      const bookingStart = new Date(date);
      bookingStart.setHours(bookingHour, bookingMinute, 0, 0);
      const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60 * 1000);

      // Check for overlap
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  private getBookingForSlot(date: Date, time: string): Booking | undefined {
    const dateString = this.timeUtils.formatDateISO(date);
    const bookings = this.bookingService.bookings();
    const selectedService = this.selectedService();

    // Get the duration of the selected service (default to 60 minutes if no service selected)
    const serviceDuration = selectedService?.duration || 60;

    // Calculate the time range for the slot we're checking
    const [slotHour, slotMinute] = time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(slotHour, slotMinute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);

    return bookings.find(booking => {
      // Check if booking is confirmed and matches the date
      if (booking.status !== 'confirmed' || booking.data !== dateString) {
        return false;
      }

      // Check if the booking time overlaps with the slot we're checking
      const bookingTime = booking.hora;
      if (!bookingTime) return false;

      // Get the service duration for this booking
      let bookingDuration = 60; // Default duration
      if (booking.serviceId) {
        const service = this.firebaseServicesService.services().find(s => s.id === booking.serviceId);
        if (service) {
          bookingDuration = service.duration;
        }
      }

      // Calculate booking time range
      const [bookingHour, bookingMinute] = bookingTime.split(':').map(Number);
      const bookingStart = new Date(date);
      bookingStart.setHours(bookingHour, bookingMinute, 0, 0);
      const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60 * 1000);

      // Check for overlap
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  private getServiceIcon(serviceId?: string): string {
    if (!serviceId) return '🔧';
    const service = this.firebaseServicesService.services().find(s => s.id === serviceId);
    return service?.icon || '🔧';
  }

  private isTimeSlotEnabled(hour: number): boolean {
    // Check lunch break
    const lunchBreak = this.lunchBreak();
    const lunchStart = lunchBreak.start;
    const lunchEnd = lunchBreak.end;

    if (hour >= lunchStart && hour < lunchEnd) {
      return false;
    }

    return true;
  }

  /**
   * Get enabled time slots for a given date
   * Used for documentation and testing purposes
   */
  getEnabledTimeSlots(date: Date): string[] {
    const slots: string[] = [];
    const dayOfWeek = date.getDay();

    // Check if it's a business day
    if (!this.businessDays().includes(dayOfWeek)) {
      return slots;
    }

    const businessHours = this.businessHours();
    const slotDuration = this.slotDuration();

    const startHour = businessHours.start;
    const endHour = businessHours.end;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        if (this.isTimeSlotEnabled(hour)) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
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
    this.router.navigate(['/bookings']);
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
      this.toastService.showError('No pots fer més reserves. Ja tens el màxim de reserves actives.');
      return;
    }

    // Check if service is selected
    if (!this.selectedService()) {
      this.toastService.showError('Si us plau, selecciona un servei primer');
      return;
    }

    // Check if date is selected
    const selectedDate = this.selectedDate();
    if (!selectedDate) {
      this.toastService.showError('Si us plau, selecciona una data primer');
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
    return this.businessDays().includes(date.getDay());
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return dateStart < todayStart;
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
    if (this.viewMode() === 'week') {
      return !this.isPastDate(date) && this.isBusinessDay(date);
    } else {
      // Month view - only current month days
      const currentDate = this.viewDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Check if date is in the current month and year
      const isInCurrentMonth =
        date.getMonth() === currentMonth && date.getFullYear() === currentYear;

      return !this.isPastDate(date) && this.isBusinessDay(date) && isInCurrentMonth;
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
    const workingDays = this.businessDays();
    return this.timeUtils.getNextAvailableDate(workingDays);
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
      if (this.businessDays().includes(day.getDay())) {
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
      if (this.businessDays().includes(day.getDay())) {
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
    this.viewModeSignal.set(newMode);
    this.clearSelectedDate();
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
    const today = new Date();

    // Try to select today if it's selectable
    if (this.canSelectDate(today)) {
      this.selectedDateSignal.set(today);
      this.viewDateSignal.set(today);
      return;
    }

    // If today is not selectable, find the first available date
    const currentViewDays = this.currentViewDays();
    const firstAvailableDate = currentViewDays.find(day => this.canSelectDate(day));

    if (firstAvailableDate) {
      this.selectedDateSignal.set(firstAvailableDate);
      this.viewDateSignal.set(firstAvailableDate);
    }
  }

  // Check if a specific day has no available appointments
  hasNoAvailableAppointmentsForDay(day: Date): boolean {
    const businessHours = this.businessHours();
    const businessHoursString = {
      start: businessHours.start.toString(),
      end: businessHours.end.toString()
    };
    const lunchBreak = this.lunchBreak();
    const lunchBreakString = {
      start: lunchBreak.start.toString(),
      end: lunchBreak.end.toString()
    };

    const daySlots = this.timeUtils.generateTimeSlots(
      day,
      businessHoursString,
      this.slotDuration(),
      lunchBreakString,
      this.businessDays(),
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
    const businessHours = this.businessHours();
    const businessHoursString = {
      start: businessHours.start.toString(),
      end: businessHours.end.toString()
    };
    const lunchBreak = this.lunchBreak();
    const lunchBreakString = {
      start: lunchBreak.start.toString(),
      end: lunchBreak.end.toString()
    };

    const daySlots = this.timeUtils.generateTimeSlots(
      day,
      businessHoursString,
      this.slotDuration(),
      lunchBreakString,
      this.businessDays(),
      this.appointments()
    );

    // Check if there are enough consecutive available slots for the service duration
    const serviceDurationInMinutes = service.duration || 60;
    const slotsNeeded = Math.ceil(serviceDurationInMinutes / this.slotDuration());
    
    let consecutiveAvailableSlots = 0;
    for (const slot of daySlots) {
      if (slot.available) {
        consecutiveAvailableSlots++;
        if (consecutiveAvailableSlots >= slotsNeeded) {
          return true;
        }
      } else {
        consecutiveAvailableSlots = 0;
      }
    }
    
    return false;
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

  onViewMyAppointments() {
    this.router.navigate(['/appointments']);
  }
}
