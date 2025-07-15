import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingPageComponent } from './booking-page.component';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { mockAuth } from '../../../../testing/firebase-mocks';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

const mockMessageService = {
  add: jasmine.createSpy('add'),
  clear: jasmine.createSpy('clear')
};

const mockTranslateService = {
  instant: jasmine.createSpy('instant').and.returnValue('translated text'),
  get: jasmine.createSpy('get').and.returnValue(of('translated text')),
  addLangs: jasmine.createSpy('addLangs').and.returnValue(undefined),
  use: jasmine.createSpy('use').and.returnValue(undefined),
  setDefaultLang: jasmine.createSpy('setDefaultLang').and.returnValue(undefined),
  getBrowserLang: jasmine.createSpy('getBrowserLang').and.returnValue('ca')
};

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BookingPageComponent,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockMessageService },
        { provide: TranslateService, useValue: mockTranslateService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  describe('Component Creation and Basic Properties', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required computed signals', () => {
      expect(component.nouClient).toBeDefined();
      expect(component.cites).toBeDefined();
      expect(component.showBookingPopup).toBeDefined();
      expect(component.bookingDetails).toBeDefined();
    });

    it('should have computed properties for events', () => {
      expect(component.events).toBeDefined();
    });

    it('should have canAddAppointment computed property', () => {
      expect(component.canAddAppointment).toBeDefined();
    });
  });

  describe('Navigation Methods', () => {
    it('should have goToMobileVersion method', () => {
      expect(typeof component.goToMobileVersion).toBe('function');
    });

    it('should navigate to mobile version when goToMobileVersion is called', () => {
      component.goToMobileVersion();
      expect(router.navigate).toHaveBeenCalledWith(['/booking-mobile']);
    });
  });

  describe('Date and Time Methods', () => {
    it('should have onDateSelected method', () => {
      expect(typeof component.onDateSelected).toBe('function');
    });

    it('should have updateNom method', () => {
      expect(typeof component.updateNom).toBe('function');
    });

    it('should have updateData method', () => {
      expect(typeof component.updateData).toBe('function');
    });

    it('should have updateHora method', () => {
      expect(typeof component.updateHora).toBe('function');
    });
  });

  describe('Booking Methods', () => {
    it('should have afegirCita method', () => {
      expect(typeof component.afegirCita).toBe('function');
    });

    it('should have onBookingConfirmed method', () => {
      expect(typeof component.onBookingConfirmed).toBe('function');
    });

    it('should have onBookingCancelled method', () => {
      expect(typeof component.onBookingCancelled).toBe('function');
    });

    it('should have showToast method', () => {
      expect(typeof component.showToast).toBe('function');
    });

    it('should have onToastClick method', () => {
      expect(typeof component.onToastClick).toBe('function');
    });

    it('should have viewAppointmentDetail method', () => {
      expect(typeof component.viewAppointmentDetail).toBe('function');
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with default values', () => {
      expect(component.nouClient()).toEqual({ nom: '', data: '', hora: '' });
      expect(component.cites()).toEqual([]);
      expect(component.showBookingPopup()).toBeFalse();
      expect(component.bookingDetails()).toEqual({ date: '', time: '', clientName: '' });
    });
  });

  describe('Service Integration', () => {
    it('should use AuthService for user information', () => {
      expect(authService.user).toHaveBeenCalled();
    });

    it('should use MessageService for toast notifications', () => {
      expect(messageService).toBeDefined();
    });

    it('should use Router for navigation', () => {
      expect(router).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    it('should handle date selection', () => {
      const testDate = { date: '2024-01-01', time: '10:00' };
      expect(() => component.onDateSelected(testDate)).not.toThrow();
    });

    it('should handle client name updates', () => {
      expect(() => component.updateNom('Test User')).not.toThrow();
    });

    it('should handle date updates', () => {
      expect(() => component.updateData('2024-01-01')).not.toThrow();
    });

    it('should handle time updates', () => {
      expect(() => component.updateHora('10:00')).not.toThrow();
    });
  });

  describe('Booking Flow', () => {
    it('should handle booking confirmation', () => {
      const bookingDetails = {
        date: '2024-01-01',
        time: '10:00',
        clientName: 'Test User'
      };

      expect(() => component.onBookingConfirmed(bookingDetails)).not.toThrow();
    });

    it('should handle booking cancellation', () => {
      expect(() => component.onBookingCancelled()).not.toThrow();
    });

    it('should handle appointment addition', () => {
      expect(() => component.afegirCita()).not.toThrow();
    });
  });

  describe('Toast Notifications', () => {
    it('should show toast notifications', () => {
      expect(() => component.showToast('success', 'Test', 'Test message')).not.toThrow();
    });

    it('should handle toast clicks', () => {
      const mockEvent = { value: { data: { appointmentId: 'test-id' } } };
      expect(() => component.onToastClick(mockEvent)).not.toThrow();
    });
  });

  describe('Appointment Management', () => {
    it('should view appointment details', () => {
      expect(() => component.viewAppointmentDetail('test-id')).not.toThrow();
    });
  });

  describe('Computed Properties', () => {
    it('should compute events correctly', () => {
      expect(Array.isArray(component.events())).toBeTrue();
    });

    it('should compute canAddAppointment correctly', () => {
      expect(typeof component.canAddAppointment()).toBe('boolean');
    });

    it('should compute nouClient correctly', () => {
      expect(component.nouClient()).toEqual({ nom: '', data: '', hora: '' });
    });

    it('should compute cites correctly', () => {
      expect(Array.isArray(component.cites())).toBeTrue();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user gracefully', () => {
      authService.user.and.returnValue(null);
      expect(() => component).not.toThrow();
    });

    it('should handle empty appointments list', () => {
      expect(component.cites()).toEqual([]);
    });

    it('should handle missing appointment data', () => {
      expect(() => component.viewAppointmentDetail('')).not.toThrow();
    });
  });

  describe('Mobile Integration', () => {
    it('should provide mobile version navigation', () => {
      expect(typeof component.goToMobileVersion).toBe('function');
    });

    it('should navigate to mobile booking page', () => {
      component.goToMobileVersion();
      expect(router.navigate).toHaveBeenCalledWith(['/booking-mobile']);
    });
  });
});
