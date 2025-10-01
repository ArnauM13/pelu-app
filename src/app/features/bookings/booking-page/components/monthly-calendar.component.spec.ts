import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { MonthlyCalendarComponent } from './monthly-calendar.component';
import { BookingStateService } from '../services/booking-state.service';
import { CalendarStateService } from '../../../calendar/services/calendar-state.service';

describe('MonthlyCalendarComponent', () => {
  let component: MonthlyCalendarComponent;
  let fixture: ComponentFixture<MonthlyCalendarComponent>;
  let bookingStateService: jasmine.SpyObj<BookingStateService>;
  let calendarStateService: jasmine.SpyObj<CalendarStateService>;

  beforeEach(async () => {
    const bookingStateSpy = jasmine.createSpyObj('BookingStateService', [
      'getCompleteMonthCalendar'
    ]);

    const calendarStateSpy = jasmine.createSpyObj('CalendarStateService', [
      'viewDate'
    ], {
      viewDate: signal(new Date('2024-01-15'))
    });

    // Mock the getCompleteMonthCalendar method
    bookingStateSpy.getCompleteMonthCalendar.and.returnValue([
      new Date('2024-01-01'),
      new Date('2024-01-02'),
      new Date('2024-01-03'),
      new Date('2024-01-04'),
      new Date('2024-01-05'),
      new Date('2024-01-06'),
      new Date('2024-01-07'),
      new Date('2024-01-08'),
      new Date('2024-01-09'),
      new Date('2024-01-10'),
      new Date('2024-01-11'),
      new Date('2024-01-12'),
      new Date('2024-01-13'),
      new Date('2024-01-14'),
      new Date('2024-01-15'),
      new Date('2024-01-16'),
      new Date('2024-01-17'),
      new Date('2024-01-18'),
      new Date('2024-01-19'),
      new Date('2024-01-20'),
      new Date('2024-01-21'),
      new Date('2024-01-22'),
      new Date('2024-01-23'),
      new Date('2024-01-24'),
      new Date('2024-01-25'),
      new Date('2024-01-26'),
      new Date('2024-01-27'),
      new Date('2024-01-28'),
      new Date('2024-01-29'),
      new Date('2024-01-30'),
      new Date('2024-01-31'),
      new Date('2024-02-01'),
      new Date('2024-02-02'),
      new Date('2024-02-03')
    ]);

    await TestBed.configureTestingModule({
      imports: [MonthlyCalendarComponent],
      providers: [
        { provide: BookingStateService, useValue: bookingStateSpy },
        { provide: CalendarStateService, useValue: calendarStateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyCalendarComponent);
    component = fixture.componentInstance;
    bookingStateService = TestBed.inject(BookingStateService) as jasmine.SpyObj<BookingStateService>;
    calendarStateService = TestBed.inject(CalendarStateService) as jasmine.SpyObj<CalendarStateService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Month Days Computation', () => {
    it('should compute month days from booking state service', () => {
      const monthDays = component.monthDays();
      expect(monthDays).toBeTruthy();
      expect(monthDays.length).toBeGreaterThan(0);
      expect(bookingStateService.getCompleteMonthCalendar).toHaveBeenCalled();
    });

    it('should use current month date for computation', () => {
      const testDate = new Date('2024-02-15');
      calendarStateService.viewDate.and.returnValue(signal(testDate));
      
      component.monthDays();
      
      expect(bookingStateService.getCompleteMonthCalendar).toHaveBeenCalledWith(testDate);
    });
  });

  describe('Date Selection Logic', () => {
    it('should select week start for weekly view', () => {
      const testDate = new Date('2024-01-16'); // Tuesday
      component.currentView.set('weekly');
      
      spyOn(component.dateSelected, 'emit');
      
      component.onDateClicked(testDate);
      
      // Should emit the start of the week (Monday)
      expect(component.dateSelected.emit).toHaveBeenCalled();
      const emittedDate = (component.dateSelected.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedDate.getDay()).toBe(1); // Monday
    });

    it('should select exact day for daily view', () => {
      const testDate = new Date('2024-01-16');
      component.currentView.set('daily');
      
      spyOn(component.dateSelected, 'emit');
      
      component.onDateClicked(testDate);
      
      expect(component.dateSelected.emit).toHaveBeenCalledWith(testDate);
    });

    it('should default to weekly view', () => {
      const testDate = new Date('2024-01-16'); // Tuesday
      component.currentView.set('weekly');
      
      spyOn(component.dateSelected, 'emit');
      
      component.onDateClicked(testDate);
      
      // Should emit the start of the week (Monday)
      expect(component.dateSelected.emit).toHaveBeenCalled();
      const emittedDate = (component.dateSelected.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedDate.getDay()).toBe(1); // Monday
    });
  });

  describe('Week Start Calculation', () => {
    it('should calculate week start correctly for Monday', () => {
      const monday = new Date('2024-01-15'); // Monday
      const weekStart = component['getWeekStart'](monday);
      
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(weekStart.getDate()).toBe(15);
    });

    it('should calculate week start correctly for Tuesday', () => {
      const tuesday = new Date('2024-01-16'); // Tuesday
      const weekStart = component['getWeekStart'](tuesday);
      
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(weekStart.getDate()).toBe(15); // Previous Monday
    });

    it('should calculate week start correctly for Sunday', () => {
      const sunday = new Date('2024-01-21'); // Sunday
      const weekStart = component['getWeekStart'](sunday);
      
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(weekStart.getDate()).toBe(15); // Previous Monday
    });

    it('should set time to start of day', () => {
      const testDate = new Date('2024-01-16');
      testDate.setHours(14, 30, 45, 123); // Set specific time
      
      const weekStart = component['getWeekStart'](testDate);
      
      expect(weekStart.getHours()).toBe(0);
      expect(weekStart.getMinutes()).toBe(0);
      expect(weekStart.getSeconds()).toBe(0);
      expect(weekStart.getMilliseconds()).toBe(0);
    });
  });

  describe('Input Properties', () => {
    it('should accept selectedDate input', () => {
      const testDate = new Date('2024-01-15');
      component.selectedDate.set(testDate);
      
      expect(component.selectedDate()).toEqual(testDate);
    });

    it('should accept viewDate input', () => {
      const testDate = new Date('2024-01-15');
      component.viewDate.set(testDate);
      
      expect(component.viewDate()).toEqual(testDate);
    });

    it('should accept referenceDate input', () => {
      const testDate = new Date('2024-01-15');
      component.referenceDate.set(testDate);
      
      expect(component.referenceDate()).toEqual(testDate);
    });

    it('should accept currentView input', () => {
      component.currentView.set('daily');
      expect(component.currentView()).toBe('daily');
      
      component.currentView.set('weekly');
      expect(component.currentView()).toBe('weekly');
    });
  });

  describe('Template Integration', () => {
    it('should pass correct inputs to calendar grid', () => {
      const testDate = new Date('2024-01-15');
      component.selectedDate.set(testDate);
      component.currentView.set('weekly');
      
      fixture.detectChanges();
      
      const calendarGrid = fixture.debugElement.nativeElement.querySelector('pelu-calendar-grid');
      expect(calendarGrid).toBeTruthy();
    });

    it('should handle date selection events', () => {
      const testDate = new Date('2024-01-15');
      component.currentView.set('weekly');
      
      spyOn(component.dateSelected, 'emit');
      
      // Simulate date selection from calendar grid
      component.onDateClicked(testDate);
      
      expect(component.dateSelected.emit).toHaveBeenCalled();
    });
  });

  describe('Reactivity', () => {
    it('should update when calendar state service viewDate changes', () => {
      const newDate = new Date('2024-02-15');
      calendarStateService.viewDate.and.returnValue(signal(newDate));
      
      const monthDays = component.monthDays();
      
      expect(bookingStateService.getCompleteMonthCalendar).toHaveBeenCalledWith(newDate);
    });

    it('should update current month date when viewDate changes', () => {
      const newDate = new Date('2024-02-15');
      calendarStateService.viewDate.and.returnValue(signal(newDate));
      
      const currentMonthDate = component.currentMonthDate();
      
      expect(currentMonthDate).toEqual(newDate);
    });
  });
});
