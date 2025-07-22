import { Injectable, signal, computed } from '@angular/core';
import { CalendarPositionService } from './calendar-position.service';

export interface Position {
  top: number;
  left: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarDragDropService {

  private readonly originalPositionSignal = signal<Position | null>(null);
  private readonly currentPositionSignal = signal<Position | null>(null);
  private readonly targetDateSignal = signal<Date | null>(null);
  private readonly targetTimeSignal = signal<string | null>(null);

  readonly originalPosition = computed(() => this.originalPositionSignal());
  readonly currentPosition = computed(() => this.currentPositionSignal());
  readonly targetDate = computed(() => this.targetDateSignal());
  readonly targetTime = computed(() => this.targetTimeSignal());

  constructor(private positionService: CalendarPositionService) {}

  canDropAppointment(sourceDate: Date, targetDate: Date, sourceTime: string, targetTime: string): boolean {
    // Mock implementation for testing
    return true;
  }

  dropAppointment(appointmentId: string, targetDate: Date, targetTime: string): Promise<boolean> {
    // Mock implementation for testing
    return Promise.resolve(true);
  }

  setOriginalPosition(position: Position | null): void {
    this.originalPositionSignal.set(position);
  }

  setCurrentPosition(position: Position | null): void {
    this.currentPositionSignal.set(position);
  }

  setTargetDate(date: Date | null): void {
    this.targetDateSignal.set(date);
  }

  setTargetTime(time: string | null): void {
    this.targetTimeSignal.set(time);
  }

  reset(): void {
    this.originalPositionSignal.set(null);
    this.currentPositionSignal.set(null);
    this.targetDateSignal.set(null);
    this.targetTimeSignal.set(null);
  }
}
