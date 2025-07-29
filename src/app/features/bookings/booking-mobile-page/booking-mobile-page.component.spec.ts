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
import { BusinessSettingsService } from '../../../core/services/business-settings.service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { format, addDays } from 'date-fns';

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
  let businessSettingsService: jasmine.SpyObj<BusinessSettingsService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser = {
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
    displayName: 'Test User',
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
  };

  const mockService = {
    id: 'service-1',
    name: 'Test Service',
    description: 'Test Description',
    duration: 60,
    price: 50,
    category: 'haircut',
    icon: '💇‍♀️',
    active: true,
  };

  const mockBooking = {
    id: 'booking-1',
    nom: 'Test Client',
    email: 'client@example.com',
    data: '2024-01-15',
    hora: '10:00',
    serviceName: 'Test Service',
    serviceId: 'service-1',
    duration: 60,
    price: 50,
    notes: 'Test notes',
    status: 'confirmed' as const,
    editToken: 'token-123',
    uid: 'test-uid',
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'user',
      'userDisplayName'
    ]);
    const firebaseServicesSpy = jasmine.createSpyObj('FirebaseServicesService', [
      'activeServices',
      'loadServices',
      'services'
    ]);
    const bookingSpy = jasmine.createSpyObj('BookingService', [
      'createBooking',
      'bookings',
      'loadBookings'
    ]);
    const roleSpy = jasmine.createSpyObj('RoleService', ['isAdmin']);
    const toastSpy = jasmine.createSpyObj('ToastService', [
      'showError',
      'showWarning',
      'showInfo',
      'showAppointmentCreated',
      'showLoginRequired'
    ]);
    const serviceColorsSpy = jasmine.createSpyObj('ServiceColorsService', [
      'getServiceColor'
    ]);
    const businessSettingsSpy = jasmine.createSpyObj('BusinessSettingsService', [
      'getBusinessHoursString',
      'getLunchBreak',
      'getWorkingDays',
      'getAppointmentDuration'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        BookingMobilePageComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: FirebaseServicesService, useValue: firebaseServicesSpy },
        { provide: BookingService, useValue: bookingSpy },
        { provide: RoleService, useValue: roleSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: ServiceColorsService, useValue: serviceColorsSpy },
        { provide: BusinessSettingsService, useValue: businessSettingsSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingMobilePageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    firebaseServicesService = TestBed.inject(
      FirebaseServicesService
    ) as jasmine.SpyObj<FirebaseServicesService>;
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    roleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    serviceColorsService = TestBed.inject(
      ServiceColorsService
    ) as jasmine.SpyObj<ServiceColorsService>;
    businessSettingsService = TestBed.inject(
      BusinessSettingsService
    ) as jasmine.SpyObj<BusinessSettingsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mock return values
    authService.isAuthenticated.and.returnValue(true);
    authService.user.and.returnValue(mockUser);
    authService.userDisplayName.and.returnValue('Test User');
    
    firebaseServicesService.activeServices.and.returnValue([mockService]);
    firebaseServicesService.services.and.returnValue([mockService]);
    firebaseServicesService.loadServices.and.returnValue(Promise.resolve());
    
    bookingService.bookings.and.returnValue([mockBooking]);
    bookingService.loadBookings.and.returnValue(Promise.resolve());
    bookingService.createBooking.and.returnValue(Promise.resolve(mockBooking));
    
    roleService.isAdmin.and.returnValue(false);
    
    toastService.showError.and.returnValue(undefined);
    toastService.showWarning.and.returnValue(undefined);
    toastService.showInfo.and.returnValue(undefined);
    
    serviceColorsService.getServiceColor.and.returnValue({
      id: 'haircut',
      translationKey: 'SERVICES.COLORS.HAIRCUT',
      color: '#ff0000',
      backgroundColor: '#ffeeee',
      borderColor: '#ff0000',
      textColor: '#000000'
    });
    
    businessSettingsService.getBusinessHoursString.and.returnValue({
      start: '09:00',
      end: '18:00',
      lunchStart: '13:00',
      lunchEnd: '14:00'
    });
    businessSettingsService.getLunchBreak.and.returnValue({
      start: '13:00',
      end: '14:00'
    });
    businessSettingsService.getWorkingDays.and.returnValue([1, 2, 3, 4, 5, 6]); // Mon-Sat
    businessSettingsService.getAppointmentDuration.and.returnValue(60);

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

    it('should initialize with default values', () => {
      expect(component.showBookingPopup()).toBeFalse();
      expect(component.bookingDetails()).toEqual({ 
        date: '', 
        time: '', 
        clientName: '', 
        email: '' 
      });
      expect(component.availableServices()).toEqual([mockService]);
    });
  });

  describe('Date and Time Methods', () => {
    it('should format day correctly', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = component.formatDay(date);
      expect(result).toContain('15');
    });

    it('should format day short correctly', () => {
      const date = new Date(2024, 0, 15);
      const result = component.formatDayShort(date);
      expect(result).toBeTruthy();
    });

    it('should format time correctly', () => {
      const result = component.formatTime('10:00');
      expect(result).toBe('10:00');
    });

    it('should format month correctly', () => {
      const date = new Date(2024, 0, 15);
      const result = component.formatMonth(date);
      expect(result).toContain('2024');
    });

    it('should check if date is today', () => {
      const today = new Date();
      expect(component.isToday(today)).toBeTrue();
      
      const tomorrow = addDays(today, 1);
      expect(component.isToday(tomorrow)).toBeFalse();
    });

    it('should check if date is selected', () => {
      const date = new Date();
      component.onDateSelected(date);
      expect(component.isSelected(date)).toBeTrue();
    });

    it('should check if date is business day', () => {
      const monday = new Date(2024, 0, 15); // Monday
      const sunday = new Date(2024, 0, 14); // Sunday
      
      expect(component.isBusinessDay(monday)).toBeTrue();
      expect(component.isBusinessDay(sunday)).toBeFalse();
    });

    it('should check if date is past date', () => {
      const yesterday = addDays(new Date(), -1);
      const tomorrow = addDays(new Date(), 1);
      
      expect(component.isPastDate(yesterday)).toBeTrue();
      expect(component.isPastDate(tomorrow)).toBeFalse();
    });

    it('should check if date can be selected', () => {
      const tomorrow = addDays(new Date(), 1);
      const yesterday = addDays(new Date(), -1);
      
      expect(component.canSelectDate(tomorrow)).toBeTrue();
      expect(component.canSelectDate(yesterday)).toBeFalse();
    });

    it('should get today and tomorrow dates', () => {
      const today = component.getToday();
      const tomorrow = component.getTomorrow();
      
      expect(today).toBeInstanceOf(Date);
      expect(tomorrow).toBeInstanceOf(Date);
      expect(tomorrow.getDate()).toBe(today.getDate() + 1);
    });
  });

  describe('Service Selection', () => {
    it('should select service from list', () => {
      component.selectServiceFromList(mockService);
      expect(component.selectedService()).toEqual(mockService);
    });

    it('should select service', () => {
      component.selectService(mockService);
      expect(component.selectedService()).toEqual(mockService);
    });
  });

  describe('Date Selection', () => {
    it('should select date', () => {
      const date = new Date();
      component.selectDate(date);
      expect(component.selectedDate()).toEqual(date);
    });

    it('should handle date selection', () => {
      const date = new Date();
      component.onDateSelected(date);
      expect(component.selectedDate()).toEqual(date);
    });

    it('should select today', () => {
      component.selectToday();
      expect(component.selectedDate()).toBeTruthy();
    });

    it('should select tomorrow', () => {
      component.selectTomorrow();
      expect(component.selectedDate()).toBeTruthy();
    });
  });

  describe('Time Slot Selection', () => {
    it('should show error when no service is selected', () => {
      const timeSlot = { time: '10:00', available: true, isSelected: false };
      component.selectTimeSlot(timeSlot);
      
      expect(toastService.showError).toHaveBeenCalledWith(
        'Si us plau, selecciona un servei primer'
      );
    });

    it('should show error when no date is selected', () => {
      component.selectServiceFromList(mockService);
      const timeSlot = { time: '10:00', available: true, isSelected: false };
      component.selectTimeSlot(timeSlot);
      
      expect(toastService.showError).toHaveBeenCalledWith(
        'Si us plau, selecciona una data primer'
      );
    });

    it('should open booking popup when service and date are selected', () => {
      component.selectServiceFromList(mockService);
      component.onDateSelected(new Date());
      const timeSlot = { time: '10:00', available: true, isSelected: false };
      
      component.selectTimeSlot(timeSlot);
      
      expect(component.showBookingPopup()).toBeTrue();
      expect(component.bookingDetails().time).toBe('10:00');
    });
  });

  describe('Booking Flow', () => {
    it('should handle booking confirmation', async () => {
      const bookingDetails = {
        date: '2024-01-15',
        time: '10:00',
        clientName: 'Test User',
        email: 'test@example.com',
        service: mockService
      };

      await component.onBookingConfirmed(bookingDetails);

      expect(bookingService.createBooking).toHaveBeenCalled();
      expect(component.showBookingPopup()).toBeFalse();
    });

    it('should handle booking cancellation', () => {
      component.onBookingCancelled();
      
      expect(component.showBookingPopup()).toBeFalse();
      expect(component.bookingDetails()).toEqual({
        date: '',
        time: '',
        clientName: '',
        email: ''
      });
    });

    it('should handle client name changes', () => {
      component.onClientNameChanged('New Name');
      expect(component.bookingDetails().clientName).toBe('New Name');
    });

    it('should handle email changes', () => {
      component.onEmailChanged('new@example.com');
      expect(component.bookingDetails().email).toBe('new@example.com');
    });
  });

  describe('View Mode', () => {
    it('should toggle view mode', () => {
      const initialMode = component.viewMode();
      component.toggleViewMode();
      expect(component.viewMode()).not.toBe(initialMode);
    });

    it('should navigate to previous period', () => {
      const initialDate = component.selectedDate();
      component.previousPeriod();
      expect(component.selectedDate()).not.toEqual(initialDate);
    });

    it('should navigate to next period', () => {
      const initialDate = component.selectedDate();
      component.nextPeriod();
      expect(component.selectedDate()).not.toEqual(initialDate);
    });

    it('should check if can go to previous period', () => {
      const result = component.canGoToPreviousPeriod();
      expect(typeof result).toBe('boolean');
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

    it('should have goToPreviousWeek method', () => {
      expect(typeof component.goToPreviousWeek).toBe('function');
    });

    it('should have goToNextWeek method', () => {
      expect(typeof component.goToNextWeek).toBe('function');
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

    it('should use BusinessSettingsService for business settings', () => {
      expect(businessSettingsService.getBusinessHoursString).toHaveBeenCalled();
      expect(businessSettingsService.getLunchBreak).toHaveBeenCalled();
      expect(businessSettingsService.getWorkingDays).toHaveBeenCalled();
      expect(businessSettingsService.getAppointmentDuration).toHaveBeenCalled();
    });
  });

  describe('Login Prompt', () => {
    it('should handle login prompt close', () => {
      component.onLoginPromptClose();
      expect(component.showLoginPrompt()).toBeFalse();
    });

    it('should handle login prompt login', () => {
      component.onLoginPromptLogin();
      expect(component.showLoginPrompt()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Utility Methods', () => {
    it('should get service color', () => {
      const result = component.getServiceColor('Test Service');
      expect(result).toBe('#ff0000');
    });

    it('should get service background color', () => {
      const result = component.getServiceBackgroundColor('Test Service');
      expect(result).toBe('#ffeeee');
    });

    it('should get enabled time slots', () => {
      const date = new Date();
      const result = component.getEnabledTimeSlots(date);
      expect(Array.isArray(result)).toBeTrue();
    });

    it('should find next available date', () => {
      const result = component.nextAvailableDate();
      expect(result).toBeInstanceOf(Date);
    });

    it('should select next available date', () => {
      component.selectNextAvailable();
      expect(component.selectedDate()).toBeTruthy();
    });

    it('should get selection message', () => {
      const result = component.getSelectionMessage();
      expect(typeof result).toBe('string');
    });
  });

  describe('Time Slot Generation', () => {
    it('should generate time slots for business day', () => {
      const monday = new Date(2024, 0, 15); // Monday
      const slots = component.getEnabledTimeSlots(monday);
      expect(slots.length).toBeGreaterThan(0);
    });

    it('should not generate time slots for non-business day', () => {
      const sunday = new Date(2024, 0, 14); // Sunday
      const slots = component.getEnabledTimeSlots(sunday);
      expect(slots.length).toBe(0);
    });
  });

  describe('Day Slot Methods', () => {
    it('should check for morning slots', () => {
      const daySlot = {
        date: new Date(),
        timeSlots: [
          { time: '09:00', available: true, isSelected: false },
          { time: '14:00', available: true, isSelected: false }
        ]
      };
      
      expect(component.hasMorningSlots(daySlot)).toBeTrue();
      expect(component.hasAfternoonSlots(daySlot)).toBeTrue();
    });

    it('should get morning and afternoon slots', () => {
      const daySlot = {
        date: new Date(),
        timeSlots: [
          { time: '09:00', available: true, isSelected: false },
          { time: '14:00', available: true, isSelected: false }
        ]
      };
      
      const morningSlots = component.getMorningSlots(daySlot);
      const afternoonSlots = component.getAfternoonSlots(daySlot);
      
      expect(morningSlots.length).toBeGreaterThan(0);
      expect(afternoonSlots.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user gracefully', async () => {
      authService.isAuthenticated.and.returnValue(false);
      const bookingDetails = {
        date: '2024-01-01',
        time: '10:00',
        clientName: 'Test User',
        email: 'test@example.com',
        service: mockService
      };

      await component.onBookingConfirmed(bookingDetails);

      expect(component.showLoginPrompt()).toBeTrue();
    });

    it('should handle empty services list', () => {
      firebaseServicesService.activeServices.and.returnValue([]);
      expect(component.availableServices()).toEqual([]);
    });

    it('should handle booking creation error', async () => {
      bookingService.createBooking.and.returnValue(Promise.reject(new Error('Test error')));
      
      const bookingDetails = {
        date: '2024-01-01',
        time: '10:00',
        clientName: 'Test User',
        email: 'test@example.com',
        service: mockService
      };

      await component.onBookingConfirmed(bookingDetails);
      
      // Should not throw error, should handle gracefully
      expect(component.showBookingPopup()).toBeFalse();
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

  describe('Fully Booked Day Detection', () => {
    it('should detect fully booked day', () => {
      // Mock a day with no available slots
      const date = new Date();
      component.onDateSelected(date);
      
      // This would require more complex mocking of the daySlots computation
      // For now, just test that the method exists
      expect(component.isSelectedDayFullyBooked).toBeDefined();
    });
  });
});

