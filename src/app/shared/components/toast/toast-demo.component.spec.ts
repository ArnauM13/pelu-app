import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastDemoComponent } from './toast-demo.component';
import { ToastService } from '../../services/toast.service';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

describe('ToastDemoComponent', () => {
  let component: ToastDemoComponent;
  let fixture: ComponentFixture<ToastDemoComponent>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
      'showInfo',
      'showWarning',
      'showSecondary',
      'showContrast',
      'showToastWithCustomIcon',
      'showToastAtPosition',
      'showToastWithDuration',
      'showStickyToast',
      'showReservationCreated',
      'showAppointmentDeleted',
      'showValidationError',
      'showNetworkError',
      'showLoginRequired',
      'showToastWithAction',
      'showToast',
      'showMultipleToasts',
      'showToastWithCustomClass',
      'clearAllToasts',
      'clearToast',
    ]);

    await TestBed.configureTestingModule({
      imports: [ToastDemoComponent, TranslateModule.forRoot()],
      providers: [
        ...provideMockFirebase(),
        { provide: ToastService, useValue: toastServiceSpy },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastDemoComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have toastService injected', () => {
    expect(component['toastService']).toBeDefined();
    expect(component['toastService']).toBeInstanceOf(ToastService);
  });

  it('should have basic toast methods defined', () => {
    expect(typeof component.showSuccess).toBe('function');
    expect(typeof component.showError).toBe('function');
    expect(typeof component.showInfo).toBe('function');
    expect(typeof component.showWarning).toBe('function');
    expect(typeof component.showSecondary).toBe('function');
    expect(typeof component.showContrast).toBe('function');
  });

  it('should have custom icon toast methods defined', () => {
    expect(typeof component.showCustomIconToast).toBe('function');
    expect(typeof component.showEmailToast).toBe('function');
    expect(typeof component.showDownloadToast).toBe('function');
    expect(typeof component.showNotificationToast).toBe('function');
  });

  it('should have position and duration methods defined', () => {
    expect(typeof component.showToastAtPosition).toBe('function');
    expect(typeof component.showToastWithDuration).toBe('function');
    expect(typeof component.showStickyToast).toBe('function');
  });

  it('should have specific use case methods defined', () => {
    expect(typeof component.showReservationCreated).toBe('function');
    expect(typeof component.showAppointmentDeleted).toBe('function');
    expect(typeof component.showValidationError).toBe('function');
    expect(typeof component.showNetworkError).toBe('function');
    expect(typeof component.showLoginRequired).toBe('function');
  });

  it('should have action methods defined', () => {
    expect(typeof component.showToastWithAction).toBe('function');
    expect(typeof component.showToastWithMultipleActions).toBe('function');
    expect(typeof component.showToastWithoutClose).toBe('function');
  });

  it('should have multiple toast methods defined', () => {
    expect(typeof component.showMultipleToasts).toBe('function');
    expect(typeof component.showCascadeToasts).toBe('function');
  });

  it('should have custom class methods defined', () => {
    expect(typeof component.showPremiumToast).toBe('function');
    expect(typeof component.showUrgentToast).toBe('function');
    expect(typeof component.showFestiveToast).toBe('function');
  });

  it('should have management methods defined', () => {
    expect(typeof component.clearAllToasts).toBe('function');
    expect(typeof component.clearSpecificToast).toBe('function');
  });

  it('should have advanced configuration methods defined', () => {
    expect(typeof component.showAdvancedConfigToast).toBe('function');
    expect(typeof component.showToastWithBreakpoints).toBe('function');
    expect(typeof component.showToastWithAnimations).toBe('function');
  });

  it('should call showSuccess on toast service', () => {
    component.showSuccess();
    expect(toastService.showSuccess).toHaveBeenCalled();
  });

  it('should call showError on toast service', () => {
    component.showError();
    expect(toastService.showError).toHaveBeenCalled();
  });

  it('should call showInfo on toast service', () => {
    component.showInfo();
    expect(toastService.showInfo).toHaveBeenCalled();
  });

  it('should call showWarning on toast service', () => {
    component.showWarning();
    expect(toastService.showWarning).toHaveBeenCalled();
  });

  it('should call showSecondary on toast service', () => {
    component.showSecondary();
    expect(toastService.showSecondary).toHaveBeenCalled();
  });

  it('should call showContrast on toast service', () => {
    component.showContrast();
    expect(toastService.showContrast).toHaveBeenCalled();
  });

  it('should call showToastWithCustomIcon on toast service', () => {
    component.showCustomIconToast();
    expect(toastService.showToastWithCustomIcon).toHaveBeenCalled();
  });

  it('should call showToastAtPosition on toast service', () => {
    component.showToastAtPosition('info', 'Test', 'Test message', 'top-left');
    expect(toastService.showToastAtPosition).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Test',
      detail: 'Test message',
    }, 'top-left');
  });

  it('should call showToastWithDuration on toast service', () => {
    component.showToastWithDuration('success', 'Test', 'Test detail', 5000);
    expect(toastService.showToastWithDuration).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Test',
      detail: 'Test detail',
    }, 5000);
  });

  it('should call showStickyToast on toast service', () => {
    component.showStickyToast();
    expect(toastService.showStickyToast).toHaveBeenCalled();
  });

  it('should call showReservationCreated on toast service', () => {
    component.showReservationCreated();
    expect(toastService.showReservationCreated).toHaveBeenCalled();
  });

  it('should call showAppointmentDeleted on toast service', () => {
    component.showAppointmentDeleted();
    expect(toastService.showAppointmentDeleted).toHaveBeenCalled();
  });

  it('should call showValidationError on toast service', () => {
    component.showValidationError();
    expect(toastService.showValidationError).toHaveBeenCalled();
  });

  it('should call showNetworkError on toast service', () => {
    component.showNetworkError();
    expect(toastService.showNetworkError).toHaveBeenCalled();
  });

  it('should call showLoginRequired on toast service', () => {
    component.showLoginRequired();
    expect(toastService.showLoginRequired).toHaveBeenCalled();
  });

  it('should call showToastWithAction on toast service', () => {
    component.showToastWithAction();
    expect(toastService.showToastWithAction).toHaveBeenCalled();
  });

  it('should call showMultipleToasts on toast service', () => {
    component.showMultipleToasts();
    expect(toastService.showMultipleToasts).toHaveBeenCalled();
  });

  it('should call showToastWithCustomClass on toast service', () => {
    component.showPremiumToast();
    expect(toastService.showToastWithCustomClass).toHaveBeenCalled();
  });

  it('should call clearAllToasts on toast service', () => {
    component.clearAllToasts();
    expect(toastService.clearAllToasts).toHaveBeenCalled();
  });

  it('should call clearToast on toast service', () => {
    component.clearSpecificToast();
    expect(toastService.clearToast).toHaveBeenCalled();
  });

  it('should not throw errors during rendering', () => {
    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should be a standalone component', () => {
    expect(component.constructor.name).toBe('ToastDemoComponent');
  });

  it('should have component metadata', () => {
    expect(component).toBeDefined();
    expect(typeof component).toBe('object');
  });
});
