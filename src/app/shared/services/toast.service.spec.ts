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
    it('should call showToast with translated success message', () => {
      spyOn(service, 'showToast');
      const summaryKey = 'COMMON.SUCCESS';
      const detailKey = 'COMMON.OPERATION_COMPLETED';
      const data = {
        appointmentId: 'test-id',
        showViewButton: true
      };

      service.showSuccess(summaryKey, detailKey, data);

      expect(_translateService.instant).toHaveBeenCalledWith(summaryKey);
      expect(_translateService.instant).toHaveBeenCalledWith(detailKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Translated text',
        detail: 'Translated text',
        data
      });
    });
  });

  describe('showError', () => {
    it('should call showToast with translated error message', () => {
      spyOn(service, 'showToast');
      const summaryKey = 'COMMON.ERROR';
      const detailKey = 'COMMON.ERROR_DETAIL';

      service.showError(summaryKey, detailKey);

      expect(_translateService.instant).toHaveBeenCalledWith(summaryKey);
      expect(_translateService.instant).toHaveBeenCalledWith(detailKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Translated text',
        detail: 'Translated text',
        data: undefined
      });
    });
  });

  describe('showInfo', () => {
    it('should call showToast with translated info message', () => {
      spyOn(service, 'showToast');
      const summaryKey = 'COMMON.INFO';
      const detailKey = 'COMMON.INFO_DETAIL';

      service.showInfo(summaryKey, detailKey);

      expect(_translateService.instant).toHaveBeenCalledWith(summaryKey);
      expect(_translateService.instant).toHaveBeenCalledWith(detailKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Translated text',
        detail: 'Translated text',
        data: undefined
      });
    });
  });

  describe('showWarning', () => {
    it('should call showToast with translated warning message', () => {
      spyOn(service, 'showToast');
      const summaryKey = 'COMMON.WARNING';
      const detailKey = 'COMMON.WARNING_DETAIL';

      service.showWarning(summaryKey, detailKey);

      expect(_translateService.instant).toHaveBeenCalledWith(summaryKey);
      expect(_translateService.instant).toHaveBeenCalledWith(detailKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Translated text',
        detail: 'Translated text',
        data: undefined
      });
    });
  });

  describe('showReservationCreated', () => {
    it('should call showToast with translated parameters', () => {
      spyOn(service, 'showToast');
      const appointmentId = 'test-id';

      service.showReservationCreated(appointmentId);

      expect(_translateService.instant).toHaveBeenCalledWith('APPOINTMENTS.CREATED_SUCCESS');
      expect(_translateService.instant).toHaveBeenCalledWith('APPOINTMENTS.CREATED_DETAIL');
      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.ACTIONS.VIEW_DETAILS');
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Translated text',
        detail: 'Translated text',
        data: {
          appointmentId,
          showViewButton: true,
          actionLabel: 'Translated text',
        },
      });
    });
  });

  describe('showAppointmentDeleted', () => {
    it('should call showToast with translated parameters', () => {
      spyOn(service, 'showToast');
      const appointmentName = 'John Doe';

      service.showAppointmentDeleted(appointmentName);

      expect(_translateService.instant).toHaveBeenCalledWith('APPOINTMENTS.DELETE_SUCCESS');
      expect(_translateService.instant).toHaveBeenCalledWith('APPOINTMENTS.DELETE_SUCCESS_WITH_NAME', { name: appointmentName });
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showAppointmentUpdated', () => {
    it('should call showToast with translated parameters', () => {
      spyOn(service, 'showToast');
      const appointmentName = 'John Doe';

      service.showAppointmentUpdated(appointmentName);

      expect(_translateService.instant).toHaveBeenCalledWith('APPOINTMENTS.UPDATE_SUCCESS');
      expect(_translateService.instant).toHaveBeenCalledWith('APPOINTMENTS.UPDATE_SUCCESS_WITH_NAME', { name: appointmentName });
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showAppointmentCreated', () => {
    it('should call showToast with translated parameters', () => {
      spyOn(service, 'showToast');
      const appointmentName = 'John Doe';
      const appointmentId = 'test-id';

      service.showAppointmentCreated(appointmentName, appointmentId);

      expect(_translateService.instant).toHaveBeenCalledWith('APPOINTMENTS.CREATED_SUCCESS');
      expect(_translateService.instant).toHaveBeenCalledWith('APPOINTMENTS.CREATED_SUCCESS_WITH_NAME', { name: appointmentName });
      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.ACTIONS.VIEW_DETAILS');
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Translated text',
        detail: 'Translated text',
        data: {
          appointmentId,
          showViewButton: true,
          actionLabel: 'Translated text',
        },
      });
    });
  });

  describe('showValidationError', () => {
    it('should call showToast with translated parameters', () => {
      spyOn(service, 'showToast');
      const messageKey = 'COMMON.VALIDATION_ERROR_MESSAGE';

      service.showValidationError(messageKey);

      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.VALIDATION_ERROR');
      expect(_translateService.instant).toHaveBeenCalledWith(messageKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showNetworkError', () => {
    it('should call showToast with translated network error message', () => {
      spyOn(service, 'showToast');

      service.showNetworkError();

      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.NETWORK_ERROR');
      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.NETWORK_ERROR_DETAIL');
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showUnauthorizedError', () => {
    it('should call showToast with translated unauthorized error message', () => {
      spyOn(service, 'showToast');

      service.showUnauthorizedError();

      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.UNAUTHORIZED_ERROR');
      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.UNAUTHORIZED_ERROR_DETAIL');
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showLoginRequired', () => {
    it('should call showToast with translated login required message', () => {
      spyOn(service, 'showToast');

      service.showLoginRequired();

      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.LOGIN_REQUIRED');
      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.LOGIN_REQUIRED_DETAIL');
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showGenericSuccess', () => {
    it('should call showToast with translated generic success message', () => {
      spyOn(service, 'showToast');
      const messageKey = 'COMMON.OPERATION_COMPLETED';

      service.showGenericSuccess(messageKey);

      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.SUCCESS');
      expect(_translateService.instant).toHaveBeenCalledWith(messageKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showGenericError', () => {
    it('should call showToast with translated generic error message', () => {
      spyOn(service, 'showToast');
      const messageKey = 'COMMON.ERROR_DETAIL';

      service.showGenericError(messageKey);

      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.ERROR');
      expect(_translateService.instant).toHaveBeenCalledWith(messageKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showGenericInfo', () => {
    it('should call showToast with translated generic info message', () => {
      spyOn(service, 'showToast');
      const messageKey = 'COMMON.INFO_DETAIL';

      service.showGenericInfo(messageKey);

      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.INFO');
      expect(_translateService.instant).toHaveBeenCalledWith(messageKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Translated text',
        detail: 'Translated text',
      });
    });
  });

  describe('showGenericWarning', () => {
    it('should call showToast with translated generic warning message', () => {
      spyOn(service, 'showToast');
      const messageKey = 'COMMON.WARNING_DETAIL';

      service.showGenericWarning(messageKey);

      expect(_translateService.instant).toHaveBeenCalledWith('COMMON.WARNING');
      expect(_translateService.instant).toHaveBeenCalledWith(messageKey);
      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Translated text',
        detail: 'Translated text',
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
