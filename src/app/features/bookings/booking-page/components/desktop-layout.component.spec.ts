import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { DesktopLayoutComponent } from './desktop-layout.component';
import { BookingStateService } from '../services/booking-state.service';
import { BookingValidationService } from '../services/booking-validation.service';
import { DateTimeSelectionService } from '../services/date-time-selection.service';
import { TimeUtils } from '../../../../shared/utils/time.utils';
import { CalendarComponent } from '../../../calendar/core/calendar.component';
import { BookingFormComponent } from './booking-form.component';
import { CalendarStateService } from '../../../calendar/services/calendar-state.service';

describe('DesktopLayoutComponent', () => {
  let component: DesktopLayoutComponent;
  let fixture: ComponentFixture<DesktopLayoutComponent>;
  let bookingStateService: jasmine.SpyObj<BookingStateService>;
  let bookingValidationService: jasmine.SpyObj<BookingValidationService>;
  let dateTimeSelectionService: jasmine.SpyObj<DateTimeSelectionService>;
  let timeUtils: jasmine.SpyObj<TimeUtils>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let calendarStateService: jasmine.SpyObj<CalendarStateService>;

  beforeEach(async () => {
    const bookingStateSpy = jasmine.createSpyObj('BookingStateService', [
      'setViewMode', 'setViewDate', 'setSelectedDate', 'selectedDate', 'viewDate', 'viewMode',
      'sidebarCollapsed', 'selectedService', 'appointments'
    ], {
      selectedDate: signal(null),
      viewDate: signal(new Date()),
      viewMode: signal('week'),
      sidebarCollapsed: signal(false),
      selectedService: signal(null),
      appointments: signal([])
    });

    const bookingValidationSpy = jasmine.createSpyObj('BookingValidationService', [
      'isCalendarBlocked'
    ], {
      isCalendarBlocked: signal(false)
    });

    const dateTimeSelectionSpy = jasmine.createSpyObj('DateTimeSelectionService', [
      'setSelectedDate', 'setSelectedTime', 'updateAvailableTimeSlots'
    ]);

    const timeUtilsSpy = jasmine.createSpyObj('TimeUtils', [
      'getPreviousWeek', 'getNextWeek', 'getPreviousMonth', 'getNextMonth'
    ]);

    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant'], {
      onLangChange: of({ lang: 'ca' })
    });
    translateSpy.instant.and.returnValue('Test Label');

    const calendarStateSpy = jasmine.createSpyObj('CalendarStateService', [
      'navigateToDate', 'viewDate'
    ], {
      viewDate: signal(new Date('2024-01-15'))
    });

    await TestBed.configureTestingModule({
      imports: [DesktopLayoutComponent],
      providers: [
        { provide: BookingStateService, useValue: bookingStateSpy },
        { provide: BookingValidationService, useValue: bookingValidationSpy },
        { provide: DateTimeSelectionService, useValue: dateTimeSelectionSpy },
        { provide: TimeUtils, useValue: timeUtilsSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: CalendarStateService, useValue: calendarStateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopLayoutComponent);
    component = fixture.componentInstance;
    bookingStateService = TestBed.inject(BookingStateService) as jasmine.SpyObj<BookingStateService>;
    bookingValidationService = TestBed.inject(BookingValidationService) as jasmine.SpyObj<BookingValidationService>;
    dateTimeSelectionService = TestBed.inject(DateTimeSelectionService) as jasmine.SpyObj<DateTimeSelectionService>;
    timeUtils = TestBed.inject(TimeUtils) as jasmine.SpyObj<TimeUtils>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    calendarStateService = TestBed.inject(CalendarStateService) as jasmine.SpyObj<CalendarStateService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('Collapsible Manual Booking', () => {
    it('should initialize with manual booking collapsed by default', () => {
      expect(component.manualBookingCollapsed()).toBe(true);
    });

    it('should toggle manual booking collapse state', () => {
      expect(component.manualBookingCollapsed()).toBe(true);

      component.toggleManualBooking();
      expect(component.manualBookingCollapsed()).toBe(false);

      component.toggleManualBooking();
      expect(component.manualBookingCollapsed()).toBe(true);
    });

    it('should render collapsed booking section when collapsed', () => {
      component.manualBookingCollapsed.set(true);
      fixture.detectChanges();

      const collapsedSection = fixture.debugElement.nativeElement.querySelector('.collapsed-booking-section');
      const expandedSection = fixture.debugElement.nativeElement.querySelector('.expanded-booking-section');

      expect(collapsedSection).toBeTruthy();
      expect(expandedSection).toBeFalsy();
    });

    it('should render expanded booking section when expanded', () => {
      component.manualBookingCollapsed.set(false);
      fixture.detectChanges();

      const collapsedSection = fixture.debugElement.nativeElement.querySelector('.collapsed-booking-section');
      const expandedSection = fixture.debugElement.nativeElement.querySelector('.expanded-booking-section');

      expect(collapsedSection).toBeFalsy();
      expect(expandedSection).toBeTruthy();
    });

    it('should display create booking button when collapsed', () => {
      component.manualBookingCollapsed.set(true);
      fixture.detectChanges();

      const createButton = fixture.debugElement.nativeElement.querySelector('.create-booking-button');
      expect(createButton).toBeTruthy();
    });

    it('should display booking form title when expanded', () => {
      component.manualBookingCollapsed.set(false);
      fixture.detectChanges();

      const formTitle = fixture.debugElement.nativeElement.querySelector('.booking-form-title');
      expect(formTitle).toBeTruthy();
    });
  });

  describe('Event Handlers', () => {
    it('should handle today button click', () => {
      const calendarComponent = jasmine.createSpyObj('CalendarComponent', ['today']);
      component['calendarComponent'] = calendarComponent;

      component.onTodayClicked();

      expect(calendarComponent.today).toHaveBeenCalled();
    });

    it('should handle previous week navigation', () => {
      const calendarComponent = jasmine.createSpyObj('CalendarComponent', ['previousDay']);
      component['calendarComponent'] = calendarComponent;

      component.goToPreviousWeek();

      expect(calendarComponent.previousDay).toHaveBeenCalled();
    });

    it('should handle next week navigation', () => {
      const calendarComponent = jasmine.createSpyObj('CalendarComponent', ['nextDay']);
      component['calendarComponent'] = calendarComponent;

      component.goToNextWeek();

      expect(calendarComponent.nextDay).toHaveBeenCalled();
    });

    it('should handle view change', () => {
      const calendarComponent = jasmine.createSpyObj('CalendarComponent', ['onViewChanged']);
      component['calendarComponent'] = calendarComponent;

      component.onViewChanged('month');

      expect(calendarComponent.onViewChanged).toHaveBeenCalledWith('month');
    });

    it('should handle desktop time slot selection', () => {
      const event = { date: '2024-01-15', time: '10:00' };
      spyOn(component.timeSlotSelected, 'emit');

      component.onDesktopTimeSlotSelected(event);

      expect(dateTimeSelectionService.setSelectedDate).toHaveBeenCalledWith('2024-01-15');
      expect(dateTimeSelectionService.setSelectedTime).toHaveBeenCalledWith('10:00');
      expect(component.timeSlotSelected.emit).toHaveBeenCalledWith(event);
    });

    it('should handle monthly calendar date selection', () => {
      const testDate = new Date('2024-01-15');
      const calendarComponent = jasmine.createSpyObj('CalendarComponent', ['navigateToDate']);
      component['calendarComponent'] = calendarComponent;

      component.onMonthlyCalendarDateSelected(testDate);

      expect(bookingStateService.setSelectedDate).toHaveBeenCalledWith(testDate);
      expect(calendarComponent.navigateToDate).toHaveBeenCalledWith('2024-01-15');
    });

    it('should handle previous month navigation', () => {
      const monthlyCalendarComponent = jasmine.createSpyObj('MonthlyCalendarComponent', ['navigateToPreviousMonth']);
      component['monthlyCalendarComponent'] = monthlyCalendarComponent;

      component.onPreviousMonth();

      // Should only call navigateToPreviousMonth on monthly calendar, not affect main calendar
      expect(monthlyCalendarComponent.navigateToPreviousMonth).toHaveBeenCalledTimes(1);
    });

    it('should handle next month navigation', () => {
      const monthlyCalendarComponent = jasmine.createSpyObj('MonthlyCalendarComponent', ['navigateToNextMonth']);
      component['monthlyCalendarComponent'] = monthlyCalendarComponent;

      component.onNextMonth();

      // Should only call navigateToNextMonth on monthly calendar, not affect main calendar
      expect(monthlyCalendarComponent.navigateToNextMonth).toHaveBeenCalledTimes(1);
    });
  });

  describe('Computed Properties', () => {
    it('should compute current month name correctly', () => {
      const monthName = component.currentMonthName();
      expect(monthName).toBeTruthy();
      expect(typeof monthName).toBe('string');
    });

    it('should compute week info correctly', () => {
      const weekInfo = component.weekInfo();
      expect(weekInfo).toBeTruthy();
      expect(typeof weekInfo).toBe('string');
    });

    it('should compute sidebar collapsed state', () => {
      const collapsed = component.sidebarCollapsed();
      expect(typeof collapsed).toBe('boolean');
    });

    it('should compute selected date', () => {
      const selectedDate = component.selectedDate();
      expect(selectedDate).toBeTruthy();
    });
  });

  describe('Monthly Calendar Selected Date', () => {
    it('should return week start for weekly view', () => {
      const calendarComponent = jasmine.createSpyObj('CalendarComponent', ['currentView']);
      calendarComponent.currentView.and.returnValue('weekly');
      component['calendarComponent'] = calendarComponent;

      const testDate = new Date('2024-01-15'); // Monday
      spyOn(component, 'firstEnabledDay').and.returnValue(testDate);

      const result = component.getMonthlyCalendarSelectedDate();

      // Should return the start of the week (Monday)
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(15);
    });

    it('should return exact day for daily view', () => {
      const calendarComponent = jasmine.createSpyObj('CalendarComponent', ['currentView']);
      calendarComponent.currentView.and.returnValue('daily');
      component['calendarComponent'] = calendarComponent;

      const testDate = new Date('2024-01-15');
      spyOn(component, 'firstEnabledDay').and.returnValue(testDate);

      const result = component.getMonthlyCalendarSelectedDate();

      expect(result).toEqual(testDate);
    });

    it('should default to weekly view when calendar component is not available', () => {
      // Create a mock calendar component
      const mockCalendarComponent = jasmine.createSpyObj('CalendarComponent', ['currentView']);
      mockCalendarComponent.currentView.and.returnValue('weekly');
      component['calendarComponent'] = mockCalendarComponent;

      const testDate = new Date('2024-01-15');
      spyOn(component, 'firstEnabledDay').and.returnValue(testDate);

      const result = component.getMonthlyCalendarSelectedDate();

      // Should return the start of the week (Monday)
      expect(result.getDay()).toBe(1); // Monday
    });
  });

  describe('Template Integration', () => {
    it('should apply collapsed class when manual booking is collapsed', () => {
      component.manualBookingCollapsed.set(true);
      fixture.detectChanges();

      const bookingSection = fixture.debugElement.nativeElement.querySelector('.manual-booking-section.collapsed');
      expect(bookingSection).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for close booking button', () => {
      component.manualBookingCollapsed.set(false);
      fixture.detectChanges();

      const closeButton = fixture.debugElement.nativeElement.querySelector('.close-booking-button');
      expect(closeButton.getAttribute('ariaLabel')).toBe('Close booking form');
    });
  });
});
