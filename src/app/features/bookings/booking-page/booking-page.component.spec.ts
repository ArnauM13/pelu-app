import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BookingPageComponent } from './booking-page.component';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { ServicesService } from '../../../core/services/services.service';
import { ToastService } from '../../../shared/services/toast.service';

// Mock classes
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let roleService: jasmine.SpyObj<RoleService>;
  let servicesService: jasmine.SpyObj<ServicesService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['userDisplayName']);
    const roleServiceSpy = jasmine.createSpyObj('RoleService', ['userRole']);
    const servicesServiceSpy = jasmine.createSpyObj('ServicesService', ['getServicesWithTranslatedNamesAsync']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showLoginRequired', 'showAppointmentCreated', 'showNetworkError']);

    // Setup default return values
    authServiceSpy.user.and.returnValue({ uid: 'test-uid', email: 'test@example.com' });
    userServiceSpy.userDisplayName.and.returnValue('Test User');
    servicesServiceSpy.getServicesWithTranslatedNamesAsync.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        BookingPageComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: RoleService, useValue: roleServiceSpy },
        { provide: ServicesService, useValue: servicesServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    roleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    servicesService = TestBed.inject(ServicesService) as jasmine.SpyObj<ServicesService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
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
    });

    it('should have info items', () => {
      expect(component.infoItems).toBeDefined();
      expect(Array.isArray(component.infoItems)).toBeTrue();
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
  });

  describe('Component Behavior', () => {
    it('should initialize with default values', () => {
      expect(component.showBookingPopup()).toBeFalse();
      expect(component.bookingDetails()).toEqual({ date: '', time: '', clientName: '', email: '' });
      expect(component.availableServices()).toEqual([]);
    });
  });

  describe('Event Handling', () => {
    it('should handle time slot selection', () => {
      const event = { date: '2024-01-01', time: '10:00' };
      expect(() => component.onTimeSlotSelected(event)).not.toThrow();
    });

    it('should handle client name changes', () => {
      expect(() => component.onClientNameChanged('New Name')).not.toThrow();
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
      authService.user.and.returnValue(null);
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

  describe('Local Storage Integration', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('[]');
      spyOn(localStorage, 'setItem');
    });

    it('should handle appointment storage', () => {
      const bookingDetails = {
        date: '2024-01-01',
        time: '10:00',
        clientName: 'Test User',
        email: 'test@example.com'
      };

      component.onBookingConfirmed(bookingDetails);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(toastService.showAppointmentCreated).toHaveBeenCalled();
    });
  });
});
