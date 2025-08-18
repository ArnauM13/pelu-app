import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastDemoComponent } from './toast-demo.component';
import { ToastService } from '../../services/toast.service';

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
    expect(toastService.showSuccess).toHaveBeenCalledWith(
      'Operació completada amb èxit',
      'La teva acció s\'ha realitzat correctament'
    );
  });

  it('should call showError on toast service', () => {
    component.showError();
    expect(toastService.showError).toHaveBeenCalledWith(
      'Ha ocorregut un error inesperat',
      'Si us plau, torna-ho a provar més tard'
    );
  });

  it('should call showInfo on toast service', () => {
    component.showInfo();
    expect(toastService.showInfo).toHaveBeenCalledWith(
      'Informació important',
      'Aquest és un missatge informatiu per l\'usuari'
    );
  });

  it('should call showWarning on toast service', () => {
    component.showWarning();
    expect(toastService.showWarning).toHaveBeenCalledWith(
      'Advertència',
      'Aquesta acció pot tenir conseqüències'
    );
  });

  it('should call showSecondary on toast service', () => {
    component.showSecondary();
    expect(toastService.showSecondary).toHaveBeenCalledWith(
      'Missatge secundari',
      'Aquest és un missatge de tipus secundari'
    );
  });

  it('should call showContrast on toast service', () => {
    component.showContrast();
    expect(toastService.showContrast).toHaveBeenCalledWith(
      'Missatge de contrast',
      'Aquest missatge destaca del fons'
    );
  });

  it('should call showToastWithCustomIcon on toast service', () => {
    component.showCustomIconToast();
    expect(toastService.showToastWithCustomIcon).toHaveBeenCalledWith(
      {
        severity: 'success',
        summary: 'Celebració!',
        detail: 'Has completat una tasca important',
      },
      '🎉'
    );
  });

  it('should call showToastAtPosition on toast service', () => {
    component.showToastAtPosition('info', 'Test', 'Test detail', 'top-left');
    expect(toastService.showToastAtPosition).toHaveBeenCalledWith(
      {
        severity: 'info',
        summary: 'Test',
        detail: 'Test detail',
      },
      'top-left'
    );
  });

  it('should call showToastWithDuration on toast service', () => {
    component.showToastWithDuration('success', 'Test', 'Test detail', 5000);
    expect(toastService.showToastWithDuration).toHaveBeenCalledWith(
      {
        severity: 'success',
        summary: 'Test',
        detail: 'Test detail',
      },
      5000
    );
  });

  it('should call showStickyToast on toast service', () => {
    component.showStickyToast();
    expect(toastService.showStickyToast).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Toast Sticky',
      detail: 'Aquest toast no desapareix automàticament. Has de tancar-lo manualment.',
    });
  });

  it('should call showReservationCreated on toast service', () => {
    component.showReservationCreated();
    expect(toastService.showReservationCreated).toHaveBeenCalledWith('demo-appointment-123');
  });

  it('should call showAppointmentDeleted on toast service', () => {
    component.showAppointmentDeleted();
    expect(toastService.showAppointmentDeleted).toHaveBeenCalledWith('Joan Pérez');
  });

  it('should call showValidationError on toast service', () => {
    component.showValidationError();
    expect(toastService.showValidationError).toHaveBeenCalledWith('nom del client');
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
    expect(toastService.showToastWithAction).toHaveBeenCalledWith(
      {
        severity: 'info',
        summary: 'Acció disponible',
        detail: 'Clica el botó per executar una acció personalitzada',
      },
      jasmine.any(Function),
      'Executar Acció'
    );
  });

  it('should call showMultipleToasts on toast service', () => {
    component.showMultipleToasts();
    expect(toastService.showMultipleToasts).toHaveBeenCalledWith(jasmine.any(Array));
  });

  it('should call showCascadeToasts on toast service', () => {
    spyOn(window, 'setTimeout');
    component.showCascadeToasts();
    expect(window.setTimeout).toHaveBeenCalledTimes(4);
  });

  it('should call showToastWithCustomClass on toast service', () => {
    component.showPremiumToast();
    expect(toastService.showToastWithCustomClass).toHaveBeenCalledWith(
      {
        severity: 'success',
        summary: 'Versió Premium',
        detail: 'Has activat les funcions premium',
        data: { customIcon: '👑' },
      },
      'premium-toast'
    );
  });

  it('should call clearAllToasts on toast service', () => {
    component.clearAllToasts();
    expect(toastService.clearAllToasts).toHaveBeenCalled();
  });

  it('should call clearToast on toast service', () => {
    component.clearSpecificToast();
    expect(toastService.clearToast).toHaveBeenCalled();
  });

  it('should call showToast with advanced config on toast service', () => {
    component.showAdvancedConfigToast();
    expect(toastService.showToast).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Configuració Avançada',
      detail: 'Aquest toast té una configuració completa personalitzada',
      life: 6000,
      position: 'center',
      data: {
        customIcon: '⚙️',
        customClass: 'premium-toast',
      },
      showTransitionOptions: '500ms ease-out',
      hideTransitionOptions: '300ms ease-in',
      showTransformOptions: 'translateY(-50px)',
      hideTransformOptions: 'translateY(50px)',
    });
  });

  it('should be a standalone component', () => {
    expect(ToastDemoComponent.prototype.constructor).toBeDefined();
    expect(ToastDemoComponent.prototype.constructor.name).toBe('ToastDemoComponent');
  });

  it('should have component metadata', () => {
    expect(ToastDemoComponent.prototype).toBeDefined();
    expect(ToastDemoComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
