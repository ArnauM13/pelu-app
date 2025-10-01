import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { CalendarGridComponent } from './calendar-grid.component';
import { BookingValidationService } from '../services/booking-validation.service';
import { UserService } from '../../../../core/services/user.service';

describe('CalendarGridComponent', () => {
  let component: CalendarGridComponent;
  let fixture: ComponentFixture<CalendarGridComponent>;
  let bookingValidationService: jasmine.SpyObj<BookingValidationService>;
  let userService: jasmine.SpyObj<UserService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const bookingValidationSpy = jasmine.createSpyObj('BookingValidationService', [
      'isBusinessDay', 'isPastDate', 'canSelectDate', 'isFullyBookedWorkingDayForService'
    ]);

    const userServiceSpy = jasmine.createSpyObj('UserService', ['isAdmin'], {
      isAdmin: signal(false)
    });

    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant'], {
      onLangChange: of({ lang: 'ca' })
    });
    translateSpy.instant.and.returnValue('Test Label');

    await TestBed.configureTestingModule({
      imports: [CalendarGridComponent],
      providers: [
        { provide: BookingValidationService, useValue: bookingValidationSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: TranslateService, useValue: translateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarGridComponent);
    component = fixture.componentInstance;
    bookingValidationService = TestBed.inject(BookingValidationService) as jasmine.SpyObj<BookingValidationService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Set up default mock responses
    bookingValidationService.isBusinessDay.and.returnValue(true);
    bookingValidationService.isPastDate.and.returnValue(false);
    bookingValidationService.canSelectDate.and.returnValue(true);
    bookingValidationService.isFullyBookedWorkingDayForService.and.returnValue(false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Week Highlighting', () => {
    it('should highlight current week in weekly view', () => {
      const testDate = new Date('2024-01-15'); // Monday
      const selectedDate = new Date('2024-01-15'); // Same week start

      // Set component inputs using component properties
      component['days'] = signal([testDate]);
      component['selectedDate'] = signal(selectedDate);
      component['currentView'] = signal('weekly');

      fixture.detectChanges();

      const result = component.isCurrentWeek(testDate);
      expect(result).toBe(true);
    });

    it('should not highlight different week in weekly view', () => {
      const testDate = new Date('2024-01-15'); // Monday
      const selectedDate = new Date('2024-01-22'); // Different week

      component['days'] = signal([testDate]);
      component['selectedDate'] = signal(selectedDate);
      component['currentView'] = signal('weekly');

      fixture.detectChanges();

      const result = component.isCurrentWeek(testDate);
      expect(result).toBe(false);
    });

    it('should not highlight in daily view', () => {
      const testDate = new Date('2024-01-15');
      const selectedDate = new Date('2024-01-15');

      component['days'] = signal([testDate]);
      component['selectedDate'] = signal(selectedDate);
      component['currentView'] = signal('daily');

      fixture.detectChanges();

      const result = component.isCurrentWeek(testDate);
      expect(result).toBe(false);
    });

    it('should not highlight when no selected date', () => {
      const testDate = new Date('2024-01-15');

      component['days'] = signal([testDate]);
      component['selectedDate'] = signal(null);
      component['currentView'] = signal('weekly');

      fixture.detectChanges();

      const result = component.isCurrentWeek(testDate);
      expect(result).toBe(false);
    });
  });

  describe('Date Selection', () => {
    it('should select exact day in daily view', () => {
      const testDate = new Date('2024-01-15');
      const selectedDate = new Date('2024-01-15');

      component['selectedDate'] = signal(selectedDate);
      component['currentView'] = signal('daily');

      const result = component.isSelected(testDate);
      expect(result).toBe(true);
    });

    it('should select week in weekly view', () => {
      const testDate = new Date('2024-01-16'); // Tuesday
      const selectedDate = new Date('2024-01-15'); // Monday (week start)

      component['selectedDate'] = signal(selectedDate);
      component['currentView'] = signal('weekly');

      const result = component.isSelected(testDate);
      expect(result).toBe(true);
    });

    it('should not select different week in weekly view', () => {
      const testDate = new Date('2024-01-22'); // Different week
      const selectedDate = new Date('2024-01-15'); // Monday (week start)

      component['selectedDate'] = signal(selectedDate);
      component['currentView'] = signal('weekly');

      const result = component.isSelected(testDate);
      expect(result).toBe(false);
    });
  });

  describe('Adjacent Month Detection', () => {
    it('should detect adjacent month days', () => {
      const currentMonth = new Date('2024-01-15');
      const adjacentDay = new Date('2024-02-01'); // Next month

      component['currentMonth'] = signal(currentMonth);

      const result = component.isAdjacentMonth(adjacentDay);
      expect(result).toBe(true);
    });

    it('should not detect current month days as adjacent', () => {
      const currentMonth = new Date('2024-01-15');
      const currentDay = new Date('2024-01-15');

      component['currentMonth'] = signal(currentMonth);

      const result = component.isAdjacentMonth(currentDay);
      expect(result).toBe(false);
    });
  });

  describe('Date Formatting', () => {
    it('should format day short correctly', () => {
      const testDate = new Date('2024-01-15'); // Monday
      const result = component.formatDayShort(testDate);
      expect(result).toBe('dl.'); // Monday in Catalan
    });
  });

  describe('Business Logic', () => {
    it('should check if date is today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      expect(component.isToday(today)).toBe(true);
      expect(component.isToday(yesterday)).toBe(false);
    });

    it('should delegate business day check to service', () => {
      const testDate = new Date('2024-01-15');
      component.isBusinessDay(testDate);

      expect(bookingValidationService.isBusinessDay).toHaveBeenCalledWith(testDate);
    });

    it('should delegate past date check to service', () => {
      const testDate = new Date('2024-01-15');
      component.isPastDate(testDate);

      expect(bookingValidationService.isPastDate).toHaveBeenCalledWith(testDate);
    });

    it('should delegate can select date check to service', () => {
      const testDate = new Date('2024-01-15');
      component.canSelectDate(testDate);

      expect(bookingValidationService.canSelectDate).toHaveBeenCalledWith(testDate);
    });
  });

  describe('Template Integration', () => {
    it('should apply current-week class when isCurrentWeek returns true', () => {
      const testDate = new Date('2024-01-15');
      component['days'] = signal([testDate]);
      component['selectedDate'] = signal(testDate);
      component['currentView'] = signal('weekly');

      spyOn(component, 'isCurrentWeek').and.returnValue(true);

      fixture.detectChanges();

      const dayElement = fixture.debugElement.nativeElement.querySelector('.day-item');
      expect(dayElement.classList.contains('current-week')).toBe(true);
    });

    it('should apply adjacent-month class for adjacent month days', () => {
      const testDate = new Date('2024-02-01'); // Next month
      component['days'] = signal([testDate]);
      component['currentMonth'] = signal(new Date('2024-01-15'));

      spyOn(component, 'isAdjacentMonth').and.returnValue(true);

      fixture.detectChanges();

      const dayElement = fixture.debugElement.nativeElement.querySelector('.day-item');
      expect(dayElement.classList.contains('adjacent-month')).toBe(true);
    });

    it('should apply selected class when isSelected returns true', () => {
      const testDate = new Date('2024-01-15');
      component['days'] = signal([testDate]);
      component['selectedDate'] = signal(testDate);
      component['currentView'] = signal('daily');

      spyOn(component, 'isSelected').and.returnValue(true);

      fixture.detectChanges();

      const dayElement = fixture.debugElement.nativeElement.querySelector('.day-item');
      expect(dayElement.classList.contains('selected')).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should emit date selected when date is clickable', () => {
      const testDate = new Date('2024-01-15');
      component['days'] = signal([testDate]);

      spyOn(component, 'canSelectDate').and.returnValue(true);
      spyOn(component.dateSelected, 'emit');

      component.onDateClicked(testDate);

      expect(component.dateSelected.emit).toHaveBeenCalledWith(testDate);
    });

    it('should not emit date selected when date is not clickable', () => {
      const testDate = new Date('2024-01-15');
      component['days'] = signal([testDate]);

      spyOn(component, 'canSelectDate').and.returnValue(false);
      spyOn(component.dateSelected, 'emit');

      component.onDateClicked(testDate);

      expect(component.dateSelected.emit).not.toHaveBeenCalled();
    });
  });
});
