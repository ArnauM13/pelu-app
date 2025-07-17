import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from './src/app/shared/services/toast.service';
import { ToastComponent } from './src/app/shared/components/toast/toast.component';
import { AuthService } from './src/app/core/auth/auth.service';

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
      imports: [TranslateModule.forRoot()],
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

  it('should call messageService.add with correct parameters', () => {
    const severity = 'success';
    const summary = 'Test summary';
    const detail = 'Test detail';

    service.showToast(severity, summary, detail);

    expect(messageService.add).toHaveBeenCalledWith({
      severity,
      summary,
      detail,
      life: 4000,
      closable: false,
      key: 'pelu-toast',
      data: { appointmentId: undefined, showViewButton: false, action: undefined }
    });
  });

  it('should call showSuccess with correct parameters', () => {
    spyOn(service, 'showToast');
    const summary = 'Success message';

    service.showSuccess(summary);

    expect(service.showToast).toHaveBeenCalledWith('success', summary, '', undefined, false);
  });

  it('should call showError with correct parameters', () => {
    spyOn(service, 'showToast');
    const summary = 'Error message';

    service.showError(summary);

    expect(service.showToast).toHaveBeenCalledWith('error', summary, '');
  });

  it('should call showReservationCreated with correct parameters', () => {
    spyOn(service, 'showSuccess');
    const appointmentId = 'test-id';

    service.showReservationCreated(appointmentId);

    expect(service.showSuccess).toHaveBeenCalledWith('COMMON.RESERVATION_CREATED', '', appointmentId, true);
  });

  it('should call showAppointmentDeleted with correct parameters', () => {
    spyOn(service, 'showSuccess');
    const appointmentName = 'John Doe';

    service.showAppointmentDeleted(appointmentName);

    expect(service.showSuccess).toHaveBeenCalledWith('🗑️ Cita eliminada', `S'ha eliminat la cita de ${appointmentName}`);
  });

  it('should call clearToast with correct key', () => {
    service.clearToast();

    expect(messageService.clear).toHaveBeenCalledWith('pelu-toast');
  });
});

describe('ToastComponent', () => {
  let component: ToastComponent;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);

    TestBed.configureTestingModule({
      imports: [ToastComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    component = TestBed.inject(ToastComponent);
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct toast key', () => {
    expect(component.toastKey).toBe('pelu-toast');
  });

  it('should call messageService.add with correct parameters', () => {
    const severity = 'success';
    const summary = 'Test summary';

    component.showToast(severity, summary);

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

  it('should call messageService.clear with correct key', () => {
    component.clearToast();

    expect(messageService.clear).toHaveBeenCalledWith('pelu-toast');
  });

  it('should execute action when action is provided', () => {
    const action = jasmine.createSpy('action');
    const event = {
      message: {
        data: { action }
      }
    };

    component.onToastClick(event);

    expect(action).toHaveBeenCalled();
  });

  it('should navigate to appointment detail when user is authenticated', () => {
    const user = { uid: 'user-123' } as any;
    authService.user.and.returnValue(user);
    const appointmentId = 'appointment-456';

    component.viewAppointmentDetail(appointmentId);

    expect(router.navigate).toHaveBeenCalledWith(['/appointments', 'user-123-appointment-456']);
  });
});
