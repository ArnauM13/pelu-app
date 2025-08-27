import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';

import { BookingPageComponent } from './booking-page.component';
import { FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { BookingValidationService } from '../../../core/services/booking-validation.service';
import { CalendarStateService } from '../../calendar/services/calendar-state.service';
import { TimeUtils } from '../../../shared/utils/time.utils';
import { LoaderService } from '../../../shared/services/loader.service';
import { configureTestBedWithTranslate } from '../../../../testing/translate-test-setup';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

// Mock services
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockFirebaseServicesService {
  loadServices = jasmine.createSpy('loadServices').and.returnValue(Promise.resolve());
  activeServices = signal([
    { id: '1', name: 'Tall de cabell', description: 'Tall de cabell', duration: 30, price: 25, category: 'hair', icon: 'scissors', isActive: true },
    { id: '2', name: 'Tintura', description: 'Tintura de cabell', duration: 60, price: 45, category: 'hair', icon: 'paint', isActive: true }
  ]);
}

class MockAuthService {
  isAuthenticated = signal(false);
  userDisplayName = signal('');
  user = signal({ email: 'test@example.com' });
}

class MockBookingService {
  bookings = signal([]);
  createBooking = jasmine.createSpy('createBooking').and.returnValue(Promise.resolve({ id: '123' }));
}

class MockSystemParametersService {
  businessHours = signal({ start: 9, end: 18, lunchStart: 13, lunchEnd: 14 });
  lunchBreak = signal({ start: 13, end: 14 });
  getMaxAppointmentsPerUser = jasmine.createSpy('getMaxAppointmentsPerUser').and.returnValue(3);
}

class MockResponsiveService {
  isMobile = signal(false);
}

class MockBookingValidationService {
  generateAvailableDays = jasmine.createSpy('generateAvailableDays').and.returnValue([]);
  canUserBookMoreAppointments = jasmine.createSpy('canUserBookMoreAppointments').and.returnValue(true);
  getUserAppointmentCount = jasmine.createSpy('getUserAppointmentCount').and.returnValue(0);
}

class MockCalendarStateService {
  viewDate = signal(new Date());
}

class MockTimeUtils {
  getFirstBusinessDayOfWeek = jasmine.createSpy('getFirstBusinessDayOfWeek').and.returnValue(new Date());
}

class MockLoaderService {
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;
  let router: MockRouter;
  let firebaseServicesService: MockFirebaseServicesService;
  let authService: MockAuthService;
  let bookingService: MockBookingService;
  let systemParametersService: MockSystemParametersService;
  let responsiveService: MockResponsiveService;
  let bookingValidationService: MockBookingValidationService;
  let calendarStateService: MockCalendarStateService;
  let timeUtils: MockTimeUtils;
  let loaderService: MockLoaderService;
  let translateService: any; // Placeholder for TranslateService

  beforeEach(async () => {
    await configureTestBedWithTranslate(
      [BookingPageComponent],
      [
        ...provideMockFirebase(),
        { provide: Router, useClass: MockRouter },
        { provide: FirebaseServicesService, useClass: MockFirebaseServicesService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: BookingService, useClass: MockBookingService },
        { provide: SystemParametersService, useClass: MockSystemParametersService },
        { provide: ResponsiveService, useClass: MockResponsiveService },
        { provide: BookingValidationService, useClass: MockBookingValidationService },
        { provide: CalendarStateService, useClass: MockCalendarStateService },
        { provide: TimeUtils, useClass: MockTimeUtils },
        { provide: LoaderService, useClass: MockLoaderService },
        MessageService,
        ConfirmationService
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;

    // Get service instances
    router = TestBed.inject(Router) as unknown as MockRouter;
    firebaseServicesService = TestBed.inject(FirebaseServicesService) as unknown as MockFirebaseServicesService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    bookingService = TestBed.inject(BookingService) as unknown as MockBookingService;
    systemParametersService = TestBed.inject(SystemParametersService) as unknown as MockSystemParametersService;
    responsiveService = TestBed.inject(ResponsiveService) as unknown as MockResponsiveService;
    bookingValidationService = TestBed.inject(BookingValidationService) as unknown as MockBookingValidationService;
    calendarStateService = TestBed.inject(CalendarStateService) as unknown as MockCalendarStateService;
    timeUtils = TestBed.inject(TimeUtils) as unknown as MockTimeUtils;
    loaderService = TestBed.inject(LoaderService) as unknown as MockLoaderService;
    // translateService is now provided by the test configuration

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load services on initialization', () => {
    expect(firebaseServicesService.loadServices).toHaveBeenCalled();
  });

  it('should set available services after loading', () => {
    expect(component.availableServices().length).toBe(2);
    expect(component.availableServices()[0].name).toBe('Tall de cabell');
  });

  it('should detect mobile devices correctly', () => {
    responsiveService.isMobile.set(true);
    fixture.detectChanges();
    expect(component.isMobile()).toBe(true);
  });

  it('should show desktop version when not mobile', () => {
    responsiveService.isMobile.set(false);
    fixture.detectChanges();
    expect(component.isMobile()).toBe(false);
  });

  it('should handle time slot selection', () => {
    const event = { date: '2024-01-15', time: '10:00' };

    component.onTimeSlotSelected(event);

    expect(component.selectedDate()).toEqual(new Date('2024-01-15'));
    expect(component.showServiceSelectionPopup()).toBe(true);
    expect(component.serviceSelectionDetails().date).toBe('2024-01-15');
    expect(component.serviceSelectionDetails().time).toBe('10:00');
  });

  it('should handle service selection cancellation', () => {
    component.showServiceSelectionPopupSignal.set(true);

    component.onServiceSelectionCancelled();

    expect(component.showServiceSelectionPopup()).toBe(false);
  });

  it('should handle booking cancellation', () => {
    component.showBookingPopupSignal.set(true);

    component.onBookingCancelled();

    expect(component.showBookingPopup()).toBe(false);
  });

  it('should handle client name change', () => {
    component.onClientNameChanged('New Name');

    expect(component.bookingDetails().clientName).toBe('New Name');
  });

  it('should handle email change', () => {
    component.onEmailChanged('new@example.com');

    expect(component.bookingDetails().email).toBe('new@example.com');
  });

  it('should handle login prompt close', () => {
    component.showLoginPromptSignal.set(true);

    component.onLoginPromptClose();

    expect(component.showLoginPrompt()).toBe(false);
  });

  it('should navigate to login page when login prompt login is clicked', () => {
    component.onLoginPromptLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should handle today button click', () => {
    component.onTodayClicked();

    expect(timeUtils.getFirstBusinessDayOfWeek).toHaveBeenCalled();
    expect(component.selectedDate()).toBeTruthy();
  });

  it('should handle date change', () => {
    const newDate = new Date('2024-01-15');

    component.onDateChange(newDate);

    expect(component.selectedDate()).toEqual(newDate);
  });

  it('should check if user can book more appointments', () => {
    const canBook = component.canUserBookMoreAppointments();

    expect(bookingValidationService.canUserBookMoreAppointments).toHaveBeenCalled();
    expect(canBook).toBe(true);
  });

  it('should get user appointment count', () => {
    const count = component.getUserAppointmentCount();

    expect(bookingValidationService.getUserAppointmentCount).toHaveBeenCalled();
    expect(count).toBe(0);
  });

  it('should get max appointments per user', () => {
    const max = component.getMaxAppointmentsPerUser();

    expect(systemParametersService.getMaxAppointmentsPerUser).toHaveBeenCalled();
    expect(max).toBe(3);
  });

  it('should navigate to appointments page', () => {
    component.onViewMyAppointments();

    expect(router.navigate).toHaveBeenCalledWith(['/appointments']);
  });

  it('should compute week info correctly', () => {
    const weekInfo = component.weekInfo();

    expect(weekInfo).toContain('-');
    expect(typeof weekInfo).toBe('string');
  });

  it('should compute available days', () => {
    const availableDays = component.availableDays();

    expect(bookingValidationService.generateAvailableDays).toHaveBeenCalled();
    expect(Array.isArray(availableDays)).toBe(true);
  });

  it('should handle appointment limit reached', () => {
    bookingValidationService.canUserBookMoreAppointments.and.returnValue(false);
    authService.isAuthenticated.set(true);

    const hasReachedLimit = component.hasReachedAppointmentLimit();

    expect(hasReachedLimit).toBe(true);
  });

  it('should block calendar when user has reached limit', () => {
    bookingValidationService.canUserBookMoreAppointments.and.returnValue(false);
    authService.isAuthenticated.set(true);

    const isBlocked = component.isCalendarBlocked();

    expect(isBlocked).toBe(true);
  });

  it('should prevent booking when user has reached limit', () => {
    bookingValidationService.canUserBookMoreAppointments.and.returnValue(false);
    authService.isAuthenticated.set(true);

    const event = { date: '2024-01-15', time: '10:00' };
    component.onTimeSlotSelected(event);

    expect(component.showServiceSelectionPopup()).toBe(false);
  });

  it('should listen for service updates', () => {
    const event = new Event('serviceUpdated');
    spyOn(window, 'addEventListener');

    // Recreate component to trigger constructor
    fixture.destroy();
    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;

    expect(window.addEventListener).toHaveBeenCalledWith('serviceUpdated', jasmine.any(Function));
  });
});

