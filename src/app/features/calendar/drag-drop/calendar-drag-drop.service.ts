import { Injectable, signal, computed } from '@angular/core';
import { CalendarPositionService } from '../services/calendar-position.service';
import { AppointmentEvent } from '../core/calendar.component';

export interface Position {
  top: number;
  left: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarDragDropService {
  private readonly isDraggingSignal = signal<boolean>(false);
  private readonly draggedAppointmentSignal = signal<AppointmentEvent | null>(null);
  private readonly originalPositionSignal = signal<Position | null>(null);
  private readonly currentPositionSignal = signal<Position | null>(null);
  private readonly targetDateSignal = signal<Date | null>(null);
  private readonly targetTimeSignal = signal<string | null>(null);
  private readonly originalDateSignal = signal<Date | null>(null);
  private readonly isValidDropSignal = signal<boolean>(true);

  readonly isDragging = computed(() => this.isDraggingSignal());
  readonly draggedAppointment = computed(() => this.draggedAppointmentSignal());
  readonly originalPosition = computed(() => this.originalPositionSignal());
  readonly currentPosition = computed(() => this.currentPositionSignal());
  readonly targetDate = computed(() => this.targetDateSignal());
  readonly targetTime = computed(() => this.targetTimeSignal());
  readonly originalDate = computed(() => this.originalDateSignal());
  readonly isValidDrop = computed(() => this.isValidDropSignal());

  private positionService = inject(CalendarPositionService);

  constructor() {}

  startDrag(appointment: AppointmentEvent, originalPosition: Position, originalDate: Date): void {
    this.isDraggingSignal.set(true);
    this.draggedAppointmentSignal.set(appointment);
    this.originalPositionSignal.set(originalPosition);
    this.originalDateSignal.set(originalDate);
  }

  updateDragPosition(position: Position): void {
    this.currentPositionSignal.set(position);
  }

  updateTargetDateTime(position: Position, dayColumn: Date): void {
    this.currentPositionSignal.set(position);
    this.targetDateSignal.set(dayColumn);
    // Mock time calculation
    this.targetTimeSignal.set('10:00');
  }

  isMovingToDifferentDay(): boolean {
    return (
      this.originalDate() !== null &&
      this.targetDate() !== null &&
      this.originalDate()!.getTime() !== this.targetDate()!.getTime()
    );
  }

  async endDrag(): Promise<boolean> {
    if (!this.isDragging() || !this.draggedAppointment()) {
      return false;
    }

    // Mock implementation
    this.reset();
    return true;
  }

  cancelDrag(): void {
    this.reset();
  }

  canDropAppointment(
    _sourceDate: Date,
    _targetDate: Date,
    _sourceTime: string,
    _targetTime: string
  ): boolean {
    return true;
  }

  dropAppointment(_appointmentId: string, _targetDate: Date, _targetTime: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  private reset(): void {
    this.isDraggingSignal.set(false);
    this.draggedAppointmentSignal.set(null);
    this.originalPositionSignal.set(null);
    this.currentPositionSignal.set(null);
    this.targetDateSignal.set(null);
    this.targetTimeSignal.set(null);
    this.originalDateSignal.set(null);
    this.isValidDropSignal.set(true);
  }
}
