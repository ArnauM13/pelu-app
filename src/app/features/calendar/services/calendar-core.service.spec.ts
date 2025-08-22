import { TestBed } from '@angular/core/testing';
import {
  CalendarCoreService,
  CoordinatePosition,
  GridConfiguration,
} from './calendar-core.service';
import { CalendarStateService } from './calendar-state.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AppointmentEvent } from '../core/calendar.component';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';
import { RoleService } from '../../../core/services/role.service';
import { LoggerService } from '../../../shared/services/logger.service';

describe('CalendarCoreService', () => {
  let service: CalendarCoreService;
  let _mockStateService: jasmine.SpyObj<CalendarStateService>;
  let _mockToastService: jasmine.SpyObj<ToastService>;
  let _mockAuthService: jasmine.SpyObj<AuthService>;
  let _mockRoleService: jasmine.SpyObj<RoleService>;
  let _mockLoggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    const stateServiceSpy = jasmine.createSpyObj('CalendarStateService', [
      'appointments',
      'setAppointments',
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showError',
      'showSuccess',
      'showAppointmentCreated',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user', 'isAuthenticated']);
    const roleServiceSpy = jasmine.createSpyObj('RoleService', [
      'isAdmin',
      'isClient',
    ]);
    const loggerServiceSpy = jasmine.createSpyObj('LoggerService', [
      'log',
      'error',
      'warn',
      'info',
    ]);

    // Setup default mocks BEFORE TestBed configuration
    stateServiceSpy.appointments.and.returnValue([]);
    authServiceSpy.user.and.returnValue({
      uid: 'test-user',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z',
        lastSignInTime: '2024-01-15T00:00:00.000Z',
      },
      phoneNumber: null,
      photoURL: null,
      providerData: [],
      providerId: 'password',
      refreshToken: 'mock-refresh-token',
      tenantId: null,
    } as unknown);
    authServiceSpy.isAuthenticated.and.returnValue(true);
    roleServiceSpy.isAdmin.and.returnValue(false);
    roleServiceSpy.isClient.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        CalendarCoreService,
        { provide: CalendarStateService, useValue: stateServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: RoleService, useValue: roleServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy },
        ...provideMockFirebase(),
      ],
    });

    service = TestBed.inject(CalendarCoreService);
    _mockStateService = TestBed.inject(CalendarStateService) as jasmine.SpyObj<CalendarStateService>;
    _mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    _mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    _mockRoleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    _mockLoggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Grid Configuration', () => {
    it('should have default configuration', () => {
      const config = service.gridConfiguration();
      expect(config.slotHeightPx).toBe(30);
      expect(config.pixelsPerMinute).toBe(1);
      expect(config.slotDurationMinutes).toBe(30);
      expect(config.businessStartHour).toBe(8);
      expect(config.businessEndHour).toBe(20);
      expect(config.lunchBreakStart).toBe(13);
      expect(config.lunchBreakEnd).toBe(15);
    });

    it('should update configuration correctly', () => {
      const newConfig: Partial<GridConfiguration> = {
        slotHeightPx: 40,
        pixelsPerMinute: 2,
        businessStartHour: 9,
      };

      service.updateGridConfiguration(newConfig);
      const config = service.gridConfiguration();

      expect(config.slotHeightPx).toBe(40);
      expect(config.pixelsPerMinute).toBe(2);
      expect(config.businessStartHour).toBe(9);
      expect(config.businessEndHour).toBe(20); // Should remain unchanged
    });
  });

  describe('Coordinate Conversion', () => {
    beforeEach(() => {
      service.updateGridConfiguration({
        slotHeightPx: 30,
        pixelsPerMinute: 1,
        slotDurationMinutes: 30,
        businessStartHour: 8,
        businessEndHour: 20,
        lunchBreakStart: 13,
        lunchBreakEnd: 15,
      });
    });

    it('should convert Y coordinate to time correctly', () => {
      expect(service.coordinateToTime(0)).toBe('08:00');
      expect(service.coordinateToTime(30)).toBe('08:30');
      expect(service.coordinateToTime(60)).toBe('09:00');
      expect(service.coordinateToTime(120)).toBe('10:00');
    });

    it('should convert time to Y coordinate correctly', () => {
      expect(service.timeToCoordinate('08:00')).toBe(0);
      expect(service.timeToCoordinate('08:30')).toBe(30);
      expect(service.timeToCoordinate('09:00')).toBe(60);
      expect(service.timeToCoordinate('10:00')).toBe(120);
    });

    it('should convert coordinate position to time position', () => {
      const targetDate = new Date('2024-01-15');
      const coordinatePosition: CoordinatePosition = { x: 0, y: 90 };

      const timePosition = service.coordinateToTimePosition(coordinatePosition, targetDate);

      expect(timePosition.date).toEqual(targetDate);
      expect(timePosition.time).toBe('09:30');
    });
  });

  describe('Time Alignment', () => {
    beforeEach(() => {
      service.updateGridConfiguration({
        slotHeightPx: 30,
        pixelsPerMinute: 1,
        slotDurationMinutes: 30,
        businessStartHour: 8,
        businessEndHour: 20,
        lunchBreakStart: 13,
        lunchBreakEnd: 15,
      });
    });

    it('should align time to nearest 30-minute slot', () => {
      expect(service.alignTimeToGrid('09:15')).toBe('09:00');
      expect(service.alignTimeToGrid('09:25')).toBe('09:30');
      expect(service.alignTimeToGrid('09:45')).toBe('09:30');
      expect(service.alignTimeToGrid('09:55')).toBe('10:00');
    });

    it('should clamp to business hours', () => {
      expect(service.alignTimeToGrid('07:30')).toBe('08:00');
      expect(service.alignTimeToGrid('20:30')).toBe('19:30');
    });
  });

  describe('Appointment Position Calculation', () => {
    beforeEach(() => {
      service.updateGridConfiguration({
        slotHeightPx: 30,
        pixelsPerMinute: 1,
        slotDurationMinutes: 30,
        businessStartHour: 8,
        businessEndHour: 20,
        lunchBreakStart: 13,
        lunchBreakEnd: 15,
      });
    });

    it('should calculate appointment position correctly', () => {
      const appointment: AppointmentEvent = {
        id: '1',
        title: 'Test Appointment',
        start: '2024-01-15T09:00:00',
        duration: 60,
      };

      const position = service.calculateAppointmentPosition(appointment);

      expect(position.top).toBe(60); // 1 hour from start
      expect(position.height).toBe(60); // 60 minutes * 1 pixel per minute
    });

    it('should calculate position from time and duration', () => {
      const position = service.calculateAppointmentPositionFromTime('09:00', 90);

      expect(position.top).toBe(60);
      expect(position.height).toBe(90);
    });
  });

  describe('Business Logic', () => {
    beforeEach(() => {
      service.updateGridConfiguration({
        slotHeightPx: 30,
        pixelsPerMinute: 1,
        slotDurationMinutes: 30,
        businessStartHour: 8,
        businessEndHour: 20,
        lunchBreakStart: 13,
        lunchBreakEnd: 15,
      });
    });

    it('should correctly identify business hours', () => {
      expect(service.isWithinBusinessHours('08:00')).toBe(true);
      expect(service.isWithinBusinessHours('12:00')).toBe(true);
      expect(service.isWithinBusinessHours('19:30')).toBe(true);
      expect(service.isWithinBusinessHours('07:00')).toBe(false);
      expect(service.isWithinBusinessHours('20:00')).toBe(false);
    });

    it('should correctly identify bookable time slots', () => {
      expect(service.isTimeSlotBookable('08:00')).toBe(true);
      expect(service.isTimeSlotBookable('12:30')).toBe(true);
      expect(service.isTimeSlotBookable('13:00')).toBe(false);
      expect(service.isTimeSlotBookable('14:30')).toBe(false);
      expect(service.isTimeSlotBookable('15:00')).toBe(true);
      expect(service.isTimeSlotBookable('19:30')).toBe(true);
    });

    it('should check time slot availability', () => {
      const appointments: AppointmentEvent[] = [];
      const date = new Date('2024-01-15');

      expect(service.isTimeSlotAvailable(date, '09:00', appointments)).toBe(true);
      expect(service.isTimeSlotAvailable(date, '13:00', appointments)).toBe(false); // Lunch break
    });
  });

  describe('Drag & Drop State', () => {
    it('should initialize drag state correctly', () => {
      expect(service.isDragging()).toBe(false);
      expect(service.draggedAppointment()).toBeNull();
      expect(service.targetDate()).toBeNull();
      expect(service.targetTime()).toBeNull();
    });

    it('should start drag operation', () => {
      const appointment: AppointmentEvent = {
        id: '1',
        title: 'Test Appointment',
        start: '2024-01-15T09:00:00',
        duration: 60,
      };
      const originalPosition = { top: 100, left: 50 };
      const originalDate = new Date('2024-01-15');

      service.startDrag(appointment, originalPosition, originalDate);

      expect(service.isDragging()).toBe(true);
      expect(service.draggedAppointment()).toEqual(appointment);
      expect(service.originalPosition()).toEqual(originalPosition);
      expect(service.targetDate()).toEqual(originalDate);
      expect(service.targetTime()).toBe('09:00');
    });

    it('should update drag position', () => {
      const newPosition = { top: 200, left: 100 };
      service.updateDragPosition(newPosition);
      expect(service.currentPosition()).toEqual(newPosition);
    });

    it('should end drag operation', async () => {
      // Start a drag operation first
      const appointment: AppointmentEvent = {
        id: '1',
        title: 'Test Appointment',
        start: '2024-01-15T09:00:00',
        duration: 60,
      };
      service.startDrag(appointment, { top: 100, left: 50 }, new Date('2024-01-15'));

      const result = await service.endDrag();
      expect(result).toBe(false); // Should fail because no valid target position
      expect(service.isDragging()).toBe(false);
    });

    it('should cancel drag operation', () => {
      const appointment: AppointmentEvent = {
        id: '1',
        title: 'Test Appointment',
        start: '2024-01-15T09:00:00',
        duration: 60,
      };
      service.startDrag(appointment, { top: 100, left: 50 }, new Date('2024-01-15'));

      service.cancelDrag();
      expect(service.isDragging()).toBe(false);
      expect(service.draggedAppointment()).toBeNull();
    });
  });

  describe('Time Slot Generation', () => {
    beforeEach(() => {
      service.updateGridConfiguration({
        slotHeightPx: 30,
        pixelsPerMinute: 1,
        slotDurationMinutes: 30,
        businessStartHour: 8,
        businessEndHour: 20,
        lunchBreakStart: 13,
        lunchBreakEnd: 15,
      });
    });

    it('should generate available time slots excluding lunch break', () => {
      const slots = service.getAvailableTimeSlots();

      expect(slots).toContain('08:00');
      expect(slots).toContain('12:30');
      expect(slots).not.toContain('13:00');
      expect(slots).not.toContain('14:30');
      expect(slots).toContain('15:00');
      expect(slots).toContain('19:30');
    });

    it('should get next available time slot', () => {
      expect(service.getNextAvailableTimeSlot('09:00')).toBe('09:30');
      expect(service.getNextAvailableTimeSlot('12:30')).toBe('15:00'); // Skip lunch
    });
  });

  describe('Lunch Break Calculations', () => {
    beforeEach(() => {
      service.updateGridConfiguration({
        slotHeightPx: 30,
        pixelsPerMinute: 1,
        slotDurationMinutes: 30,
        businessStartHour: 8,
        businessEndHour: 20,
        lunchBreakStart: 13,
        lunchBreakEnd: 15,
      });
    });

    it('should calculate lunch break offset correctly', () => {
      const offset = service.getLunchBreakOffset();
      expect(offset).toBe(300); // 5 hours * 60 minutes * 1 pixel per minute
    });

    it('should calculate lunch break height correctly', () => {
      const height = service.getLunchBreakHeight();
      expect(height).toBe(120); // 2 hours * 60 minutes * 1 pixel per minute
    });
  });
});
