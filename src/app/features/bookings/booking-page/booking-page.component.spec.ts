import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BookingPageComponent } from './booking-page.component';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ServicesService } from '../../../core/services/services.service';
import { ToastService } from '../../../shared/services/toast.service';
import { FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { CalendarStateService } from '../../calendar/services/calendar-state.service';
import { BookingValidationService } from '../../../core/services/booking-validation.service';
import { TimeUtils } from '../../../shared/utils/time.utils';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

// Mock classes
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.BOOKING': 'Reserva',
      'COMMON.SERVICES': 'Serveis',
      'COMMON.DATE': 'Data',
      'COMMON.TIME': 'Hora',
      'COMMON.CLIENT_NAME': 'Nom del client',
      'COMMON.EMAIL': 'Email',
    });
  }
}

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let servicesService: jasmine.SpyObj<ServicesService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let firebaseServicesService: jasmine.SpyObj<FirebaseServicesService>;
  let _bookingService: jasmine.SpyObj<BookingService>;
  let _systemParametersService: jasmine.SpyObj<SystemParametersService>;
  let responsiveService: jasmine.SpyObj<ResponsiveService>;
  let _calendarStateService: jasmine.SpyObj<CalendarStateService>;
  let _bookingValidationService: jasmine.SpyObj<BookingValidationService>;
  let _timeUtils: jasmine.SpyObj<TimeUtils>;
  let _translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user', 'isAuthenticated']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['userDisplayName']);
    const servicesServiceSpy = jasmine.createSpyObj('ServicesService', [
      'getServicesWithTranslatedNamesAsync',
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showLoginRequired',
      'showAppointmentCreated',
      'showNetworkError',
    ]);
    const firebaseServicesServiceSpy = jasmine.createSpyObj('FirebaseServicesService', [
      'services',
      'getServiceById',
    ]);
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'createBooking',
      'getBookings',
    ]);
    const systemParametersServiceSpy = jasmine.createSpyObj('SystemParametersService', [
      'getSystemParameters',
    ]);
    const responsiveServiceSpy = jasmine.createSpyObj('ResponsiveService', ['isMobile']);
    const calendarStateServiceSpy = jasmine.createSpyObj('CalendarStateService', [
      'getState',
      'setState',
    ]);
    const bookingValidationServiceSpy = jasmine.createSpyObj('BookingValidationService', [
      'validateBooking',
    ]);
    const timeUtilsSpy = jasmine.createSpyObj('TimeUtils', [
      'formatTime',
      'parseTime',
    ]);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'get',
      'instant',
      'use',
    ]);

    // Setup default return values
    authServiceSpy.user.and.returnValue({ uid: 'test-uid', email: 'test@example.com' });
    authServiceSpy.isAuthenticated.and.returnValue(true);
    userServiceSpy.userDisplayName.and.returnValue('Test User');
    servicesServiceSpy.getServicesWithTranslatedNamesAsync.and.returnValue(of([]));
    firebaseServicesServiceSpy.services.and.returnValue([]);
    responsiveServiceSpy.isMobile.and.returnValue(false);
    translateServiceSpy.get.and.returnValue(of('translated text'));
    translateServiceSpy.instant.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [
        BookingPageComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ServicesService, useValue: servicesServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: FirebaseServicesService, useValue: firebaseServicesServiceSpy },
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: SystemParametersService, useValue: systemParametersServiceSpy },
        { provide: ResponsiveService, useValue: responsiveServiceSpy },
        { provide: CalendarStateService, useValue: calendarStateServiceSpy },
        { provide: BookingValidationService, useValue: bookingValidationServiceSpy },
        { provide: TimeUtils, useValue: timeUtilsSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        provideMockFirebase(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    servicesService = TestBed.inject(ServicesService) as jasmine.SpyObj<ServicesService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    firebaseServicesService = TestBed.inject(FirebaseServicesService) as jasmine.SpyObj<FirebaseServicesService>;
    _bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    _systemParametersService = TestBed.inject(SystemParametersService) as jasmine.SpyObj<SystemParametersService>;
    responsiveService = TestBed.inject(ResponsiveService) as jasmine.SpyObj<ResponsiveService>;
    _calendarStateService = TestBed.inject(CalendarStateService) as jasmine.SpyObj<CalendarStateService>;
    _bookingValidationService = TestBed.inject(BookingValidationService) as jasmine.SpyObj<BookingValidationService>;
    _timeUtils = TestBed.inject(TimeUtils) as jasmine.SpyObj<TimeUtils>;
    _translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    fixture.detectChanges();
  });

  describe('Component Creation and Basic Properties', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required computed signals', () => {
      expect(component.showBookingPopup).toBeDefined();
      expect(component.bookingDetails).toBeDefined();
      expect(component.availableServices).toBeDefined();
      expect(component.isAuthenticated).toBeDefined();
      expect(component.isMobile).toBeDefined();
    });

    it('should initialize with default values', () => {
      expect(component.showServiceSelectionPopup()).toBe(false);
      expect(component.showBookingPopup()).toBe(false);
      expect(component.availableServices()).toEqual([]);
      expect(component.showLoginPrompt()).toBe(false);
    });
  });

  describe('Service Integration', () => {
    it('should use AuthService for user information', () => {
      expect(authService.user).toHaveBeenCalled();
    });

    it('should use UserService for display name', () => {
      expect(userService.userDisplayName).toHaveBeenCalled();
    });

    it('should use ServicesService for loading services', () => {
      expect(servicesService.getServicesWithTranslatedNamesAsync).toHaveBeenCalled();
    });

    it('should use ToastService for notifications', () => {
      expect(toastService).toBeDefined();
    });

    it('should use Router for navigation', () => {
      expect(router).toBeDefined();
    });

    it('should use FirebaseServicesService for services', () => {
      expect(firebaseServicesService.services).toHaveBeenCalled();
    });

    it('should use ResponsiveService for mobile detection', () => {
      expect(responsiveService.isMobile).toHaveBeenCalled();
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with default values', () => {
      expect(component.showServiceSelectionPopup()).toBe(false);
      expect(component.showBookingPopup()).toBe(false);
      expect(component.availableServices()).toEqual([]);
    });

    it('should handle appointment storage', () => {
      const appointmentData = {
        date: '2024-01-15',
        time: '10:00',
        clientName: 'Test User',
        email: 'test@example.com',
      };

      component.serviceSelectionDetailsSignal.set(appointmentData);
      expect(component.serviceSelectionDetails()).toEqual(appointmentData);
    });
  });

  describe('Event Handling', () => {
    it('should handle client name changes', () => {
      const newName = 'New Client Name';
      const currentDetails = component.serviceSelectionDetails();
      const updatedDetails = { ...currentDetails, clientName: newName };

      component.serviceSelectionDetailsSignal.set(updatedDetails);
      expect(component.serviceSelectionDetails().clientName).toBe(newName);
    });

    it('should handle time slot selection', () => {
      const newTime = '14:30';
      const currentDetails = component.serviceSelectionDetails();
      const updatedDetails = { ...currentDetails, time: newTime };

      component.serviceSelectionDetailsSignal.set(updatedDetails);
      expect(component.serviceSelectionDetails().time).toBe(newTime);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty services list', () => {
      firebaseServicesService.services.and.returnValue([]);
      component.availableServicesSignal.set([]);
      expect(component.availableServices()).toEqual([]);
    });

    it('should handle missing user gracefully', () => {
      authService.user.and.returnValue(null);
      authService.isAuthenticated.and.returnValue(false);

      // Component should still be created
      expect(component).toBeTruthy();
    });
  });

  describe('Booking Flow', () => {
    it('should handle booking confirmation', () => {
      const bookingDetails = {
        date: '2024-01-15',
        time: '10:00',
        clientName: 'Test User',
        email: 'test@example.com',
      };

      component.bookingDetailsSignal.set(bookingDetails);
      expect(component.bookingDetails()).toEqual(bookingDetails);
    });

    it('should handle booking cancellation', () => {
      component.showBookingPopupSignal.set(false);
      expect(component.showBookingPopup()).toBe(false);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should detect mobile devices', () => {
      responsiveService.isMobile.and.returnValue(true);
      expect(component.isMobile()).toBe(true);
    });

    it('should detect desktop devices', () => {
      responsiveService.isMobile.and.returnValue(false);
      expect(component.isMobile()).toBe(false);
    });
  });

  describe('Authentication State', () => {
    it('should show authenticated state', () => {
      authService.isAuthenticated.and.returnValue(true);
      expect(component.isAuthenticated()).toBe(true);
    });

    it('should show unauthenticated state', () => {
      authService.isAuthenticated.and.returnValue(false);
      expect(component.isAuthenticated()).toBe(false);
    });
  });

  describe('Date Handling', () => {
    it('should handle date selection', () => {
      const testDate = new Date('2024-01-15');
      component.selectedDateSignal.set(testDate);
      expect(component.selectedDate()).toEqual(testDate);
    });

    it('should provide today date', () => {
      const today = component.todayDate();
      expect(today).toBeInstanceOf(Date);
    });
  });
});

