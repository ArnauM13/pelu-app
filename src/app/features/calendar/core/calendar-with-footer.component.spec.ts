import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarWithFooterComponent } from './calendar-with-footer.component';
import { CalendarBusinessService } from '../services/calendar-business.service';
import { TranslateService } from '@ngx-translate/core';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

describe('CalendarWithFooterComponent', () => {
  let component: CalendarWithFooterComponent;
  let fixture: ComponentFixture<CalendarWithFooterComponent>;
  let businessService: jasmine.SpyObj<CalendarBusinessService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const businessSpy = jasmine.createSpyObj('CalendarBusinessService', [
      'getBusinessConfig',
      'getAppropriateViewDate'
    ]);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      imports: [CalendarWithFooterComponent],
      providers: [
        ...provideMockFirebase(),
        { provide: CalendarBusinessService, useValue: businessSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarWithFooterComponent);
    component = fixture.componentInstance;
    businessService = TestBed.inject(
      CalendarBusinessService
    ) as jasmine.SpyObj<CalendarBusinessService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup default spy returns
    businessService.getBusinessConfig.and.returnValue({
      hours: { start: 8, end: 20 },
      lunchBreak: { start: 13, end: 15 },
      days: { start: 1, end: 5 },
    });
    businessService.getAppropriateViewDate.and.returnValue(new Date());
    translateService.instant.and.returnValue('Translated text');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.mini()).toBe(false);
    expect(component.events()).toEqual([]);
  });

  it('should emit dateSelected when calendar emits', () => {
    spyOn(component.dateSelected, 'emit');
    const event = { date: '2024-01-01', time: '10:00' };

    component.onBookingsLoaded(true);
    // Simulate calendar dateSelected event
    component.dateSelected.emit(event);

    expect(component.dateSelected.emit).toHaveBeenCalledWith(event);
  });

  it('should emit editAppointment when calendar emits', () => {
    spyOn(component.editAppointment, 'emit');
    const appointment = { id: '1', title: 'Test', start: '2024-01-01T10:00:00' };

    component.editAppointment.emit(appointment);

    expect(component.editAppointment.emit).toHaveBeenCalledWith(appointment);
  });

  it('should emit deleteAppointment when calendar emits', () => {
    spyOn(component.deleteAppointment, 'emit');
    const appointment = { id: '1', title: 'Test', start: '2024-01-01T10:00:00' };

    component.deleteAppointment.emit(appointment);

    expect(component.deleteAppointment.emit).toHaveBeenCalledWith(appointment);
  });

  it('should update calendar loaded state when onBookingsLoaded is called', () => {
    expect(component.isCalendarLoaded()).toBe(false);

    component.onBookingsLoaded(true);

    expect(component.isCalendarLoaded()).toBe(true);
  });

  it('should generate footer alerts with business hours info', () => {
    const alerts = component.footerAlerts();

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].type).toBe('info');
    expect(alerts[0].icon).toBe('🕐');
    expect(alerts[0].show).toBe(true);
  });

  it('should include weekend info when it is weekend', () => {
    // Mock today as weekend
    const originalDate = Date;
    const mockDate = new Date('2024-01-06'); // Saturday
    spyOn(window, 'Date').and.returnValue(mockDate as unknown as string);

    const alerts = component.footerAlerts();

    expect(alerts.some(alert => alert.id === 'weekend-info')).toBe(true);

    // Restore original Date
    (window as unknown as { Date: typeof Date }).Date = originalDate;
  });

  it('should not include weekend info when it is not weekend', () => {
    // Mock today as weekday
    const originalDate = Date;
    const mockDate = new Date('2024-01-08'); // Monday
    spyOn(window, 'Date').and.returnValue(mockDate as unknown as string);

    const alerts = component.footerAlerts();

    expect(alerts.some(alert => alert.id === 'weekend-info')).toBe(false);

    // Restore original Date
    (window as unknown as { Date: typeof Date }).Date = originalDate;
  });

  it('should translate business hours info correctly', () => {
    translateService.instant.and.returnValue('Business hours: 08:00-20:00, Lunch: 13:00-15:00');

    const alerts = component.footerAlerts();
    const businessHoursAlert = alerts.find(alert => alert.id === 'business-hours-info');

    expect(businessHoursAlert).toBeDefined();
    expect(translateService.instant).toHaveBeenCalledWith('CALENDAR.FOOTER.BUSINESS_HOURS_INFO', {
      startHour: '08',
      endHour: '20',
      lunchStart: '13',
      lunchEnd: '15',
    });
  });
});
