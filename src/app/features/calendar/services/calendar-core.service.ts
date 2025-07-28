import { Injectable, computed, signal, inject } from '@angular/core';
import { addMinutes, format, parseISO, isSameDay } from 'date-fns';
import { AppointmentEvent } from '../core/calendar.component';
import { CalendarStateService } from './calendar-state.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';

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

  // ===== GRID CONFIGURATION =====
  private readonly slotHeightPxSignal = signal<number>(30);
  private readonly pixelsPerMinuteSignal = signal<number>(1);
  private readonly slotDurationMinutesSignal = signal<number>(30);
  private readonly businessStartHourSignal = signal<number>(8);
  private readonly businessEndHourSignal = signal<number>(20);
  private readonly lunchBreakStartSignal = signal<number>(13);
  private readonly lunchBreakEndSignal = signal<number>(15);

  readonly gridConfiguration = computed(
    (): GridConfiguration => ({
      slotHeightPx: this.slotHeightPxSignal(),
      pixelsPerMinute: this.pixelsPerMinuteSignal(),
      slotDurationMinutes: this.slotDurationMinutesSignal(),
      businessStartHour: this.businessStartHourSignal(),
      businessEndHour: this.businessEndHourSignal(),
      lunchBreakStart: this.lunchBreakStartSignal(),
      lunchBreakEnd: this.lunchBreakEndSignal(),
    })
  );

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

  // ===== CONFIGURATION METHODS =====
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
  }

  // ===== COORDINATE CONVERSION METHODS =====
  coordinateToTime(yPosition: number): string {
    const config = this.gridConfiguration();

    // Calculate which time slot we're in (each slot is 30 minutes = 30 pixels)
    const slotIndex = Math.round(yPosition / config.slotHeightPx);

    // Calculate total minutes from business start
    // Since we now show ALL time slots including lunch break, no need to adjust for lunch break
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
    const [hours, minutes] = time.split(':').map(Number);

    // Calculate minutes since business start
    // Since we now show ALL time slots including lunch break, no need to adjust for lunch break
    const minutesSinceStart = (hours - config.businessStartHour) * 60 + minutes;

    const slotIndex = minutesSinceStart / config.slotDurationMinutes;
    return slotIndex * config.slotHeightPx;
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
    const [hours, minutes] = time.split(':').map(Number);

    // Always align to 30-minute slots (0 or 30 minutes)
    const roundedMinutes =
      Math.round(minutes / config.slotDurationMinutes) * config.slotDurationMinutes;

    let finalHours = hours;
    let finalMinutes = roundedMinutes;

    if (finalMinutes >= 60) {
      finalHours += 1;
      finalMinutes = 0;
    }

    // Clamp to business hours
    if (finalHours < config.businessStartHour) {
      finalHours = config.businessStartHour;
      finalMinutes = 0;
    }
    if (finalHours >= config.businessEndHour) {
      finalHours = config.businessEndHour - 1;
      finalMinutes = 30;
    }

    // Skip lunch break hours
    if (finalHours >= config.lunchBreakStart && finalHours < config.lunchBreakEnd) {
      finalHours = config.lunchBreakEnd;
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
    const height = (appointment.duration || 60) * this.gridConfiguration().pixelsPerMinute;

    return { top, height };
  }

  calculateAppointmentPositionFromTime(
    startTime: string,
    durationMinutes: number
  ): { top: number; height: number } {
    const top = this.timeToCoordinate(startTime);
    const height = durationMinutes * this.gridConfiguration().pixelsPerMinute;

    return { top, height };
  }

  getAppointmentPositions(appointments: AppointmentEvent[]): Map<string, AppointmentPosition> {
    const positions = new Map<string, AppointmentPosition>();

    appointments.forEach(appointment => {
      const key = appointment.id || `${appointment.title}-${appointment.start}`;
      positions.set(key, this.calculateAppointmentPosition(appointment));
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
    requestedDuration: number = this.gridConfiguration().slotDurationMinutes
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
        : addMinutes(appointmentStart, appointment.duration || 60);

      return appointmentStart < slotEnd && appointmentEnd > slotStart;
    });
  }

  // ===== TIME SLOT GENERATION =====
  getAvailableTimeSlots(): string[] {
    const config = this.gridConfiguration();
    const slots: string[] = [];

    let currentHour = config.businessStartHour;
    let currentMinute = 0;

    while (currentHour < config.businessEndHour) {
      currentMinute += config.slotDurationMinutes;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  }

  getNextAvailableTimeSlot(time: string): string {
    const config = this.gridConfiguration();
    const [hours, minutes] = time.split(':').map(Number);

    let nextHours = hours;
    let nextMinutes = minutes + config.slotDurationMinutes;

    if (nextMinutes >= 60) {
      nextHours += 1;
      nextMinutes = 0;
    }

    const nextTime = `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;

    return nextTime;
  }

  // ===== LUNCH BREAK CALCULATIONS =====
  getLunchBreakOffset(): number {
    const config = this.gridConfiguration();
    const lunchBreakStartMinutes = config.lunchBreakStart * 60;
    const businessStartMinutes = config.businessStartHour * 60;
    const minutesSinceStart = lunchBreakStartMinutes - businessStartMinutes;

    return minutesSinceStart * config.pixelsPerMinute;
  }

  getLunchBreakHeight(): number {
    const config = this.gridConfiguration();
    const lunchBreakDuration = (config.lunchBreakEnd - config.lunchBreakStart) * 60;

    return lunchBreakDuration * config.pixelsPerMinute;
  }

  getLunchBreakPosition(): { top: number; height: number } {
    const config = this.gridConfiguration();
    const lunchBreakStartMinutes = config.lunchBreakStart * 60;
    const businessStartMinutes = config.businessStartHour * 60;
    const minutesSinceStart = lunchBreakStartMinutes - businessStartMinutes;

    const top = (minutesSinceStart / config.slotDurationMinutes) * config.slotHeightPx;
    const height =
      (((config.lunchBreakEnd - config.lunchBreakStart) * 60) / config.slotDurationMinutes) *
      config.slotHeightPx;

    return { top, height };
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
    console.log('startDrag called with:', { appointment, originalPosition, originalDate });

    this.isDraggingSignal.set(true);
    this.draggedAppointmentSignal.set(appointment);
    this.originalPositionSignal.set(originalPosition);
    this.currentPositionSignal.set(originalPosition);
    this.originalDateSignal.set(originalDate);

    this.targetDateSignal.set(originalDate);
    this.targetTimeSignal.set(this.extractTimeFromAppointment(appointment));

    console.log('Drag state initialized');
  }

  updateDragPosition(position: { top: number; left: number }): void {
    this.currentPositionSignal.set(position);
  }

  updateTargetDateTime(position: { top: number; left: number }, dayColumn: Date): void {
    console.log('updateTargetDateTime called with:', { position, dayColumn });

    const coordinatePosition: CoordinatePosition = { x: position.left, y: position.top };
    const timePosition: TimePosition = this.coordinateToTimePosition(coordinatePosition, dayColumn);

    console.log('Calculated time position:', timePosition);

    this.targetTimeSignal.set(timePosition.time);
    this.targetDateSignal.set(timePosition.date);

    const draggedAppointment = this.draggedAppointment();
    if (draggedAppointment) {
      const isValid = this.isValidDropPosition(
        draggedAppointment,
        timePosition.date,
        timePosition.time
      );
      console.log('Drop position valid:', isValid);
      this.isValidDropSignal.set(isValid);
    }
  }

  isMovingToDifferentDay(): boolean {
    const originalDate = this.originalDate();
    const targetDate = this.targetDate();

    if (!originalDate || !targetDate) return false;

    return !isSameDay(originalDate, targetDate);
  }

  async endDrag(): Promise<boolean> {
    const draggedAppointment = this.draggedAppointment();
    const targetDate = this.targetDate();
    const targetTime = this.targetTime();

    if (!draggedAppointment || !targetDate || !targetTime) {
      this.resetDragState();
      return false;
    }

    if (this.isValidDropPosition(draggedAppointment, targetDate, targetTime)) {
      await this.moveAppointment(draggedAppointment, targetDate, targetTime);
      this.resetDragState();
      return true;
    } else {
      this.resetDragState();
      return false;
    }
  }

  cancelDrag(): void {
    this.resetDragState();
  }

  // ===== PRIVATE HELPER METHODS =====
  private extractTimeFromAppointment(appointment: AppointmentEvent): string {
    if (!appointment.start) return '08:00';

    try {
      const date = new Date(appointment.start);
      return format(date, 'HH:mm');
    } catch {
      return '08:00';
    }
  }

  private isValidDropPosition(
    appointment: AppointmentEvent,
    targetDate: Date,
    targetTime: string
  ): boolean {
    const appointments = this.stateService.appointments();

    const appointmentEvents: AppointmentEvent[] = appointments
      .map(app => ({
        id: app.id,
        title: app.nom,
        start: `${app.data}T${app.hora}:00`,
        duration: app.duration || 60,
        serviceName: app.serviceName,
        clientName: app.nom,
      }))
      .filter(app => app.id !== appointment.id);

    const alignedTime = this.alignTimeToGrid(targetTime);

    const newStartDate = new Date(targetDate);
    const [hours, minutes] = alignedTime.split(':').map(Number);
    newStartDate.setHours(hours, minutes, 0, 0);

    const newAppointment: AppointmentEvent = {
      ...appointment,
      start: newStartDate.toISOString().slice(0, 16).replace('T', 'T'),
      end: addMinutes(newStartDate, appointment.duration || 60)
        .toISOString()
        .slice(0, 16)
        .replace('T', 'T'),
    };

    return this.isTimeSlotAvailable(
      targetDate,
      alignedTime,
      appointmentEvents,
      appointment.duration || 60
    );
  }

  private async moveAppointment(
    appointment: AppointmentEvent,
    targetDate: Date,
    targetTime: string
  ): Promise<void> {
    console.log('moveAppointment called with:', { appointment, targetDate, targetTime });

    const user = this.authService.user();
    if (!user) {
      console.error('No user found for appointment update');
      return;
    }

    if (!appointment.id) {
      console.error('Invalid appointment ID for update');
      return;
    }

    const alignedTime = this.alignTimeToGrid(targetTime);
    const formattedDate = format(targetDate, 'yyyy-MM-dd');

    console.log('Updating booking with:', {
      bookingId: appointment.id,
      data: formattedDate,
      hora: alignedTime,
    });

    try {
      // Update the booking in Firebase
      const success = await this.bookingService.updateBooking(appointment.id, {
        data: formattedDate,
        hora: alignedTime,
      });

      if (success) {
        // Refresh bookings to update the UI
        await this.bookingService.refreshBookings();

        this.toastService.showSuccess(
          'Cita moguda',
          `S'ha mogut la cita de ${appointment.title} a ${format(targetDate, 'dd/MM')} a les ${alignedTime}`
        );

        console.log('Booking updated successfully');
      } else {
        console.error('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
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
