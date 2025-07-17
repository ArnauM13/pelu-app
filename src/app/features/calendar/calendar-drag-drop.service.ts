import { Injectable, signal, computed, inject } from '@angular/core';
import { AppointmentEvent } from './calendar.component';
import { CalendarPositionService } from './calendar-position.service';
import { CalendarStateService } from './calendar-state.service';
import { addMinutes, format, parseISO } from 'date-fns';
import { ToastService } from '../../shared/services/toast.service';

export interface DragDropState {
  isDragging: boolean;
  draggedAppointment: AppointmentEvent | null;
  originalPosition: { top: number; left: number } | null;
  currentPosition: { top: number; left: number } | null;
  targetDate: Date | null;
  targetTime: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarDragDropService {
  private readonly positionService = inject(CalendarPositionService);
  private readonly stateService = inject(CalendarStateService);
  private readonly toastService = inject(ToastService);

  // Internal state signals
  private readonly isDraggingSignal = signal<boolean>(false);
  private readonly draggedAppointmentSignal = signal<AppointmentEvent | null>(null);
  private readonly originalPositionSignal = signal<{ top: number; left: number } | null>(null);
  private readonly currentPositionSignal = signal<{ top: number; left: number } | null>(null);
  private readonly targetDateSignal = signal<Date | null>(null);
  private readonly targetTimeSignal = signal<string | null>(null);
  private readonly isValidDropSignal = signal<boolean>(true);

  // Public computed signals
  readonly isDragging = computed(() => this.isDraggingSignal());
  readonly draggedAppointment = computed(() => this.draggedAppointmentSignal());
  readonly originalPosition = computed(() => this.originalPositionSignal());
  readonly currentPosition = computed(() => this.currentPositionSignal());
  readonly targetDate = computed(() => this.targetDateSignal());
  readonly targetTime = computed(() => this.targetTimeSignal());
  readonly isValidDrop = computed(() => this.isValidDropSignal());

  // Computed state
  readonly dragState = computed((): DragDropState => ({
    isDragging: this.isDragging(),
    draggedAppointment: this.draggedAppointment(),
    originalPosition: this.originalPosition(),
    currentPosition: this.currentPosition(),
    targetDate: this.targetDate(),
    targetTime: this.targetTime()
  }));

  /**
   * Start dragging an appointment
   */
  startDrag(appointment: AppointmentEvent, originalPosition: { top: number; left: number }): void {
    this.isDraggingSignal.set(true);
    this.draggedAppointmentSignal.set(appointment);
    this.originalPositionSignal.set(originalPosition);
    this.currentPositionSignal.set(originalPosition);
  }

  /**
   * Update drag position
   */
  updateDragPosition(position: { top: number; left: number }): void {
    this.currentPositionSignal.set(position);
  }

      /**
   * Update target date and time based on position
   */
  updateTargetDateTime(position: { top: number; left: number }, dayColumn: Date): void {
    const targetTime = this.calculateTimeFromPosition(position.top);
    const alignedTime = this.alignTimeToGrid(targetTime);

    this.targetTimeSignal.set(alignedTime);
    this.targetDateSignal.set(dayColumn);

    // Validate the new position
    const draggedAppointment = this.draggedAppointment();
    if (draggedAppointment) {
      const isValid = this.isValidDropPosition(draggedAppointment, dayColumn, alignedTime);
      this.isValidDropSignal.set(isValid);
    }
  }

  /**
   * Calculate the exact grid position for an appointment
   */
  calculateGridPosition(appointment: AppointmentEvent, targetDate: Date, targetTime: string): { top: number; height: number } {
    const pixelsPerMinute = this.positionService.getPixelsPerMinute();
    const [hours, minutes] = targetTime.split(':').map(Number);

    // Calculate minutes since business start (8:00)
    const businessStartHour = 8;
    const minutesSinceStart = (hours - businessStartHour) * 60 + minutes;

    // Convert to pixels
    const top = minutesSinceStart * pixelsPerMinute;
    const height = (appointment.duration || 60) * pixelsPerMinute;

    return { top, height };
  }

  /**
   * End dragging and apply changes if valid
   */
  endDrag(): boolean {
    const draggedAppointment = this.draggedAppointment();
    const targetDate = this.targetDate();
    const targetTime = this.targetTime();

    if (!draggedAppointment || !targetDate || !targetTime) {
      this.resetDragState();
      return false;
    }

    // Check if the new position is valid
    if (this.isValidDropPosition(draggedAppointment, targetDate, targetTime)) {
      this.moveAppointment(draggedAppointment, targetDate, targetTime);
      this.resetDragState();
      return true;
    } else {
      this.resetDragState();
      return false;
    }
  }

  /**
   * Cancel dragging
   */
  cancelDrag(): void {
    this.resetDragState();
  }

  /**
   * Reset drag state
   */
  private resetDragState(): void {
    this.isDraggingSignal.set(false);
    this.draggedAppointmentSignal.set(null);
    this.originalPositionSignal.set(null);
    this.currentPositionSignal.set(null);
    this.targetDateSignal.set(null);
    this.targetTimeSignal.set(null);
    this.isValidDropSignal.set(true);
  }

  /**
   * Calculate time from position
   */
  private calculateTimeFromPosition(topPosition: number): string {
    const pixelsPerMinute = this.positionService.getPixelsPerMinute();
    const businessStartHour = 8; // 08:00

    const minutesFromStart = Math.round(topPosition / pixelsPerMinute);
    const totalMinutes = (businessStartHour * 60) + minutesFromStart;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

    /**
   * Check if the drop position is valid
   */
  private isValidDropPosition(appointment: AppointmentEvent, targetDate: Date, targetTime: string): boolean {
    const appointments = this.stateService.appointments();

    // Convert appointments to AppointmentEvent format for validation
    const appointmentEvents: AppointmentEvent[] = appointments.map(app => ({
      id: app.id,
      title: app.nom,
      start: `${app.data}T${app.hora}:00`,
      duration: app.duration || 60,
      serviceName: app.serviceName,
      clientName: app.nom
    })).filter(app => app.id !== appointment.id); // Exclude the dragged appointment

    // Align time to grid for validation
    const alignedTime = this.alignTimeToGrid(targetTime);

    // Create new appointment with aligned target date/time
    const newStartDate = new Date(targetDate);
    const [hours, minutes] = alignedTime.split(':').map(Number);
    newStartDate.setHours(hours, minutes, 0, 0);

    const newAppointment: AppointmentEvent = {
      ...appointment,
      start: newStartDate.toISOString().slice(0, 16).replace('T', 'T'),
      end: addMinutes(newStartDate, appointment.duration || 60).toISOString().slice(0, 16).replace('T', 'T')
    };

    // Check if the new position conflicts with existing appointments
    return this.positionService.isTimeSlotAvailable(
      targetDate,
      alignedTime,
      appointmentEvents,
      appointment.duration || 60
    );
  }

    /**
   * Move appointment to new position
   */
  private moveAppointment(appointment: AppointmentEvent, targetDate: Date, targetTime: string): void {
    const appointments = this.stateService.appointments();

    // Find the original appointment
    const originalAppointment = appointments.find(app => app.id === appointment.id);
    if (!originalAppointment) return;

    // Ensure the time is aligned to the grid (30-minute slots)
    const alignedTime = this.alignTimeToGrid(targetTime);

    // Create updated appointment with aligned time
    const updatedAppointment = {
      ...originalAppointment,
      data: format(targetDate, 'yyyy-MM-dd'),
      hora: alignedTime
    };

    // Update the appointment in the list
    const updatedAppointments = appointments.map(app =>
      app.id === appointment.id ? updatedAppointment : app
    );

    // Save to state and localStorage
    this.stateService.setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    // Show toast notification
    this.toastService.showAppointmentUpdated(originalAppointment.nom);
  }

  /**
   * Align time to the nearest 30-minute grid slot
   */
  private alignTimeToGrid(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);

    // Round to nearest 30-minute slot
    const roundedMinutes = Math.round(minutes / 30) * 30;

    // Handle hour overflow
    let finalHours = hours;
    let finalMinutes = roundedMinutes;

    if (finalMinutes >= 60) {
      finalHours += 1;
      finalMinutes = 0;
    }

    // Ensure hours are within business hours (8-20)
    if (finalHours < 8) finalHours = 8;
    if (finalHours >= 20) finalHours = 19;

    return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  }
}
