import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupModalComponent } from './popup-modal.component';
import { createTestComponentNoRender, domTestUtils } from '../../../../testing/test-setup';

describe('PopupModalComponent', () => {
  let component: PopupModalComponent;
  let fixture: ComponentFixture<PopupModalComponent>;

  beforeEach(async () => {
    fixture = await createTestComponentNoRender<PopupModalComponent>(
      PopupModalComponent
    );
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have open input signal', () => {
    expect(component.open).toBeDefined();
    expect(typeof component.open).toBe('function');
  });

  it('should have title input signal', () => {
    expect(component.title).toBeDefined();
    expect(typeof component.title).toBe('function');
  });

  it('should have size input signal', () => {
    expect(component.size).toBeDefined();
    expect(typeof component.size).toBe('function');
  });

  it('should have secondary input signal', () => {
    expect(component.secondary).toBeDefined();
    expect(typeof component.secondary).toBe('function');
  });

  it('should have closed output signal', () => {
    expect(component.closed).toBeDefined();
    expect(typeof component.closed.emit).toBe('function');
  });

  it('should have isClosing computed property', () => {
    expect(component.isClosing).toBeDefined();
    expect(typeof component.isClosing).toBe('function');
  });

  it('should have modalClasses computed property', () => {
    expect(component.modalClasses).toBeDefined();
    expect(typeof component.modalClasses).toBe('function');
  });

  it('should emit closed event when onClose is called', () => {
    spyOn(component.closed, 'emit');
    jasmine.clock().install();

    component.onClose();

    jasmine.clock().tick(300);
    expect(component.closed.emit).toHaveBeenCalled();

    jasmine.clock().uninstall();
  });

  it('should set isClosing to true when onClose is called', () => {
    jasmine.clock().install();

    component.onClose();

    expect(component.isClosing()).toBe(true);

    jasmine.clock().tick(300);
    expect(component.isClosing()).toBe(false);

    jasmine.clock().uninstall();
  });

  it('should not call onClose again if already closing', () => {
    spyOn(component.closed, 'emit');
    jasmine.clock().install();

    // First call
    component.onClose();
    expect(component.isClosing()).toBe(true);

    // Second call while closing
    component.onClose();

    jasmine.clock().tick(300);

    // Should only emit once
    expect(component.closed.emit).toHaveBeenCalledTimes(1);

    jasmine.clock().uninstall();
  });

  it('should emit closed event when backdrop is clicked', () => {
    spyOn(component.closed, 'emit');
    jasmine.clock().install();

    const mockEvent = domTestUtils.createBackdropEvent();

    component.onBackdropClick(mockEvent);

    jasmine.clock().tick(300);
    expect(component.closed.emit).toHaveBeenCalled();

    jasmine.clock().uninstall();
  });

  it('should not emit closed event when non-backdrop element is clicked', () => {
    spyOn(component.closed, 'emit');

    const mockEvent = domTestUtils.createNonBackdropEvent();

    component.onBackdropClick(mockEvent);

    expect(component.closed.emit).not.toHaveBeenCalled();
  });

  it('should generate correct modal classes for medium size', () => {
    spyOn(component, 'size').and.returnValue('medium');
    spyOn(component, 'secondary').and.returnValue(false);
    spyOn(component, 'isClosing').and.returnValue(false);

    const classes = component.modalClasses();

    expect(classes['popup-modal']).toBe(true);
    expect(classes['popup-modal--medium']).toBe(true);
    expect(classes['popup-modal--secondary']).toBe(false);
    expect(classes['popup-modal--closing']).toBe(false);
  });

  it('should generate correct modal classes for small size', () => {
    spyOn(component, 'size').and.returnValue('small');
    spyOn(component, 'secondary').and.returnValue(false);
    spyOn(component, 'isClosing').and.returnValue(false);

    const classes = component.modalClasses();

    expect(classes['popup-modal']).toBe(true);
    expect(classes['popup-modal--small']).toBe(true);
    expect(classes['popup-modal--secondary']).toBe(false);
    expect(classes['popup-modal--closing']).toBe(false);
  });

  it('should generate correct modal classes for large size', () => {
    spyOn(component, 'size').and.returnValue('large');
    spyOn(component, 'secondary').and.returnValue(false);
    spyOn(component, 'isClosing').and.returnValue(false);

    const classes = component.modalClasses();

    expect(classes['popup-modal']).toBe(true);
    expect(classes['popup-modal--large']).toBe(true);
    expect(classes['popup-modal--secondary']).toBe(false);
    expect(classes['popup-modal--closing']).toBe(false);
  });

  it('should generate correct modal classes for secondary variant', () => {
    spyOn(component, 'size').and.returnValue('medium');
    spyOn(component, 'secondary').and.returnValue(true);
    spyOn(component, 'isClosing').and.returnValue(false);

    const classes = component.modalClasses();

    expect(classes['popup-modal']).toBe(true);
    expect(classes['popup-modal--medium']).toBe(true);
    expect(classes['popup-modal--secondary']).toBe(true);
    expect(classes['popup-modal--closing']).toBe(false);
  });

  it('should generate correct modal classes when closing', () => {
    spyOn(component, 'size').and.returnValue('medium');
    spyOn(component, 'secondary').and.returnValue(false);
    spyOn(component, 'isClosing').and.returnValue(true);

    const classes = component.modalClasses();

    expect(classes['popup-modal']).toBe(true);
    expect(classes['popup-modal--medium']).toBe(true);
    expect(classes['popup-modal--secondary']).toBe(false);
    expect(classes['popup-modal--closing']).toBe(true);
  });

  it('should have onClose method', () => {
    expect(typeof component.onClose).toBe('function');
  });

  it('should have onBackdropClick method', () => {
    expect(typeof component.onBackdropClick).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(PopupModalComponent.prototype.constructor.name).toBe('PopupModalComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = PopupModalComponent;
    expect(componentClass.name).toBe('PopupModalComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(PopupModalComponent.prototype).toBeDefined();
    expect(PopupModalComponent.prototype.constructor).toBeDefined();
  });

  it('should handle multiple rapid close calls gracefully', () => {
    spyOn(component.closed, 'emit');
    jasmine.clock().install();

    // Multiple rapid calls
    component.onClose();
    component.onClose();
    component.onClose();

    jasmine.clock().tick(300);

    // Should only emit once
    expect(component.closed.emit).toHaveBeenCalledTimes(1);

    jasmine.clock().uninstall();
  });

  it('should reset isClosing after timeout', () => {
    jasmine.clock().install();

    component.onClose();
    expect(component.isClosing()).toBe(true);

    jasmine.clock().tick(300);
    expect(component.isClosing()).toBe(false);

    jasmine.clock().uninstall();
  });



  it('should return false for isClosing when not closing', () => {
    expect(component.isClosing()).toBe(false);
  });

  it('should return true for isClosing when closing', () => {
    jasmine.clock().install();

    component.onClose();
    expect(component.isClosing()).toBe(true);

    jasmine.clock().tick(300);
    expect(component.isClosing()).toBe(false);

    jasmine.clock().uninstall();
  });

  it('should validate component interface', () => {
    expect(component.open).toBeDefined();
    expect(component.title).toBeDefined();
    expect(component.size).toBeDefined();
    expect(component.secondary).toBeDefined();
    expect(component.closed).toBeDefined();
    expect(component.isClosing).toBeDefined();
    expect(component.modalClasses).toBeDefined();
  });

  it('should have all required methods', () => {
    const requiredMethods = [
      'onClose',
      'onBackdropClick'
    ];

    requiredMethods.forEach(method => {
      expect(typeof component[method as keyof PopupModalComponent]).toBe('function');
    });
  });
});
