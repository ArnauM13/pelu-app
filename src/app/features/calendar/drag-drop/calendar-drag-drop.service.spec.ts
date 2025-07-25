import { TestBed } from '@angular/core/testing';
import { CalendarDragDropService } from './calendar-drag-drop.service';
import { CalendarPositionService } from '../services/calendar-position.service';
import { AppointmentEvent } from '../core/calendar.component';

describe('CalendarDragDropService', () => {
  let service: CalendarDragDropService;
  let positionService: jasmine.SpyObj<CalendarPositionService>;

  beforeEach(() => {
    const positionSpy = jasmine.createSpyObj('CalendarPositionService', [
      'calculatePosition',
      'getTimeSlotPosition',
      'getDayPosition',
    ]);

    // Setup default spy returns
    positionSpy.calculatePosition.and.returnValue({ top: 0, left: 0 });
    positionSpy.getTimeSlotPosition.and.returnValue({ top: 0, left: 0 });
    positionSpy.getDayPosition.and.returnValue({ top: 0, left: 0 });

    TestBed.configureTestingModule({
      providers: [
        CalendarDragDropService,
        { provide: CalendarPositionService, useValue: positionSpy },
      ],
    });

    service = TestBed.inject(CalendarDragDropService);
    positionService = TestBed.inject(
      CalendarPositionService
    ) as jasmine.SpyObj<CalendarPositionService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start drag correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
    };

    const originalPosition = { top: 100, left: 50 };
    const originalDate = new Date('2024-01-01');

    service.startDrag(appointment, originalPosition, originalDate);

    expect(service.isDragging()).toBe(true);
    expect(service.draggedAppointment()).toEqual(appointment);
    expect(service.originalPosition()).toEqual(originalPosition);
    expect(service.currentPosition()).toBeNull(); // currentPosition is not set by startDrag
    expect(service.originalDate()).toEqual(originalDate);
  });

  it('should update drag position correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
    };

    service.startDrag(appointment, { top: 100, left: 50 }, new Date('2024-01-01'));

    const newPosition = { top: 150, left: 75 };
    service.updateDragPosition(newPosition);

    expect(service.currentPosition()).toEqual(newPosition);
  });

  it('should calculate time from position correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
    };

    service.startDrag(appointment, { top: 100, left: 50 }, new Date('2024-01-01'));

    const day = new Date('2024-01-01');
    const position = { top: 120, left: 0 }; // 120 minutes from 8:00 = 10:00

    service.updateTargetDateTime(position, day);

    expect(service.targetTime()).toBe('10:00');
    expect(service.targetDate()).toEqual(day);
  });

  it('should validate drop position correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
    };

    service.startDrag(appointment, { top: 100, left: 50 }, new Date('2024-01-01'));

    const day = new Date('2024-01-01');
    const position = { top: 120, left: 0 };

    service.updateTargetDateTime(position, day);

    expect(service.isValidDrop()).toBe(true);
  });

  it('should end drag successfully when position is valid', async () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
    };

    service.startDrag(appointment, { top: 100, left: 50 }, new Date('2024-01-01'));

    const day = new Date('2024-01-01');
    const position = { top: 120, left: 0 };

    service.updateTargetDateTime(position, day);

    const result = await service.endDrag();

    expect(result).toBe(true);
    expect(service.isDragging()).toBe(false);
  });

  it('should cancel drag correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
    };

    service.startDrag(appointment, { top: 100, left: 50 }, new Date('2024-01-01'));
    expect(service.isDragging()).toBe(true);

    service.cancelDrag();

    expect(service.isDragging()).toBe(false);
    expect(service.draggedAppointment()).toBeNull();
    expect(service.originalPosition()).toBeNull();
    expect(service.currentPosition()).toBeNull();
    expect(service.targetDate()).toBeNull();
    expect(service.targetTime()).toBeNull();
  });

  it('should detect cross-day dragging correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
    };

    const originalDate = new Date('2024-01-01');
    service.startDrag(appointment, { top: 100, left: 50 }, originalDate);

    // Same day - should return false
    service.updateTargetDateTime({ top: 120, left: 0 }, originalDate);
    expect(service.isMovingToDifferentDay()).toBe(false);

    // Different day - should return true
    const differentDate = new Date('2024-01-02');
    service.updateTargetDateTime({ top: 120, left: 0 }, differentDate);
    expect(service.isMovingToDifferentDay()).toBe(true);
  });
});
