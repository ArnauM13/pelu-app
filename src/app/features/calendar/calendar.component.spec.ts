import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent, AppointmentEvent } from './calendar.component';
import { signal } from '@angular/core';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Basic Properties', () => {
    it('should have timeSlots computed property', () => {
      expect(component.timeSlots).toBeDefined();
      const timeSlots = component.timeSlots();
      expect(Array.isArray(timeSlots)).toBe(true);
      expect(timeSlots.length).toBeGreaterThan(0);
      // Should have 30-minute intervals (2 slots per hour * 12 hours = 24 slots) + 2 lunch break slots = 26 slots
      expect(timeSlots.length).toBe(26);
    });

    it('should have weekDays computed property', () => {
      expect(component.weekDays).toBeDefined();
      const weekDays = component.weekDays();
      expect(Array.isArray(weekDays)).toBe(true);
      expect(weekDays.length).toBe(5); // Tuesday to Saturday
    });

    it('should have calendarEvents computed property', () => {
      expect(component.calendarEvents).toBeDefined();
      const events = component.calendarEvents();
      expect(Array.isArray(events)).toBe(true);
    });

    it('should have selectedDateMessage computed property', () => {
      expect(component.selectedDateMessage).toBeDefined();
      const message = component.selectedDateMessage();
      expect(typeof message).toBe('string');
    });
  });

  describe('Navigation Methods', () => {
    it('should have previousWeek method', () => {
      expect(typeof component.previousWeek).toBe('function');
    });

    it('should have nextWeek method', () => {
      expect(typeof component.nextWeek).toBe('function');
    });

    it('should have today method', () => {
      expect(typeof component.today).toBe('function');
    });

    it('should have canNavigateToPreviousWeek method', () => {
      expect(typeof component.canNavigateToPreviousWeek).toBe('function');
    });
  });

  describe('Selection Methods', () => {
    it('should have selectDay method', () => {
      expect(typeof component.selectDay).toBe('function');
    });

    it('should have selectTimeSlot method', () => {
      expect(typeof component.selectTimeSlot).toBe('function');
    });

    it('should have isDaySelected method', () => {
      expect(typeof component.isDaySelected).toBe('function');
    });

    it('should have isTimeSlotSelected method', () => {
      expect(typeof component.isTimeSlotSelected).toBe('function');
    });
  });

  describe('Utility Methods', () => {
    it('should have formatPopupDate method', () => {
      expect(typeof component.formatPopupDate).toBe('function');
    });

    it('should have format method', () => {
      expect(typeof component.format).toBe('function');
    });

    it('should have isPastDate method', () => {
      expect(typeof component.isPastDate).toBe('function');
    });

    it('should have getDayName method', () => {
      expect(typeof component.getDayName).toBe('function');
    });

    it('should have getEventTime method', () => {
      expect(typeof component.getEventTime).toBe('function');
    });

    it('should have formatDuration method', () => {
      expect(typeof component.formatDuration).toBe('function');
    });

    it('should have getTimeSlotTooltip method', () => {
      expect(typeof component.getTimeSlotTooltip).toBe('function');
    });
  });

  describe('Appointment Methods', () => {
    it('should have getEventsForDay method', () => {
      expect(typeof component.getEventsForDay).toBe('function');
    });

    it('should have isTimeSlotAvailable method', () => {
      expect(typeof component.isTimeSlotAvailable).toBe('function');
    });

    it('should have getAppointmentForTimeSlot method', () => {
      expect(typeof component.getAppointmentForTimeSlot).toBe('function');
    });

    it('should have getAppointmentDisplayInfo method', () => {
      expect(typeof component.getAppointmentDisplayInfo).toBe('function');
    });

    it('should have isLunchBreak method', () => {
      expect(typeof component.isLunchBreak).toBe('function');
    });

    it('should have isPastTimeSlot method', () => {
      expect(typeof component.isPastTimeSlot).toBe('function');
    });
  });

  describe('Appointment Coverage Functionality', () => {
    it('should have getAppointmentSlotCoverage method', () => {
      expect(typeof component.getAppointmentSlotCoverage).toBe('function');
    });

    it('should have shouldShowAppointmentInfo method', () => {
      expect(typeof component.shouldShowAppointmentInfo).toBe('function');
    });

    it('should calculate appointment coverage correctly for no appointment', () => {
      const testDate = new Date('2024-01-15');
      const testTime = '10:00';

      const coverage = component.getAppointmentSlotCoverage(testDate, testTime);
      expect(coverage).toBe(0);
    });

    it('should calculate appointment coverage correctly for different durations', () => {
      const testDate = new Date('2024-01-15');
      const testTime = '10:00';

      // Coverage should be between 0 and 1
      const coverage = component.getAppointmentSlotCoverage(testDate, testTime);
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(1);
    });


  });

  describe('Format Duration', () => {
    it('should format minutes correctly', () => {
      expect(component.formatDuration(30)).toBe('30 min');
      expect(component.formatDuration(45)).toBe('45 min');
    });

    it('should format hours correctly', () => {
      expect(component.formatDuration(60)).toBe('1h');
      expect(component.formatDuration(120)).toBe('2h');
    });

    it('should format hours and minutes correctly', () => {
      expect(component.formatDuration(90)).toBe('1h 30min');
      expect(component.formatDuration(150)).toBe('2h 30min');
    });
  });

  describe('Lunch Break Detection', () => {
    it('should detect lunch break times', () => {
      expect(component.isLunchBreak('13:00')).toBe(true);
      expect(component.isLunchBreak('13:30')).toBe(true);
      expect(component.isLunchBreak('14:00')).toBe(true);
      expect(component.isLunchBreak('14:30')).toBe(true);
      expect(component.isLunchBreak('15:00')).toBe(false);
    });

    it('should not detect non-lunch break times', () => {
      expect(component.isLunchBreak('10:00')).toBe(false);
      expect(component.isLunchBreak('10:30')).toBe(false);
      expect(component.isLunchBreak('16:00')).toBe(false);
    });
  });

  describe('Past Date Detection', () => {
    it('should detect past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(component.isPastDate(pastDate)).toBe(true);
    });

    it('should not detect future dates as past', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(component.isPastDate(futureDate)).toBe(false);
    });
  });

  describe('Day Name Formatting', () => {
    it('should return correct day names', () => {
      const monday = new Date('2024-01-15'); // Monday
      const tuesday = new Date('2024-01-16'); // Tuesday

      expect(component.getDayName(monday)).toBe('Dilluns');
      expect(component.getDayName(tuesday)).toBe('Dimarts');
    });
  });

  describe('Event Time Extraction', () => {
    it('should extract time from event string', () => {
      const eventString = '2024-01-15T10:30:00';
      expect(component.getEventTime(eventString)).toBe('10:30');
    });

    it('should handle 30-minute time slots', () => {
      const eventString1 = '2024-01-15T10:00:00';
      expect(component.getEventTime(eventString1)).toBe('10:00');

      const eventString2 = '2024-01-15T10:30:00';
      expect(component.getEventTime(eventString2)).toBe('10:30');

      const eventString3 = '2024-01-15T11:00:00';
      expect(component.getEventTime(eventString3)).toBe('11:00');

      const eventString4 = '2024-01-15T11:30:00';
      expect(component.getEventTime(eventString4)).toBe('11:30');
    });

    it('should handle invalid event strings', () => {
      expect(component.getEventTime('invalid')).toBe('');
      expect(component.getEventTime('')).toBe('');
    });
  });

  describe('Date Formatting', () => {
    it('should format popup date correctly', () => {
      const dateString = '2024-01-15';
      const formatted = component.formatPopupDate(dateString);
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
    });

    it('should handle empty date string', () => {
      expect(component.formatPopupDate('')).toBe('');
    });
  });

  describe('Time Slot Availability', () => {
    it('should check time slot availability', () => {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 1); // Tomorrow
      const testTime = '10:00';

      const isAvailable = component.isTimeSlotAvailable(testDate, testTime);
      expect(typeof isAvailable).toBe('boolean');
    });

        it('should not allow lunch break slots', () => {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 1);

      expect(component.isTimeSlotAvailable(testDate, '13:00')).toBe(false);
      expect(component.isTimeSlotAvailable(testDate, '13:30')).toBe(false);
      expect(component.isTimeSlotAvailable(testDate, '14:00')).toBe(false);
      expect(component.isTimeSlotAvailable(testDate, '14:30')).toBe(false);
    });
  });

  describe('Tooltip Generation', () => {
        it('should generate tooltips for different slot types', () => {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 1);

      const lunchTooltip = component.getTimeSlotTooltip(testDate, '13:00');
      expect(lunchTooltip).toContain('Pausa');

      const lunchTooltip2 = component.getTimeSlotTooltip(testDate, '13:30');
      expect(lunchTooltip2).toContain('Pausa');

      const availableTooltip = component.getTimeSlotTooltip(testDate, '10:00');
      expect(availableTooltip).toContain('Disponible');

      const availableTooltip2 = component.getTimeSlotTooltip(testDate, '10:30');
      expect(availableTooltip2).toContain('Disponible');
    });
  });
});
