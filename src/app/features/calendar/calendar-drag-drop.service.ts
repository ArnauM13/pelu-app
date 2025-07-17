import { Injectable, signal, computed, inject } from '@angular/core';
import { AppointmentEvent } from './calendar.component';
import { CalendarPositionService } from './calendar-position.service';
import { CalendarStateService } from './calendar-state.service';
import { addMinutes, format, parseISO, isSameDay } from 'date-fns';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../core/auth/auth.service';

export interface DragDropState {
  isDragging: boolean;
  draggedAppointment: AppointmentEvent | null;
  originalPosition: { top: number; left: number } | null;
  currentPosition: { top: number; left: number } | null;
  targetDate: Date | null;
  targetTime: string | null;
  originalDate: Date | null; // Add original date tracking
}

@Injectable({
  providedIn: 'root'
})
export class CalendarDragDropService {
  private readonly positionService = inject(CalendarPositionService);
  private readonly stateService = inject(CalendarStateService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  // Internal state signals
  private readonly isDraggingSignal = signal<boolean>(false);
  private readonly draggedAppointmentSignal = signal<AppointmentEvent | null>(null);
  private readonly originalPositionSignal = signal<{ top: number; left: number } | null>(null);
  private readonly currentPositionSignal = signal<{ top: number; left: number } | null>(null);
  private readonly targetDateSignal = signal<Date | null>(null);
  private readonly targetTimeSignal = signal<string | null>(null);
  private readonly isValidDropSignal = signal<boolean>(true);
  private readonly originalDateSignal = signal<Date | null>(null); // Track original date

  // Public computed signals
  readonly isDragging = computed(() => this.isDraggingSignal());
  readonly draggedAppointment = computed(() => this.draggedAppointmentSignal());
  readonly originalPosition = computed(() => this.originalPositionSignal());
  readonly currentPosition = computed(() => this.currentPositionSignal());
  readonly targetDate = computed(() => this.targetDateSignal());
  readonly targetTime = computed(() => this.targetTimeSignal());
  readonly isValidDrop = computed(() => this.isValidDropSignal());
  readonly originalDate = computed(() => this.originalDateSignal());

  // Computed state
  readonly dragState = computed((): DragDropState => ({
    isDragging: this.isDragging(),
    draggedAppointment: this.draggedAppointment(),
    originalPosition: this.originalPosition(),
    currentPosition: this.currentPosition(),
    targetDate: this.targetDate(),
    targetTime: this.targetTime(),
    originalDate: this.originalDate()
  }));

  /**
   * Start dragging an appointment
   */
  startDrag(appointment: AppointmentEvent, originalPosition: { top: number; left: number }, originalDate: Date): void {
    this.isDraggingSignal.set(true);
    this.draggedAppointmentSignal.set(appointment);
    this.originalPositionSignal.set(originalPosition);
    this.currentPositionSignal.set(originalPosition);
    this.originalDateSignal.set(originalDate);

    // Initialize target to original position
    this.targetDateSignal.set(originalDate);
    this.targetTimeSignal.set(this.extractTimeFromAppointment(appointment));
  }

  /**
   * Update drag position globally (for cross-day dragging)
   */
  updateDragPosition(position: { top: number; left: number }): void {
    this.currentPositionSignal.set(position);
  }

  /**
   * Update target date and time based on position and day column
   * This method now properly handles cross-day dragging
   */
  updateTargetDateTime(position: { top: number; left: number }, dayColumn: Date): void {
    const targetTime = this.calculateTimeFromPosition(position.top);
    const alignedTime = this.alignTimeToGrid(targetTime);

    // Update target date and time
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
   * Check if the appointment is being moved to a different day
   */
  isMovingToDifferentDay(): boolean {
    const originalDate = this.originalDate();
    const targetDate = this.targetDate();

    if (!originalDate || !targetDate) return false;

    return !isSameDay(originalDate, targetDate);
  }

  /**
   * Extract time from appointment start string
   */
  private extractTimeFromAppointment(appointment: AppointmentEvent): string {
    if (!appointment.start) return '08:00';

    try {
      const date = new Date(appointment.start);
      return format(date, 'HH:mm');
    } catch {
      return '08:00';
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
    this.originalDateSignal.set(null);
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

    // Check user authentication (like edit form does)
    const user = this.authService.user();
    if (!user) {
      this.toastService.showError('No s\'ha pogut actualitzar la cita. Si us plau, inicia sessió.');
      return;
    }

    // Ensure the time is aligned to the grid (30-minute slots)
    const alignedTime = this.alignTimeToGrid(targetTime);

    // Create updated appointment with all fields preserved (like edit form does)
    const updatedAppointment = {
      ...originalAppointment,
      data: format(targetDate, 'yyyy-MM-dd'),
      hora: alignedTime,
      // Preserve all other fields exactly as they are
      nom: originalAppointment.nom || '',
      notes: originalAppointment.notes || '',
      servei: originalAppointment.servei || '',
      preu: originalAppointment.preu || 0,
      duration: originalAppointment.duration || 60,
      serviceName: originalAppointment.serviceName || '',
      serviceId: originalAppointment.serviceId || '',
      userId: user.uid // Ensure userId is set to current user (like edit form does)
    };

    // Update the appointment in the list
    const updatedAppointments = appointments.map(app =>
      app.id === appointment.id ? updatedAppointment : app
    );

    // Save to state and localStorage (using both keys for consistency)
    this.stateService.setAppointments(updatedAppointments);
    localStorage.setItem('cites', JSON.stringify(updatedAppointments));
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    // Dispatch custom event to notify other components (like edit form does)
    window.dispatchEvent(new CustomEvent('appointmentUpdated', {
      detail: { appointment: updatedAppointment }
    }));

    // Show toast notification for drag&drop (different from edit)
    this.toastService.showSuccess('Cita moguda', `S'ha mogut la cita de ${originalAppointment.nom} a ${format(targetDate, 'dd/MM')} a les ${alignedTime}`);
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
