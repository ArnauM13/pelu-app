import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { addMinutes, format, parseISO, isSameDay } from 'date-fns';
import { AppointmentEvent } from '../core/calendar.component';
import { CalendarStateService } from './calendar-state.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { BusinessSettingsService } from '../../../core/services/business-settings.service';
import { RoleService } from '../../../core/services/role.service';

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
  private readonly stateService = inject(CalendarStateService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly businessSettingsService = inject(BusinessSettingsService);
  private readonly roleService = inject(RoleService);

  // ===== GRID CONFIGURATION =====
  private readonly slotHeightPxSignal = signal<number>(30);
  private readonly pixelsPerMinuteSignal = signal<number>(1); // Will be calculated reactively
  private readonly slotDurationMinutesSignal = signal<number>(30); // Initial value, will be updated reactively
  private readonly businessStartHourSignal = signal<number>(8);
  private readonly businessEndHourSignal = signal<number>(20);
  private readonly lunchBreakStartSignal = signal<number>(13);
  private readonly lunchBreakEndSignal = signal<number>(15);
  private readonly bookingDurationMinutesSignal = signal<number>(60); // New: reactive booking duration

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
  readonly reactiveSlotDurationFromSettings = computed(() => this.businessSettingsService.getAppointmentDuration());
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
      const appointmentDuration = this.businessSettingsService.getAppointmentDuration();
      const slotHeight = this.slotHeightPxSignal();
      const pixelsPerMinute = slotHeight / appointmentDuration;

      console.log('Updating reactive values:', {
        appointmentDuration,
        slotHeight,
        pixelsPerMinute,
        currentSlotDuration: this.slotDurationMinutesSignal(),
        currentPixelsPerMinute: this.pixelsPerMinuteSignal()
      });

      this.slotDurationMinutesSignal.set(appointmentDuration);
      this.pixelsPerMinuteSignal.set(pixelsPerMinute);
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

    // Calculate which time slot we're in
    const slotIndex = Math.round(yPosition / slotHeight);

    // Calculate total minutes from business start
    const totalMinutes = config.businessStartHour * 60 + slotIndex * config.slotDurationMinutes;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Clamp to business hours
    const clampedHours = Math.max(
      config.businessStartHour,
      Math.min(config.businessEndHour - 1, hours)
    );

    const result = `${clampedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    console.log('coordinateToTime:', {
      yPosition,
      config,
      slotIndex,
      totalMinutes,
      hours,
      minutes,
      clampedHours,
      result,
    });

    return result;
  }

  timeToCoordinate(time: string): number {
    const config = this.gridConfiguration();
    const slotHeight = this.reactiveSlotHeight();
    const [hours, minutes] = time.split(':').map(Number);

    // Calculate minutes since business start
    const minutesSinceStart = (hours - config.businessStartHour) * 60 + minutes;

    const slotIndex = minutesSinceStart / config.slotDurationMinutes;
    return slotIndex * slotHeight;
  }

  coordinateToTimePosition(position: CoordinatePosition, targetDate: Date): TimePosition {
    const time = this.coordinateToTime(position.y);
    const alignedTime = this.alignTimeToGrid(time);
    console.log('coordinateToTimePosition:', { position, time, alignedTime });
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
    const config = this.gridConfiguration();
    const slotDuration = this.reactiveSlotDuration();
    const [hours, minutes] = time.split(':').map(Number);

    // Align to slot duration
    const roundedMinutes = Math.round(minutes / slotDuration) * slotDuration;

    let finalHours = hours;
    let finalMinutes = roundedMinutes;

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
    const height = (appointment.duration || this.reactiveBookingDuration()) * this.reactivePixelsPerMinute();

    return { top, height };
  }

  calculateAppointmentPositionFromTime(
    startTime: string,
    durationMinutes: number
  ): { top: number; height: number } {
    const top = this.timeToCoordinate(startTime);
    const height = durationMinutes * this.reactivePixelsPerMinute();

    console.log('calculateAppointmentPositionFromTime:', {
      startTime,
      durationMinutes,
      top,
      height,
      reactivePixelsPerMinute: this.reactivePixelsPerMinute(),
      gridConfig: this.gridConfiguration()
    });

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
    // Use the reactive booking duration for height calculation
    const height = (appointment.duration || this.reactiveBookingDuration()) * this.reactivePixelsPerMinute();

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
    return this.isWithinBusinessHours(time);
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
    const config = this.gridConfiguration();
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

  // ===== LUNCH BREAK CALCULATIONS =====
  getLunchBreakOffset(): number {
    const config = this.gridConfiguration();
    const lunchBreakStartTime = `${config.lunchBreakStart.toString().padStart(2, '0')}:00`;
    return this.timeToCoordinate(lunchBreakStartTime);
  }

  getLunchBreakHeight(): number {
    const config = this.gridConfiguration();
    const lunchBreakDuration = (config.lunchBreakEnd - config.lunchBreakStart) * 60;
    return lunchBreakDuration * this.reactivePixelsPerMinute();
  }

  getLunchBreakPosition(): { top: number; height: number } {
    return {
      top: this.getLunchBreakOffset(),
      height: this.getLunchBreakHeight(),
    };
  }

  getLunchBreakTimeRange(): { start: string; end: string } {
    const config = this.gridConfiguration();
    return {
      start: `${config.lunchBreakStart.toString().padStart(2, '0')}:00`,
      end: `${config.lunchBreakEnd.toString().padStart(2, '0')}:00`,
    };
  }

  // ===== DRAG & DROP METHODS =====
  startDrag(
    appointment: AppointmentEvent,
    originalPosition: { top: number; left: number },
    originalDate: Date
  ): void {
    console.log('Starting drag for appointment:', appointment);

    // Check permissions before allowing drag
    const currentUser = this.authService.user();
    const isAdmin = this.roleService.isAdmin();

    if (!currentUser?.uid) {
      console.log('No authenticated user, cannot drag');
      return;
    }

    // Check if user can drag this appointment
    const isOwnBooking = appointment.uid === currentUser.uid;
    const canDrag = isAdmin || isOwnBooking;

    if (!canDrag) {
      console.log('User cannot drag this appointment');
      this.toastService.showError('No tens permisos per moure aquesta cita');
      return;
    }

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
    this.targetDateSignal.set(dayColumn);
    this.targetTimeSignal.set(timePosition.time);

    // Validate drop position
    if (this.draggedAppointment()) {
      const isValid = this.isValidDropPosition(
        this.draggedAppointment()!,
        dayColumn,
        timePosition.time
      );
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
  private extractTimeFromAppointment(appointment: AppointmentEvent): string {
    if (!appointment.start) return '00:00';

    const startDate = new Date(appointment.start);
    return `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
  }

  private isValidDropPosition(
    appointment: AppointmentEvent,
    targetDate: Date,
    targetTime: string
  ): boolean {
    // Check if target time is within business hours
    if (!this.isTimeSlotBookable(targetTime)) {
      return false;
    }

    // Check if the appointment duration fits in the target time slot
    const appointmentDuration = appointment.duration || this.reactiveBookingDuration();
    const targetEndTime = addMinutes(new Date(targetDate), appointmentDuration);
    const targetEndTimeString = `${targetEndTime.getHours().toString().padStart(2, '0')}:${targetEndTime.getMinutes().toString().padStart(2, '0')}`;

    if (!this.isTimeSlotBookable(targetEndTimeString)) {
      return false;
    }

    // Check for conflicts with existing appointments
    const existingAppointments = this.bookingService.bookings();
    const conflictingAppointment = existingAppointments.find(existing => {
      if (!existing.data || !existing.hora || existing.id === appointment.id) return false;

      const existingStart = new Date(`${existing.data}T${existing.hora}`);
      const existingEnd = addMinutes(existingStart, existing.duration || 60);
      const targetStart = new Date(targetDate);
      targetStart.setHours(parseInt(targetTime.split(':')[0]), parseInt(targetTime.split(':')[1]), 0, 0);
      const targetEnd = addMinutes(targetStart, appointmentDuration);

      return existingStart < targetEnd && existingEnd > targetStart;
    });

    return !conflictingAppointment;
  }

  private async moveAppointment(
    appointment: AppointmentEvent,
    targetDate: Date,
    targetTime: string
  ): Promise<void> {
    const [hours, minutes] = targetTime.split(':').map(Number);
    const newStartDate = new Date(targetDate);
    newStartDate.setHours(hours, minutes, 0, 0);

    const updatedAppointment: AppointmentEvent = {
      ...appointment,
      start: newStartDate.toISOString(),
      end: addMinutes(newStartDate, appointment.duration || this.reactiveBookingDuration()).toISOString(),
    };

    // Update the appointment in the booking service
    await this.bookingService.updateBooking(appointment.id!, updatedAppointment);
    this.toastService.showSuccess('Cita actualizada correctamente');
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
