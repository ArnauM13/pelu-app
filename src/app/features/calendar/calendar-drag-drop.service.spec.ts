import { TestBed } from '@angular/core/testing';
import { CalendarDragDropService } from './calendar-drag-drop.service';
import { CalendarPositionService } from './calendar-position.service';
import { CalendarStateService } from './calendar-state.service';
import { AppointmentEvent } from './calendar.component';

describe('CalendarDragDropService', () => {
  let service: CalendarDragDropService;
  let positionService: jasmine.SpyObj<CalendarPositionService>;
  let stateService: jasmine.SpyObj<CalendarStateService>;

  beforeEach(() => {
    const positionSpy = jasmine.createSpyObj('CalendarPositionService', [
      'getPixelsPerMinute',
      'isTimeSlotAvailable'
    ]);
    const stateSpy = jasmine.createSpyObj('CalendarStateService', [
      'appointments',
      'setAppointments'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CalendarDragDropService,
        { provide: CalendarPositionService, useValue: positionSpy },
        { provide: CalendarStateService, useValue: stateSpy }
      ]
    });

    service = TestBed.inject(CalendarDragDropService);
    positionService = TestBed.inject(CalendarPositionService) as jasmine.SpyObj<CalendarPositionService>;
    stateService = TestBed.inject(CalendarStateService) as jasmine.SpyObj<CalendarStateService>;

    // Setup default spy returns
    positionService.getPixelsPerMinute.and.returnValue(1);
    stateService.appointments.and.returnValue([]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start drag correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60
    };

    const originalPosition = { top: 100, left: 50 };

    service.startDrag(appointment, originalPosition);

    expect(service.isDragging()).toBe(true);
    expect(service.draggedAppointment()).toEqual(appointment);
    expect(service.originalPosition()).toEqual(originalPosition);
    expect(service.currentPosition()).toEqual(originalPosition);
  });

  it('should update drag position correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60
    };

    service.startDrag(appointment, { top: 100, left: 50 });

    const newPosition = { top: 150, left: 75 };
    service.updateDragPosition(newPosition);

    expect(service.currentPosition()).toEqual(newPosition);
  });

  it('should calculate time from position correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60
    };

    service.startDrag(appointment, { top: 100, left: 50 });

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
      duration: 60
    };

    positionService.isTimeSlotAvailable.and.returnValue(true);
    stateService.appointments.and.returnValue([]);

    service.startDrag(appointment, { top: 100, left: 50 });

    const day = new Date('2024-01-01');
    const position = { top: 120, left: 0 };

    service.updateTargetDateTime(position, day);

    expect(service.isValidDrop()).toBe(true);
  });

  it('should end drag successfully when position is valid', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60
    };

    positionService.isTimeSlotAvailable.and.returnValue(true);
    stateService.appointments.and.returnValue([]);

    service.startDrag(appointment, { top: 100, left: 50 });

    const day = new Date('2024-01-01');
    const position = { top: 120, left: 0 };

    service.updateTargetDateTime(position, day);

    const result = service.endDrag();

    expect(result).toBe(true);
    expect(service.isDragging()).toBe(false);
  });

  it('should cancel drag correctly', () => {
    const appointment: AppointmentEvent = {
      id: 'test-1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60
    };

    service.startDrag(appointment, { top: 100, left: 50 });
    expect(service.isDragging()).toBe(true);

    service.cancelDrag();

    expect(service.isDragging()).toBe(false);
    expect(service.draggedAppointment()).toBeNull();
    expect(service.originalPosition()).toBeNull();
    expect(service.currentPosition()).toBeNull();
    expect(service.targetDate()).toBeNull();
    expect(service.targetTime()).toBeNull();
  });
});
