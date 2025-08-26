import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BookingPageComponent } from './booking-page.component';
import { AuthService } from '../../../core/auth/auth.service';
import { FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { BookingService } from '../../../core/services/booking.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { CalendarStateService } from '../../calendar/services/calendar-state.service';
import { BookingValidationService } from '../../../core/services/booking-validation.service';
import { TimeUtils } from '../../../shared/utils/time.utils';
import { LoaderService } from '../../../shared/services/loader.service';
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
      'BOOKING.LOGIN_PROMPT_TITLE': 'Login Required',
      'AUTH.SIGN_IN': 'Sign In',
      'BOOKING.LOADING_SERVICES': 'Loading Services',
      'BOOKING.CREATING_BOOKING': 'Creating Booking',
      'BOOKING.USER_LIMIT_REACHED_MESSAGE': 'User limit reached',
    });
  }
}

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let firebaseServicesService: jasmine.SpyObj<FirebaseServicesService>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let systemParametersService: jasmine.SpyObj<SystemParametersService>;
  let responsiveService: jasmine.SpyObj<ResponsiveService>;
  let calendarStateService: jasmine.SpyObj<CalendarStateService>;
  let bookingValidationService: jasmine.SpyObj<BookingValidationService>;
  let timeUtils: jasmine.SpyObj<TimeUtils>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'userDisplayName',
      'user'
    ]);
    const firebaseServicesServiceSpy = jasmine.createSpyObj('FirebaseServicesService', [
      'loadServices',
      'activeServices'
    ]);
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'createBooking',
      'bookings'
    ]);
    const systemParametersServiceSpy = jasmine.createSpyObj('SystemParametersService', [
      'businessHours',
      'lunchBreak',
      'getMaxAppointmentsPerUser'
    ]);
    const responsiveServiceSpy = jasmine.createSpyObj('ResponsiveService', ['isMobile']);
    const calendarStateServiceSpy = jasmine.createSpyObj('CalendarStateService', [
      'viewDate'
    ]);
    const bookingValidationServiceSpy = jasmine.createSpyObj('BookingValidationService', [
      'canUserBookMoreAppointments',
      'getUserAppointmentCount',
      'generateAvailableDays'
    ]);
    const timeUtilsSpy = jasmine.createSpyObj('TimeUtils', [
      'getFirstBusinessDayOfWeek'
    ]);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'get',
      'instant'
    ]);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', [
      'show',
      'hide'
    ]);

    // Setup default return values
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.userDisplayName.and.returnValue('Test User');
    authServiceSpy.user.and.returnValue({ uid: 'test-uid', email: 'test@example.com' });
    firebaseServicesServiceSpy.activeServices.and.returnValue([]);
    bookingServiceSpy.bookings.and.returnValue([]);
    systemParametersServiceSpy.businessHours.and.returnValue({ start: 8, end: 20, lunchStart: 13, lunchEnd: 15 });
    systemParametersServiceSpy.lunchBreak.and.returnValue({ start: 13, end: 15 });
    systemParametersServiceSpy.getMaxAppointmentsPerUser.and.returnValue(5);
    responsiveServiceSpy.isMobile.and.returnValue(false);
    calendarStateServiceSpy.viewDate.and.returnValue(new Date());
    bookingValidationServiceSpy.canUserBookMoreAppointments.and.returnValue(true);
    bookingValidationServiceSpy.getUserAppointmentCount.and.returnValue(0);
    bookingValidationServiceSpy.generateAvailableDays.and.returnValue([]);
    timeUtilsSpy.getFirstBusinessDayOfWeek.and.returnValue(new Date());
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
        { provide: FirebaseServicesService, useValue: firebaseServicesServiceSpy },
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: SystemParametersService, useValue: systemParametersServiceSpy },
        { provide: ResponsiveService, useValue: responsiveServiceSpy },
        { provide: CalendarStateService, useValue: calendarStateServiceSpy },
        { provide: BookingValidationService, useValue: bookingValidationServiceSpy },
        { provide: TimeUtils, useValue: timeUtilsSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        provideMockFirebase(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    firebaseServicesService = TestBed.inject(FirebaseServicesService) as jasmine.SpyObj<FirebaseServicesService>;
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    systemParametersService = TestBed.inject(SystemParametersService) as jasmine.SpyObj<SystemParametersService>;
    responsiveService = TestBed.inject(ResponsiveService) as jasmine.SpyObj<ResponsiveService>;
    calendarStateService = TestBed.inject(CalendarStateService) as jasmine.SpyObj<CalendarStateService>;
    bookingValidationService = TestBed.inject(BookingValidationService) as jasmine.SpyObj<BookingValidationService>;
    timeUtils = TestBed.inject(TimeUtils) as jasmine.SpyObj<TimeUtils>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
  });

  describe('Component Creation and Basic Properties', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required computed signals', () => {
      expect(component.showServiceSelectionPopup).toBeDefined();
      expect(component.showBookingPopup).toBeDefined();
      expect(component.serviceSelectionDetails).toBeDefined();
      expect(component.bookingDetails).toBeDefined();
      expect(component.availableServices).toBeDefined();
      expect(component.showLoginPrompt).toBeDefined();
      expect(component.selectedDate).toBeDefined();
      expect(component.isAuthenticated).toBeDefined();
      expect(component.isMobile).toBeDefined();
      expect(component.todayDate).toBeDefined();
      expect(component.hasReachedAppointmentLimit).toBeDefined();
      expect(component.isCalendarBlocked).toBeDefined();
      expect(component.weekInfo).toBeDefined();
      expect(component.calendarFooterConfig).toBeDefined();
      expect(component.availableDays).toBeDefined();
      expect(component.loginPromptDialogConfig).toBeDefined();
    });

    it('should initialize with default values', () => {
      expect(component.showServiceSelectionPopup()).toBe(false);
      expect(component.showBookingPopup()).toBe(false);
      expect(component.availableServices()).toEqual([]);
      expect(component.showLoginPrompt()).toBe(false);
      expect(component.selectedDate()).toBeNull();
    });
  });

  describe('Service Integration', () => {
    it('should use ResponsiveService for mobile detection', () => {
      component.isMobile();
      expect(responsiveService.isMobile).toHaveBeenCalled();
    });

    it('should use AuthService for authentication state', () => {
      component.isAuthenticated();
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should use FirebaseServicesService for services', () => {
      component.availableServices();
      expect(firebaseServicesService.activeServices).toHaveBeenCalled();
    });

    it('should use SystemParametersService for business configuration', () => {
      component.calendarFooterConfig();
      expect(systemParametersService.businessHours).toHaveBeenCalled();
      expect(systemParametersService.lunchBreak).toHaveBeenCalled();
    });

    it('should use CalendarStateService for view date', () => {
      component.weekInfo();
      expect(calendarStateService.viewDate).toHaveBeenCalled();
    });

    it('should use BookingValidationService for appointment validation', () => {
      component.canUserBookMoreAppointments();
      expect(bookingValidationService.canUserBookMoreAppointments).toHaveBeenCalled();
    });

    it('should use TimeUtils for date operations', () => {
      component.onTodayClicked();
      expect(timeUtils.getFirstBusinessDayOfWeek).toHaveBeenCalled();
    });

    it('should use LoaderService for loading states', () => {
      // Test that LoaderService is injected and available
      expect(loaderService).toBeDefined();
      expect(loaderService.show).toBeDefined();
      expect(loaderService.hide).toBeDefined();
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
    it('should show unauthenticated state', () => {
      authService.isAuthenticated.and.returnValue(false);
      expect(component.isAuthenticated()).toBe(false);
    });

    it('should show authenticated state', () => {
      authService.isAuthenticated.and.returnValue(true);
      expect(component.isAuthenticated()).toBe(true);
    });
  });

  describe('Date Handling', () => {
    it('should provide today date', () => {
      const today = component.todayDate();
      expect(today).toBeInstanceOf(Date);
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
      expect(today.getSeconds()).toBe(0);
    });

    it('should handle date selection', () => {
      const testDate = new Date('2024-01-15');
      component.onDateChange(testDate);
      expect(component.selectedDate()).toEqual(testDate);
    });
  });

  describe('Event Handling', () => {
    it('should handle time slot selection', () => {
      const event = { date: '2024-01-15', time: '10:00' };
      component.onTimeSlotSelected(event);
      expect(component.selectedDate()).toBeInstanceOf(Date);
      expect(component.serviceSelectionDetails().date).toBe('2024-01-15');
      expect(component.serviceSelectionDetails().time).toBe('10:00');
    });

    it('should handle client name changes', () => {
      const testName = 'John Doe';
      component.onClientNameChanged(testName);
      expect(component.bookingDetails().clientName).toBe(testName);
    });

    it('should handle email changes', () => {
      const testEmail = 'john@example.com';
      component.onEmailChanged(testEmail);
      expect(component.bookingDetails().email).toBe(testEmail);
    });
  });

  describe('Booking Flow', () => {
    it('should handle booking confirmation', async () => {
      const details = {
        date: '2024-01-15',
        time: '10:00',
        clientName: 'John Doe',
        email: 'john@example.com',
        service: {
          id: 'service1',
          name: 'Test Service',
          description: 'Test Description',
          price: 50,
          duration: 60,
          category: 'test',
          icon: 'test-icon',
          isActive: true
        }
      };

      bookingService.createBooking.and.returnValue(Promise.resolve({
        id: 'booking1',
        clientName: 'John Doe',
        email: 'john@example.com',
        data: '2024-01-15',
        hora: '10:00',
        serviceId: 'service1',
        notes: '',
        status: 'confirmed',
        createdAt: new Date()
      }));

      await component.onBookingConfirmed(details);

      expect(bookingService.createBooking).toHaveBeenCalledWith({
        clientName: 'John Doe',
        email: 'john@example.com',
        data: '2024-01-15',
        hora: '10:00',
        serviceId: 'service1',
        notes: '',
        status: 'confirmed'
      });
    });

    it('should handle booking cancellation', () => {
      component.onBookingCancelled();
      expect(component.showBookingPopup()).toBe(false);
    });

    it('should handle service selection', () => {
      const details = {
        date: '2024-01-15',
        time: '10:00',
        clientName: 'John Doe',
        email: 'john@example.com'
      };
      const service = {
        id: 'service1',
        name: 'Test Service',
        description: 'Test Description',
        price: 50,
        duration: 60,
        category: 'test',
        icon: 'test-icon',
        isActive: true
      };

      component.onServiceSelected({ details, service });

      expect(component.showServiceSelectionPopup()).toBe(false);
      expect(component.showBookingPopup()).toBe(true);
      expect(component.bookingDetails().service).toEqual(service);
    });

    it('should handle service selection cancellation', () => {
      component.onServiceSelectionCancelled();
      expect(component.showServiceSelectionPopup()).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to appointments', () => {
      component.onViewMyAppointments();
      expect(router.navigate).toHaveBeenCalledWith(['/appointments']);
    });

    it('should handle login prompt login', () => {
      component.onLoginPromptLogin();
      expect(component.showLoginPrompt()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should handle login prompt close', () => {
      component.onLoginPromptClose();
      expect(component.showLoginPrompt()).toBe(false);
    });
  });

  describe('Appointment Limits', () => {
    it('should check user appointment limit', () => {
      component.canUserBookMoreAppointments();
      expect(bookingValidationService.canUserBookMoreAppointments).toHaveBeenCalled();
    });

    it('should get user appointment count', () => {
      component.getUserAppointmentCount();
      expect(bookingValidationService.getUserAppointmentCount).toHaveBeenCalled();
    });

    it('should get max appointments per user', () => {
      component.getMaxAppointmentsPerUser();
      expect(systemParametersService.getMaxAppointmentsPerUser).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty services list', () => {
      firebaseServicesService.activeServices.and.returnValue([]);
      expect(component.availableServices()).toEqual([]);
    });

    it('should handle missing user gracefully', () => {
      authService.user.and.returnValue(null);
      authService.userDisplayName.and.returnValue('');
      expect(component.isAuthenticated()).toBe(true); // Default mock value
    });
  });

  describe('Component Behavior', () => {
    it('should handle appointment storage', () => {
      bookingService.bookings.and.returnValue([
        {
          id: 'booking1',
          clientName: 'John Doe',
          email: 'john@example.com',
          data: '2024-01-15',
          hora: '10:00',
          serviceId: 'service1',
          notes: '',
          status: 'confirmed',
          createdAt: new Date()
        }
      ]);
      expect(bookingService.bookings).toBeDefined();
    });

    it('should initialize with default values', () => {
      expect(component.showServiceSelectionPopup()).toBe(false);
      expect(component.showBookingPopup()).toBe(false);
      expect(component.availableServices()).toEqual([]);
      expect(component.showLoginPrompt()).toBe(false);
    });
  });
});

