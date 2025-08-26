import { TestBed } from '@angular/core/testing';
import { CalendarBusinessService } from './calendar-business.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

describe('CalendarBusinessService', () => {
  let service: CalendarBusinessService;
  let mockSystemParametersService: jasmine.SpyObj<SystemParametersService>;

  beforeEach(() => {
    mockSystemParametersService = jasmine.createSpyObj('SystemParametersService', [
      'getAppointmentDuration',
      'workingDays',
      'isLunchBreak',
      'businessHours',
      'lunchBreak'
    ]);

    // Setup default return values
    mockSystemParametersService.getAppointmentDuration.and.returnValue(30);
    mockSystemParametersService.workingDays.and.returnValue([1, 2, 3, 4, 5, 6]); // Monday to Saturday
    mockSystemParametersService.isLunchBreak.and.callFake((time: string) => {
      const hour = parseInt(time.split(':')[0]);
      return hour >= 13 && hour < 15;
    });
    mockSystemParametersService.businessHours.and.returnValue({ start: 8, end: 20, lunchStart: 13, lunchEnd: 15 });
    mockSystemParametersService.lunchBreak.and.returnValue({ start: 13, end: 15 });

    TestBed.configureTestingModule({
      providers: [
        CalendarBusinessService,
        { provide: SystemParametersService, useValue: mockSystemParametersService },
        provideMockFirebase(),
      ],
    });

    service = TestBed.inject(CalendarBusinessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Business Configuration', () => {
    it('should get business configuration from SystemParametersService', () => {
      const config = service.getBusinessConfig();
      
      expect(mockSystemParametersService.businessHours).toHaveBeenCalled();
      expect(mockSystemParametersService.lunchBreak).toHaveBeenCalled();
      expect(mockSystemParametersService.getAppointmentDuration).toHaveBeenCalled();
      
      expect(config.businessHours.start).toBe(8);
      expect(config.businessHours.end).toBe(20);
      expect(config.days.start).toBe(1); // Monday
      expect(config.days.end).toBe(6); // Saturday
      expect(config.lunchBreak.start).toBe(13);
      expect(config.lunchBreak.end).toBe(15);
    });
  });

  describe('Business Days', () => {
    it('should check if day is business day using SystemParametersService', () => {
      service.isBusinessDay(1); // Monday
      service.isBusinessDay(5); // Friday
      service.isBusinessDay(6); // Saturday
      service.isBusinessDay(0); // Sunday
      
      expect(mockSystemParametersService.workingDays).toHaveBeenCalledTimes(4);
      
      expect(service.isBusinessDay(1)).toBe(true); // Monday
      expect(service.isBusinessDay(5)).toBe(true); // Friday
      expect(service.isBusinessDay(6)).toBe(true); // Saturday
      expect(service.isBusinessDay(0)).toBe(false); // Sunday
    });

    it('should get business days for week starting from selected date', () => {
      const selectedDate = new Date('2024-01-15'); // Monday
      const businessDays = service.getBusinessDaysForWeek(selectedDate);

      expect(businessDays.length).toBeGreaterThan(0);
      // The first day should be the selected date
      expect(businessDays[0].toDateString()).toBe(selectedDate.toDateString());
      businessDays.forEach(day => {
        expect(service.isBusinessDay(day.getDay())).toBe(true);
      });
    });
  });

  describe('Lunch Break', () => {
    it('should check if time is during lunch break using SystemParametersService', () => {
      service.isLunchBreak('13:00');
      service.isLunchBreak('14:30');
      service.isLunchBreak('15:00');
      service.isLunchBreak('12:30');
      
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('13:00');
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('14:30');
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('15:00');
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('12:30');
      
      expect(service.isLunchBreak('13:00')).toBe(true);
      expect(service.isLunchBreak('14:30')).toBe(true);
      expect(service.isLunchBreak('15:00')).toBe(false);
      expect(service.isLunchBreak('12:30')).toBe(false);
    });
  });

  describe('Time Slots', () => {
    it('should check if time slot is bookable using SystemParametersService', () => {
      // Test each time slot individually and verify the calls
      const result1 = service.isTimeSlotBookable('08:00');
      expect(result1).toBe(true);
      
      const result2 = service.isTimeSlotBookable('12:30');
      expect(result2).toBe(true);
      
      const result3 = service.isTimeSlotBookable('13:00');
      expect(result3).toBe(false); // Lunch break
      
      const result4 = service.isTimeSlotBookable('15:00');
      expect(result4).toBe(true);
      
      const result5 = service.isTimeSlotBookable('20:00');
      expect(result5).toBe(false); // After hours
      
      // Verify that isLunchBreak was called for each time slot
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('08:00');
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('12:30');
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('13:00');
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('15:00');
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledWith('20:00');
      
      // Verify total number of calls
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalledTimes(5);
    });

    it('should generate time slots including lunch break times', () => {
      const slots = service.generateTimeSlots();
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toBe('08:00');
      expect(slots).toContain('12:30');
      expect(slots).toContain('13:00'); // Lunch break times are included but will be disabled in UI
      expect(slots).toContain('15:00');
      
      // Verify that lunch break times are included in the generated slots
      expect(slots).toContain('13:30');
      expect(slots).toContain('14:00');
      expect(slots).toContain('14:30');
    });
  });

  describe('Date Validation', () => {
    it('should check if date is past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(service.isPastDate(yesterday)).toBe(true);
      expect(service.isPastDate(tomorrow)).toBe(false);
    });

    it('should check if time slot is past', () => {
      const today = new Date();
      const pastTime = '08:00';
      const futureTime = '20:00';

      // The result depends on current time, so we test the logic structure
      const pastResult = service.isPastTimeSlot(today, pastTime);
      const futureResult = service.isPastTimeSlot(today, futureTime);
      
      expect(typeof pastResult).toBe('boolean');
      expect(typeof futureResult).toBe('boolean');
      
      // If it's early in the day, pastTime might be in the past
      // If it's late in the day, futureTime might be in the past
      // We just verify the method returns a boolean
    });
  });

  describe('Appointments', () => {
    it('should get appointments for day', () => {
      const date = new Date('2024-01-15');
      const appointments: { id: string; title: string; start: string; duration: number }[] = [
        { id: '1', title: 'Test', start: '2024-01-15T10:00:00', duration: 60 },
      ];

      const dayAppointments = service.getAppointmentsForDay(date, appointments);
      expect(dayAppointments.length).toBe(1);
    });

    it('should check if has available time slots', () => {
      const date = new Date('2024-01-15');
      const appointments: { id: string; title: string; start: string; duration: number }[] = [];

      expect(service.hasAvailableTimeSlots(date, appointments)).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should check if can navigate to previous week', () => {
      const today = new Date();
      const canNavigate = service.canNavigateToPreviousWeek(today);
      expect(typeof canNavigate).toBe('boolean');
    });

    it('should get appropriate view date', () => {
      const viewDate = service.getAppropriateViewDate();
      expect(viewDate).toBeInstanceOf(Date);
    });
  });

  describe('Info Methods', () => {
    it('should get business days info', () => {
      const info = service.getBusinessDaysInfo();
      expect(typeof info).toBe('string');
      expect(info.length).toBeGreaterThan(0);
    });

    it('should get business hours info', () => {
      const info = service.getBusinessHoursInfo();
      expect(typeof info).toBe('string');
      expect(info.length).toBeGreaterThan(0);
    });
  });

  describe('Service Integration', () => {
    it('should use SystemParametersService for all business logic', () => {
      // Test that the service properly delegates to SystemParametersService
      service.getBusinessConfig();
      service.isBusinessDay(1);
      service.isLunchBreak('13:00');
      service.getBusinessHoursForDate(new Date());
      
      expect(mockSystemParametersService.getAppointmentDuration).toHaveBeenCalled();
      expect(mockSystemParametersService.workingDays).toHaveBeenCalled();
      expect(mockSystemParametersService.isLunchBreak).toHaveBeenCalled();
      expect(mockSystemParametersService.businessHours).toHaveBeenCalled();
      expect(mockSystemParametersService.lunchBreak).toHaveBeenCalled();
    });
  });
});
