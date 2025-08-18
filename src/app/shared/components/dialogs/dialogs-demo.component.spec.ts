import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { DialogsDemoComponent } from './dialogs-demo.component';

describe('DialogsDemoComponent', () => {
  let component: DialogsDemoComponent;
  let fixture: ComponentFixture<DialogsDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogsDemoComponent, TranslateModule.forRoot()],
      providers: [ConfirmationService],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogsDemoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all dialog state signals defined', () => {
    expect(component.isBasicDialogOpen).toBeDefined();
    expect(component.isConfirmOpen).toBeDefined();
    expect(component.isAlertOpen).toBeDefined();
    expect(component.isModalOpen).toBeDefined();
  });

  it('should have all dialog config signals defined', () => {
    expect(component.basicDialogConfig).toBeDefined();
    expect(component.confirmData).toBeDefined();
    expect(component.alertData).toBeDefined();
  });

  it('should initialize with all dialogs closed', () => {
    expect(component.isBasicDialogOpen()).toBe(false);
    expect(component.isConfirmOpen()).toBe(false);
    expect(component.isAlertOpen()).toBe(false);
    expect(component.isModalOpen()).toBe(false);
  });

  it('should have basic dialog methods defined', () => {
    expect(typeof component.openBasicDialog).toBe('function');
    expect(typeof component.closeBasicDialog).toBe('function');
  });

  it('should have confirmation dialog methods defined', () => {
    expect(typeof component.openConfirm).toBe('function');
    expect(typeof component.onConfirm).toBe('function');
    expect(typeof component.onCancelConfirm).toBe('function');
  });

  it('should have alert dialog methods defined', () => {
    expect(typeof component.openAlert).toBe('function');
    expect(typeof component.onAlertClose).toBe('function');
  });

  it('should have modal methods defined', () => {
    expect(typeof component.openModal).toBe('function');
    expect(typeof component.closeModal).toBe('function');
  });

  it('should open and close basic dialog', () => {
    expect(component.isBasicDialogOpen()).toBe(false);
    
    component.openBasicDialog();
    expect(component.isBasicDialogOpen()).toBe(true);
    
    component.closeBasicDialog();
    expect(component.isBasicDialogOpen()).toBe(false);
  });

  it('should open and close confirmation dialog', () => {
    expect(component.isConfirmOpen()).toBe(false);
    
    component.openConfirm();
    expect(component.isConfirmOpen()).toBe(true);
    
    component.onConfirm();
    expect(component.isConfirmOpen()).toBe(false);
  });

  it('should close confirmation dialog on cancel', () => {
    component.openConfirm();
    expect(component.isConfirmOpen()).toBe(true);
    
    component.onCancelConfirm();
    expect(component.isConfirmOpen()).toBe(false);
  });

  it('should open and close alert dialog', () => {
    expect(component.isAlertOpen()).toBe(false);
    
    component.openAlert();
    expect(component.isAlertOpen()).toBe(true);
    
    component.onAlertClose();
    expect(component.isAlertOpen()).toBe(false);
  });

  it('should open and close modal', () => {
    expect(component.isModalOpen()).toBe(false);
    
    component.openModal();
    expect(component.isModalOpen()).toBe(true);
    
    component.closeModal();
    expect(component.isModalOpen()).toBe(false);
  });

  it('should have basic dialog config with correct structure', () => {
    const config = component.basicDialogConfig();
    expect(config.title).toBe('Diàleg bàsic');
    expect(config.size).toBe('medium');
    expect(config.closeOnBackdropClick).toBe(true);
    expect(config.showFooter).toBe(true);
    expect(Array.isArray(config.footerActions)).toBe(true);
    expect(config.footerActions?.length).toBe(2);
  });

  it('should have confirmation data with correct structure', () => {
    const data = component.confirmData();
    expect(data.title).toBe('Confirmació');
    expect(data.message).toBe('Vols continuar amb aquesta acció?');
    expect(data.confirmText).toBe('Confirmar');
    expect(data.cancelText).toBe('Cancel·lar');
    expect(data.severity).toBe('warning');
  });

  it('should have alert data with correct structure', () => {
    const data = component.alertData();
    expect(data.title).toBe('Informació');
    expect(data.message).toBe('Operació completada correctament.');
    expect(data.emoji).toBe('ℹ️');
    expect(data.confirmText).toBe('D\'acord');
    expect(data.severity).toBe('success');
  });

  it('should be a standalone component', () => {
    expect(DialogsDemoComponent.prototype.constructor).toBeDefined();
    expect(DialogsDemoComponent.prototype.constructor.name).toContain('DialogsDemoComponent');
  });

  it('should have component metadata', () => {
    expect(DialogsDemoComponent.prototype).toBeDefined();
    expect(DialogsDemoComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
