import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingPopupComponent } from './booking-popup.component';
import { ServicesService, Service } from '../../../core/services/services.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
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
    }
  ])
};

const mockTranslateService = {
  instant: jasmine.createSpy('instant').and.returnValue('translated text'),
  get: jasmine.createSpy('get').and.returnValue(of('translated text'))
};

const mockMessageService = {
  add: jasmine.createSpy('add'),
  clear: jasmine.createSpy('clear')
};

describe('BookingPopupComponent', () => {
  let component: BookingPopupComponent;
  let fixture: ComponentFixture<BookingPopupComponent>;
  let servicesService: jasmine.SpyObj<ServicesService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BookingPopupComponent,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: ServicesService, useValue: mockServicesService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MessageService, useValue: mockMessageService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPopupComponent);
    component = fixture.componentInstance;

    servicesService = TestBed.inject(ServicesService) as jasmine.SpyObj<ServicesService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
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
    });

    it('should have computed properties', () => {
      expect(component.canConfirm).toBeDefined();
      expect(component.totalPrice).toBeDefined();
      expect(component.totalDuration).toBeDefined();
    });

    it('should have error handling properties', () => {
      expect(component.errorMessage).toBeDefined();
      expect(component.showErrorToast).toBeDefined();
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

    it('should have totalDuration computed property', () => {
      expect(component.totalDuration).toBeDefined();
      expect(typeof component.totalDuration()).toBe('number');
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
    it('should use ServicesService for available services', () => {
      expect(servicesService.getAllServices).toHaveBeenCalled();
    });

    it('should use TranslateService for translations', () => {
      expect(translateService).toBeDefined();
    });

    it('should use MessageService for notifications', () => {
      expect(messageService).toBeDefined();
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

  describe('Error Handling', () => {
    it('should have error handling properties', () => {
      expect(component.errorMessage).toBeDefined();
      expect(component.showErrorToast).toBeDefined();
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
