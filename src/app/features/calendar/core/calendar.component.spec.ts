import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { CalendarBusinessService } from '../services/calendar-business.service';
import { CalendarStateService } from '../services/calendar-state.service';
import { CalendarCoreService } from '../services/calendar-core.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { TranslateService } from '@ngx-translate/core';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let businessService: jasmine.SpyObj<CalendarBusinessService>;
  let stateService: jasmine.SpyObj<CalendarStateService>;
  let coreService: jasmine.SpyObj<CalendarCoreService>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let roleService: jasmine.SpyObj<RoleService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let serviceColorsService: jasmine.SpyObj<ServiceColorsService>;

  beforeEach(async () => {
    const businessSpy = jasmine.createSpyObj('CalendarBusinessService', [
      'getBusinessConfig',
      'generateTimeSlots',
      'getBusinessDaysForWeek',
      'hasAvailableTimeSlots',
      'getAppointmentsForDay',
      'isLunchBreak',
      'isTimeSlotBookable',
      'isPastDate',
      'isPastTimeSlot',
      'canNavigateToPreviousWeek',
      'isBusinessDay',
      'getBusinessDaysInfo'
    ]);
    const stateSpy = jasmine.createSpyObj('CalendarStateService', [
      'viewDate',
      'selectedDay',
      'showDetailPopup',
      'selectedAppointment',
      'setSelectedDay',
      'previousWeek',
      'nextWeek',
      'today',
      'navigateToDate',
      'openAppointmentDetail',
      'closeAppointmentDetail',
      'removeAppointment'
    ]);
    const coreSpy = jasmine.createSpyObj('CalendarCoreService', [
      'gridConfiguration',
      'getAppointmentPositions',
      'isDragging',
      'targetDate',
      'targetTime',
      'draggedAppointment',
      'calculateAppointmentPositionFromTime',
      'isValidDrop',
      'currentPosition',
      'updateTargetDateTime',
      'endDrag',
      'reactiveBookingDuration',
      'reactiveSlotDuration',
      'updateBookingDuration',
      'updateGridConfiguration'
    ]);
    const bookingSpy = jasmine.createSpyObj('BookingService', [
      'bookings',
      'isLoading',
      'hasCachedData',
      'getBookingsWithCache',
      'silentRefreshBookings'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['user']);
    const roleSpy = jasmine.createSpyObj('RoleService', ['isAdmin']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const serviceColorsSpy = jasmine.createSpyObj('ServiceColorsService', ['getServiceCssClass']);

    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
      providers: [
        ...provideMockFirebase(),
        { provide: CalendarBusinessService, useValue: businessSpy },
        { provide: CalendarStateService, useValue: stateSpy },
        { provide: CalendarCoreService, useValue: coreSpy },
        { provide: BookingService, useValue: bookingSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: RoleService, useValue: roleSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: ServiceColorsService, useValue: serviceColorsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    businessService = TestBed.inject(CalendarBusinessService) as jasmine.SpyObj<CalendarBusinessService>;
    stateService = TestBed.inject(CalendarStateService) as jasmine.SpyObj<CalendarStateService>;
    coreService = TestBed.inject(CalendarCoreService) as jasmine.SpyObj<CalendarCoreService>;
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    roleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    serviceColorsService = TestBed.inject(ServiceColorsService) as jasmine.SpyObj<ServiceColorsService>;

    // Setup default spy returns
    businessService.getBusinessConfig.and.returnValue({
      hours: { start: 8, end: 20 },
      lunchBreak: { start: 13, end: 15 },
      days: { start: 1, end: 5 },
    });
    businessService.generateTimeSlots.and.returnValue(['08:00', '08:30', '09:00']);
    businessService.getBusinessDaysForWeek.and.returnValue([new Date(), new Date()]);
    businessService.hasAvailableTimeSlots.and.returnValue(true);
    businessService.getAppointmentsForDay.and.returnValue([]);
    businessService.isLunchBreak.and.returnValue(false);
    businessService.isTimeSlotBookable.and.returnValue(true);
    businessService.isPastDate.and.returnValue(false);
    businessService.isPastTimeSlot.and.returnValue(false);
    businessService.canNavigateToPreviousWeek.and.returnValue(true);
    businessService.isBusinessDay.and.returnValue(true);
    businessService.getBusinessDaysInfo.and.returnValue('Monday to Friday');

    stateService.viewDate.and.returnValue({ asReadonlySignal: () => new Date() });
    stateService.selectedDay.and.returnValue({ asReadonlySignal: () => null });
    stateService.showDetailPopup.and.returnValue({ asReadonlySignal: () => false });
    stateService.selectedAppointment.and.returnValue({ asReadonlySignal: () => null });

    coreService.gridConfiguration.and.returnValue({
      slotDurationMinutes: 30,
      pixelsPerMinute: 1,
      slotHeightPx: 30,
      businessStartHour: 8,
      businessEndHour: 20,
      lunchBreakStart: 13,
      lunchBreakEnd: 15,
    });
    coreService.getAppointmentPositions.and.returnValue([]);
    coreService.isDragging.and.returnValue({ asReadonlySignal: () => false });
    coreService.targetDate.and.returnValue({ asReadonlySignal: () => null });
    coreService.targetTime.and.returnValue({ asReadonlySignal: () => null });
    coreService.draggedAppointment.and.returnValue({ asReadonlySignal: () => null });
    coreService.calculateAppointmentPositionFromTime.and.returnValue({ top: 0, height: 60 });
    coreService.isValidDrop.and.returnValue({ asReadonlySignal: () => true });
    coreService.currentPosition.and.returnValue({ asReadonlySignal: () => null });
    coreService.reactiveBookingDuration.and.returnValue({ asReadonlySignal: () => 60 });
    coreService.reactiveSlotDuration.and.returnValue({ asReadonlySignal: () => 30 });

    bookingService.bookings.and.returnValue({ asReadonlySignal: () => [] });
    bookingService.isLoading.and.returnValue({ asReadonlySignal: () => false });
    bookingService.hasCachedData.and.returnValue(false);
    bookingService.getBookingsWithCache.and.returnValue(Promise.resolve());
    bookingService.silentRefreshBookings.and.returnValue(Promise.resolve());

    authService.user.and.returnValue({ asReadonlySignal: () => null });
    roleService.isAdmin.and.returnValue({ asReadonlySignal: () => false });
    translateService.instant.and.returnValue('Translated text');
    serviceColorsService.getServiceCssClass.and.returnValue('service-default');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.mini()).toBe(false);
    expect(component.events()).toEqual([]);
  });

  it('should emit dateSelected when time slot is clicked', () => {
    spyOn(component.dateSelected, 'emit');
    const date = new Date();
    const time = '10:00';

    component.onTimeSlotClick(date, time);

    expect(component.dateSelected.emit).toHaveBeenCalledWith({
      date: jasmine.any(String),
      time: time
    });
  });

  it('should emit editAppointment when appointment is edited', () => {
    spyOn(component.editAppointment, 'emit');
    const appointmentEvent = {
      id: '1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
      serviceName: 'Test Service',
      clientName: 'Test Client',
      isPublicBooking: false,
      isOwnBooking: true,
      canDrag: true,
      canViewDetails: true,
    };

    component.onAppointmentEditRequested(appointmentEvent as any);

    expect(component.editAppointment.emit).toHaveBeenCalledWith(appointmentEvent);
  });

  it('should emit deleteAppointment when appointment is deleted', () => {
    spyOn(component.deleteAppointment, 'emit');
    const appointmentEvent = {
      id: '1',
      title: 'Test Appointment',
      start: '2024-01-01T10:00:00',
      duration: 60,
      serviceName: 'Test Service',
      clientName: 'Test Client',
      isPublicBooking: false,
      isOwnBooking: true,
      canDrag: true,
      canViewDetails: true,
    };

    component.onAppointmentDeleted(appointmentEvent as any);

    expect(component.deleteAppointment.emit).toHaveBeenCalledWith(appointmentEvent);
  });

  it('should emit bookingsLoaded when calendar is loaded', () => {
    spyOn(component.bookingsLoaded, 'emit');

    // Trigger the effect that emits bookingsLoaded
    component.isBookingsLoaded();

    expect(component.bookingsLoaded.emit).toHaveBeenCalled();
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

  it('should update booking duration', () => {
    component.updateBookingDuration(90);

    expect(coreService.updateBookingDuration).toHaveBeenCalledWith(90);
  });

  it('should update slot duration', () => {
    component.updateSlotDuration(45);

    expect(coreService.updateGridConfiguration).toHaveBeenCalledWith({
      slotDurationMinutes: 45
    });
  });

  it('should get current booking duration', () => {
    const duration = component.getCurrentBookingDuration();

    expect(coreService.reactiveBookingDuration).toHaveBeenCalled();
    expect(duration).toBeDefined();
  });

  it('should get current slot duration', () => {
    const duration = component.getCurrentSlotDuration();

    expect(coreService.reactiveSlotDuration).toHaveBeenCalled();
    expect(duration).toBeDefined();
  });
});
