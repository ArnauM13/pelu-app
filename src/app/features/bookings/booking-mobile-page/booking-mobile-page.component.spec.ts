import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingMobilePageComponent } from './booking-mobile-page.component';
import { TranslateService, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { BookingService } from '../../../core/services/booking.service';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { ServiceTranslationService } from '../../../core/services/service-translation.service';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('BookingMobilePageComponent', () => {
  let component: BookingMobilePageComponent;
  let fixture: ComponentFixture<BookingMobilePageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let firebaseServicesService: jasmine.SpyObj<FirebaseServicesService>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let roleService: jasmine.SpyObj<RoleService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let serviceColorsService: jasmine.SpyObj<ServiceColorsService>;
  let serviceTranslationService: jasmine.SpyObj<ServiceTranslationService>;
  let responsiveService: jasmine.SpyObj<ResponsiveService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'user']);
    const firebaseServicesSpy = jasmine.createSpyObj('FirebaseServicesService', ['activeServices']);
    const bookingSpy = jasmine.createSpyObj('BookingService', [
      'createBooking',
      'bookings',
      'isLoading',
      'error',
      'isInitialized',
      'hasCachedData',
      'loadBookings',
      'getBookingsForDate',
      'getBookingsForDateRange',
      'getUpcomingBookings',
      'getPastBookings',
      'getDraftBookings',
      'isBookingComplete',
      'isPublicBooking',
      'isOwnBooking',
      'refreshBookings',
      'silentRefreshBookings',
      'getBookingsWithCache',
      'clearCache'
    ]);
    const roleSpy = jasmine.createSpyObj('RoleService', ['isAdmin']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['showAppointmentCreated', 'showLoginRequired']);
    const serviceColorsSpy = jasmine.createSpyObj('ServiceColorsService', ['getServiceColor']);
    const serviceTranslationSpy = jasmine.createSpyObj('ServiceTranslationService', ['getServiceName']);
    const responsiveSpy = jasmine.createSpyObj('ResponsiveService', ['isMobile']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        BookingMobilePageComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: FirebaseServicesService, useValue: firebaseServicesSpy },
        { provide: BookingService, useValue: bookingSpy },
        { provide: RoleService, useValue: roleSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: ServiceColorsService, useValue: serviceColorsSpy },
        { provide: ServiceTranslationService, useValue: serviceTranslationSpy },
        { provide: ResponsiveService, useValue: responsiveSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingMobilePageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    firebaseServicesService = TestBed.inject(FirebaseServicesService) as jasmine.SpyObj<FirebaseServicesService>;
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    roleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    serviceColorsService = TestBed.inject(ServiceColorsService) as jasmine.SpyObj<ServiceColorsService>;
    serviceTranslationService = TestBed.inject(ServiceTranslationService) as jasmine.SpyObj<ServiceTranslationService>;
    responsiveService = TestBed.inject(ResponsiveService) as jasmine.SpyObj<ResponsiveService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mock return values
    authService.isAuthenticated.and.returnValue(true);
    authService.user.and.returnValue({
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      metadata: { creationTime: '', lastSignInTime: '' },
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: () => Promise.resolve(),
      getIdToken: () => Promise.resolve(''),
      getIdTokenResult: () => Promise.resolve({} as any),
      reload: () => Promise.resolve(),
      toJSON: () => ({}),
      displayName: null,
      phoneNumber: null,
      photoURL: null,
      providerId: 'password'
    });
    firebaseServicesService.activeServices.and.returnValue([]);
    roleService.isAdmin.and.returnValue(false);
    responsiveService.isMobile.and.returnValue(true);

    // Setup BookingService mock return values
    bookingService.bookings.and.returnValue([]);
    bookingService.isLoading.and.returnValue(false);
    bookingService.error.and.returnValue(null);
    bookingService.isInitialized.and.returnValue(true);
    bookingService.hasCachedData.and.returnValue(false);
    bookingService.loadBookings.and.returnValue(Promise.resolve());
    bookingService.getBookingsForDate.and.returnValue([]);
    bookingService.getBookingsForDateRange.and.returnValue([]);
    bookingService.getUpcomingBookings.and.returnValue([]);
    bookingService.getPastBookings.and.returnValue([]);
    bookingService.getDraftBookings.and.returnValue([]);
    bookingService.isBookingComplete.and.returnValue(true);
    bookingService.isPublicBooking.and.returnValue(false);
    bookingService.isOwnBooking.and.returnValue(true);
    bookingService.refreshBookings.and.returnValue(Promise.resolve());
    bookingService.silentRefreshBookings.and.returnValue(Promise.resolve());
    bookingService.getBookingsWithCache.and.returnValue(Promise.resolve([]));
    bookingService.clearCache.and.returnValue(undefined);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Properties', () => {
    it('should have business configuration properties', () => {
      expect(component.businessHours).toBeDefined();
      expect(component.lunchBreak).toBeDefined();
      expect(component.businessDays).toBeDefined();
      expect(component.slotDuration).toBeDefined();
    });

    it('should have computed properties for time slots', () => {
      expect(component.weekDays).toBeDefined();
      expect(component.selectedDaySlots).toBeDefined();
      expect(component.daySlots).toBeDefined();
    });

    it('should have available services computed property', () => {
      expect(component.availableServices).toBeDefined();
    });

    it('should have authentication computed properties', () => {
      expect(component.isAuthenticated).toBeDefined();
      expect(component.isAdmin).toBeDefined();
    });
  });

  describe('Navigation Methods', () => {
    it('should have previousWeek method', () => {
      expect(typeof component.previousWeek).toBe('function');
    });

    it('should have nextWeek method', () => {
      expect(typeof component.nextWeek).toBe('function');
    });

    it('should have goToToday method', () => {
      expect(typeof component.goToToday).toBe('function');
    });

    it('should have selectToday method', () => {
      expect(typeof component.selectToday).toBe('function');
    });

    it('should have selectTomorrow method', () => {
      expect(typeof component.selectTomorrow).toBe('function');
    });
  });

  describe('Date and Time Methods', () => {
    it('should have selectDate method', () => {
      expect(typeof component.selectDate).toBe('function');
    });

    it('should have selectTimeSlot method', () => {
      expect(typeof component.selectTimeSlot).toBe('function');
    });

    it('should have formatDay method', () => {
      expect(typeof component.formatDay).toBe('function');
    });

    it('should have formatDayShort method', () => {
      expect(typeof component.formatDayShort).toBe('function');
    });

    it('should have isToday method', () => {
      expect(typeof component.isToday).toBe('function');
    });

    it('should have isSelected method', () => {
      expect(typeof component.isSelected).toBe('function');
    });

    it('should have isBusinessDay method', () => {
      expect(typeof component.isBusinessDay).toBe('function');
    });

    it('should have isPastDate method', () => {
      expect(typeof component.isPastDate).toBe('function');
    });

    it('should have canSelectDate method', () => {
      expect(typeof component.canSelectDate).toBe('function');
    });

    it('should have getToday method', () => {
      expect(typeof component.getToday).toBe('function');
    });

    it('should have getTomorrow method', () => {
      expect(typeof component.getTomorrow).toBe('function');
    });
  });

  describe('Service Selection', () => {
    it('should have selectService method', () => {
      expect(typeof component.selectService).toBe('function');
    });

    it('should have selectServiceFromList method', () => {
      expect(typeof component.selectServiceFromList).toBe('function');
    });
  });

  describe('Booking Methods', () => {
    it('should have onBookingConfirmed method', () => {
      expect(typeof component.onBookingConfirmed).toBe('function');
    });

    it('should have onBookingCancelled method', () => {
      expect(typeof component.onBookingCancelled).toBe('function');
    });

    it('should have onClientNameChanged method', () => {
      expect(typeof component.onClientNameChanged).toBe('function');
    });

    it('should have onEmailChanged method', () => {
      expect(typeof component.onEmailChanged).toBe('function');
    });
  });

  describe('Service Integration', () => {
    it('should use AuthService for authentication', () => {
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should use FirebaseServicesService for services', () => {
      expect(firebaseServicesService.activeServices).toHaveBeenCalled();
    });

    it('should use BookingService for bookings', () => {
      expect(bookingService).toBeDefined();
    });

    it('should use RoleService for role checking', () => {
      expect(roleService.isAdmin).toHaveBeenCalled();
    });

    it('should use ToastService for notifications', () => {
      expect(toastService).toBeDefined();
    });

    it('should use Router for navigation', () => {
      expect(router).toBeDefined();
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with default values', () => {
      expect(component.showBookingPopup()).toBeFalse();
      expect(component.bookingDetails()).toEqual({ date: '', time: '', clientName: '', email: '' });
      expect(component.availableServices()).toEqual([]);
    });
  });

  describe('Event Handling', () => {
    it('should handle date selection', () => {
      const date = new Date();
      expect(() => component.onDateSelected(date)).not.toThrow();
    });

    it('should handle client name changes', () => {
      expect(() => component.onClientNameChanged('New Name')).not.toThrow();
    });

    it('should handle email changes', () => {
      expect(() => component.onEmailChanged('new@example.com')).not.toThrow();
    });
  });

  describe('Booking Flow', () => {
    it('should handle booking confirmation', () => {
      const bookingDetails = {
        date: '2024-01-01',
        time: '10:00',
        clientName: 'Test User',
        email: 'test@example.com'
      };

      expect(() => component.onBookingConfirmed(bookingDetails)).not.toThrow();
    });

    it('should handle booking cancellation', () => {
      expect(() => component.onBookingCancelled()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user gracefully', () => {
      authService.isAuthenticated.and.returnValue(false);
      const bookingDetails = {
        date: '2024-01-01',
        time: '10:00',
        clientName: 'Test User',
        email: 'test@example.com'
      };

      component.onBookingConfirmed(bookingDetails);

      expect(toastService.showLoginRequired).toHaveBeenCalled();
    });

    it('should handle empty services list', () => {
      expect(component.availableServices()).toEqual([]);
    });
  });

  describe('Utility Methods', () => {
    it('should have getServiceColor method', () => {
      expect(typeof component.getServiceColor).toBe('function');
    });

    it('should have getServiceBackgroundColor method', () => {
      expect(typeof component.getServiceBackgroundColor).toBe('function');
    });

    it('should have getEnabledTimeSlots method', () => {
      expect(typeof component.getEnabledTimeSlots).toBe('function');
    });

    it('should have nextAvailableDate method', () => {
      expect(typeof component.nextAvailableDate).toBe('function');
    });

    it('should have selectNextAvailable method', () => {
      expect(typeof component.selectNextAvailable).toBe('function');
    });
  });
});
