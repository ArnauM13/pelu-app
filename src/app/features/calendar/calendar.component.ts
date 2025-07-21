import { Component, input, output, computed, signal, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule, CalendarView, CalendarUtils, DateAdapter, CalendarA11y } from 'angular-calendar';
import { startOfWeek, endOfWeek, format as dateFnsFormat, isSameDay, addMinutes } from 'date-fns';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ca } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentDetailPopupComponent } from '../../shared/components/appointment-detail-popup/appointment-detail-popup.component';
import { AppointmentSlotComponent, AppointmentSlotData } from './appointment-slot.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { AuthService } from '../../core/auth/auth.service';
import { BookingService, Booking } from '../../core/services/booking.service';
import { RoleService } from '../../core/services/role.service';
import { CalendarCoreService } from './calendar-core.service';
import { CalendarBusinessService } from './calendar-business.service';
import { CalendarStateService } from './calendar-state.service';
import { ServiceColorsService } from '../../core/services/service-colors.service';
import { CalendarHeaderComponent } from './header/calendar-header.component';
import { Router } from '@angular/router';
import { migrateOldAppointments, needsMigration, saveMigratedAppointments } from '../../shared/services';

// Interface for appointment with duration
export interface AppointmentEvent {
  id?: string;
  title: string;
  start: string;
  end?: string; // New: explicit end time
  duration?: number; // in minutes, default 60 if not specified
  serviceName?: string;
  clientName?: string;
  isPublicBooking?: boolean;
  isOwnBooking?: boolean;
  canDrag?: boolean;
  canViewDetails?: boolean;
}

@Component({
  selector: 'pelu-calendar-component',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule, TranslateModule, AppointmentDetailPopupComponent, AppointmentSlotComponent, CalendarHeaderComponent, LoaderComponent],
  providers: [
    CalendarUtils,
    CalendarA11y,
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  // Inject services
  private readonly authService = inject(AuthService);
  private readonly appointmentService = inject(BookingService);
  private readonly roleService = inject(RoleService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  readonly calendarCoreService = inject(CalendarCoreService);
  private readonly businessService = inject(CalendarBusinessService);
  private readonly stateService = inject(CalendarStateService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Input signals
  readonly mini = input<boolean>(false);
  readonly events = input<AppointmentEvent[]>([]);

  // Output signals
  readonly dateSelected = output<{date: string, time: string}>();
  readonly onEditAppointment = output<AppointmentEvent>();
  readonly onDeleteAppointment = output<AppointmentEvent>();

  // Public computed signals from state service
  readonly viewDate = this.stateService.viewDate;
  readonly selectedDay = this.stateService.selectedDay;
  readonly showDetailPopup = this.stateService.showDetailPopup;
  readonly selectedAppointment = this.stateService.selectedAppointment;
  readonly appointments = this.appointmentService.bookings;
  readonly isLoading = this.appointmentService.isLoading;
  private readonly isInitializedSignal = signal<boolean>(false);
  private readonly calendarMountedSignal = signal<boolean>(false);
  readonly isBookingsLoaded = computed(() =>
    (this.appointmentService.hasCachedData() || !this.isLoading()) &&
    this.isInitializedSignal() &&
    this.calendarMountedSignal()
  );

  // Constants
  readonly view: CalendarView = CalendarView.Week;
  readonly businessHours = this.businessService.getBusinessConfig().hours;
  readonly lunchBreak = this.businessService.getBusinessConfig().lunchBreak;
  readonly businessDays = this.businessService.getBusinessConfig().days;
  readonly SLOT_DURATION_MINUTES = this.calendarCoreService.gridConfiguration().slotDurationMinutes;
  readonly PIXELS_PER_MINUTE = this.calendarCoreService.gridConfiguration().pixelsPerMinute;
  readonly SLOT_HEIGHT_PX = this.calendarCoreService.gridConfiguration().slotHeightPx;

  // Computed events that combines input events with Firebase bookings
  readonly allEvents = computed((): AppointmentEvent[] => {
    // Use provided events or load from appointments signal
    const providedEvents = this.events();
    if (providedEvents.length > 0) {
      // Ensure all provided events have unique IDs
      return providedEvents.map(event => ({
        ...event,
        id: event.id || uuidv4() // Generate unique ID if not exists
      }));
    }

    // Use appointments from signal - ensure it's always an array
    const appointments = this.appointments() || [];
    const currentUser = this.authService.user();
    const isAdmin = this.roleService.isAdmin();

    const events = appointments.map(c => {
      // Ensure proper date and time formatting
      const date = c.data || '';
      const time = c.hora || '00:00';
      const duration = c.duration || 60;

      // Create proper ISO string for start with local timezone
      const startString = `${date}T${time}:00`;

      // Calculate end time based on duration
      const startDate = new Date(startString);
      const endDate = addMinutes(startDate, duration);

      // Format dates in local timezone to avoid UTC conversion issues
      const formatLocalDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const endString = formatLocalDateTime(endDate);

      // Check if this is a public booking (not owned by current user)
      const isOwnBooking = !!(currentUser?.uid && c.uid === currentUser.uid);
      const isPublicBooking = !isAdmin && !isOwnBooking && c.nom === 'Ocupat';

      return {
        id: c.id || uuidv4(), // Generate unique ID if not exists
        title: isPublicBooking ? this.translateService.instant('COMMON.STATUS.RESERVED') : (c.nom || 'Client'),
        start: startString,
        end: endString,
        duration: duration,
        serviceName: c.serviceName || c.servei || '',
        clientName: c.nom || 'Client',
        isPublicBooking: isPublicBooking,
        isOwnBooking: isOwnBooking,
        canDrag: isAdmin || isOwnBooking,
        canViewDetails: isAdmin || isOwnBooking
      };
    });

    return events.map(event => ({
      ...event,
      title: event.title || 'Client',
      serviceName: event.serviceName || '',
      clientName: event.clientName || 'Client'
    }));
  });

  // ✅ Generate 30-minute time slots from 08:00 to 20:00
  readonly timeSlots = computed(() => {
    return this.businessService.generateTimeSlots();
  });

  // Computed properties
  readonly weekDays = computed(() => {
    const allBusinessDays = this.businessService.getBusinessDaysForWeek(this.viewDate());

    // Filter out days that have no available time slots
    return allBusinessDays.filter(day => {
      // Always show past days (they might have appointments to view)
      if (this.isPastDate(day)) {
        return true;
      }

      // Check if the day has any available time slots
      return this.businessService.hasAvailableTimeSlots(day, this.allEvents());
    });
  });

  readonly calendarEvents = computed(() => {
    return this.allEvents().map(event => {
      const startDate = new Date(event.start);
      const endDate = event.end ? new Date(event.end) : addMinutes(startDate, event.duration || 60);

      return {
      title: event.title,
        start: startDate,
        end: endDate,
      color: {
        primary: '#3b82f6',
        secondary: '#dbeafe'
      },
      meta: event
      };
    });
  });

  // Computed appointment positions - this is now stable and won't cause ExpressionChangedAfterItHasBeenCheckedError
  readonly appointmentPositions = computed(() => {
    const appointments = this.allEvents();
    return this.calendarCoreService.getAppointmentPositions(appointments);
  });

  constructor(private serviceColorsService: ServiceColorsService) {
    // Initialize coordinate service with business configuration
    this.initializeCoordinateService();

    // Load bookings when component initializes (with cache support)
    this.loadBookingsWithLoader();

    // Listen for custom appointment update events - silent refresh
    window.addEventListener('appointmentUpdated', () => {
      this.appointmentService.silentRefreshBookings();
    });

    // Listen for custom appointment delete events - silent refresh
    window.addEventListener('appointmentDeleted', () => {
      this.appointmentService.silentRefreshBookings();
    });

    // Listen for custom appointment created events - silent refresh
    window.addEventListener('appointmentCreated', () => {
      this.reloadAppointments();
    });

    // Mark calendar as mounted after a delay to ensure complete rendering
    setTimeout(() => {
      if (this.isInitializedSignal()) {
        this.calendarMountedSignal.set(true);
        this.cdr.detectChanges();
      }
    }, 800);

    // Set up a periodic check for localStorage changes (fallback)
    // Removed localStorage checking - now using Firebase
  }

  // Removed localStorage methods - now using Firebase via AppointmentService

  // Methods that delegate to services
  isTimeSlotAvailable(date: Date, time: string, requestedDuration: number = this.SLOT_DURATION_MINUTES): boolean {
    const events = this.allEvents();
    return this.calendarCoreService.isTimeSlotAvailable(date, time, events, requestedDuration);
  }

  getEventsForDay(date: Date) {
    return this.calendarEvents().filter(event => isSameDay(event.start, date));
  }

  getAppointmentsForDay(date: Date) {
    return this.businessService.getAppointmentsForDay(date, this.allEvents());
  }

    openAppointmentPopup(appointmentEvent: AppointmentEvent) {
    // Convert AppointmentEvent to the format expected by the popup
    const originalAppointment = this.findOriginalAppointment(appointmentEvent);

    if (originalAppointment) {
      // Use the original appointment data which has the correct format
      // Assegurem-nos que té l'userId correcte
      const currentUser = this.authService.user();
      if (currentUser?.uid && !originalAppointment.userId) {
        originalAppointment.userId = currentUser.uid;
      }
      this.stateService.openAppointmentDetail(originalAppointment);
    } else {
      // Fallback: convert AppointmentEvent to the expected format
      const currentUser = this.authService.user();

      // Generate a unique ID if not available
      const appointmentId = appointmentEvent.id || uuidv4();

      const convertedAppointment = {
        id: appointmentId,
        nom: appointmentEvent.title || appointmentEvent.clientName || '',
        data: appointmentEvent.start ? appointmentEvent.start.split('T')[0] : '',
        hora: appointmentEvent.start ? appointmentEvent.start.split('T')[1]?.substring(0, 5) : '',
        duration: appointmentEvent.duration || 60,
        serviceName: appointmentEvent.serviceName || '',
        servei: appointmentEvent.serviceName || '',
        notes: '',
        preu: 0,
        userId: currentUser?.uid || '',
        serviceId: ''
      };

      // Removed localStorage saving - now using Firebase

      this.stateService.openAppointmentDetail(convertedAppointment);
    }
  }

  // Removed localStorage saving - now using Firebase

  isLunchBreak(time: string): boolean {
    return this.calendarCoreService.isLunchBreak(time);
  }

  isTimeSlotBlocked(time: string): boolean {
    return this.businessService.isLunchBreak(time) || !this.businessService.isTimeSlotBookable(time);
  }

  getAppointmentForTimeSlot(date: Date, time: string) {
    const appointments = this.getAppointmentsForDay(date);
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);

    return appointments.find(appointment => {
      if (!appointment.start) return false;
      const appointmentStart = new Date(appointment.start);
      const appointmentEnd = appointment.end ? new Date(appointment.end) : addMinutes(appointmentStart, appointment.duration || 60);
      return appointmentStart <= slotTime && slotTime < appointmentEnd;
    });
  }

  findOriginalAppointment(appointmentEvent: AppointmentEvent) {
    const appointments = this.appointments();

    // First try to find by ID if available
    if (appointmentEvent.id) {
      const foundById = appointments.find(app => app.id === appointmentEvent.id);
      if (foundById) {
        return foundById;
      }
    }

    // Then try to find by date, time and title
    return appointments.find(app => {
      if (!app.data || !appointmentEvent.start) return false;

      const appDate = app.data;
      const eventDate = appointmentEvent.start.split('T')[0];
      const eventTime = appointmentEvent.start.split('T')[1]?.substring(0, 5);

      // Match by date and time
      const dateMatches = appDate === eventDate;
      const timeMatches = app.hora === eventTime;

      // Also try to match by title/nom
      const titleMatches = app.nom === appointmentEvent.title || app.nom === appointmentEvent.clientName;

      return dateMatches && timeMatches && titleMatches;
    });
  }

  getAppointmentDisplayInfo(date: Date, time: string) {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return null;

    return {
      title: appointment.title,
      serviceName: appointment.serviceName,
      duration: appointment.duration || 60
    };
  }

  getAppointmentSlotCoverage(date: Date, time: string): number {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return 0;

    const [hour, minute] = time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);

    const appointmentStart = new Date(appointment.start);
    const appointmentEnd = appointment.end ? new Date(appointment.end) : addMinutes(appointmentStart, appointment.duration || 60);

    const slotEnd = addMinutes(slotStart, this.SLOT_DURATION_MINUTES);

    const overlapStart = appointmentStart > slotStart ? appointmentStart : slotStart;
    const overlapEnd = appointmentEnd < slotEnd ? appointmentEnd : slotEnd;

    if (overlapStart >= overlapEnd) return 0;

    const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
    return (overlapMinutes / this.SLOT_DURATION_MINUTES) * 100;
  }

  shouldShowAppointmentInfo(date: Date, time: string): boolean {
    const coverage = this.getAppointmentSlotCoverage(date, time);
    return coverage > 50; // Show info if more than 50% of slot is covered
  }

  isAppointmentStart(date: Date, time: string): boolean {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment || !appointment.start) return false;

    const appointmentStart = new Date(appointment.start);
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);

    return Math.abs(appointmentStart.getTime() - slotTime.getTime()) < 60000; // Within 1 minute
  }

  isWithinAppointment(date: Date, time: string): boolean {
    return this.getAppointmentForTimeSlot(date, time) !== undefined;
  }

  selectDay(date: Date) {
    this.stateService.setSelectedDay(date);
  }

  selectTimeSlot(date: Date, time: string) {
    // Prevent selection of past dates and time slots
    if (this.isPastDate(date) || this.isPastTimeSlot(date, time)) {
      return;
    }

    if (!this.isTimeSlotAvailable(date, time)) {
      return;
    }

    const dateString = dateFnsFormat(date, 'yyyy-MM-dd');
    this.dateSelected.emit({ date: dateString, time: time });
  }

      onTimeSlotClick(date: Date, time: string) {
    // Prevent selection of past dates and time slots
    if (this.isPastDate(date) || this.isPastTimeSlot(date, time)) {
      return;
    }

    // Prevent selection of blocked time slots
    if (this.isTimeSlotBlocked(time)) {
      return;
    }

    // Check if slot is available
    if (!this.isTimeSlotAvailable(date, time)) {
      return;
    }

    // Emit the selection
    const dateString = dateFnsFormat(date, 'yyyy-MM-dd');
    this.dateSelected.emit({ date: dateString, time: time });
  }

  isDaySelected(date: Date): boolean {
    const selectedDay = this.selectedDay();
    return selectedDay ? isSameDay(date, selectedDay) : false;
  }

  canNavigateToPreviousWeek(): boolean {
    return this.businessService.canNavigateToPreviousWeek(this.viewDate(), this.allEvents());
  }

  getViewDateInfo(): string {
    const viewDate = this.viewDate();
    const start = startOfWeek(viewDate, { weekStartsOn: 1 });
    const end = endOfWeek(viewDate, { weekStartsOn: 1 });
    return `${dateFnsFormat(start, 'dd/MM')} - ${dateFnsFormat(end, 'dd/MM')}`;
  }

  isBusinessDay(dayOfWeek: number): boolean {
    return this.businessService.isBusinessDay(dayOfWeek);
  }

  getBusinessDaysInfo(): string {
    return this.businessService.getBusinessDaysInfo();
  }

  getEventForTimeSlot(date: Date, time: string) {
    return this.getAppointmentForTimeSlot(date, time);
  }

  previousWeek() {
    this.stateService.previousWeek();
  }

  nextWeek() {
    this.stateService.nextWeek();
  }

  today() {
    this.stateService.today();
  }

  formatPopupDate(dateString: string): string {
    const date = new Date(dateString);
    // Always show day of week and date, never "Demà" or "Avui"
    return dateFnsFormat(date, 'EEEE dd/MM', { locale: ca });
  }

  format(date: Date, formatString: string): string {
    return dateFnsFormat(date, formatString, { locale: ca });
  }

  isPastDate(date: Date): boolean {
    return this.businessService.isPastDate(date);
  }

  isPastTimeSlot(date: Date, time: string): boolean {
    return this.businessService.isPastTimeSlot(date, time);
  }

  getDayName(date: Date): string {
    return dateFnsFormat(date, 'EEEE', { locale: ca });
  }

  getEventTime(startString: string): string {
    const date = new Date(startString);
    // Use local timezone formatting to avoid UTC conversion issues
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getTimeSlotTooltip(date: Date, time: string): string {
    if (this.isPastDate(date)) {
      return this.translateService.instant('COMMON.PAST_DATE');
    }

    if (this.isPastTimeSlot(date, time)) {
      return this.translateService.instant('COMMON.PAST_TIME');
    }

    if (this.isTimeSlotBlocked(time)) {
      return 'Pausa per dinar';
    }

    if (this.isTimeSlotAvailable(date, time)) {
      return 'Disponible';
    }

    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (appointment) {
      return `${appointment.title} - ${appointment.serviceName || ''}`;
    }

    return 'No disponible';
  }

  onAppointmentDetailPopupClosed() {
    this.stateService.closeAppointmentDetail();
  }

  onAppointmentDeleted(appointment: any) {
    console.log('Appointment deleted:', appointment);

    // Remove the appointment from the state
    this.stateService.removeAppointment(appointment.id);

    // Close the popup immediately
    this.stateService.closeAppointmentDetail();

    // Silently refresh appointments without showing loader
    this.appointmentService.silentRefreshBookings();

    // Emit the delete event to parent if needed
    this.onDeleteAppointment.emit(appointment);
  }

  onAppointmentEditRequested(appointment: any) {
    const currentUser = this.authService.user();
    if (!currentUser?.uid) {
      console.warn('No user found');
      return;
    }

    // All appointments are now bookings, so use the direct ID with token
    if (appointment.editToken) {
      this.router.navigate(['/appointments', appointment.id], {
        queryParams: {
          token: appointment.editToken,
          edit: 'true'
        }
      });
    } else {
      // Fallback for appointments without editToken (shouldn't happen)
      const clientId = currentUser.uid;
      const uniqueId = `${clientId}-${appointment.id}`;
      this.router.navigate(['/appointments', uniqueId], { queryParams: { edit: 'true' } });
    }

    // Close the popup
    this.stateService.closeAppointmentDetail();
  }

  isLunchBreakStart(time: string): boolean {
    return this.businessService.isLunchBreakStart(time);
  }

  reloadAppointments() {
    // Silently refresh appointments without showing loader
    this.appointmentService.silentRefreshBookings();
  }

  private async loadBookingsWithLoader(): Promise<void> {
    try {
      // Check if we have cached data
      if (this.appointmentService.hasCachedData()) {
        // Use cached data - no loader needed
        this.isInitializedSignal.set(true);
        this.calendarMountedSignal.set(true);
        return;
      }

      // Ensure loader is shown only for first load
      this.isInitializedSignal.set(false);
      this.calendarMountedSignal.set(false);

      // Load bookings with cache support
      await this.appointmentService.getBookingsWithCache();

      // Mark as initialized after a small delay to ensure smooth transition
      setTimeout(() => {
        this.isInitializedSignal.set(true);

        // Wait for the next tick to ensure the calendar is rendered
        setTimeout(() => {
          this.calendarMountedSignal.set(true);
          this.cdr.detectChanges();
        }, 100);

        this.cdr.detectChanges();
      }, 500);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Still mark as initialized to show the calendar even if there's an error
      this.isInitializedSignal.set(true);
      this.calendarMountedSignal.set(true);
      this.cdr.detectChanges();
    }
  }

  // Removed localStorage change checking - now using Firebase

  onDateChange(dateString: string) {
    this.stateService.navigateToDate(dateString);
  }

  // Drag & Drop methods
  onDropZoneMouseEnter(event: MouseEvent, day: Date) {
    console.log('onDropZoneMouseEnter:', { isDragging: this.calendarCoreService.isDragging() });
    if (this.calendarCoreService.isDragging()) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      console.log('Mouse enter - relativeY:', relativeY);
      this.calendarCoreService.updateTargetDateTime({ top: relativeY, left: 0 }, day);
    }
  }

  onDropZoneMouseMove(event: MouseEvent, day: Date) {
    if (this.calendarCoreService.isDragging()) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      this.calendarCoreService.updateTargetDateTime({ top: relativeY, left: 0 }, day);
    }
  }

  async onDropZoneDrop(event: DragEvent, day: Date) {
    event.preventDefault();

    // Update the target date and time one final time before ending drag
    if (this.calendarCoreService.isDragging()) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      this.calendarCoreService.updateTargetDateTime({ top: relativeY, left: 0 }, day);
    }

    const success = await this.calendarCoreService.endDrag();

    if (success) {
      // Appointment was successfully moved - silent refresh
      this.reloadAppointments();
    }
  }

  onDropZoneDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Helper method to compare dates
  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
  }

  // Create appointment slot data for the new component
  createAppointmentSlotData(appointment: AppointmentEvent, date: Date): AppointmentSlotData {
    return {
      appointment,
      date
    };
  }

  // Get service CSS class for drag preview
  getServiceCssClass(appointment: AppointmentEvent): string {
    const serviceName = appointment.serviceName || '';
    return this.serviceColorsService.getServiceCssClass(serviceName);
  }

  // Format duration for display
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}min`;
      }
    }
  }

  private convertToCalendarEvent(appointment: any): AppointmentEvent {
    if (appointment.originalAppointment) {
      return appointment.originalAppointment;
    } else {
      return appointment;
    }
  }

      /**
   * Initialize the calendar core service with business configuration
   */
  private initializeCoordinateService(): void {
    console.log('Initializing calendar core service...');
    const businessConfig = this.businessService.getBusinessConfig();
    console.log('Business config:', businessConfig);

    this.calendarCoreService.updateGridConfiguration({
      slotHeightPx: 30,
      pixelsPerMinute: 1,
      slotDurationMinutes: 30,
      businessStartHour: businessConfig.hours.start,
      businessEndHour: businessConfig.hours.end,
      lunchBreakStart: businessConfig.lunchBreak.start,
      lunchBreakEnd: businessConfig.lunchBreak.end
    });

    console.log('Calendar core service initialized with config:', this.calendarCoreService.gridConfiguration());
  }
}
