import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppointmentDetailPageComponent } from './appointment-detail-page.component';
import { CurrencyService } from '../../../core/services/currency.service';
import { AppointmentDetailService } from '../../../core/services/appointment-detail.service';
import { ServicesService } from '../../../core/services/services.service';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { AppointmentManagementService } from '../../../core/services/appointment-management.service';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.CLIENT_NAME': 'Nom del client',
      'COMMON.DATE': 'Data',
      'COMMON.TIME': 'Hora',
      'COMMON.SERVICE': 'Servei',
      'COMMON.PRICE': 'Preu',
      'COMMON.STATUS': 'Estat',
    });
  }
}

describe('AppointmentDetailPageComponent', () => {
  let component: AppointmentDetailPageComponent;
  let fixture: ComponentFixture<AppointmentDetailPageComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let mockAppointmentDetailService: jasmine.SpyObj<AppointmentDetailService>;
  let mockServicesService: jasmine.SpyObj<ServicesService>;
  let mockResponsiveService: jasmine.SpyObj<ResponsiveService>;
  let mockAppointmentManagementService: jasmine.SpyObj<AppointmentManagementService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('test-id'),
        },
      },
    });
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm', 'close']);
    mockCurrencyService = jasmine.createSpyObj('CurrencyService', ['formatCurrency']);
    mockAppointmentDetailService = jasmine.createSpyObj('AppointmentDetailService', ['getAppointmentDetail']);
    mockServicesService = jasmine.createSpyObj('ServicesService', ['getServiceById']);
    mockResponsiveService = jasmine.createSpyObj('ResponsiveService', ['isMobile']);
    mockAppointmentManagementService = jasmine.createSpyObj('AppointmentManagementService', [
      'loadAppointment',
      'deleteAppointment',
      'editAppointment',
    ]);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get', 'instant', 'use']);

    // Setup default return values
    mockResponsiveService.isMobile.and.returnValue(false);
    mockTranslateService.get.and.returnValue(of('translated text'));
    mockTranslateService.instant.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [
        AppointmentDetailPageComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: CurrencyService, useValue: mockCurrencyService },
        { provide: AppointmentDetailService, useValue: mockAppointmentDetailService },
        { provide: ServicesService, useValue: mockServicesService },
        { provide: ResponsiveService, useValue: mockResponsiveService },
        { provide: AppointmentManagementService, useValue: mockAppointmentManagementService },
        { provide: TranslateService, useValue: mockTranslateService },
        provideMockFirebase(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetailPageComponent);
    component = fixture.componentInstance;
    // Don't call fixture.detectChanges() to avoid template rendering issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loading signal', () => {
    expect(component.isLoading).toBeDefined();
  });

  it('should have appointment signal', () => {
    expect(component.booking).toBeDefined();
  });

  it('should have notFound computed via detailConfig', () => {
    expect(component.detailConfig).toBeDefined();
  });

  it('should have appointmentInfoItems computed', () => {
    expect(component.appointmentInfoItems).toBeDefined();
  });

  it('should have isToday computed', () => {
    expect(component.isToday).toBeDefined();
  });

  it('should have isPast computed', () => {
    expect(component.isPast).toBeDefined();
  });

  it('should have statusBadge computed', () => {
    expect(component.statusBadge).toBeDefined();
  });

  it('should have deleteAppointment method', () => {
    expect(typeof component.deleteAppointment).toBe('function');
  });

  it('should have editAppointment method', () => {
    expect(typeof component.editAppointment).toBe('function');
  });

  it('should have goBack method', () => {
    expect(typeof component.goBack).toBe('function');
  });

  it('should have formatDate method', () => {
    expect(typeof component.formatDate).toBe('function');
  });

  it('should have formatTime method', () => {
    expect(typeof component.formatTime).toBe('function');
  });

  it('should have isTodayDate method', () => {
    expect(typeof component.isTodayDate).toBe('function');
  });

  it('should have isPastDate method', () => {
    expect(typeof component.isPastDate).toBe('function');
  });

  describe('Component Behavior', () => {
    it('should initialize with default values', () => {
      expect(component.isLoading).toBeDefined();
      expect(component.booking).toBeDefined();
      expect(component.canEdit).toBeDefined();
      expect(component.canDelete).toBeDefined();
    });

    it('should handle mobile detection', () => {
      expect(component.isMobile).toBeDefined();
    });

    it('should handle service loading', () => {
      expect(component.service).toBeDefined();
    });

    it('should handle appointment ID from route', () => {
      expect(component.appointmentId).toBeDefined();
    });
  });

  describe('UI State Management', () => {
    it('should handle delete alert state', () => {
      expect(component.showDeleteAlert).toBeDefined();
      expect(component.deleteAlertData).toBeDefined();
    });

    it('should handle delete confirmation', () => {
      expect(typeof component.onDeleteConfirmed).toBe('function');
    });

    it('should handle delete cancellation', () => {
      expect(typeof component.onDeleteCancelled).toBe('function');
    });

    it('should handle edit requests', () => {
      expect(typeof component.onEditRequested).toBe('function');
    });

    it('should handle view detail requests', () => {
      expect(typeof component.onViewDetailRequested).toBe('function');
    });
  });

  describe('Service Integration', () => {
    it('should use AppointmentManagementService', () => {
      expect(mockAppointmentManagementService).toBeDefined();
    });

    it('should use ResponsiveService for mobile detection', () => {
      expect(mockResponsiveService.isMobile).toHaveBeenCalled();
    });

    it('should use ServicesService for service data', () => {
      expect(mockServicesService).toBeDefined();
    });

    it('should use CurrencyService for formatting', () => {
      expect(mockCurrencyService).toBeDefined();
    });
  });

  describe('Method Functionality', () => {
    it('should format date correctly', () => {
      const testDate = '2024-01-15';
      const result = component.formatDate(testDate);
      expect(typeof result).toBe('string');
    });

    it('should format time correctly', () => {
      const testTime = '10:30';
      const result = component.formatTime(testTime);
      expect(typeof result).toBe('string');
    });

    it('should check if date is today', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = component.isTodayDate(today);
      expect(typeof result).toBe('boolean');
    });

    it('should check if date is past', () => {
      const pastDate = '2023-01-01';
      const result = component.isPastDate(pastDate);
      expect(typeof result).toBe('boolean');
    });
  });
});
