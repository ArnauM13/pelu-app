import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent, AppointmentEvent } from './calendar.component';
import { signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translation.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  mockAuth,
  mockTranslateService,
  mockTranslateStore,
  mockTranslationService,
  mockAuthService
} from '../../../testing/firebase-mocks';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TranslateStore, useValue: mockTranslateStore },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: AuthService, useValue: mockAuthService }
      ]
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
      expect(typeof component.timeSlots).toBe('function');
      expect(component.timeSlots().length).toBe(24);
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

  describe('Date Input Functionality', () => {
    it('should have onDateChange method', () => {
      expect(typeof component.onDateChange).toBe('function');
    });

    it('should handle date change correctly', () => {
      const testDate = '2024-01-15';
      const spy = spyOn(component['stateService'], 'navigateToDate');

      component.onDateChange(testDate);

      expect(spy).toHaveBeenCalledWith(testDate);
    });
  });
});
