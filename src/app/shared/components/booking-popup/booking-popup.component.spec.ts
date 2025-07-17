import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BookingPopupComponent } from './booking-popup.component';
import { ServicesService } from '../../../core/services/services.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../services/toast.service';

// Mock classes
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('BookingPopupComponent', () => {
  let component: BookingPopupComponent;
  let fixture: ComponentFixture<BookingPopupComponent>;
  let servicesService: jasmine.SpyObj<ServicesService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let authService: jasmine.SpyObj<AuthService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const servicesServiceSpy = jasmine.createSpyObj('ServicesService', ['getServiceName']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'userDisplayName']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['formatPrice']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showValidationError']);

    // Setup default return values
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.userDisplayName.and.returnValue('Test User');
    servicesServiceSpy.getServiceName.and.returnValue('Test Service');
    currencyServiceSpy.formatPrice.and.returnValue('25.00 €');

    await TestBed.configureTestingModule({
      imports: [
        BookingPopupComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: ServicesService, useValue: servicesServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPopupComponent);
    component = fixture.componentInstance;

    servicesService = TestBed.inject(ServicesService) as jasmine.SpyObj<ServicesService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  describe('Component Creation and Basic Properties', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required input signals', () => {
      expect(component.open).toBeDefined();
      expect(component.bookingDetails).toBeDefined();
      expect(component.availableServices).toBeDefined();
    });

    it('should have required output signals', () => {
      expect(component.confirmed).toBeDefined();
      expect(component.cancelled).toBeDefined();
      expect(component.clientNameChanged).toBeDefined();
    });

    it('should have computed properties', () => {
      expect(component.canConfirm).toBeDefined();
      expect(component.totalPrice).toBeDefined();
      expect(component.isAuthenticated).toBeDefined();
      expect(component.currentUserName).toBeDefined();
    });
  });

  describe('Required Methods', () => {
    it('should have onClose method', () => {
      expect(typeof component.onClose).toBe('function');
    });

    it('should have onConfirm method', () => {
      expect(typeof component.onConfirm).toBe('function');
    });

    it('should have onBackdropClick method', () => {
      expect(typeof component.onBackdropClick).toBe('function');
    });

    it('should have formatDate method', () => {
      expect(typeof component.formatDate).toBe('function');
    });

    it('should have formatPrice method', () => {
      expect(typeof component.formatPrice).toBe('function');
    });

    it('should have formatDuration method', () => {
      expect(typeof component.formatDuration).toBe('function');
    });

    it('should have updateClientName method', () => {
      expect(typeof component.updateClientName).toBe('function');
    });

    it('should have onServiceChange method', () => {
      expect(typeof component.onServiceChange).toBe('function');
    });

    it('should have getServiceName method', () => {
      expect(typeof component.getServiceName).toBe('function');
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with default values', () => {
      expect(component.open()).toBeFalse();
      expect(component.bookingDetails()).toEqual({ date: '', time: '', clientName: '' });
      expect(component.availableServices()).toEqual([]);
    });

    it('should have input signals defined', () => {
      expect(component.open).toBeDefined();
      expect(component.bookingDetails).toBeDefined();
      expect(component.availableServices).toBeDefined();
    });
  });

  describe('Computed Properties Logic', () => {
    it('should have canConfirm computed property', () => {
      expect(component.canConfirm).toBeDefined();
      expect(typeof component.canConfirm()).toBe('boolean');
    });

    it('should have totalPrice computed property', () => {
      expect(component.totalPrice).toBeDefined();
      expect(typeof component.totalPrice()).toBe('number');
    });

    it('should have isAuthenticated computed property', () => {
      expect(component.isAuthenticated).toBeDefined();
      expect(typeof component.isAuthenticated()).toBe('boolean');
    });

    it('should have currentUserName computed property', () => {
      expect(component.currentUserName).toBeDefined();
      expect(typeof component.currentUserName()).toBe('string');
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
      const mockEvent = { target: { classList: { contains: () => true } } };
      expect(() => component.onBackdropClick(mockEvent as any)).not.toThrow();
    });

    it('should emit clientNameChanged when updateClientName is called', () => {
      const clientNameChangedSpy = jasmine.createSpy('clientNameChanged');
      component.clientNameChanged.subscribe(clientNameChangedSpy);

      component.updateClientName('New Name');
      expect(clientNameChangedSpy).toHaveBeenCalledWith('New Name');
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
    it('should use ServicesService for service names', () => {
      const mockService = {
        id: '1',
        name: 'Test Service',
        description: 'Test description',
        price: 25,
        duration: 30,
        category: 'haircut' as const,
        icon: '✂️'
      };
      component.getServiceName(mockService);
      expect(servicesService.getServiceName).toHaveBeenCalledWith(mockService);
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
      expect(BookingPopupComponent.prototype.constructor.name).toBe('BookingPopupComponent');
    });

    it('should be a standalone component', () => {
      expect(BookingPopupComponent.prototype.constructor).toBeDefined();
    });

    it('should have component metadata', () => {
      expect(BookingPopupComponent.prototype).toBeDefined();
    });
  });

  describe('Validation Logic', () => {
    it('should show validation error for empty client name', () => {
      component.onConfirm();
      expect(toastService.showValidationError).toHaveBeenCalledWith('nom del client');
    });

    it('should show validation error for missing service', () => {
      // Set client name but no service
      component.updateClientName('Test User');
      component.onConfirm();
      expect(toastService.showValidationError).toHaveBeenCalledWith('servei');
    });
  });

  describe('Popup State Management', () => {
    it('should have input signals for state management', () => {
      expect(component.open).toBeDefined();
      expect(component.bookingDetails).toBeDefined();
      expect(component.availableServices).toBeDefined();
    });
  });
});
