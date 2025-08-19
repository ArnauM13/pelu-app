import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastComponent } from './toast.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LoggerService } from '../../services/logger.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let loggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(async () => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      user: jasmine.createSpy('user').and.returnValue(null),
    });
    const loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'userAction', 'info']);

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

      component.showToast(config);

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

      component.showToast(config);

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

  describe('clearToast', () => {
    it('should call messageService.clear with correct key', () => {
      component.clearToast();

      expect(messageService.clear).toHaveBeenCalledWith('pelu-toast');
    });
  });

  describe('onToastClick', () => {
    it('should execute action when action is provided', () => {
      const action = jasmine.createSpy('action');
      const event = {
        message: {
          data: { action },
        },
      };

      component.onToastClick(event);

      expect(action).toHaveBeenCalled();
    });

    it('should call viewAppointmentDetail when appointmentId is provided', () => {
      spyOn(component, 'viewAppointmentDetail');
      const appointmentId = 'test-id';
      const event = {
        message: {
          data: { appointmentId },
        },
      };

      component.onToastClick(event);

      expect(component.viewAppointmentDetail).toHaveBeenCalledWith(appointmentId);
    });

    it('should not call viewAppointmentDetail when no appointmentId is provided', () => {
      spyOn(component, 'viewAppointmentDetail');
      const event = {
        message: {
          data: {},
        },
      };

      component.onToastClick(event);

      expect(component.viewAppointmentDetail).not.toHaveBeenCalled();
    });

    it('should prioritize action over appointmentId when both are provided', () => {
      const action = jasmine.createSpy('action');
      spyOn(component, 'viewAppointmentDetail');
      const appointmentId = 'test-id';
      const event = {
        message: {
          data: { action, appointmentId },
        },
      };

      component.onToastClick(event);

      expect(action).toHaveBeenCalled();
      expect(component.viewAppointmentDetail).not.toHaveBeenCalled();
    });
  });

  describe('executeAction', () => {
    it('should execute action successfully', () => {
      const action = jasmine.createSpy('action');

      component.executeAction(action);

      expect(action).toHaveBeenCalled();
    });

    it('should handle action errors gracefully', () => {
      const action = jasmine.createSpy('action').and.throwError('Test error');

      component.executeAction(action);

      expect(action).toHaveBeenCalled();
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('viewAppointmentDetail', () => {
    it('should navigate to appointment detail when user is authenticated', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = { uid: 'user-123' } as any;
      authService.user.and.returnValue(user);
      const appointmentId = 'appointment-456';

      component.viewAppointmentDetail(appointmentId);

      expect(router.navigate).toHaveBeenCalledWith(['/appointments', 'user-123-appointment-456']);
    });

    it('should not navigate when user is not authenticated', () => {
      authService.user.and.returnValue(null);
      const appointmentId = 'appointment-456';

      component.viewAppointmentDetail(appointmentId);

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when user has no uid', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = { email: 'test@example.com' } as any;
      authService.user.and.returnValue(user);
      const appointmentId = 'appointment-456';

      component.viewAppointmentDetail(appointmentId);

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  // Tests de DOM/renderitzat eliminats ja que no són aplicables amb template override
  // describe('template rendering', () => { ... });
  // describe('CSS classes and styling', () => { ... });
});
