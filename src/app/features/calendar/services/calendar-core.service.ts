import { Injectable, inject, signal, computed, Injector, effect } from '@angular/core';
import { addMinutes, isSameDay } from 'date-fns';
import { AppointmentEvent } from '../core/calendar.component';
import { CalendarStateService } from './calendar-state.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { UserService } from '../../../core/services/user.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import { ServicesService } from '../../../core/services/services.service';
import { FirebaseService } from '../../../core/services/firebase-services.service';

// Interfaces for coordinate and time management
export interface CoordinatePosition {
  x: number;
  y: number;
}

export interface TimePosition {
  date: Date;
  time: string;
}

export interface GridConfiguration {
  slotHeightPx: number;
  pixelsPerMinute: number;
  slotDurationMinutes: number;
  businessStartHour: number;
  businessEndHour: number;
  lunchBreakStart: number;
  lunchBreakEnd: number;
  bookingDurationMinutes: number; // New: reactive booking duration
}

export interface AppointmentPosition {
  top: number;
  height: number;
}

export interface DragDropState {
  isDragging: boolean;
  draggedAppointment: AppointmentEvent | null;
  originalPosition: { top: number; left: number } | null;
  currentPosition: { top: number; left: number } | null;
  targetDate: Date | null;
  targetTime: string | null;
  originalDate: Date | null;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarCoreService {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly systemParametersService = inject(SystemParametersService);
  private readonly userService = inject(UserService);
  private readonly injector = inject(Injector);

  // ===== GRID CONFIGURATION =====
  private readonly slotHeightPxSignal = signal<number>(30);
  private readonly pixelsPerMinuteSignal = signal<number>(1); // Will be calculated reactively
  private readonly slotDurationMinutesSignal = signal<number>(30); // Initial value, will be updated reactively
  private readonly businessStartHourSignal = signal<number>(8);
  private readonly businessEndHourSignal = signal<number>(20);
  private readonly lunchBreakStartSignal = signal<number>(13);
  private readonly lunchBreakEndSignal = signal<number>(15);
  private readonly bookingDurationMinutesSignal = signal<number>(60);

  readonly gridConfiguration = computed(
    (): GridConfiguration => ({
      slotHeightPx: this.slotHeightPxSignal(),
      pixelsPerMinute: this.pixelsPerMinuteSignal(),
      slotDurationMinutes: this.slotDurationMinutesSignal(),
      businessStartHour: this.businessStartHourSignal(),
      businessEndHour: this.businessEndHourSignal(),
      lunchBreakStart: this.lunchBreakStartSignal(),
      lunchBreakEnd: this.lunchBreakEndSignal(),
      bookingDurationMinutes: this.bookingDurationMinutesSignal(), // New: reactive booking duration
    })
  );

  // ===== REACTIVE POSITIONING COMPUTED SIGNALS =====
  // These computed signals automatically recalculate when grid configuration changes
  readonly reactiveSlotHeight = computed(() => this.gridConfiguration().slotHeightPx);
  readonly reactivePixelsPerMinute = computed(() => this.gridConfiguration().pixelsPerMinute);
  readonly reactiveSlotDuration = computed(() => this.gridConfiguration().slotDurationMinutes);
  readonly reactiveBookingDuration = computed(() => this.gridConfiguration().bookingDurationMinutes);

  // Reactive computed signals that update based on business settings
  readonly reactiveSlotDurationFromSettings = computed(() => this.systemParametersService.getAppointmentDuration());
  readonly reactivePixelsPerMinuteFromSettings = computed(() => {
    const slotHeight = this.reactiveSlotHeight();
    const slotDuration = this.reactiveSlotDurationFromSettings();
    return slotHeight / slotDuration; // pixels per minute
  });

  // ===== DRAG & DROP STATE =====
  private readonly isDraggingSignal = signal<boolean>(false);
  private readonly draggedAppointmentSignal = signal<AppointmentEvent | null>(null);
  private readonly originalPositionSignal = signal<{ top: number; left: number } | null>(null);
  private readonly currentPositionSignal = signal<{ top: number; left: number } | null>(null);
  private readonly targetDateSignal = signal<Date | null>(null);
  private readonly targetTimeSignal = signal<string | null>(null);
  private readonly isValidDropSignal = signal<boolean>(true);
  private readonly originalDateSignal = signal<Date | null>(null);

  // Public computed signals
  readonly isDragging = computed(() => this.isDraggingSignal());
  readonly draggedAppointment = computed(() => this.draggedAppointmentSignal());
  readonly originalPosition = computed(() => this.originalPositionSignal());
  readonly currentPosition = computed(() => this.currentPositionSignal());
  readonly targetDate = computed(() => this.targetDateSignal());
  readonly targetTime = computed(() => this.targetTimeSignal());
  readonly isValidDrop = computed(() => this.isValidDropSignal());
  readonly originalDate = computed(() => this.originalDateSignal());

  readonly dragState = computed(
    (): DragDropState => ({
      isDragging: this.isDragging(),
      draggedAppointment: this.draggedAppointment(),
      originalPosition: this.originalPosition(),
      currentPosition: this.currentPosition(),
      targetDate: this.targetDate(),
      targetTime: this.targetTime(),
      originalDate: this.originalDate(),
    })
  );

  constructor() {
    // Set up effect to log grid configuration changes for debugging
    effect(() => {
      const config = this.gridConfiguration();
      console.log('Grid configuration updated:', config);
    });

        // Set up effect to update slot duration and pixels per minute reactively
    effect(() => {
      const bookingDuration = this.systemParametersService.getAppointmentDuration();
      const slotHeight = this.slotHeightPxSignal();
      const pixelsPerMinute = slotHeight / bookingDuration;

      // Use bookingDuration as slotDuration (bookingDurationMinutes controls slot size)
      this.slotDurationMinutesSignal.set(bookingDuration);
      this.bookingDurationMinutesSignal.set(bookingDuration);
      this.pixelsPerMinuteSignal.set(pixelsPerMinute);
    });

    // Set up effect to update business hours and lunch break reactively
    effect(() => {
      const businessHours = this.systemParametersService.businessHours();
      const lunchBreak = this.systemParametersService.lunchBreak();

      this.businessStartHourSignal.set(businessHours.start);
      this.businessEndHourSignal.set(businessHours.end);
      this.lunchBreakStartSignal.set(lunchBreak.start);
      this.lunchBreakEndSignal.set(lunchBreak.end);
    });
  }

  // ===== GRID CONFIGURATION METHODS =====
  updateGridConfiguration(config: Partial<GridConfiguration>): void {
    if (config.slotHeightPx !== undefined) {
      this.slotHeightPxSignal.set(config.slotHeightPx);
    }
    if (config.pixelsPerMinute !== undefined) {
      this.pixelsPerMinuteSignal.set(config.pixelsPerMinute);
    }
    if (config.slotDurationMinutes !== undefined) {
      this.slotDurationMinutesSignal.set(config.slotDurationMinutes);
    }
    if (config.businessStartHour !== undefined) {
      this.businessStartHourSignal.set(config.businessStartHour);
    }
    if (config.businessEndHour !== undefined) {
      this.businessEndHourSignal.set(config.businessEndHour);
    }
    if (config.lunchBreakStart !== undefined) {
      this.lunchBreakStartSignal.set(config.lunchBreakStart);
    }
    if (config.lunchBreakEnd !== undefined) {
      this.lunchBreakEndSignal.set(config.lunchBreakEnd);
    }
    if (config.bookingDurationMinutes !== undefined) {
      this.bookingDurationMinutesSignal.set(config.bookingDurationMinutes);
    }
  }

  // New method to update booking duration specifically
  updateBookingDuration(durationMinutes: number): void {
    this.bookingDurationMinutesSignal.set(durationMinutes);
  }

  // ===== COORDINATE CONVERSION METHODS =====
  coordinateToTime(yPosition: number): string {
    const config = this.gridConfiguration();
    const slotHeight = this.reactiveSlotHeight();

    // Derive minutes since the very top edge of the business day using exact pixels-per-minute
    const minutesSinceStart = Math.floor((yPosition / slotHeight) * config.slotDurationMinutes);
    const totalMinutes = config.businessStartHour * 60 + minutesSinceStart;

    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    // Clamp within business window; allow exactly end:00 but not beyond
    if (hours < config.businessStartHour) {
      hours = config.businessStartHour;
      minutes = 0;
    }
    if (hours > config.businessEndHour || (hours === config.businessEndHour && minutes > 0)) {
      hours = config.businessEndHour;
      minutes = 0;
    }

    const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return result;
  }

  timeToCoordinate(time: string): number {
    const config = this.gridConfiguration();
    const slotHeight = this.reactiveSlotHeight();
    const [hours, minutes] = time.split(':').map(Number);

    // Minutes since business start
    const minutesSinceStart = (hours - config.businessStartHour) * 60 + minutes;
    // Use continuous mapping: slots are visual groupings, but position is pixel-accurate
    const slotsSinceStart = minutesSinceStart / config.slotDurationMinutes;
    return slotsSinceStart * slotHeight;
  }

  coordinateToTimePosition(position: CoordinatePosition, targetDate: Date): TimePosition {
    const time = this.coordinateToTime(position.y);
    const alignedTime = this.alignTimeToGrid(time);
    return {
      date: targetDate,
      time: alignedTime,
    };
  }

  timePositionToCoordinate(timePosition: TimePosition): CoordinatePosition {
    const y = this.timeToCoordinate(timePosition.time);
    return { x: 0, y };
  }

  // ===== TIME ALIGNMENT METHODS =====
  alignTimeToGrid(time: string): string {
    const slotDuration = this.reactiveSlotDuration();
    const [hours, minutes] = time.split(':').map(Number);

    // Align down to nearest slot to avoid snapping outside boundaries
    const alignedMinutes = Math.floor(minutes / slotDuration) * slotDuration;

    let finalHours = hours;
    let finalMinutes = alignedMinutes;

    if (finalMinutes >= 60) {
      finalHours += 1;
      finalMinutes = 0;
    }

    return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  }

  // ===== APPOINTMENT POSITION METHODS =====
  calculateAppointmentPosition(appointment: AppointmentEvent): AppointmentPosition {
    if (!appointment.start) {
      return { top: 0, height: 0 };
    }

    const startDate = new Date(appointment.start);
    const timeString = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

    const top = this.timeToCoordinate(timeString);
    // Determine effective duration using end if provided, otherwise duration or default setting
    let effectiveDuration = appointment.duration || this.reactiveBookingDuration();
    if (appointment.end) {
      const endDate = new Date(appointment.end);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffMin = Math.max(0, Math.round(diffMs / 60000));
      if (diffMin > 0) {
        effectiveDuration = diffMin;
      }
    }
    const height = effectiveDuration * this.reactivePixelsPerMinuteFromSettings();

    return { top, height };
  }

  calculateAppointmentPositionFromTime(
    startTime: string,
    durationMinutes: number
  ): { top: number; height: number } {
    const top = this.timeToCoordinate(startTime);
    // Calculate height based on actual duration in minutes using the correct pixels per minute
    const height = durationMinutes * this.reactivePixelsPerMinuteFromSettings();

    return { top, height };
  }

  // New method for reactive position calculation with current booking duration
  calculateReactiveAppointmentPosition(appointment: AppointmentEvent): AppointmentPosition {
    if (!appointment.start) {
      return { top: 0, height: 0 };
    }

    const startDate = new Date(appointment.start);
    const timeString = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

    const top = this.timeToCoordinate(timeString);
    // Use end if present; otherwise duration or reactive booking duration
    let effectiveDuration = appointment.duration || this.reactiveBookingDuration();
    if (appointment.end) {
      const endDate = new Date(appointment.end);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffMin = Math.max(0, Math.round(diffMs / 60000));
      if (diffMin > 0) {
        effectiveDuration = diffMin;
      }
    }
    const height = effectiveDuration * this.reactivePixelsPerMinuteFromSettings();

    return { top, height };
  }

  getAppointmentPositions(appointments: AppointmentEvent[]): Map<string, AppointmentPosition> {
    const positions = new Map<string, AppointmentPosition>();

    appointments.forEach(appointment => {
      const key = appointment.id || `${appointment.title}-${appointment.start}`;
      positions.set(key, this.calculateReactiveAppointmentPosition(appointment));
    });

    return positions;
  }

  // ===== BUSINESS LOGIC METHODS =====
  isWithinBusinessHours(time: string): boolean {
    const config = this.gridConfiguration();
    const [hours] = time.split(':').map(Number);

    return hours >= config.businessStartHour && hours < config.businessEndHour;
  }

  isTimeSlotBookable(time: string): boolean {
    return this.isWithinBusinessHours(time) && !this.isLunchBreakTime(time);
  }

  isLunchBreakTime(time: string): boolean {
    // Use the system parameters service for consistent lunch break detection
    return this.systemParametersService.isLunchBreak(time);
  }



  isTimeSlotAvailable(
    date: Date,
    time: string,
    appointments: AppointmentEvent[],
    requestedDuration: number = this.reactiveBookingDuration() // Use reactive booking duration
  ): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);

    const slotEnd = addMinutes(slotStart, requestedDuration);

    if (!this.isTimeSlotBookable(time)) {
      return false;
    }

    return !appointments.some(appointment => {
      if (!appointment.start) return false;

      const appointmentStart = new Date(appointment.start);
      const appointmentEnd = appointment.end
        ? new Date(appointment.end)
        : addMinutes(appointmentStart, appointment.duration || this.reactiveBookingDuration());

      return appointmentStart < slotEnd && appointmentEnd > slotStart;
    });
  }

  // ===== TIME SLOT GENERATION =====
  getAvailableTimeSlots(): string[] {
    const config = this.gridConfiguration();
    const slotDuration = this.reactiveSlotDuration();
    const slots: string[] = [];

    let currentHour = config.businessStartHour;
    let currentMinute = 0;

    while (currentHour < config.businessEndHour) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      // Include lunch break too; UI will mark it as blocked
      slots.push(timeString);

      currentMinute += slotDuration;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  }

  getNextAvailableTimeSlot(time: string): string {
    const slotDuration = this.reactiveSlotDuration();
    const [hours, minutes] = time.split(':').map(Number);

    let nextHours = hours;
    let nextMinutes = minutes + slotDuration;

    if (nextMinutes >= 60) {
      nextHours += 1;
      nextMinutes = 0;
    }

    return `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
  }



  getLunchBreakPosition(): { top: number; height: number } {
    const lunchBreak = this.systemParametersService.lunchBreak();
    const startTime = `${lunchBreak.start.toString().padStart(2, '0')}:00`;
    const top = this.timeToCoordinate(startTime);
    const height = (lunchBreak.end - lunchBreak.start) * 60 * this.reactivePixelsPerMinuteFromSettings();

    return { top, height };
  }

  // Methods expected by specs
  getLunchBreakOffset(): number {
    const lunchBreak = this.systemParametersService.lunchBreak();
    const minutesFromStart = (lunchBreak.start - this.gridConfiguration().businessStartHour) * 60;
    return minutesFromStart * this.reactivePixelsPerMinuteFromSettings();
  }

  getLunchBreakHeight(): number {
    const lunchBreak = this.systemParametersService.lunchBreak();
    const minutes = (lunchBreak.end - lunchBreak.start) * 60;
    return minutes * this.reactivePixelsPerMinuteFromSettings();
  }

  getLunchBreakTimeRange(): { start: string; end: string } {
    const lunchBreak = this.systemParametersService.lunchBreak();
    return {
      start: `${lunchBreak.start.toString().padStart(2, '0')}:00`,
      end: `${lunchBreak.end.toString().padStart(2, '0')}:00`,
    };
  }

  // ===== DRAG & DROP METHODS =====
  startDrag(
    appointment: AppointmentEvent,
    originalPosition: { top: number; left: number },
    originalDate: Date
  ): void {
    // Check permissions before allowing drag
    const currentUser = this.authService.user();
    const isAdmin = this.userService.isAdmin();

    console.log('startDrag called:', {
      appointment: appointment.title,
      currentUser: currentUser?.email,
      isAdmin,
      appointmentUid: appointment.uid,
      canDrag: appointment.canDrag
    });

    if (!currentUser?.uid) {
      console.log('No authenticated user, cannot drag');
      return;
    }

    // Check if user can drag this appointment
    // For admin users, they can drag all appointments
    // For regular users, they can only drag their own appointments
    const isOwnBooking = appointment.uid === currentUser.email;
    const canDrag = isAdmin || isOwnBooking;

    console.log('Permission check:', {
      isOwnBooking,
      canDrag,
      appointmentEmail: appointment.uid,
      currentUserEmail: currentUser.email
    });

    if (!canDrag) {
      console.log('User cannot drag this appointment');
      this.toastService.showError('No tens permisos per moure aquesta cita');
      return;
    }

    console.log('Starting drag operation');
    this.isDraggingSignal.set(true);
    this.draggedAppointmentSignal.set(appointment);
    this.originalPositionSignal.set(originalPosition);
    this.currentPositionSignal.set(originalPosition);
    this.originalDateSignal.set(originalDate);
    this.targetDateSignal.set(null);
    this.targetTimeSignal.set(null);
    this.isValidDropSignal.set(true);
  }

  updateDragPosition(position: { top: number; left: number }): void {
    this.currentPositionSignal.set(position);
  }

  updateTargetDateTime(position: { top: number; left: number }, dayColumn: Date): void {
    const timePosition = this.coordinateToTimePosition({ x: position.left, y: position.top }, dayColumn);

    console.log('🎯 Updating target date/time:', {
      position,
      dayColumn: dayColumn.toDateString(),
      timePosition,
      draggedAppointment: this.draggedAppointment()?.title
    });

    this.targetDateSignal.set(dayColumn);
    this.targetTimeSignal.set(timePosition.time);

    // Validate drop position
    if (this.draggedAppointment()) {
      const isValid = this.isValidDropPosition(
        this.draggedAppointment()!,
        dayColumn,
        timePosition.time
      );
      console.log('🔍 Drop validation result:', isValid);
      this.isValidDropSignal.set(isValid);
    }
  }

  isMovingToDifferentDay(): boolean {
    const originalDate = this.originalDate();
    const targetDate = this.targetDate();

    if (!originalDate || !targetDate) {
      return false;
    }

    return !isSameDay(originalDate, targetDate);
  }

  async endDrag(): Promise<boolean> {
    const appointment = this.draggedAppointment();
    const targetDate = this.targetDate();
    const targetTime = this.targetTime();

    if (!appointment || !targetDate || !targetTime) {
      this.cancelDrag();
      return false;
    }

    const isValid = this.isValidDropPosition(appointment, targetDate, targetTime);
    if (!isValid) {
      this.cancelDrag();
      return false;
    }

    try {
      await this.moveAppointment(appointment, targetDate, targetTime);
      this.resetDragState();
      return true;
    } catch (error) {
      console.error('Failed to move appointment:', error);
      this.cancelDrag();
      return false;
    }
  }

  cancelDrag(): void {
    this.resetDragState();
  }

  // ===== PRIVATE HELPER METHODS =====
  private isValidDropPosition(
    appointment: AppointmentEvent,
    targetDate: Date,
    targetTime: string
  ): boolean {
    const config = this.gridConfiguration();
    console.log('🔍 Validating drop position:', {
      appointment: appointment.title,
      targetDate: targetDate.toDateString(),
      targetTime,
      appointmentDuration: appointment.duration || this.reactiveBookingDuration(),
      gridConfig: {
        businessStartHour: config.businessStartHour,
        businessEndHour: config.businessEndHour,
        lunchBreakStart: config.lunchBreakStart,
        lunchBreakEnd: config.lunchBreakEnd
      }
    });

    // Check if target time is within business hours
    if (!this.isTimeSlotBookable(targetTime)) {
      console.log('❌ Target time not bookable:', targetTime);
      return false;
    }

    // Check if the appointment duration fits in the target time slot
    const appointmentDuration = appointment.duration || this.reactiveBookingDuration();

    // Create target start time by combining targetDate with targetTime
    const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
    const targetStartTime = new Date(targetDate);
    targetStartTime.setHours(targetHours, targetMinutes, 0, 0);

    // Calculate end time
    const targetEndTime = addMinutes(targetStartTime, appointmentDuration);
    const targetEndTimeString = `${targetEndTime.getHours().toString().padStart(2, '0')}:${targetEndTime.getMinutes().toString().padStart(2, '0')}`;

    console.log('📅 Time range check:', {
      startTime: targetTime,
      endTime: targetEndTimeString,
      duration: appointmentDuration
    });

    // Check if end time is within business hours (allow ending exactly at business end)
    if (!this.isWithinBusinessHours(targetEndTimeString) && targetEndTimeString !== `${config.businessEndHour.toString().padStart(2, '0')}:00`) {
      console.log('❌ End time outside business hours:', targetEndTimeString);
      return false;
    }

    // Check if end time overlaps with lunch break (allow ending exactly at lunch start)
    if (this.isLunchBreakTime(targetEndTimeString) && targetEndTimeString !== `${config.lunchBreakStart.toString().padStart(2, '0')}:00`) {
      console.log('❌ End time overlaps with lunch break:', targetEndTimeString);
      return false;
    }

    // Check if the target slot is occupied by any existing appointment
    const existingAppointments = this.bookingService.bookings();
    console.log('🔍 Checking if target slot is occupied');

    // Check if any existing appointment occupies the target slot
    const isSlotOccupied = existingAppointments.some(existing => {
      if (!existing.data || !existing.hora || existing.id === appointment.id) return false;

      const existingStart = new Date(`${existing.data}T${existing.hora}`);

      // Get the actual service duration for this existing appointment
      let existingDuration = this.reactiveBookingDuration(); // Default duration
      if (existing.serviceId) {
        // Try to get the service from the services service
        const servicesService = this.injector.get(ServicesService);
        const service = servicesService.getAllServices().find((s: FirebaseService) => s.id === existing.serviceId);
        if (service) {
          existingDuration = service.duration;
        }
      }

      const existingEnd = addMinutes(existingStart, existingDuration);

      const targetStart = new Date(targetDate);
      targetStart.setHours(parseInt(targetTime.split(':')[0]), parseInt(targetTime.split(':')[1]), 0, 0);
      const targetEnd = addMinutes(targetStart, appointmentDuration);

      // Check if the target slot overlaps with this existing appointment
      const hasOverlap = existingStart < targetEnd && existingEnd > targetStart;

      if (hasOverlap) {
        console.log('❌ Slot occupied by:', {
          existing: existing.clientName,
          existingTime: `${existing.data} ${existing.hora}`,
          existingDuration: existingDuration,
          targetTime: `${targetDate.toDateString()} ${targetTime}`,
          targetDuration: appointmentDuration
        });
      }

      return hasOverlap;
    });

    const isValid = !isSlotOccupied;
    console.log('✅ Slot availability check result:', isValid);
    return isValid;
  }

  private async moveAppointment(
    appointment: AppointmentEvent,
    targetDate: Date,
    targetTime: string
  ): Promise<void> {
    const [hours, minutes] = targetTime.split(':').map(Number);
    const newStartDate = new Date(targetDate);
    newStartDate.setHours(hours, minutes, 0, 0);

    // Convert AppointmentEvent to Booking format
    const bookingUpdates: Partial<Booking> = {
      data: this.formatDateToYYYYMMDD(targetDate), // Format: YYYY-MM-DD
      hora: targetTime, // Format: HH:MM
    };

    console.log('🔄 Moving appointment:', {
      appointmentId: appointment.id,
      originalTime: appointment.start,
      newDate: bookingUpdates.data,
      newTime: bookingUpdates.hora
    });

    // Update the booking in Firebase
    const success = await this.bookingService.updateBooking(appointment.id!, bookingUpdates);

    if (success) {
      this.toastService.showSuccess('Cita actualizada correctamente');
    } else {
      this.toastService.showError('Error al actualizar la cita');
    }
  }

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private resetDragState(): void {
    this.isDraggingSignal.set(false);
    this.draggedAppointmentSignal.set(null);
    this.originalPositionSignal.set(null);
    this.currentPositionSignal.set(null);
    this.targetDateSignal.set(null);
    this.targetTimeSignal.set(null);
    this.isValidDropSignal.set(true);
    this.originalDateSignal.set(null);
  }
}
