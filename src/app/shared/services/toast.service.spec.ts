import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { ToastService } from './toast.service';
import { AuthService } from '../../core/auth/auth.service';
import { LoggerService } from './logger.service';

describe('ToastService', () => {
  let service: ToastService;
  let messageService: jasmine.SpyObj<MessageService>;
  let _router: jasmine.SpyObj<Router>;
  let _authService: jasmine.SpyObj<AuthService>;
  let _translateService: jasmine.SpyObj<TranslateService>;
  let _loggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'instant',
      'get',
      'use',
      'setDefaultLang',
      'addLangs',
      'getLangs',
    ]);
    const loggerServiceSpy = jasmine.createSpyObj('LoggerService', [
      'log',
      'error',
      'warn',
      'info',
      'debug',
      'firebaseError',
    ]);

    // Setup default spy returns
    translateServiceSpy.instant.and.returnValue('Translated text');

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: TranslateStore, useValue: {} },
        { provide: LoggerService, useValue: loggerServiceSpy },
      ],
    });

    service = TestBed.inject(ToastService);
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    _router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    _authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    _translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    _loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showToast', () => {
    it('should call messageService.add with correct parameters', () => {
      const config = {
        severity: 'success' as const,
        summary: 'Test summary',
        detail: 'Test detail',
        data: {
          appointmentId: 'test-id',
          showViewButton: true,
          action: () => {}
        }
      };

      service.showToast(config);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: config.severity,
        summary: config.summary,
        detail: config.detail,
        life: 4000,
        sticky: false,
        closable: true,
        key: 'pelu-toast',
        data: config.data,
      });
    });

    it('should call messageService.add with default parameters', () => {
      const config = {
        severity: 'error' as const,
        summary: 'Test summary'
      };

      service.showToast(config);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: config.severity,
        summary: config.summary,
        detail: '',
        life: 4000,
        sticky: false,
        closable: true,
        key: 'pelu-toast',
        data: {},
      });
    });
  });

  describe('showSuccess', () => {
    it('should call showToast with success severity', () => {
      spyOn(service, 'showToast');
      const summary = 'Success message';
      const detail = 'Success detail';
      const data = {
        appointmentId: 'test-id',
        showViewButton: true
      };

      service.showSuccess(summary, detail, data);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary,
        detail,
        data
      });
    });
  });

  describe('showError', () => {
    it('should call showToast with error severity', () => {
      spyOn(service, 'showToast');
      const summary = 'Error message';
      const detail = 'Error detail';

      service.showError(summary, detail);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary,
        detail,
        data: undefined
      });
    });
  });

  describe('showInfo', () => {
    it('should call showToast with info severity', () => {
      spyOn(service, 'showToast');
      const summary = 'Info message';
      const detail = 'Info detail';

      service.showInfo(summary, detail);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'info',
        summary,
        detail,
        data: undefined
      });
    });
  });

  describe('showWarning', () => {
    it('should call showToast with warn severity', () => {
      spyOn(service, 'showToast');
      const summary = 'Warning message';
      const detail = 'Warning detail';

      service.showWarning(summary, detail);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'warn',
        summary,
        detail,
        data: undefined
      });
    });
  });

  describe('showReservationCreated', () => {
    it('should call showToast with correct parameters', () => {
      spyOn(service, 'showToast');
      const appointmentId = 'test-id';

      service.showReservationCreated(appointmentId);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Cita creada',
        detail: 'La teva cita s\'ha creat correctament',
        data: {
          appointmentId,
          showViewButton: true,
          actionLabel: 'Veure cita',
        },
      });
    });
  });

  describe('showAppointmentDeleted', () => {
    it('should call showToast with correct parameters', () => {
      spyOn(service, 'showToast');
      const appointmentName = 'John Doe';

      service.showAppointmentDeleted(appointmentName);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Cita eliminada',
        detail: `La cita de ${appointmentName} s'ha eliminat correctament`,
      });
    });
  });

  describe('showAppointmentUpdated', () => {
    it('should call showToast with correct parameters', () => {
      spyOn(service, 'showToast');
      const appointmentName = 'John Doe';

      service.showAppointmentUpdated(appointmentName);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Cita actualitzada',
        detail: `La cita de ${appointmentName} s'ha actualitzat correctament`,
      });
    });
  });

  describe('showAppointmentCreated', () => {
    it('should call showToast with correct parameters', () => {
      spyOn(service, 'showToast');
      const appointmentName = 'John Doe';
      const appointmentId = 'test-id';

      service.showAppointmentCreated(appointmentName, appointmentId);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Cita creada',
        detail: `La cita de ${appointmentName} s'ha creat correctament`,
        data: {
          appointmentId,
          showViewButton: true,
          actionLabel: 'Veure cita',
        },
      });
    });
  });

  describe('showValidationError', () => {
    it('should call showToast with correct parameters', () => {
      spyOn(service, 'showToast');
      const message = 'Error de validació';

      service.showValidationError(message);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error de validació',
        detail: message,
      });
    });
  });

  describe('showNetworkError', () => {
    it('should call showToast with network error message', () => {
      spyOn(service, 'showToast');

      service.showNetworkError();

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error de connexió',
        detail: 'No s\'ha pogut connectar amb el servidor. Si us plau, torna-ho a provar.',
      });
    });
  });

  describe('showUnauthorizedError', () => {
    it('should call showToast with unauthorized error message', () => {
      spyOn(service, 'showToast');

      service.showUnauthorizedError();

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Accés denegat',
        detail: 'No tens permisos per realitzar aquesta acció.',
      });
    });
  });

  describe('showLoginRequired', () => {
    it('should call showToast with login required message', () => {
      spyOn(service, 'showToast');

      service.showLoginRequired();

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Inici de sessió requerit',
        detail: 'Has d\'iniciar sessió per realitzar aquesta acció.',
      });
    });
  });

  describe('showGenericSuccess', () => {
    it('should call showToast with generic success message', () => {
      spyOn(service, 'showToast');
      const message = 'Operació completada';

      service.showGenericSuccess(message);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Èxit',
        detail: message,
      });
    });
  });

  describe('showGenericError', () => {
    it('should call showToast with generic error message', () => {
      spyOn(service, 'showToast');
      const message = 'Ha ocorregut un error';

      service.showGenericError(message);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: message,
      });
    });
  });

  describe('showGenericInfo', () => {
    it('should call showToast with generic info message', () => {
      spyOn(service, 'showToast');
      const message = 'Informació important';

      service.showGenericInfo(message);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Informació',
        detail: message,
      });
    });
  });

  describe('showGenericWarning', () => {
    it('should call showToast with generic warning message', () => {
      spyOn(service, 'showToast');
      const message = 'Advertència important';

      service.showGenericWarning(message);

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Advertència',
        detail: message,
      });
    });
  });

  describe('clearToast', () => {
    it('should call messageService.clear with correct key', () => {
      service.clearToast();

      expect(messageService.clear).toHaveBeenCalledWith('pelu-toast');
    });
  });

  describe('clearAllToasts', () => {
    it('should call messageService.clear without parameters', () => {
      service.clearAllToasts();

      expect(messageService.clear).toHaveBeenCalledWith();
    });
  });

  describe('showToastWithAction', () => {
    it('should call showToast with action parameter', () => {
      spyOn(service, 'showToast');
      const config = {
        severity: 'success' as const,
        summary: 'Test summary',
        detail: 'Test detail'
      };
      const action = () => {};
      const actionLabel = 'Custom Action';

      service.showToastWithAction(config, action, actionLabel);

      expect(service.showToast).toHaveBeenCalledWith({
        ...config,
        data: { action, actionLabel }
      });
    });
  });
});
