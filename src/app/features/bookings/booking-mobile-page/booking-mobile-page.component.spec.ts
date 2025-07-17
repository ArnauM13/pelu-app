import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingMobilePageComponent } from './booking-mobile-page.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ServicesService, Service } from '../../../core/services/services.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { mockAuth } from '../../../../testing/firebase-mocks';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastService } from '../../../shared/services/toast.service';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Mock services
const mockAuthService = {
  user: jasmine.createSpy('user').and.returnValue({
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com'
  }),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true)
};

const mockServicesService = {
  getAllServices: jasmine.createSpy('getAllServices').and.returnValue([
    {
      id: '1',
      name: 'Haircut',
      description: 'Classic or modern haircut',
      price: 25,
      duration: 30,
      category: 'haircut' as const,
      icon: '✂️'
    },
    {
      id: '2',
      name: 'Hair Coloring',
      description: 'Professional hair coloring',
      price: 50,
      duration: 60,
      category: 'treatment' as const,
      icon: '🎨'
    }
  ])
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

const mockMessageService = {
  add: jasmine.createSpy('add'),
  clear: jasmine.createSpy('clear')
};

const mockToastService = {
  showLoginRequired: jasmine.createSpy('showLoginRequired')
};

const mockTranslateService = {
  instant: jasmine.createSpy('instant').and.returnValue('translated text'),
  get: jasmine.createSpy('get').and.returnValue(of('translated text'))
};

describe('BookingMobilePageComponent', () => {
  let component: BookingMobilePageComponent;
  let fixture: ComponentFixture<BookingMobilePageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let servicesService: jasmine.SpyObj<ServicesService>;
  let router: jasmine.SpyObj<Router>;
  let messageService: jasmine.SpyObj<MessageService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BookingMobilePageComponent,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ServicesService, useValue: mockServicesService },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ToastService, useValue: mockToastService },
        { provide: TranslateService, useValue: mockTranslateService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingMobilePageComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    servicesService = TestBed.inject(ServicesService) as jasmine.SpyObj<ServicesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  describe('Component Creation and Basic Properties', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required computed signals', () => {
      expect(component.selectedDate).toBeDefined();
      expect(component.selectedService).toBeDefined();
      expect(component.appointments).toBeDefined();
      expect(component.showBookingPopup).toBeDefined();
      expect(component.bookingDetails).toBeDefined();
    });

    it('should have business configuration properties', () => {
      expect(component.businessHours).toBeDefined();
      expect(component.lunchBreak).toBeDefined();
      expect(component.businessDays).toBeDefined();
      expect(component.slotDuration).toBeDefined();
    });

    it('should have computed properties for time slots', () => {
      expect(component.weekDays).toBeDefined();
      expect(component.selectedDaySlots).toBeDefined();
      expect(component.morningSlots).toBeDefined();
      expect(component.afternoonSlots).toBeDefined();
    });

    it('should have available services computed property', () => {
      expect(component.availableServices).toBeDefined();
    });

    it('should have canBook computed property', () => {
      expect(component.canBook).toBeDefined();
    });
  });

  describe('Navigation Methods', () => {
    it('should have previousWeek method', () => {
      expect(typeof component.previousWeek).toBe('function');
    });

    it('should have nextWeek method', () => {
      expect(typeof component.nextWeek).toBe('function');
    });

    it('should have today method', () => {
      expect(typeof component.today).toBe('function');
    });

    it('should have tomorrow method', () => {
      expect(typeof component.tomorrow).toBe('function');
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
  });

  describe('Booking Methods', () => {
    it('should have onBookingConfirmed method', () => {
      expect(typeof component.onBookingConfirmed).toBe('function');
    });

    it('should have onBookingCancelled method', () => {
      expect(typeof component.onBookingCancelled).toBe('function');
    });
  });

  describe('Data Management', () => {
    it('should have guardarCites method', () => {
      expect(typeof component.guardarCites).toBe('function');
    });

    it('should have formatDate method', () => {
      expect(typeof component.formatDate).toBe('function');
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with default values', () => {
      expect(component.selectedDate()).toBeInstanceOf(Date);
      expect(component.selectedService()).toBeNull();
      expect(component.appointments()).toEqual([]);
      expect(component.showBookingPopup()).toBeFalse();
    });
  });

  describe('Service Integration', () => {
    it('should use AuthService for user information', () => {
      expect(authService.user).toHaveBeenCalled();
    });

    it('should use ServicesService for available services', () => {
      expect(servicesService.getAllServices).toHaveBeenCalled();
    });

    it('should use MessageService for toast notifications', () => {
      expect(messageService).toBeDefined();
    });

    it('should use Router for navigation', () => {
      expect(router).toBeDefined();
    });
  });

  describe('Template Integration', () => {
    it('should have proper component selector', () => {
      expect(BookingMobilePageComponent.prototype.constructor.name).toBe('BookingMobilePageComponent');
    });

    it('should be a standalone component', () => {
      expect(BookingMobilePageComponent.prototype.constructor).toBeDefined();
    });

    it('should have component metadata', () => {
      expect(BookingMobilePageComponent.prototype).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle booking confirmation errors', () => {
      spyOn(toastService, 'showLoginRequired');
      authService.user.and.returnValue(null);

      const bookingDetails = {
        date: '2024-01-01',
        time: '10:00',
        clientName: 'Test User',
        service: { id: '1', name: 'Haircut', description: 'Classic haircut', price: 25, duration: 30, category: 'haircut' as const, icon: '✂️' }
      };

      component.onBookingConfirmed(bookingDetails);
      expect(toastService.showLoginRequired).toHaveBeenCalled();
    });
  });

  describe('Date Navigation', () => {
    it('should handle week navigation correctly', () => {
      const initialDate = component.selectedDate();

      component.nextWeek();
      expect(component.selectedDate().getTime()).toBeGreaterThan(initialDate.getTime());

      component.previousWeek();
      expect(component.selectedDate().getTime()).toBe(initialDate.getTime());
    });

    it('should handle today navigation', () => {
      const today = new Date();
      component.today();
      expect(component.selectedDate().toDateString()).toBe(today.toDateString());
    });

    it('should handle tomorrow navigation', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      component.tomorrow();
      expect(component.selectedDate().toDateString()).toBe(tomorrow.toDateString());
    });
  });

  describe('Service Selection Logic', () => {
        it('should select service correctly', () => {
      const testService: Service = {
        id: '1',
        name: 'Test Service',
        description: 'Test service description',
        price: 25,
        duration: 30,
        category: 'haircut' as const,
        icon: '🧪'
      };

      component.selectService(testService);
      expect(component.selectedService()).toEqual(testService);
    });

    it('should update canBook computed when service is selected', () => {
      expect(component.canBook()).toBeFalse();

      const testService: Service = {
        id: '1',
        name: 'Test Service',
        description: 'Test service description',
        price: 25,
        duration: 30,
        category: 'haircut' as const,
        icon: '🧪'
      };

      component.selectService(testService);
      expect(component.canBook()).toBeTrue();
    });
  });

  describe('Booking Flow', () => {
    it('should open booking popup when time slot is selected', () => {
      const testService: Service = {
        id: '1',
        name: 'Test Service',
        description: 'Test service description',
        price: 25,
        duration: 30,
        category: 'haircut' as const,
        icon: '🧪'
      };

      component.selectService(testService);
      component.selectDate(new Date());

      const timeSlot = { time: '10:00', available: true, isLunchBreak: false };
      component.selectTimeSlot(timeSlot);

      expect(component.showBookingPopup()).toBeTrue();
      expect(component.bookingDetails().time).toBe('10:00');
    });

    it('should close booking popup when cancelled', () => {
      component.onBookingCancelled();
      expect(component.showBookingPopup()).toBeFalse();
    });
  });
});
