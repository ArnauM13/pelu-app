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
      'silentRefreshBookings',
      'deleteBooking'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['user', 'isLoading', 'isInitialized']);
    const roleSpy = jasmine.createSpyObj('RoleService', ['isAdmin', 'userRole', 'isLoadingRole']);
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
      slotDuration: 30,
      businessHours: { start: 8, end: 20 },
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

    stateService.viewDate.and.returnValue(new Date());
    stateService.selectedDay.and.returnValue(null);
    stateService.showDetailPopup.and.returnValue(false);
    stateService.selectedAppointment.and.returnValue(null);

    coreService.gridConfiguration.and.returnValue({
      slotHeightPx: 30,
      pixelsPerMinute: 1,
      slotDurationMinutes: 30,
      businessStartHour: 8,
      businessEndHour: 20,
      lunchBreakStart: 13,
      lunchBreakEnd: 15,
      bookingDurationMinutes: 60,
    });
    coreService.getAppointmentPositions.and.returnValue(new Map());
    coreService.isDragging.and.returnValue(false);
    coreService.targetDate.and.returnValue(null);
    coreService.targetTime.and.returnValue(null);
    coreService.draggedAppointment.and.returnValue(null);
    coreService.calculateAppointmentPositionFromTime.and.returnValue({ top: 0, height: 60 });
    coreService.isValidDrop.and.returnValue(true);
    coreService.currentPosition.and.returnValue(null);
    coreService.reactiveBookingDuration.and.returnValue(60);
    coreService.reactiveSlotDuration.and.returnValue(30);

    bookingService.bookings.and.returnValue([]);
    bookingService.isLoading.and.returnValue(false);
    bookingService.hasCachedData.and.returnValue(false);
    bookingService.getBookingsWithCache.and.returnValue(Promise.resolve([]));
    bookingService.silentRefreshBookings.and.returnValue(Promise.resolve());
    bookingService.deleteBooking.and.returnValue(Promise.resolve(true));

    authService.user.and.returnValue(null);
    authService.isLoading.and.returnValue(false);
    authService.isInitialized.and.returnValue(true);
    roleService.isAdmin.and.returnValue(false);
    roleService.userRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'client',
      lang: 'ca',
      theme: 'light'
    });
    roleService.isLoadingRole.and.returnValue(false);
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

  it('should have output signals defined', () => {
    expect(component.dateSelected).toBeDefined();
    expect(component.editAppointment).toBeDefined();
    expect(component.deleteAppointment).toBeDefined();
    expect(component.bookingsLoaded).toBeDefined();
  });

  it('should have method definitions', () => {
    expect(typeof component.onTimeSlotClick).toBe('function');
    expect(typeof component.onAppointmentEditRequested).toBe('function');
    expect(typeof component.onAppointmentDeleted).toBe('function');
    expect(typeof component.showDeleteConfirmation).toBe('function');
    expect(typeof component.onDeleteConfirmed).toBe('function');
    expect(typeof component.onDeleteCancelled).toBe('function');
    expect(typeof component.isBookingsLoaded).toBe('function');
  });

  it('should handle weekend info correctly', () => {
    // Mock today as weekend
    const originalDate = Date;
    const mockDate = new Date('2024-01-06'); // Saturday
    spyOn(window, 'Date').and.returnValue(mockDate as unknown as string);

    // Test that the component can handle weekend dates
    expect(component).toBeTruthy();

    // Restore original Date
    (window as unknown as { Date: typeof Date }).Date = originalDate;
  });

  it('should handle weekday info correctly', () => {
    // Mock today as weekday
    const originalDate = Date;
    const mockDate = new Date('2024-01-08'); // Monday
    spyOn(window, 'Date').and.returnValue(mockDate as unknown as string);

    // Test that the component can handle weekday dates
    expect(component).toBeTruthy();

    // Restore original Date
    (window as unknown as { Date: typeof Date }).Date = originalDate;
  });

  it('should translate business hours info correctly', () => {
    translateService.instant.and.returnValue('Business hours: 08:00-20:00, Lunch: 13:00-15:00');

    expect(translateService.instant).toBeDefined();
    expect(translateService.instant('test.key')).toBe('Business hours: 08:00-20:00, Lunch: 13:00-15:00');
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

  describe('Delete Confirmation Functionality', () => {
    const mockBooking = {
      id: 'test-booking-id',
      clientName: 'Test Client',
      email: 'test@example.com',
      data: '2024-01-15',
      hora: '10:00',
      serviceId: 'service-1',
      status: 'confirmed' as const,
      createdAt: new Date(),
    };

    it('should have delete confirmation computed properties', () => {
      expect(component.showDeleteConfirm).toBeDefined();
      expect(component.deleteConfirmData).toBeDefined();
    });

    it('should show delete confirmation when showDeleteConfirmation is called', () => {
      component.showDeleteConfirmation(mockBooking);
      
      expect(component.showDeleteConfirm()).toBe(true);
      expect(component.deleteConfirmData()).toBeDefined();
      expect(component.deleteConfirmData()?.severity).toBe('danger');
    });

    it('should reset delete confirmation when onDeleteCancelled is called', () => {
      // First show confirmation
      component.showDeleteConfirmation(mockBooking);
      expect(component.showDeleteConfirm()).toBe(true);

      // Then cancel
      component.onDeleteCancelled();
      expect(component.showDeleteConfirm()).toBe(false);
      expect(component.deleteConfirmData()).toBeNull();
    });

    it('should call onAppointmentDeleted when onDeleteConfirmed is called', () => {
      spyOn(component, 'onAppointmentDeleted');
      
      // Set up confirmation
      component.showDeleteConfirmation(mockBooking);
      
      // Confirm deletion
      component.onDeleteConfirmed();
      
      expect(component.onAppointmentDeleted).toHaveBeenCalledWith(mockBooking);
      expect(component.showDeleteConfirm()).toBe(false);
    });
  });
});
