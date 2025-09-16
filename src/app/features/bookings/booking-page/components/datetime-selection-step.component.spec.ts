import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { DateTimeSelectionStepComponent } from './datetime-selection-step.component';
import { BookingStateService } from '../services/booking-state.service';
import { BookingValidationService } from '../services/booking-validation.service';
import { DateTimeSelectionService } from '../services/date-time-selection.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';

describe('DateTimeSelectionStepComponent', () => {
  let component: DateTimeSelectionStepComponent;
  let fixture: ComponentFixture<DateTimeSelectionStepComponent>;
  let bookingStateService: jasmine.SpyObj<BookingStateService>;
  let bookingValidationService: jasmine.SpyObj<BookingValidationService>;
  let dateTimeSelectionService: jasmine.SpyObj<DateTimeSelectionService>;
  let timeUtils: jasmine.SpyObj<TimeUtils>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const bookingStateSpy = jasmine.createSpyObj('BookingStateService', [
      'setViewMode', 'setViewDate', 'setSelectedDay'
    ], {
      viewMode: signal('week'),
      viewDate: signal(new Date('2024-01-15')),
      selectedService: signal(null),
      appointments: signal([]),
      daySlots: signal([]),
      weekDays: signal([]),
      monthDays: signal([]),
      currentViewDays: signal([])
    });

    const bookingValidationSpy = jasmine.createSpyObj('BookingValidationService', [
      'canSelectDate', 'isPastDate', 'isBusinessDay', 'isFullyBookedWorkingDayForService'
    ]);
    bookingValidationSpy.canSelectDate.and.returnValue(true);
    bookingValidationSpy.isPastDate.and.returnValue(false);
    bookingValidationSpy.isBusinessDay.and.returnValue(true);
    bookingValidationSpy.isFullyBookedWorkingDayForService.and.returnValue(false);

    const dateTimeSelectionSpy = jasmine.createSpyObj('DateTimeSelectionService', [
      'setSelectedDateFromDate', 'setSelectedTime', 'updateAvailableTimeSlots', 'resetDateSelection'
    ], {
      selectedDate: signal(null),
      selectedTime: signal(null),
      availableTimeSlots: signal([])
    });

    const timeUtilsSpy = jasmine.createSpyObj('TimeUtils', [
      'getPreviousWeek', 'getNextWeek', 'getPreviousMonth', 'getNextMonth',
      'getEndOfWeek', 'getEndOfMonth', 'isToday', 'isSelected',
      'formatDay', 'formatDayShort', 'formatTime', 'formatMonth'
    ]);
    timeUtilsSpy.getPreviousWeek.and.returnValue(new Date('2024-01-08'));
    timeUtilsSpy.getNextWeek.and.returnValue(new Date('2024-01-22'));
    timeUtilsSpy.getPreviousMonth.and.returnValue(new Date('2023-12-15'));
    timeUtilsSpy.getNextMonth.and.returnValue(new Date('2024-02-15'));
    timeUtilsSpy.getEndOfWeek.and.returnValue(new Date('2024-01-21'));
    timeUtilsSpy.getEndOfMonth.and.returnValue(new Date('2024-01-31'));
    timeUtilsSpy.isToday.and.returnValue(false);
    timeUtilsSpy.isSelected.and.returnValue(false);
    timeUtilsSpy.formatDay.and.returnValue('Monday');
    timeUtilsSpy.formatDayShort.and.returnValue('Mon');
    timeUtilsSpy.formatTime.and.returnValue('10:00');
    timeUtilsSpy.formatMonth.and.returnValue('January 2024');

    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant'], {
      onLangChange: of({ lang: 'ca' })
    });
    translateSpy.instant.and.returnValue('Test Label');

    await TestBed.configureTestingModule({
      imports: [DateTimeSelectionStepComponent],
      providers: [
        { provide: BookingStateService, useValue: bookingStateSpy },
        { provide: BookingValidationService, useValue: bookingValidationSpy },
        { provide: DateTimeSelectionService, useValue: dateTimeSelectionSpy },
        { provide: TimeUtils, useValue: timeUtilsSpy },
        { provide: TranslateService, useValue: translateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DateTimeSelectionStepComponent);
    component = fixture.componentInstance;
    bookingStateService = TestBed.inject(BookingStateService) as jasmine.SpyObj<BookingStateService>;
    bookingValidationService = TestBed.inject(BookingValidationService) as jasmine.SpyObj<BookingValidationService>;
    dateTimeSelectionService = TestBed.inject(DateTimeSelectionService) as jasmine.SpyObj<DateTimeSelectionService>;
    timeUtils = TestBed.inject(TimeUtils) as jasmine.SpyObj<TimeUtils>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('View Management Logic', () => {
    it('should return correct view type for date controls based on current view mode', () => {
      // Test week view
      spyOn(component, 'viewMode').and.returnValue('week');
      expect(component.getCurrentViewForDateControls()).toBe('week');

      // Test month view
      spyOn(component, 'viewMode').and.returnValue('month');
      expect(component.getCurrentViewForDateControls()).toBe('month');
    });

    it('should update booking state when view changes to month', () => {
      component.onViewChanged('month');
      expect(bookingStateService.setViewMode).toHaveBeenCalledWith('month');
    });

    it('should update booking state when view changes to week', () => {
      component.onViewChanged('week');
      expect(bookingStateService.setViewMode).toHaveBeenCalledWith('week');
    });

    it('should return correct mobile toggle button configuration for week view', () => {
      spyOn(component, 'viewMode').and.returnValue('week');

      expect(component.getMobileToggleButtonLabel()).toBe('Mes');
      expect(component.getMobileToggleButtonIcon()).toBe('pi pi-calendar');
    });

    it('should return correct mobile toggle button configuration for month view', () => {
      spyOn(component, 'viewMode').and.returnValue('month');

      expect(component.getMobileToggleButtonLabel()).toBe('Setmana');
      expect(component.getMobileToggleButtonIcon()).toBe('pi pi-calendar-plus');
    });

    it('should toggle view mode correctly from week to month', () => {
      spyOn(component, 'viewMode').and.returnValue('week');

      component.onMobileViewToggle();

      expect(bookingStateService.setViewMode).toHaveBeenCalledWith('month');
    });

    it('should toggle view mode correctly from month to week', () => {
      spyOn(component, 'viewMode').and.returnValue('month');

      component.onMobileViewToggle();

      expect(bookingStateService.setViewMode).toHaveBeenCalledWith('week');
    });

    it('should get correct mobile toggle button label for week view', () => {
      spyOn(component, 'viewMode').and.returnValue('week');

      const label = component.getMobileToggleButtonLabel();

      expect(label).toBe('Mes');
    });

    it('should get correct mobile toggle button label for month view', () => {
      spyOn(component, 'viewMode').and.returnValue('month');

      const label = component.getMobileToggleButtonLabel();

      expect(label).toBe('Setmana');
    });

    it('should get correct mobile toggle button icon for week view', () => {
      spyOn(component, 'viewMode').and.returnValue('week');

      const icon = component.getMobileToggleButtonIcon();

      expect(icon).toBe('pi pi-calendar');
    });

    it('should get correct mobile toggle button icon for month view', () => {
      spyOn(component, 'viewMode').and.returnValue('month');

      const icon = component.getMobileToggleButtonIcon();

      expect(icon).toBe('pi pi-calendar-plus');
    });
  });

  describe('Date Selection Logic', () => {
    it('should allow date selection when date is valid', () => {
      const testDate = new Date('2024-01-15');
      spyOn(component.dateSelected, 'emit');

      component.onDateClicked(testDate);

      expect(bookingValidationService.canSelectDate).toHaveBeenCalledWith(testDate);
      expect(dateTimeSelectionService.setSelectedDateFromDate).toHaveBeenCalledWith(testDate);
      expect(component.dateSelected.emit).toHaveBeenCalledWith(testDate);
    });

    it('should NOT allow date selection when date is invalid', () => {
      const testDate = new Date('2024-01-15');
      bookingValidationService.canSelectDate.and.returnValue(false);
      spyOn(component.dateSelected, 'emit');

      component.onDateClicked(testDate);

      expect(bookingValidationService.canSelectDate).toHaveBeenCalledWith(testDate);
      expect(dateTimeSelectionService.setSelectedDateFromDate).not.toHaveBeenCalled();
      expect(component.dateSelected.emit).not.toHaveBeenCalled();
    });

    it('should select today when today button is clicked and date is valid', () => {
      const today = new Date();
      bookingValidationService.canSelectDate.and.returnValue(true);
      spyOn(component, 'onDateClicked');

      component.onTodayClicked();

      expect(component.onDateClicked).toHaveBeenCalledWith(today);
    });

    it('should NOT select today when today button is clicked and date is invalid', () => {
      const today = new Date();
      bookingValidationService.canSelectDate.and.returnValue(false);
      spyOn(component, 'onDateClicked');

      component.onTodayClicked();

      expect(component.onDateClicked).not.toHaveBeenCalled();
    });

    it('should allow today selection even when not in current month (canSelectDate fix)', () => {
      const today = new Date();

      // canSelectDate should return true for today even in month view
      bookingValidationService.canSelectDate.and.returnValue(true);
      spyOn(component, 'onDateClicked');

      component.onTodayClicked();

      expect(component.onDateClicked).toHaveBeenCalledWith(today);
    });
  });

  describe('Time Slot Selection Logic', () => {
    it('should allow time slot selection when slot is available', () => {
      const timeSlot = { time: '10:00', available: true, isSelected: false };
      spyOn(component.timeSlotSelected, 'emit');

      component.onTimeSlotClicked(timeSlot);

      expect(dateTimeSelectionService.setSelectedTime).toHaveBeenCalledWith('10:00');
      expect(component.timeSlotSelected.emit).toHaveBeenCalledWith(timeSlot);
    });

    it('should NOT allow time slot selection when slot is not available', () => {
      const timeSlot = { time: '10:00', available: false, isSelected: false };
      spyOn(component.timeSlotSelected, 'emit');

      component.onTimeSlotClicked(timeSlot);

      expect(dateTimeSelectionService.setSelectedTime).not.toHaveBeenCalled();
      expect(component.timeSlotSelected.emit).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Logic', () => {
    it('should check if can navigate to previous period for week view', () => {
      spyOn(component, 'viewMode').and.returnValue('week');
      spyOn(component, 'viewDate').and.returnValue(new Date('2024-01-15'));

      const canGo = component.canGoToPreviousPeriod();

      expect(timeUtils.getPreviousWeek).toHaveBeenCalled();
      expect(timeUtils.getEndOfWeek).toHaveBeenCalled();
      expect(typeof canGo).toBe('boolean');
    });

    it('should check if can navigate to previous period for month view', () => {
      spyOn(component, 'viewMode').and.returnValue('month');
      spyOn(component, 'viewDate').and.returnValue(new Date('2024-01-15'));

      const canGo = component.canGoToPreviousPeriod();

      expect(timeUtils.getPreviousMonth).toHaveBeenCalled();
      expect(timeUtils.getEndOfMonth).toHaveBeenCalled();
      expect(typeof canGo).toBe('boolean');
    });

    it('should navigate to previous period for week view', () => {
      spyOn(component, 'viewMode').and.returnValue('week');
      spyOn(component, 'viewDate').and.returnValue(new Date('2024-01-15'));

      component.previousPeriod();

      expect(timeUtils.getPreviousWeek).toHaveBeenCalled();
      expect(bookingStateService.setViewDate).toHaveBeenCalled();
      expect(dateTimeSelectionService.resetDateSelection).toHaveBeenCalled();
    });

    it('should navigate to next period for week view', () => {
      spyOn(component, 'viewMode').and.returnValue('week');
      spyOn(component, 'viewDate').and.returnValue(new Date('2024-01-15'));

      component.nextPeriod();

      expect(timeUtils.getNextWeek).toHaveBeenCalled();
      expect(bookingStateService.setViewDate).toHaveBeenCalled();
      expect(dateTimeSelectionService.resetDateSelection).toHaveBeenCalled();
    });
  });

  describe('Time Slot Filtering Logic', () => {
    it('should correctly identify morning slots', () => {
      const daySlot = {
        date: new Date(),
        timeSlots: [
          { time: '10:00', available: true, isSelected: false },
          { time: '14:00', available: true, isSelected: false }
        ]
      };

      const hasMorning = component.hasMorningSlots(daySlot);
      expect(hasMorning).toBe(true);
    });

    it('should correctly identify afternoon slots', () => {
      const daySlot = {
        date: new Date(),
        timeSlots: [
          { time: '10:00', available: true, isSelected: false },
          { time: '14:00', available: true, isSelected: false }
        ]
      };

      const hasAfternoon = component.hasAfternoonSlots(daySlot);
      expect(hasAfternoon).toBe(true);
    });

    it('should filter morning slots correctly', () => {
      const daySlot = {
        date: new Date(),
        timeSlots: [
          { time: '10:00', available: true, isSelected: false },
          { time: '14:00', available: true, isSelected: false }
        ]
      };

      const morningSlots = component.getMorningSlots(daySlot);
      expect(morningSlots.length).toBe(1);
      expect(morningSlots[0].time).toBe('10:00');
    });

    it('should filter afternoon slots correctly', () => {
      const daySlot = {
        date: new Date(),
        timeSlots: [
          { time: '10:00', available: true, isSelected: false },
          { time: '14:00', available: true, isSelected: false }
        ]
      };

      const afternoonSlots = component.getAfternoonSlots(daySlot);
      expect(afternoonSlots.length).toBe(1);
      expect(afternoonSlots[0].time).toBe('14:00');
    });
  });

  describe('Week Info Display Logic', () => {
    it('should return formatted week info for week view', () => {
      spyOn(component, 'viewMode').and.returnValue('week');
      spyOn(component, 'weekDays').and.returnValue([
        new Date('2024-01-15'),
        new Date('2024-01-16'),
        new Date('2024-01-17'),
        new Date('2024-01-18'),
        new Date('2024-01-19'),
        new Date('2024-01-20'),
        new Date('2024-01-21')
      ]);

      const weekInfo = component.getWeekInfo();

      expect(typeof weekInfo).toBe('string');
      expect(weekInfo).toContain('de');
      expect(weekInfo).toContain('-');
    });

    it('should return month info for month view', () => {
      spyOn(component, 'viewMode').and.returnValue('month');
      spyOn(component, 'viewDate').and.returnValue(new Date('2024-01-15'));

      const weekInfo = component.getWeekInfo();

      expect(timeUtils.formatMonth).toHaveBeenCalled();
      expect(typeof weekInfo).toBe('string');
    });
  });

  describe('Utility Methods', () => {
    it('should delegate date validation to BookingValidationService', () => {
      const testDate = new Date();
      component.canSelectDate(testDate);
      expect(bookingValidationService.canSelectDate).toHaveBeenCalledWith(testDate);
    });

    it('should delegate today check to TimeUtils', () => {
      const testDate = new Date();
      component.isToday(testDate);
      expect(timeUtils.isToday).toHaveBeenCalledWith(testDate);
    });

    it('should delegate date selection check to TimeUtils', () => {
      const testDate = new Date();
      const selectedDate = new Date();
      spyOn(component, 'selectedDate').and.returnValue(selectedDate);

      component.isSelected(testDate);
      expect(timeUtils.isSelected).toHaveBeenCalledWith(testDate, selectedDate);
    });
  });
});
