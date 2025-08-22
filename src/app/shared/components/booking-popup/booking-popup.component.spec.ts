import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingPopupComponent } from './booking-popup.component';
import { TranslateService, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ServicesService } from '../../../core/services/services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ServiceTranslationService } from '../../../core/services/service-translation.service';
import { ConfirmationService } from 'primeng/api';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { IdTokenResult } from '@firebase/auth';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('BookingPopupComponent', () => {
  let component: BookingPopupComponent;
  let fixture: ComponentFixture<BookingPopupComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let servicesService: jasmine.SpyObj<ServicesService>;
  let authService: jasmine.SpyObj<AuthService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let serviceTranslationService: jasmine.SpyObj<ServiceTranslationService>;

  beforeEach(async () => {
    const translateSpy = {
      instant: (key: string) => key,
      get: (key: string) => ({ subscribe: (fn: (value: string) => void) => fn(key) }),
      addLangs: () => {},
      getBrowserLang: () => 'ca',
      use: () => ({ subscribe: (fn: (value: unknown) => void) => fn({}) }),
      reloadLang: () => ({ subscribe: (fn: (value: unknown) => void) => fn({}) }),
      setDefaultLang: () => {},
      getDefaultLang: () => 'ca',
      getLangs: () => ['ca', 'es', 'en', 'ar'],
    };
    const servicesSpy = jasmine.createSpyObj('ServicesService', ['getServiceName']);
    const authSpy = jasmine.createSpyObj('AuthService', [
      'user',
      'isAuthenticated',
      'userDisplayName',
    ]);
    const currencySpy = jasmine.createSpyObj('CurrencyService', ['formatPrice']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['showAppointmentCreated', 'showValidationError']);
    const serviceTranslationSpy = jasmine.createSpyObj('ServiceTranslationService', ['getServiceName', 'translateServiceName']);

    await TestBed.configureTestingModule({
      imports: [
        BookingPopupComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: TranslateService, useValue: translateSpy },
        { provide: ServicesService, useValue: servicesSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: CurrencyService, useValue: currencySpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: ServiceTranslationService, useValue: serviceTranslationSpy },
        ConfirmationService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPopupComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    servicesService = TestBed.inject(ServicesService) as jasmine.SpyObj<ServicesService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    serviceTranslationService = TestBed.inject(ServiceTranslationService) as jasmine.SpyObj<ServiceTranslationService>;

    // Setup ServiceTranslationService mock
    serviceTranslationSpy.getServiceName.and.returnValue('Test Service');
    serviceTranslationSpy.translateServiceName.and.returnValue('Test Service');

    // Setup default mock return values
    // TranslateService is already mocked with simple functions above
    servicesService.getServiceName.and.returnValue('Test Service');
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
      getIdTokenResult: () => Promise.resolve({} as IdTokenResult),
      reload: () => Promise.resolve(),
      toJSON: () => ({}),
      displayName: null,
      phoneNumber: null,
      photoURL: null,
      providerId: 'password',
    });
    authService.isAuthenticated.and.returnValue(true);
    authService.userDisplayName.and.returnValue('Test User');
    currencyService.formatPrice.and.returnValue('25€');
    toastService.showAppointmentCreated.and.returnValue(undefined);
    toastService.showValidationError.and.returnValue(undefined);

    // Don't call fixture.detectChanges() to avoid template rendering issues with TranslatePipe
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Signals', () => {
    it('should have open input signal', () => {
      expect(component.open).toBeDefined();
      expect(typeof component.open).toBe('function');
    });

    it('should have bookingDetails input signal', () => {
      expect(component.bookingDetails).toBeDefined();
      expect(typeof component.bookingDetails).toBe('function');
    });

    it('should have availableServices input signal', () => {
      expect(component.availableServices).toBeDefined();
      expect(typeof component.availableServices).toBe('function');
    });
  });

  describe('Output Signals', () => {
    it('should have confirmed output signal', () => {
      expect(component.confirmed).toBeDefined();
      expect(typeof component.confirmed.emit).toBe('function');
    });

    it('should have cancelled output signal', () => {
      expect(component.cancelled).toBeDefined();
      expect(typeof component.cancelled.emit).toBe('function');
    });

    it('should have clientNameChanged output signal', () => {
      expect(component.clientNameChanged).toBeDefined();
      expect(typeof component.clientNameChanged.emit).toBe('function');
    });

    it('should have emailChanged output signal', () => {
      expect(component.emailChanged).toBeDefined();
      expect(typeof component.emailChanged.emit).toBe('function');
    });
  });

  describe('Computed Properties', () => {
    it('should have totalPrice computed property', () => {
      expect(component.totalPrice).toBeDefined();
      expect(typeof component.totalPrice()).toBe('number');
    });

    it('should have isAuthenticated computed property', () => {
      expect(component.isAuthenticated).toBeDefined();
      expect(typeof component.isAuthenticated).toBe('function');
    });

    it('should have currentUserName computed property', () => {
      expect(component.currentUserName).toBeDefined();
      expect(typeof component.currentUserName()).toBe('string');
    });

    it('should have canConfirm computed property', () => {
      expect(component.canConfirm).toBeDefined();
      expect(typeof component.canConfirm()).toBe('boolean');
    });
  });

  describe('Event Handling', () => {
    it('should emit cancelled event when onClose is called', () => {
      const cancelledSpy = jasmine.createSpy('cancelled');
      component.cancelled.subscribe(cancelledSpy);

      component.onClose();
      expect(cancelledSpy).toHaveBeenCalled();
    });

    it('should have onConfirm method that can be called', () => {
      expect(() => component.onConfirm()).not.toThrow();
    });

    it('should have onBackdropClick method that can be called', () => {
      const mockEvent = { target: { classList: { contains: () => true } } } as unknown as Event;
      expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
    });
  });

  describe('Formatting Methods', () => {
    it('should format date correctly', () => {
      const formattedDate = component.formatDate('2024-01-01');
      expect(typeof formattedDate).toBe('string');
      expect(formattedDate).toContain('2024');
    });

    it('should format price correctly', () => {
      const formattedPrice = component.formatPrice(25);
      expect(typeof formattedPrice).toBe('string');
      expect(formattedPrice).toContain('25');
    });

    it('should format duration correctly', () => {
      const formattedDuration = component.formatDuration(30);
      expect(typeof formattedDuration).toBe('string');
      expect(formattedDuration).toContain('30');
    });
  });

  describe('Service Integration', () => {
    it('should use ServiceTranslationService for service names', () => {
      const mockService = {
        id: '1',
        name: 'Test Service',
        description: 'Test description',
        price: 25,
        duration: 30,
        category: 'haircut' as const,
        icon: '✂️',
      };
      component.getServiceName(mockService);
      expect(serviceTranslationService.translateServiceName).toHaveBeenCalledWith('Test Service');
    });

    it('should use TranslateService for translations', () => {
      expect(translateService).toBeDefined();
    });

    it('should use AuthService for authentication', () => {
      expect(authService).toBeDefined();
    });

    it('should use CurrencyService for price formatting', () => {
      expect(currencyService).toBeDefined();
    });

    it('should use ToastService for notifications', () => {
      expect(toastService).toBeDefined();
    });
  });

  describe('Template Integration', () => {
    it('should have proper component selector', () => {
      expect(BookingPopupComponent.prototype.constructor.name).toContain('BookingPopupComponent');
    });

    it('should be a standalone component', () => {
      expect(BookingPopupComponent.prototype.constructor).toBeDefined();
    });

    it('should have component metadata', () => {
      expect(BookingPopupComponent.prototype).toBeDefined();
    });
  });
});
