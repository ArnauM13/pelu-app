import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import {
  addDays,
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { ca } from 'date-fns/locale';
import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import {
  BookingPopupComponent,
  BookingDetails,
} from '../../../shared/components/booking-popup/booking-popup.component';

import {
  FirebaseServicesService,
  FirebaseService,
} from '../../../core/services/firebase-services.service';
import { Booking, BookingService } from '../../../core/services/booking.service';
import { RoleService } from '../../../core/services/role.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { BusinessSettingsService } from '../../../core/services/business-settings.service';

interface TimeSlot {
  time: string;
  available: boolean;
  isSelected: boolean;
  clientName?: string;
  serviceName?: string;
  serviceIcon?: string;
  bookingId?: string;
  notes?: string;
}

interface DaySlot {
  date: Date;
  timeSlots: TimeSlot[];
}

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
    CardComponent,
    BookingPopupComponent,
    CurrencyPipe,
  ],
  templateUrl: './booking-mobile-page.component.html',
  styleUrls: ['./booking-mobile-page.component.scss'],
})
export class BookingMobilePageComponent {
  // Inject services
  public readonly authService = inject(AuthService);
  public readonly firebaseServicesService = inject(FirebaseServicesService);
  public readonly bookingService = inject(BookingService);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly serviceColorsService = inject(ServiceColorsService);
  private readonly businessSettingsService = inject(BusinessSettingsService);

  // Internal state signals
  private readonly selectedDateSignal = signal<Date | null>(null);
  private readonly selectedServiceSignal = signal<FirebaseService | null>(null);
  private readonly appointmentsSignal = signal<Booking[]>([]);
  private readonly viewModeSignal = signal<'week' | 'month'>('week');

  private readonly showBookingPopupSignal = signal<boolean>(false);

  private readonly bookingDetailsSignal = signal<BookingDetails>({
    date: '',
    time: '',
    clientName: '',
    email: '',
  });
  private readonly showLoginPromptSignal = signal<boolean>(false);

  // Public computed signals
  readonly selectedDate = computed(() => this.selectedDateSignal());
  readonly selectedService = computed(() => this.selectedServiceSignal() || undefined);
  readonly appointments = computed(() => this.appointmentsSignal());
  readonly viewMode = computed(() => this.viewModeSignal());

  readonly showBookingPopup = computed(() => this.showBookingPopupSignal());

  readonly bookingDetails = computed(() => this.bookingDetailsSignal());
  readonly showLoginPrompt = computed(() => this.showLoginPromptSignal());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isAdmin = computed(() => this.roleService.isAdmin());

  // Business configuration
  readonly businessHours = computed(() => this.businessSettingsService.getBusinessHoursString());
  readonly lunchBreak = computed(() => this.businessSettingsService.getLunchBreak());
  readonly businessDays = computed(() => this.businessSettingsService.getWorkingDays());
  readonly slotDuration = computed(() => this.businessSettingsService.getAppointmentDuration());

  // Available services
  readonly availableServices = computed(() => this.firebaseServicesService.activeServices());

  // Week days computation
  readonly weekDays = computed(() => {
    const currentDate = this.selectedDate() || new Date();
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  });

  // Month days computation
  readonly monthDays = computed(() => {
    const currentDate = this.selectedDate() || new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Find the first business day of the week that contains the month start
    // If month starts on Sunday and business days are Mon-Sat, we need to go back to Monday
    const firstBusinessDayOfWeek = this.getFirstBusinessDayOfWeek(monthStart);

    // Find the last business day of the week that contains the month end
    // If month ends on Saturday and business days are Mon-Sat, we need to go forward to Saturday
    const lastBusinessDayOfWeek = this.getLastBusinessDayOfWeek(monthEnd);

    return eachDayOfInterval({ start: firstBusinessDayOfWeek, end: lastBusinessDayOfWeek });
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
    return this.daySlots().find(daySlot => isSameDay(daySlot.date, selectedDate));
  });

  readonly isSelectedDayFullyBooked = computed(() => {
    const daySlots = this.selectedDaySlots();
    if (!daySlots) return false;

    // Check if all time slots are occupied
    const availableSlots = daySlots.timeSlots.filter(slot => slot.available);
    return availableSlots.length === 0 && daySlots.timeSlots.length > 0;
  });

  constructor() {
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
  }

  private async loadServices() {
    try {
      await this.firebaseServicesService.loadServices();
      // Don't auto-select any service - let user choose
    } catch (error) {
      console.error('Error loading services:', error);
      // Don't show toast for loading errors - they're not user-initiated actions
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

    const startHour = parseInt(businessHours.start.split(':')[0]);
    const endHour = parseInt(businessHours.end.split(':')[0]);
    const now = new Date();
    const isToday = isSameDay(date, now);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);

        // Skip disabled time slots (lunch break, etc.)
        if (!this.isTimeSlotEnabled(hour, minute)) {
          continue;
        }

        // Skip past hours (only for today)
        if (isToday && slotDate <= now) {
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
          clientName: booking?.nom || booking?.clientName,
          serviceName: booking?.serviceName || booking?.servei,
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
    const timeString = format(date, 'HH:mm');
    const dateString = format(date, 'yyyy-MM-dd');

    return bookings.some(booking => {
      // Check if booking is confirmed and matches the date and time
      return (
        booking.status === 'confirmed' && booking.data === dateString && booking.hora === timeString
      );
    });
  }

  private getBookingForSlot(date: Date, time: string): Booking | undefined {
    const dateString = format(date, 'yyyy-MM-dd');
    const bookings = this.bookingService.bookings();

    return bookings.find(booking => {
      // Check if booking is confirmed and matches the date and time
      return booking.status === 'confirmed' && booking.data === dateString && booking.hora === time;
    });
  }

  private getServiceIcon(serviceId?: string): string {
    if (!serviceId) return '🔧';
    const service = this.firebaseServicesService.services().find(s => s.id === serviceId);
    return service?.icon || '🔧';
  }

  private isTimeSlotEnabled(hour: number, _minute: number): boolean {
    // Check lunch break
    const lunchBreak = this.lunchBreak();
    const lunchStart = parseInt(lunchBreak.start.split(':')[0]);
    const lunchEnd = parseInt(lunchBreak.end.split(':')[0]);

    if (hour >= lunchStart && hour < lunchEnd) {
      return false;
    }

    // Add more disabled time slots here if needed
    // Example: if (hour === 12 && minute === 0) return false; // Disable 12:00

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

    const startHour = parseInt(businessHours.start.split(':')[0]);
    const endHour = parseInt(businessHours.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        if (this.isTimeSlotEnabled(hour, minute)) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
    }

    return slots;
  }

  onDateSelected(date: Date) {
    this.selectedDateSignal.set(date);

    // Check if the selected day is fully booked and show toast
    const daySlots = this.daySlots().find(daySlot => isSameDay(daySlot.date, date));
    if (daySlots && daySlots.timeSlots.length > 0) {
      const availableSlots = daySlots.timeSlots.filter(slot => slot.available);
      if (availableSlots.length === 0) {
        this.toastService.showWarning(
          'Totes les hores estan ocupades',
          'Aquest dia no té cap hora disponible per reservar.'
        );
      }
    }
  }

  selectServiceFromList(service: FirebaseService) {
    this.selectedServiceSignal.set(service);
  }

  // View mode methods
  toggleViewMode() {
    const newMode = this.viewMode() === 'week' ? 'month' : 'week';
    this.viewModeSignal.set(newMode);
  }

  canGoToPreviousPeriod(): boolean {
    const currentDate = this.selectedDate() || new Date();
    const today = new Date();

    if (this.viewMode() === 'week') {
      // Check if the previous week would be before today
      const previousWeekStart = addDays(currentDate, -7);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return previousWeekStart >= todayStart;
    } else {
      // Check if the previous month would be before current month
      const previousMonth = subMonths(currentDate, 1);
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return previousMonth >= currentMonth;
    }
  }

  previousPeriod() {
    if (!this.canGoToPreviousPeriod()) {
      return; // Don't navigate if it would go to past periods
    }

    const currentDate = this.selectedDate() || new Date();
    if (this.viewMode() === 'week') {
      const newDate = addDays(currentDate, -7);
      this.selectedDateSignal.set(newDate);
    } else {
      const newDate = subMonths(currentDate, 1);
      this.selectedDateSignal.set(newDate);
    }
  }

  nextPeriod() {
    const currentDate = this.selectedDate() || new Date();
    if (this.viewMode() === 'week') {
      const newDate = addDays(currentDate, 7);
      this.selectedDateSignal.set(newDate);
    } else {
      const newDate = addMonths(currentDate, 1);
      this.selectedDateSignal.set(newDate);
    }
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

        // Refresh appointments to show the new booking
        await this.loadAppointments();

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('bookingUpdated'));
      }

      this.showBookingPopupSignal.set(false);
      this.bookingDetailsSignal.set({ date: '', time: '', clientName: '', email: '' });
    } catch (error) {
      console.error('Error creating booking:', error);
      // Don't show toast - the booking service already handles success/error toasts
    }
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

  // Navigation
  goToPreviousWeek() {
    const currentDate = this.selectedDate() || new Date();
    const newDate = addDays(currentDate, -7);
    this.selectedDateSignal.set(newDate);
  }

  goToNextWeek() {
    const currentDate = this.selectedDate() || new Date();
    const newDate = addDays(currentDate, 7);
    this.selectedDateSignal.set(newDate);
  }

  goToToday() {
    this.selectedDateSignal.set(new Date());
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

    // Go directly to booking confirmation popup
    const bookingDetails: BookingDetails = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: timeSlot.time,
      clientName: this.isAuthenticated() ? this.authService.userDisplayName() || '' : '',
      email: this.isAuthenticated() ? this.authService.user()?.email || '' : '',
      service: this.selectedService() || undefined,
    };

    this.bookingDetailsSignal.set(bookingDetails);
    this.showBookingPopupSignal.set(true);
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

  formatMonth(date: Date): string {
    return format(date, 'MMMM yyyy', { locale: ca });
  }

  // State check methods
  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  isSelected(date: Date): boolean {
    const selectedDate = this.selectedDate();
    return selectedDate ? isSameDay(date, selectedDate) : false;
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
    const currentDate = this.selectedDate() || new Date();
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
      const currentDate = this.selectedDate() || new Date();
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
    return addDays(new Date(), 1);
  }

  selectToday() {
    const today = new Date();
    if (this.canSelectDate(today)) {
      this.selectedDateSignal.set(today);
    }
  }

  selectTomorrow() {
    const tomorrow = this.getTomorrow();
    if (this.canSelectDate(tomorrow)) {
      this.selectedDateSignal.set(tomorrow);
    }
  }

  nextAvailableDate(): Date | null {
    // Check next 30 days for available dates
    for (let i = 0; i < 30; i++) {
      const date = addDays(new Date(), i);
      console.log(`Checking date ${i}: ${format(date, 'yyyy-MM-dd')} (day ${date.getDay()})`);

      if (this.canSelectDate(date)) {
        console.log(`Date ${format(date, 'yyyy-MM-dd')} is selectable`);
        // Generate time slots for this specific date
        const timeSlots = this.generateTimeSlots(date);
        console.log(`Generated ${timeSlots.length} time slots for ${format(date, 'yyyy-MM-dd')}`);

        const availableSlots = timeSlots.filter(slot => slot.available);
        console.log(`Available slots: ${availableSlots.length}`);

        if (availableSlots.length > 0) {
          console.log(`Found available date: ${format(date, 'yyyy-MM-dd')}`);
          return date;
        }
      } else {
        console.log(`Date ${format(date, 'yyyy-MM-dd')} is not selectable`);
      }
    }
    console.log('No available dates found in next 30 days');
    return null;
  }

  selectNextAvailable() {
    const nextAvailable = this.nextAvailableDate();
    if (nextAvailable) {
      this.selectedDateSignal.set(nextAvailable);
      // Show a toast to inform the user about the selected date
      this.toastService.showInfo(
        'Data seleccionada',
        `S'ha seleccionat la propera data disponible: ${this.formatDay(nextAvailable)}`
      );
    } else {
      // Show a message if no available dates found
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
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    // Find the first business day in the week
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      if (this.businessDays().includes(day.getDay())) {
        return day;
      }
    }
    return weekStart; // Fallback
  }

  private getLastBusinessDayOfWeek(date: Date): Date {
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    // Find the last business day in the week
    for (let i = 6; i >= 0; i--) {
      const day = addDays(weekEnd, -i);
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
}
