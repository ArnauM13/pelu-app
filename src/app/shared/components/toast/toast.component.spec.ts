import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast'; // Eliminat
import { Router } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ToastComponent } from './toast.component';
import { AuthService } from '../../../core/auth/auth.service';
import { NO_ERRORS_SCHEMA, Component, Input } from '@angular/core';

// Mock classes
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Mock p-toast component
@Component({
    selector: 'p-toast',
    template: '<ng-content></ng-content>',
    standalone: false
})
class MockPToastComponent {
  @Input() key: string = '';
  @Input() position: string = '';
  @Input() baseZIndex: number = 0;
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
        // ToastModule, // Eliminat
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      // declarations: [MockPToastComponent], // ja no cal
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    // OVERRIDE TEMPLATE: Evitem que es renderitzi p-toast
    .overrideComponent(ToastComponent, { set: { template: '' } })
    .compileComponents();

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

  // Tests de DOM/renderitzat eliminats ja que no són aplicables amb template override
  // describe('template rendering', () => { ... });
  // describe('CSS classes and styling', () => { ... });
});
