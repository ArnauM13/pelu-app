import {
  Component,
  input,
  output,
  computed,
  signal,
  inject,
  ChangeDetectionStrategy,
  effect,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CalendarModule,
  CalendarView,
  CalendarUtils,
  DateAdapter,
  CalendarA11y,
} from 'angular-calendar';
import { startOfWeek, endOfWeek, format as dateFnsFormat, isSameDay, addMinutes } from 'date-fns';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ca } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentDetailPopupComponent } from '../../../shared/components/appointment-detail-popup/appointment-detail-popup.component';
import { AppointmentSlotData } from '../slots/appointment-slot.component';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import { UserService } from '../../../core/services/user.service';
import { CalendarCoreService } from '../services/calendar-core.service';
import { CalendarBusinessService } from '../services/calendar-business.service';
import { CalendarStateService } from '../services/calendar-state.service';
import { ServicesService } from '../../../core/services/services.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  CalendarLoaderComponent,
  CalendarTimeColumnComponent,
  CalendarDayColumnComponent,
  CalendarDragPreviewComponent,
  TimeSlot,
  DayColumnData,
  DragPreviewData,
} from '../components';
import {
  LunchBreakData,
} from '../components/calendar-lunch-break/calendar-lunch-break.component';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { Service } from '../../../core/services/services.service';
import { TimeUtils } from '../../../shared/utils/time.utils';

// Interface for appointment with duration
export interface AppointmentEvent {
  id?: string;
  title: string;
  start: string;
  end?: string; // New: explicit end time
  duration?: number; // in minutes, default 60 if not specified
  serviceName?: string;
  clientName?: string;
  uid?: string; // User ID who owns this appointment
  isOwnBooking?: boolean;
  canDrag?: boolean;
  canViewDetails?: boolean;
}

@Component({
  selector: 'pelu-calendar-component',
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    TranslateModule,
    AppointmentDetailPopupComponent,
    CalendarLoaderComponent,
    CalendarTimeColumnComponent,
    CalendarDayColumnComponent,
    CalendarDragPreviewComponent,
    ButtonComponent,
  ],
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
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  // Inject services
  private readonly authService = inject(AuthService);
  private readonly appointmentService = inject(BookingService);
  private readonly userService = inject(UserService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  readonly calendarCoreService = inject(CalendarCoreService);
  private readonly timeUtils = inject(TimeUtils);
  private readonly stateService   = inject(CalendarStateService);
  private readonly businessService = inject(CalendarBusinessService);
  private readonly servicesService = inject(ServicesService);
  private readonly toastService = inject(ToastService);
  private readonly injector = inject(Injector);

  // Service data for popup - now using cached services
  private loadedService = signal<Service | null>(null);
  readonly service = computed(() => this.loadedService());

  // Input signals
  readonly mini = input<boolean>(false);
  readonly events = input<AppointmentEvent[]>([]);

  // Output signals
  readonly dateSelected = output<{ date: string; time: string }>();
  readonly editAppointment = output<AppointmentEvent>();
  readonly deleteAppointment = output<AppointmentEvent>();
  readonly bookingsLoaded = output<boolean>();

  // Public computed signals from state service
  readonly viewDate = this.stateService.viewDate;
  readonly selectedDay = this.stateService.selectedDay;
  readonly showDetailPopup = this.stateService.showDetailPopup;
  readonly selectedAppointment = this.stateService.selectedAppointment;
  readonly appointments = this.appointmentService.bookings;
  readonly isLoading = this.appointmentService.isLoading;
  readonly isAdmin = this.userService.isAdmin;
  private readonly isInitializedSignal = signal<boolean>(false);
  private readonly calendarMountedSignal = signal<boolean>(false);
  readonly isBookingsLoaded = computed(
    () =>
      (this.appointmentService.hasCachedData() || !this.isLoading()) &&
      this.isInitializedSignal() &&
      this.calendarMountedSignal()
  );

  // Date picker property
  readonly selectedDate = signal<Date | null>(null);

  // Today's date as a computed signal to avoid creating new instances
  readonly todayDate = computed(() => {
    const today = new Date();
    // Set time to start of day for consistent comparison
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Constants
  readonly view: CalendarView = CalendarView.Week;

  // Reactive business configuration - will update automatically when parameters change
  readonly businessHours = computed(() => this.businessService.getBusinessConfig().hours);
  readonly lunchBreak = computed(() => this.businessService.getBusinessConfig().lunchBreak);
  readonly businessDays = computed(() => this.businessService.getBusinessConfig().days);

  // Dynamic slot configuration based on booking duration
  readonly SLOT_DURATION_MINUTES = computed(() => this.calendarCoreService.reactiveSlotDuration());
  readonly PIXELS_PER_MINUTE = computed(() => this.calendarCoreService.reactivePixelsPerMinute());
  readonly SLOT_HEIGHT_PX = computed(() => this.calendarCoreService.reactiveSlotHeight());

  // Calculate number of slots based on business hours and slot duration
  readonly SLOT_COUNT = computed(() => {
    const businessHours = this.businessHours();
    const slotDuration = this.calendarCoreService.reactiveSlotDuration();
    const totalMinutes = (businessHours.end - businessHours.start) * 60;
    return Math.ceil(totalMinutes / slotDuration);
  });

  // Computed events that combines input events with Firebase bookings - SIMPLIFIED
  readonly allEvents = computed((): AppointmentEvent[] => {
    // Use provided events or load from appointments signal
    const providedEvents = this.events();
    if (providedEvents.length > 0) {
      return providedEvents.map(event => ({
        ...event,
        id: event.id || uuidv4(),
      }));
    }

    // Use appointments from signal
    const appointments = this.appointments() || [];
    const currentUser = this.authService.user();
    const allServices = this.servicesService.getAllServices();

    return appointments.map(booking => {
      // Get service information
      const service = booking.serviceId ? allServices.find(s => s.id === booking.serviceId) : null;
      const serviceName = service?.name || '';
      const serviceDuration = service?.duration || 60;

      // Create date strings
      const date = booking.data || '';
      const time = booking.hora || '00:00';
      const startString = `${date}T${time}:00`;

      const startDate = new Date(startString);
      const endDate = addMinutes(startDate, serviceDuration);
      const endString = this.formatLocalDateTime(endDate);

            // Determine permissions
      const isOwnBooking = !!(currentUser?.email && booking.email === currentUser.email);
      const isAdmin = this.isAdmin();

      // Check if the booking is in the past
      const bookingDate = new Date(startString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPastBooking = bookingDate < today;

      // Admin can see all details and manage all bookings (including past ones)
      // Non-admin can only see and manage their own bookings, but not past ones
      const canDrag = isAdmin || (isOwnBooking && !isPastBooking);
      const canViewDetails = isAdmin || isOwnBooking;

      // Admin can see all client names, non-admin only sees their own or "Reservada" for others
      const title = isAdmin ? booking.clientName : (isOwnBooking ? booking.clientName : this.translateService.instant('COMMON.STATUS.RESERVED'));

      return {
        id: booking.id || uuidv4(),
        title: title || 'Client',
        start: startString,
        end: endString,
        duration: serviceDuration,
        serviceName: serviceName,
        clientName: booking.clientName || 'Client',
        uid: booking.email || '',
        isOwnBooking: isOwnBooking,
        canDrag: canDrag,
        canViewDetails: canViewDetails,
      };
    });
  });

  readonly timeSlots = computed(() => {
    return this.businessService.generateTimeSlots();
  });

  // Computed properties
  readonly weekDays = computed(() => {
    const startDate = this.viewDate();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const allBusinessDays = this.businessService.getBusinessDaysForWeek(startDate, endDate);

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
          secondary: '#dbeafe',
        },
        meta: event,
      };
    });
  });

  // Computed appointment positions - now reactive to booking duration
  readonly appointmentPositions = computed(() => {
    const appointments = this.allEvents();
    return this.calendarCoreService.getAppointmentPositions(appointments);
  });

  // Computed time slots for time column - reactive to slot duration
  readonly timeColumnSlots = computed((): TimeSlot[] => {
    return this.timeSlots().map(time => ({
      time,
      isBlocked: this.isLunchBreak(time),
      isDisabled: this.isLunchBreak(time),
    }));
  });

  // Computed day columns data - reactive to booking duration
  readonly dayColumnsData = computed((): DayColumnData[] => {
    return this.weekDays().map(day => {
      const timeSlots = this.timeSlots().map(time => ({
        date: day,
        time,
        isAvailable: this.isTimeSlotAvailable(day, time),
        isBooked:
          !this.isTimeSlotAvailable(day, time) &&
          !this.isLunchBreak(time) &&
          !this.isPastDate(day) &&
          !this.isPastTimeSlot(day, time),
        isLunchBreak: this.isLunchBreak(time),
        isPastDate: this.isPastDate(day),
        isPastTime: this.isPastTimeSlot(day, time),
        isClickable: this.isTimeSlotAvailable(day, time),
        isDisabled:
          this.isPastDate(day) || this.isPastTimeSlot(day, time) || this.isLunchBreak(time),
        tooltip: this.getTimeSlotTooltip(day, time),
      }));

      const dropIndicator =
        this.calendarCoreService.isDragging() &&
        this.calendarCoreService.targetDate() &&
        this.calendarCoreService.targetTime() &&
        this.calendarCoreService.draggedAppointment() &&
        this.isSameDay(day, this.calendarCoreService.targetDate()!)
          ? (() => {
              const position = this.calendarCoreService.calculateAppointmentPositionFromTime(
                this.calendarCoreService.targetTime()!,
                this.calendarCoreService.draggedAppointment()!.duration || this.calendarCoreService.reactiveBookingDuration()
              );

              return {
                top: position.top,
                height: position.height,
                isValid: this.calendarCoreService.isValidDrop(),
              };
            })()
          : null;

      // Calculate lunch break data
      const lunchBreakData = this.calculateLunchBreakData(day);

      return {
        date: day,
        dayName: this.getDayName(day),
        dayDate: this.format(day, 'dd/MM'),
        isPast: this.isPastDate(day),
        isDisabled: this.isPastDate(day),
        timeSlots,
        appointments: this.getAppointmentsForDay(day),
        dropIndicator,
        isDragOver: this.calendarCoreService.isDragging(),
        isDropValid:
          this.calendarCoreService.isDragging() && this.calendarCoreService.isValidDrop(),
        isDropInvalid:
          this.calendarCoreService.isDragging() && !this.calendarCoreService.isValidDrop(),
        lunchBreak: lunchBreakData,
      };
    });
  });

  // Computed drag preview data
  readonly dragPreviewData = computed((): DragPreviewData | null => {
    if (!this.calendarCoreService.isDragging() || !this.calendarCoreService.draggedAppointment()) {
      return null;
    }

    return {
      appointment: this.calendarCoreService.draggedAppointment()!,
      position: {
        left: this.calendarCoreService.currentPosition()?.left || 0,
        top: this.calendarCoreService.currentPosition()?.top || 0,
      },
      serviceCssClass: this.getServiceCssClass(this.calendarCoreService.draggedAppointment()!),
    };
  });

  constructor() {
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

    // Listen for service updates to refresh service colors
    window.addEventListener('serviceUpdated', () => {
      // Force a re-computation of allEvents to update service colors
      console.log('Service updated, refreshing calendar appointments');
    });

    // Listen for system parameters updates to refresh calendar configuration
    window.addEventListener('systemParametersUpdated', () => {
      console.log('System parameters updated, refreshing calendar configuration');
      // Force re-initialization of coordinate service with new business configuration
      this.initializeCoordinateService();

      // Force a complete calendar refresh
      setTimeout(() => {
        // Trigger change detection by updating a signal
        this.isInitializedSignal.update(() => true);
      }, 100);
    });

    // Mark calendar as mounted after a delay to ensure complete rendering
    if (this.isInitializedSignal()) {
      this.calendarMountedSignal.set(true);
    }

    // Effect to emit booking loaded state
    effect(() => {
      this.bookingsLoaded.emit(this.isBookingsLoaded());
    });

    // Effect to initialize and sync selectedDate with viewDate
    effect(() => {
      const currentViewDate = this.viewDate();
      if (currentViewDate && !this.selectedDate()) {
        this.selectedDate.set(currentViewDate);
      }
    });

        // Effect to reinitialize coordinate service when business parameters change
    effect(() => {
      // Access business parameters to trigger reactivity
      const _businessHours = this.businessHours();
      const _lunchBreak = this.lunchBreak();
      const _businessDays = this.businessDays();

      // Reinitialize coordinate service when parameters change
      this.initializeCoordinateService();

      // Force calendar refresh when business parameters change
      console.log('Business parameters changed, refreshing calendar...');

      // Force change detection by updating a signal
      this.isInitializedSignal.update(() => true);
    });
  }

  // Methods that delegate to services
  isTimeSlotAvailable(
    date: Date,
    time: string,
    requestedDuration: number = this.calendarCoreService.reactiveBookingDuration()
  ): boolean {
    const events = this.allEvents();
    return this.calendarCoreService.isTimeSlotAvailable(date, time, events, requestedDuration);
  }

  getEventsForDay(date: Date) {
    return this.calendarEvents().filter(event => isSameDay(event.start, date));
  }

  getAppointmentsForDay(date: Date) {
    return this.timeUtils.getAppointmentsForDay(date, this.allEvents());
  }

  openAppointmentPopup(appointmentEvent: AppointmentEvent) {
    // Check permissions before opening the popup
    const currentUser = this.authService.user();

    // If user is not admin, check if they can view this appointment
    if (!this.isAdmin()) {
      const isOwnBooking = appointmentEvent.isOwnBooking;
      const canViewDetails = appointmentEvent.canViewDetails;

      // If user cannot view details, don't open the popup
      if (!canViewDetails || !isOwnBooking) {
        console.log('❌ Calendar - User cannot view this appointment');
        return;
      }
    }

    // Convert AppointmentEvent to the format expected by the popup
    const originalAppointment = this.findOriginalAppointment(appointmentEvent);

    if (originalAppointment) {
      // Use the original appointment data which has the correct format
      // Assegurem-nos que té l'email correcte
      if (currentUser?.email && !originalAppointment.email) {
        originalAppointment.email = currentUser.email;
      }

      // Load service data before opening popup - OPTIMIZED to use cached services
      this.loadServiceDataFromCache(originalAppointment.serviceId);

      this.stateService.openAppointmentDetail(originalAppointment);
    } else {
      // Fallback: convert AppointmentEvent to the expected format
      // Generate a unique ID if not available
      const appointmentId = appointmentEvent.id || uuidv4();

      const convertedAppointment: Booking = {
        id: appointmentId,
        clientName: appointmentEvent.title || appointmentEvent.clientName || '',
        email: currentUser?.email || '',
        data: appointmentEvent.start ? appointmentEvent.start.split('T')[0] : '',
        hora: appointmentEvent.start ? appointmentEvent.start.split('T')[1]?.substring(0, 5) : '',
        notes: '',
        serviceId: '',
        status: 'confirmed' as const,
        createdAt: new Date(),
      };

      // Load service data before opening popup - OPTIMIZED to use cached services
      this.loadServiceDataFromCache(convertedAppointment.serviceId);

      this.stateService.openAppointmentDetail(convertedAppointment);
    }
  }

  // OPTIMIZED: Load service data from cache instead of making Firebase calls
  private loadServiceDataFromCache(serviceId: string): void {
    if (!serviceId) {
      this.loadedService.set(null);
      return;
    }

    // Get service from cached services - NO FIREBASE CALL
    const allServices = this.servicesService.getAllServices();
    const service = allServices.find(s => s.id === serviceId);

    if (service) {
      this.loadedService.set(service);
    } else {
      // Only make Firebase call if service is not in cache
      this.loadServiceDataAsync(serviceId);
    }
  }

  // Fallback method for async service loading (only when not in cache)
  private async loadServiceDataAsync(serviceId: string): Promise<void> {
    if (!serviceId) {
      this.loadedService.set(null);
      return;
    }

    try {
      // Use injector to ensure proper injection context
      const servicesService = this.injector.get(ServicesService);
      const service = await servicesService.getServiceById(serviceId) as Service | null;
      this.loadedService.set(service);
    } catch (error) {
      console.error('Error loading service:', error);
      this.loadedService.set(null);
    }
  }

  isLunchBreak(time: string): boolean {
    return this.calendarCoreService.isLunchBreakTime(time);
  }

  calculateLunchBreakData(day: Date): LunchBreakData | null {
    // Only show lunch break on business days
    if (this.isPastDate(day) || !this.businessService.isBusinessDay(day)) {
      return null;
    }

    const position = this.calendarCoreService.getLunchBreakPosition();
    const timeRange = this.calendarCoreService.getLunchBreakTimeRange();

    return {
      top: position.top,
      height: position.height,
      timeRange,
    };
  }

  isTimeSlotBlocked(time: string): boolean {
    return this.isLunchBreak(time);
  }

  getAppointmentForTimeSlot(date: Date, time: string) {
    const appointments = this.getAppointmentsForDay(date);
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);

    return appointments.find(appointment => {
      if (!appointment.start) return false;
      const appointmentStart = new Date(appointment.start);
      const appointmentEnd = appointment.end
        ? new Date(appointment.end)
        : addMinutes(appointmentStart, appointment.duration || this.calendarCoreService.reactiveBookingDuration());
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

      // Also try to match by title/clientName
      const titleMatches =
        app.clientName === appointmentEvent.title || app.clientName === appointmentEvent.clientName;

      return dateMatches && timeMatches && titleMatches;
    });
  }

  getAppointmentDisplayInfo(date: Date, time: string) {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return null;

    return {
      title: appointment.title,
      serviceName: appointment.serviceName,
      duration: appointment.duration || 60,
    };
  }

  getAppointmentSlotCoverage(date: Date, time: string): number {
    const appointment = this.getAppointmentForTimeSlot(date, time);
    if (!appointment) return 0;

    const [hour, minute] = time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);

    const appointmentStart = new Date(appointment.start);
    const appointmentEnd = appointment.end
      ? new Date(appointment.end)
      : addMinutes(appointmentStart, appointment.duration || 60);

    const slotDuration = this.SLOT_DURATION_MINUTES();
    const slotEnd = addMinutes(slotStart, slotDuration);

    const overlapStart = appointmentStart > slotStart ? appointmentStart : slotStart;
    const overlapEnd = appointmentEnd < slotEnd ? appointmentEnd : slotEnd;

    if (overlapStart >= overlapEnd) return 0;

    const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
    return (overlapMinutes / slotDuration) * 100;
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

    // Prevent selection of lunch break time slots
    if (this.isLunchBreak(time)) {
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

    // Prevent selection of lunch break time slots
    if (this.isLunchBreak(time)) {
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
    // Always allow navigation to past weeks
    return true;
  }

  getViewDateInfo(): string {
    const viewDate = this.viewDate();
    const start = startOfWeek(viewDate, { weekStartsOn: 1 });
    const end = endOfWeek(viewDate, { weekStartsOn: 1 });
    return `${dateFnsFormat(start, 'dd/MM')} - ${dateFnsFormat(end, 'dd/MM')}`;
  }

  isBusinessDay(dayOfWeek: number): boolean {
    const date = new Date();
    date.setDate(date.getDate() + (dayOfWeek - date.getDay()));
    return this.timeUtils.isBusinessDay(date);
  }

  getBusinessDaysInfo(): string {
    return this.timeUtils.getBusinessDaysInfo();
  }

  getEventForTimeSlot(date: Date, time: string) {
    return this.getAppointmentForTimeSlot(date, time);
  }

  previousWeek() {
    // Always allow navigation to previous week
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

  private formatLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  isPastDate(date: Date): boolean {
    return this.timeUtils.isPastDay(date);
  }

  isPastTimeSlot(date: Date, time: string): boolean {
    return this.timeUtils.isPastTimeSlot(date, time);
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

    if (this.isLunchBreak(time)) {
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
    // Reset service data when popup is closed
    this.loadedService.set(null);
  }

  async onAppointmentDeleted(booking: Booking) {
    console.log('Appointment deleted:', booking);

    if (!booking || !booking.id) {
      this.toastService.showError('Error', 'No s\'ha pogut eliminar la cita');
      return;
    }

    try {
      // Actually delete the booking from the database
      const success = await this.appointmentService.deleteBooking(booking.id);

      if (success) {
        // Show success toast
        this.toastService.showAppointmentDeleted(booking.clientName || 'Client');

        // Remove the appointment from the state
        this.stateService.removeAppointment(booking.id);

        // Close the popup immediately
        this.stateService.closeAppointmentDetail();

        // Silently refresh appointments without showing loader
        this.appointmentService.silentRefreshBookings();

        // Convert Booking to AppointmentEvent and emit to parent
        const currentUser = this.authService.user();
        const isOwnBooking = !!(currentUser?.email && booking.email === currentUser.email);

        // Get service information from serviceId
        const allServices = this.servicesService.getAllServices();
        const service = booking.serviceId ? allServices.find(s => s.id === booking.serviceId) : null;
        const serviceName = service?.name || 'Service';
        const serviceDuration = service?.duration || 60;

        const appointmentEvent: AppointmentEvent = {
          id: booking.id || '',
          title: booking.clientName || 'Appointment',
          start: (booking.data || '') + 'T' + (booking.hora || '00:00'),
          end: (booking.data || '') + 'T' + (booking.hora || '23:59'),
          duration: serviceDuration,
          serviceName: serviceName,
          clientName: booking.clientName,
          uid: booking.email || '',
          isOwnBooking: isOwnBooking,
          canDrag: this.isAdmin() || isOwnBooking,
          canViewDetails: this.isAdmin() || isOwnBooking,
        };
        this.deleteAppointment.emit(appointmentEvent);
      } else {
        this.toastService.showError('Error', 'No s\'ha pogut eliminar la cita');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      this.toastService.showError('Error', 'No s\'ha pogut eliminar la cita');
    }
  }

  onAppointmentEditRequested(booking: Booking) {
    const currentUser = this.authService.user();
    if (!currentUser?.uid) {
      console.warn('No user found');
      return;
    }

    // All appointments are now bookings, so use the direct ID
    this.router.navigate(['/appointments', booking.id || ''], {
      queryParams: {
        edit: 'true',
      },
    });

    // Close the popup
    this.stateService.closeAppointmentDetail();

    // Convert Booking to AppointmentEvent and emit to parent
    const isOwnBooking = !!(currentUser?.email && booking.email === currentUser.email);

    // Get service information from serviceId
    const allServices = this.servicesService.getAllServices();
    const service = booking.serviceId ? allServices.find(s => s.id === booking.serviceId) : null;
    const serviceName = service?.name || 'Service';
    const serviceDuration = service?.duration || 60;

    const appointmentEvent: AppointmentEvent = {
      id: booking.id || '',
      title: booking.clientName || 'Appointment',
      start: (booking.data || '') + 'T' + (booking.hora || '00:00'),
      end: (booking.data || '') + 'T' + (booking.hora || '23:59'),
      duration: serviceDuration,
      serviceName: serviceName,
      clientName: booking.clientName,
      uid: booking.email || '',
      isOwnBooking: isOwnBooking,
      canDrag: this.isAdmin() || isOwnBooking,
      canViewDetails: this.isAdmin() || isOwnBooking,
    };
    this.editAppointment.emit(appointmentEvent);
  }

  onViewDetailRequested(booking: Booking) {
    // Navigate to appointment detail page
    this.router.navigate(['/appointments', booking.id || '']);

    // Close the popup
    this.stateService.closeAppointmentDetail();
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

      this.isInitializedSignal.set(true);
      this.calendarMountedSignal.set(true);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Still mark as initialized to show the calendar even if there's an error
      this.isInitializedSignal.set(true);
      this.calendarMountedSignal.set(true);
    }
  }

  onDateChange(event: Date | string | null): void {
    if (event instanceof Date) {
      const dateString = dateFnsFormat(event, 'yyyy-MM-dd');
      this.stateService.navigateToDate(dateString);
      this.selectedDate.set(event);
    } else if (typeof event === 'string') {
      this.stateService.navigateToDate(event);
      // Convert string to Date for the selectedDate signal
      const date = new Date(event);
      if (!isNaN(date.getTime())) {
        this.selectedDate.set(date);
      }
    } else {
      // Clear the selected date
      this.selectedDate.set(null);
    }
  }

  // Drag & Drop methods
  onDropZoneMouseEnter(event: MouseEvent, day: Date) {
    if (this.calendarCoreService.isDragging()) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
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
      date,
    };
  }

  // Get service CSS class for drag preview - OPTIMIZED to use cached services
  getServiceCssClass(appointment: AppointmentEvent): string {
    const serviceName = appointment.serviceName || '';
    if (!serviceName) {
      return 'service-color-default';
    }

    // Get all cached services to avoid Firebase calls
    const allServices = this.servicesService.getAllServices();

    // Try to find service by name first, then by ID
    let service = allServices.find(s => s.name === serviceName);

    // If not found by name, try by ID (for backward compatibility)
    if (!service) {
      service = allServices.find(s => s.id === serviceName);
    }

    // If still not found, try to find by partial name match
    if (!service) {
      service = allServices.find(s =>
        s.name.toLowerCase().includes(serviceName.toLowerCase()) ||
        serviceName.toLowerCase().includes(s.name.toLowerCase())
      );
    }

    if (!service) {
      return 'service-color-default';
    }

    return this.servicesService.getServiceCssClass(service);
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

  /**
   * Update the booking duration for the calendar grid
   * This will automatically recalculate all appointment positions
   */
  updateBookingDuration(durationMinutes: number): void {
    this.calendarCoreService.updateBookingDuration(durationMinutes);
  }

  /**
   * Get the current booking duration
   */
  getCurrentBookingDuration(): number {
    return this.calendarCoreService.reactiveBookingDuration();
  }

  /**
   * Update the slot duration for the calendar grid
   * This will automatically recalculate all time slots and positions
   */
  updateSlotDuration(durationMinutes: number): void {
    this.calendarCoreService.updateGridConfiguration({
      slotDurationMinutes: durationMinutes
    });
  }

  /**
   * Get the current slot duration
   */
  getCurrentSlotDuration(): number {
    return this.calendarCoreService.reactiveSlotDuration();
  }

  /**
   * Initialize the calendar core service with business configuration
   */
  private initializeCoordinateService(): void {
    console.log('Initializing calendar core service...');
    // Business hours and lunch break are now updated reactively via effects
    // Only set the slot height which doesn't change dynamically
    this.calendarCoreService.updateGridConfiguration({
      slotHeightPx: 30,
    });
  }
}
