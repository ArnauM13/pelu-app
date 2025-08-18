import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerDemoComponent } from './logger-demo.component';
import { LoggerService } from '../../services/logger.service';
import { ToastService } from '../../services/toast.service';

describe('LoggerDemoComponent', () => {
  let component: LoggerDemoComponent;
  let fixture: ComponentFixture<LoggerDemoComponent>;
  let loggerService: jasmine.SpyObj<LoggerService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const loggerServiceSpy = jasmine.createSpyObj('LoggerService', [
      'info',
      'warn',
      'debug',
      'performance',
      'error',
      'critical',
      'firebaseError',
      'networkError',
      'validationError',
      'authError',
      'userAction',
      'clearStoredLogs',
      'getStoredLogs',
    ]);

    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showInfo',
      'showWarning',
      'showSuccess',
      'showError',
    ]);

    // Setup default return values
    loggerServiceSpy.getStoredLogs.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [LoggerDemoComponent, TranslateModule.forRoot()],
      providers: [
        { provide: LoggerService, useValue: loggerServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoggerDemoComponent);
    component = fixture.componentInstance;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have logger and toast services injected', () => {
    expect(component['logger']).toBeDefined();
    expect(component['toastService']).toBeDefined();
  });

  it('should have storedLogs array initialized', () => {
    expect(component.storedLogs).toBeDefined();
    expect(Array.isArray(component.storedLogs)).toBe(true);
  });

  it('should have basic log methods defined', () => {
    expect(typeof component.showInfoLog).toBe('function');
    expect(typeof component.showWarningLog).toBe('function');
    expect(typeof component.showDebugLog).toBe('function');
    expect(typeof component.showPerformanceLog).toBe('function');
  });

  it('should have error log methods defined', () => {
    expect(typeof component.showNormalError).toBe('function');
    expect(typeof component.showCriticalError).toBe('function');
    expect(typeof component.showFirebaseError).toBe('function');
    expect(typeof component.showNetworkError).toBe('function');
  });

  it('should have specific error methods defined', () => {
    expect(typeof component.showValidationError).toBe('function');
    expect(typeof component.showAuthError).toBe('function');
    expect(typeof component.showPermissionError).toBe('function');
  });

  it('should have user action methods defined', () => {
    expect(typeof component.showUserAction).toBe('function');
    expect(typeof component.showUserActionWithData).toBe('function');
  });

  it('should have log management methods defined', () => {
    expect(typeof component.viewStoredLogs).toBe('function');
    expect(typeof component.clearStoredLogs).toBe('function');
    expect(typeof component.exportLogs).toBe('function');
  });

  it('should have trackByLog method defined', () => {
    expect(typeof component.trackByLog).toBe('function');
  });

  it('should call info on logger service', () => {
    component.showInfoLog();
    expect(loggerService.info).toHaveBeenCalledWith(
      'Això és un log informatiu de prova',
      {
        component: 'LoggerDemoComponent',
        method: 'showInfoLog',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call warn on logger service', () => {
    component.showWarningLog();
    expect(loggerService.warn).toHaveBeenCalledWith(
      "Això és un log d'advertència de prova",
      {
        component: 'LoggerDemoComponent',
        method: 'showWarningLog',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call debug on logger service', () => {
    component.showDebugLog();
    expect(loggerService.debug).toHaveBeenCalledWith(
      'Això és un log de debug de prova',
      {
        component: 'LoggerDemoComponent',
        method: 'showDebugLog',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call performance on logger service', () => {
    spyOn(window, 'setTimeout').and.callFake((fn: any) => fn());
    spyOn(performance, 'now').and.returnValues(100, 150);
    
    component.showPerformanceLog();
    
    expect(loggerService.performance).toHaveBeenCalledWith(
      'Operació de prova',
      50,
      {
        component: 'LoggerDemoComponent',
        method: 'showPerformanceLog',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call error on logger service', () => {
    component.showNormalError();
    expect(loggerService.error).toHaveBeenCalledWith(
      jasmine.any(Error),
      {
        component: 'LoggerDemoComponent',
        method: 'showNormalError',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call critical on logger service', () => {
    component.showCriticalError();
    expect(loggerService.critical).toHaveBeenCalledWith(
      jasmine.any(Error),
      {
        component: 'LoggerDemoComponent',
        method: 'showCriticalError',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call firebaseError on logger service', () => {
    component.showFirebaseError();
    expect(loggerService.firebaseError).toHaveBeenCalledWith(
      jasmine.any(Error),
      'testOperation',
      {
        component: 'LoggerDemoComponent',
        method: 'showFirebaseError',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call networkError on logger service', () => {
    component.showNetworkError();
    expect(loggerService.networkError).toHaveBeenCalledWith(
      jasmine.any(Error),
      '/api/test',
      {
        component: 'LoggerDemoComponent',
        method: 'showNetworkError',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call validationError on logger service', () => {
    component.showValidationError();
    expect(loggerService.validationError).toHaveBeenCalledWith(
      'email',
      'invalid-email',
      {
        component: 'LoggerDemoComponent',
        method: 'showValidationError',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call authError on logger service', () => {
    component.showAuthError();
    expect(loggerService.authError).toHaveBeenCalledWith(
      jasmine.any(Error),
      {
        component: 'LoggerDemoComponent',
        method: 'showAuthError',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call userAction on logger service', () => {
    component.showUserAction();
    expect(loggerService.userAction).toHaveBeenCalledWith(
      'button_click',
      {
        component: 'LoggerDemoComponent',
        method: 'showUserAction',
        userId: 'demo-user-123',
      }
    );
  });

  it('should call userAction with data on logger service', () => {
    component.showUserActionWithData();
    expect(loggerService.userAction).toHaveBeenCalledWith(
      'form_submit',
      {
        component: 'LoggerDemoComponent',
        method: 'showUserActionWithData',
        userId: 'demo-user-123',
      },
      { formData: { name: 'Test User', action: 'submit' } }
    );
  });

  it('should call clearStoredLogs on logger service', () => {
    component.clearStoredLogs();
    expect(loggerService.clearStoredLogs).toHaveBeenCalled();
    expect(component.storedLogs).toEqual([]);
  });

  it('should call getStoredLogs on logger service', () => {
    component.viewStoredLogs();
    expect(loggerService.getStoredLogs).toHaveBeenCalled();
  });

  it('should call showInfo on toast service for info log', () => {
    component.showInfoLog();
    expect(toastService.showInfo).toHaveBeenCalledWith(
      'Log Info',
      "S'ha generat un log informatiu"
    );
  });

  it('should call showWarning on toast service for warning log', () => {
    component.showWarningLog();
    expect(toastService.showWarning).toHaveBeenCalledWith(
      'Log Warning',
      "S'ha generat un log d'advertència"
    );
  });

  it('should call showError on toast service for validation error', () => {
    component.showValidationError();
    expect(toastService.showError).toHaveBeenCalledWith(
      'COMMON.ERRORS.VALIDATION_ERROR',
      "S'ha generat un error de validació"
    );
  });

  it('should call showSuccess on toast service for clear logs', () => {
    component.clearStoredLogs();
    expect(toastService.showSuccess).toHaveBeenCalledWith(
      'Logs Netejats',
      "S'han netejat tots els logs"
    );
  });

  it('should track logs correctly', () => {
    const mockLog = {
      timestamp: '2024-01-01T00:00:00.000Z',
      level: 'info',
      message: 'Test log',
    };
    
    const result = component.trackByLog(0, mockLog);
    expect(result).toBe('2024-01-01T00:00:00.000ZinfoTest log');
  });

  it('should be a standalone component', () => {
    expect(LoggerDemoComponent.prototype.constructor).toBeDefined();
    expect(LoggerDemoComponent.prototype.constructor.name).toBe('LoggerDemoComponent');
  });

  it('should have component metadata', () => {
    expect(LoggerDemoComponent.prototype).toBeDefined();
    expect(LoggerDemoComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
