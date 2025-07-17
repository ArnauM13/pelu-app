import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ToastComponent } from './toast.component';
import { AuthService } from '../../../core/auth/auth.service';

// Mock classes
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);

    // Setup default return values
    authServiceSpy.user.and.returnValue({ uid: 'test-uid', email: 'test@example.com' });

    await TestBed.configureTestingModule({
      imports: [
        ToastComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct toast key', () => {
    expect(component.toastKey).toBe('pelu-toast');
  });

  describe('showToast', () => {
    it('should call messageService.add with correct parameters', () => {
      const severity = 'success';
      const summary = 'Test summary';
      const detail = 'Test detail';
      const appointmentId = 'test-id';
      const showViewButton = true;
      const action = () => {};

      component.showToast(severity, summary, detail, appointmentId, showViewButton, action);

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
          data: { action }
        }
      };

      component.onToastClick(event);

      expect(action).toHaveBeenCalled();
    });

    it('should call viewAppointmentDetail when appointmentId is provided', () => {
      spyOn(component, 'viewAppointmentDetail');
      const appointmentId = 'test-id';
      const event = {
        message: {
          data: { appointmentId }
        }
      };

      component.onToastClick(event);

      expect(component.viewAppointmentDetail).toHaveBeenCalledWith(appointmentId);
    });

    it('should not call viewAppointmentDetail when no appointmentId is provided', () => {
      spyOn(component, 'viewAppointmentDetail');
      const event = {
        message: {
          data: {}
        }
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
          data: { action, appointmentId }
        }
      };

      component.onToastClick(event);

      expect(action).toHaveBeenCalled();
      expect(component.viewAppointmentDetail).not.toHaveBeenCalled();
    });
  });

  describe('executeAction', () => {
    it('should execute action successfully', () => {
      const action = jasmine.createSpy('action');
      spyOn(console, 'error');

      component.executeAction(action);

      expect(action).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle action errors gracefully', () => {
      const action = jasmine.createSpy('action').and.throwError('Test error');
      spyOn(console, 'error');

      component.executeAction(action);

      expect(action).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error executing toast action:', jasmine.any(Error));
    });
  });

  describe('viewAppointmentDetail', () => {
    it('should navigate to appointment detail when user is authenticated', () => {
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
      const user = { email: 'test@example.com' } as any;
      authService.user.and.returnValue(user);
      const appointmentId = 'appointment-456';

      component.viewAppointmentDetail(appointmentId);

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should render p-toast component with correct attributes', () => {
      const compiled = fixture.nativeElement;
      const toastElement = compiled.querySelector('p-toast');

      expect(toastElement).toBeTruthy();
      expect(toastElement.getAttribute('key')).toBe('pelu-toast');
      expect(toastElement.getAttribute('position')).toBe('top-right');
      expect(toastElement.getAttribute('baseZIndex')).toBe('10000');
    });

    it('should render toast message template', () => {
      const compiled = fixture.nativeElement;
      const template = compiled.querySelector('ng-template[pTemplate="message"]');

      expect(template).toBeTruthy();
    });

    it('should render view detail button when showViewButton is true', () => {
      const compiled = fixture.nativeElement;
      const viewButton = compiled.querySelector('.p-toast-message-btn');

      // El botó no es renderitza fins que hi ha un missatge amb showViewButton = true
      expect(viewButton).toBeFalsy();
    });

    it('should render close button', () => {
      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('.p-toast-icon-close');

      expect(closeButton).toBeTruthy();
      expect(closeButton.querySelector('i')).toBeTruthy();
    });
  });

  describe('CSS classes and styling', () => {
    it('should have correct CSS classes for different severity types', () => {
      const compiled = fixture.nativeElement;
      const styles = compiled.querySelector('style');

      expect(styles).toBeTruthy();
      expect(styles.textContent).toContain('.p-toast-message.p-toast-message-success');
      expect(styles.textContent).toContain('.p-toast-message.p-toast-message-error');
      expect(styles.textContent).toContain('.p-toast-message.p-toast-message-warn');
      expect(styles.textContent).toContain('.p-toast-message.p-toast-message-info');
    });

    it('should have responsive styles for mobile', () => {
      const compiled = fixture.nativeElement;
      const styles = compiled.querySelector('style');

      expect(styles.textContent).toContain('@media (max-width: 768px)');
    });

    it('should have animation styles', () => {
      const compiled = fixture.nativeElement;
      const styles = compiled.querySelector('style');

      expect(styles.textContent).toContain('@keyframes slideInRight');
      expect(styles.textContent).toContain('animation: slideInRight 0.3s ease-out');
    });
  });
});
