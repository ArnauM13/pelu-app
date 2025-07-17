import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { AuthService } from '../../core/auth/auth.service';

describe('ToastService', () => {
  let service: ToastService;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(ToastService);
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showToast', () => {
    it('should call messageService.add with correct parameters', () => {
      const severity = 'success';
      const summary = 'Test summary';
      const detail = 'Test detail';
      const appointmentId = 'test-id';
      const showViewButton = true;
      const action = () => {};

      service.showToast(severity, summary, detail, appointmentId, showViewButton, action);

      expect(messageService.add).toHaveBeenCalledWith({
        severity,
        summary,
        detail,
        life: 4000,
        closable: false,
        key: 'pelu-toast',
        data: { appointmentId, showViewButton, action }
      });
    });

    it('should call messageService.add with default parameters', () => {
      const severity = 'error';
      const summary = 'Test summary';

      service.showToast(severity, summary);

      expect(messageService.add).toHaveBeenCalledWith({
        severity,
        summary,
        detail: '',
        life: 4000,
        closable: false,
        key: 'pelu-toast',
        data: { appointmentId: undefined, showViewButton: false, action: undefined }
      });
    });
  });

  describe('showSuccess', () => {
    it('should call showToast with success severity', () => {
      spyOn(service, 'showToast');
      const summary = 'Success message';
      const detail = 'Success detail';
      const appointmentId = 'test-id';
      const showViewButton = true;

      service.showSuccess(summary, detail, appointmentId, showViewButton);

      expect(service.showToast).toHaveBeenCalledWith('success', summary, detail, appointmentId, showViewButton);
    });
  });

  describe('showError', () => {
    it('should call showToast with error severity', () => {
      spyOn(service, 'showToast');
      const summary = 'Error message';
      const detail = 'Error detail';

      service.showError(summary, detail);

      expect(service.showToast).toHaveBeenCalledWith('error', summary, detail);
    });
  });

  describe('showInfo', () => {
    it('should call showToast with info severity', () => {
      spyOn(service, 'showToast');
      const summary = 'Info message';
      const detail = 'Info detail';

      service.showInfo(summary, detail);

      expect(service.showToast).toHaveBeenCalledWith('info', summary, detail);
    });
  });

  describe('showWarning', () => {
    it('should call showToast with warn severity', () => {
      spyOn(service, 'showToast');
      const summary = 'Warning message';
      const detail = 'Warning detail';

      service.showWarning(summary, detail);

      expect(service.showToast).toHaveBeenCalledWith('warn', summary, detail);
    });
  });

  describe('showReservationCreated', () => {
    it('should call showSuccess with correct parameters', () => {
      spyOn(service, 'showSuccess');
      const appointmentId = 'test-id';

      service.showReservationCreated(appointmentId);

      expect(service.showSuccess).toHaveBeenCalledWith('COMMON.RESERVATION_CREATED', '', appointmentId, true);
    });
  });

  describe('showAppointmentDeleted', () => {
    it('should call showSuccess with correct parameters', () => {
      spyOn(service, 'showSuccess');
      const appointmentName = 'John Doe';

      service.showAppointmentDeleted(appointmentName);

      expect(service.showSuccess).toHaveBeenCalledWith('Cita eliminada', `S'ha eliminat la cita de ${appointmentName}`);
    });
  });

  describe('showAppointmentUpdated', () => {
    it('should call showSuccess with correct parameters', () => {
      spyOn(service, 'showSuccess');
      const appointmentName = 'John Doe';

      service.showAppointmentUpdated(appointmentName);

      expect(service.showSuccess).toHaveBeenCalledWith('Cita actualitzada', `S'ha actualitzat la cita de ${appointmentName}`);
    });
  });

  describe('showAppointmentCreated', () => {
    it('should call showSuccess with correct parameters', () => {
      spyOn(service, 'showSuccess');
      const appointmentName = 'John Doe';
      const appointmentId = 'test-id';

      service.showAppointmentCreated(appointmentName, appointmentId);

      expect(service.showSuccess).toHaveBeenCalledWith('Cita creada', `S'ha creat la cita per ${appointmentName}`, appointmentId, true);
    });
  });

  describe('showValidationError', () => {
    it('should call showError with correct parameters', () => {
      spyOn(service, 'showError');
      const field = 'nom del client';

      service.showValidationError(field);

      expect(service.showError).toHaveBeenCalledWith('Error de validació', `El camp "${field}" és obligatori`);
    });
  });

  describe('showNetworkError', () => {
    it('should call showError with network error message', () => {
      spyOn(service, 'showError');

      service.showNetworkError();

      expect(service.showError).toHaveBeenCalledWith('Error de connexió', 'No s\'ha pogut connectar amb el servidor. Si us plau, torna-ho a provar.');
    });
  });

  describe('showUnauthorizedError', () => {
    it('should call showError with unauthorized error message', () => {
      spyOn(service, 'showError');

      service.showUnauthorizedError();

      expect(service.showError).toHaveBeenCalledWith('Accés denegat', 'No tens permisos per realitzar aquesta acció.');
    });
  });

  describe('showLoginRequired', () => {
    it('should call showWarning with login required message', () => {
      spyOn(service, 'showWarning');

      service.showLoginRequired();

      expect(service.showWarning).toHaveBeenCalledWith('Sessió requerida', 'Si us plau, inicia sessió per continuar.');
    });
  });

  describe('showGenericSuccess', () => {
    it('should call showSuccess with generic success message', () => {
      spyOn(service, 'showSuccess');
      const message = 'Operació completada';

      service.showGenericSuccess(message);

      expect(service.showSuccess).toHaveBeenCalledWith('Èxit', message);
    });
  });

  describe('showGenericError', () => {
    it('should call showError with generic error message', () => {
      spyOn(service, 'showError');
      const message = 'Ha ocorregut un error';

      service.showGenericError(message);

      expect(service.showError).toHaveBeenCalledWith('Error', message);
    });
  });

  describe('showGenericInfo', () => {
    it('should call showInfo with generic info message', () => {
      spyOn(service, 'showInfo');
      const message = 'Informació important';

      service.showGenericInfo(message);

      expect(service.showInfo).toHaveBeenCalledWith('Informació', message);
    });
  });

  describe('showGenericWarning', () => {
    it('should call showWarning with generic warning message', () => {
      spyOn(service, 'showWarning');
      const message = 'Advertència important';

      service.showGenericWarning(message);

      expect(service.showWarning).toHaveBeenCalledWith('Advertència', message);
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

  describe('onToastClick', () => {
    it('should execute action when action is provided', () => {
      const action = jasmine.createSpy('action');
      const event = {
        message: {
          data: { action }
        }
      };

      service.onToastClick(event);

      expect(action).toHaveBeenCalled();
    });

    it('should call viewAppointmentDetail when appointmentId is provided', () => {
      spyOn(service, 'viewAppointmentDetail');
      const appointmentId = 'test-id';
      const event = {
        message: {
          data: { appointmentId }
        }
      };

      service.onToastClick(event);

      expect(service.viewAppointmentDetail).toHaveBeenCalledWith(appointmentId);
    });

    it('should not call viewAppointmentDetail when no appointmentId is provided', () => {
      spyOn(service, 'viewAppointmentDetail');
      const event = {
        message: {
          data: {}
        }
      };

      service.onToastClick(event);

      expect(service.viewAppointmentDetail).not.toHaveBeenCalled();
    });
  });

  describe('viewAppointmentDetail', () => {
    it('should navigate to appointment detail when user is authenticated', () => {
      const user = { uid: 'user-123' } as any;
      authService.user.and.returnValue(user);
      const appointmentId = 'appointment-456';

      service.viewAppointmentDetail(appointmentId);

      expect(router.navigate).toHaveBeenCalledWith(['/appointments', 'user-123-appointment-456']);
    });

    it('should not navigate when user is not authenticated', () => {
      authService.user.and.returnValue(null);
      const appointmentId = 'appointment-456';

      service.viewAppointmentDetail(appointmentId);

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when user has no uid', () => {
      const user = { email: 'test@example.com' } as any;
      authService.user.and.returnValue(user);
      const appointmentId = 'appointment-456';

      service.viewAppointmentDetail(appointmentId);

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('showToastWithAction', () => {
    it('should call showToast with action parameter', () => {
      spyOn(service, 'showToast');
      const severity = 'success';
      const summary = 'Test summary';
      const detail = 'Test detail';
      const action = () => {};
      const actionLabel = 'Custom Action';

      service.showToastWithAction(severity, summary, detail, action, actionLabel);

      expect(service.showToast).toHaveBeenCalledWith(severity, summary, detail, undefined, false, action);
    });
  });
});
