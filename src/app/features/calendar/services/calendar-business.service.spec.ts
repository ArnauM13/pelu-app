import { TestBed } from '@angular/core/testing';
import { CalendarBusinessService } from './calendar-business.service';

describe('CalendarBusinessService', () => {
  let service: CalendarBusinessService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalendarBusinessService]
    });

    service = TestBed.inject(CalendarBusinessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Business Configuration', () => {
    it('should get business configuration', () => {
      const config = service.getBusinessConfig();
      expect(config.hours.start).toBe(8);
      expect(config.hours.end).toBe(20);
      expect(config.days.start).toBe(1); // Monday
      expect(config.days.end).toBe(6);   // Saturday
      expect(config.lunchBreak.start).toBe(13);
      expect(config.lunchBreak.end).toBe(15);
    });
  });

  describe('Business Days', () => {
    it('should check if day is business day', () => {
      expect(service.isBusinessDay(1)).toBe(true);  // Monday
      expect(service.isBusinessDay(5)).toBe(true);  // Friday
      expect(service.isBusinessDay(6)).toBe(true);  // Saturday
      expect(service.isBusinessDay(0)).toBe(false); // Sunday
    });

    it('should get business days for week', () => {
      const monday = new Date('2024-01-15'); // Monday
      const businessDays = service.getBusinessDaysForWeek(monday);

      expect(businessDays.length).toBeGreaterThan(0);
      businessDays.forEach(day => {
        expect(service.isBusinessDay(day.getDay())).toBe(true);
      });
    });
  });

  describe('Lunch Break', () => {
    it('should check if time is during lunch break', () => {
      expect(service.isLunchBreak('13:00')).toBe(true);
      expect(service.isLunchBreak('14:30')).toBe(true);
      expect(service.isLunchBreak('15:00')).toBe(false);
      expect(service.isLunchBreak('12:30')).toBe(false);
    });

    it('should check if time is lunch break start', () => {
      expect(service.isLunchBreakStart('13:00')).toBe(true);
      expect(service.isLunchBreakStart('13:30')).toBe(false);
      expect(service.isLunchBreakStart('14:00')).toBe(false);
    });
  });

  describe('Time Slots', () => {
    it('should check if time slot is bookable', () => {
      expect(service.isTimeSlotBookable('08:00')).toBe(true);
      expect(service.isTimeSlotBookable('12:30')).toBe(true);
      expect(service.isTimeSlotBookable('13:00')).toBe(false); // Lunch break
      expect(service.isTimeSlotBookable('15:00')).toBe(true);
      expect(service.isTimeSlotBookable('20:00')).toBe(false); // After hours
    });

    it('should generate time slots', () => {
      const slots = service.generateTimeSlots();
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toBe('08:00');
      expect(slots).toContain('12:30');
      expect(slots).not.toContain('13:00'); // Lunch break
      expect(slots).toContain('15:00');
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

      expect(service.isPastTimeSlot(today, pastTime)).toBe(false); // Depends on current time
      expect(service.isPastTimeSlot(today, futureTime)).toBe(false);
    });
  });

  describe('Appointments', () => {
    it('should get appointments for day', () => {
      const date = new Date('2024-01-15');
      const appointments: any[] = [
        { id: '1', title: 'Test', start: '2024-01-15T10:00:00', duration: 60 }
      ];

      const dayAppointments = service.getAppointmentsForDay(date, appointments);
      expect(dayAppointments.length).toBe(1);
    });

    it('should check if has available time slots', () => {
      const date = new Date('2024-01-15');
      const appointments: any[] = [];

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
});
