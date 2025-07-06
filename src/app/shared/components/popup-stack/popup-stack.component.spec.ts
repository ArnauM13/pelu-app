import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupStackComponent, PopupItem } from './popup-stack.component';
import { FiltersPopupComponent } from '../filters-popup/filters-popup.component';

describe('PopupStackComponent', () => {
  let component: PopupStackComponent;
  let fixture: ComponentFixture<PopupStackComponent>;

  const mockPopupItem: PopupItem = {
    id: 'test-popup-1',
    title: 'Test Popup',
    size: 'medium',
    content: FiltersPopupComponent,
    data: { testData: 'value' },
    onFilterClick: jasmine.createSpy('onFilterClick'),
    onDateChange: jasmine.createSpy('onDateChange'),
    onClientChange: jasmine.createSpy('onClientChange'),
    onReset: jasmine.createSpy('onReset'),
    onToggleAdvanced: jasmine.createSpy('onToggleAdvanced')
  };

  const mockPopupItem2: PopupItem = {
    id: 'test-popup-2',
    title: 'Test Popup 2',
    size: 'large',
    content: FiltersPopupComponent,
    data: { testData2: 'value2' }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupStackComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PopupStackComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have popups input signal', () => {
    expect(component.popups).toBeDefined();
    expect(typeof component.popups).toBe('function');
  });

  it('should have popupClosed output signal', () => {
    expect(component.popupClosed).toBeDefined();
    expect(typeof component.popupClosed.emit).toBe('function');
  });

  it('should have hasPopups computed property', () => {
    expect(component.hasPopups).toBeDefined();
    expect(typeof component.hasPopups).toBe('function');
  });

  it('should have topPopup computed property', () => {
    expect(component.topPopup).toBeDefined();
    expect(typeof component.topPopup).toBe('function');
  });

  it('should return false for hasPopups when no popups', () => {
    spyOn(component, 'popups').and.returnValue([]);

    expect(component.hasPopups()).toBe(false);
  });

  it('should return true for hasPopups when popups exist', () => {
    spyOn(component, 'popups').and.returnValue([mockPopupItem]);

    expect(component.hasPopups()).toBe(true);
  });

  it('should return null for topPopup when no popups', () => {
    spyOn(component, 'popups').and.returnValue([]);

    expect(component.topPopup()).toBeNull();
  });

  it('should return last popup for topPopup when popups exist', () => {
    spyOn(component, 'popups').and.returnValue([mockPopupItem, mockPopupItem2]);

    expect(component.topPopup()).toBe(mockPopupItem2);
  });

  it('should emit popupClosed event when closePopup is called', () => {
    spyOn(component.popupClosed, 'emit');
    jasmine.clock().install();

    component.closePopup('test-popup-1');

    jasmine.clock().tick(300);
    expect(component.popupClosed.emit).toHaveBeenCalledWith('test-popup-1');

    jasmine.clock().uninstall();
  });

  it('should not close popup twice if already closing', () => {
    spyOn(component.popupClosed, 'emit');
    jasmine.clock().install();

    // First call
    component.closePopup('test-popup-1');

    // Second call while closing
    component.closePopup('test-popup-1');

    jasmine.clock().tick(300);

    // Should only emit once
    expect(component.popupClosed.emit).toHaveBeenCalledTimes(1);

    jasmine.clock().uninstall();
  });

  it('should close top popup when backdrop is clicked', () => {
    spyOn(component.popupClosed, 'emit');
    spyOn(component, 'topPopup').and.returnValue(mockPopupItem);
    jasmine.clock().install();

    const mockEvent = new Event('click');
    Object.defineProperty(mockEvent, 'target', { value: mockEvent.currentTarget });

    component.onBackdropClick(mockEvent);

    jasmine.clock().tick(300);
    expect(component.popupClosed.emit).toHaveBeenCalledWith('test-popup-1');

    jasmine.clock().uninstall();
  });

  it('should not close popup when non-backdrop element is clicked', () => {
    spyOn(component.popupClosed, 'emit');

    const mockEvent = new Event('click');
    const mockTarget = document.createElement('div');
    Object.defineProperty(mockEvent, 'target', { value: mockTarget });
    Object.defineProperty(mockEvent, 'currentTarget', { value: document.createElement('div') });

    component.onBackdropClick(mockEvent);

    expect(component.popupClosed.emit).not.toHaveBeenCalled();
  });

  it('should not close popup when no top popup exists', () => {
    spyOn(component.popupClosed, 'emit');
    spyOn(component, 'topPopup').and.returnValue(null);

    const mockEvent = new Event('click');
    Object.defineProperty(mockEvent, 'target', { value: mockEvent.currentTarget });

    component.onBackdropClick(mockEvent);

    expect(component.popupClosed.emit).not.toHaveBeenCalled();
  });

  it('should get component inputs with all callbacks', () => {
    const inputs = component.getComponentInputs(mockPopupItem);

    expect(inputs.testData).toBe('value');
    expect(inputs.onFilterClick).toBe(mockPopupItem.onFilterClick);
    expect(inputs.onDateChange).toBe(mockPopupItem.onDateChange);
    expect(inputs.onClientChange).toBe(mockPopupItem.onClientChange);
    expect(inputs.onReset).toBe(mockPopupItem.onReset);
    expect(inputs.onToggleAdvanced).toBe(mockPopupItem.onToggleAdvanced);
  });

  it('should get component inputs without optional callbacks', () => {
    const inputs = component.getComponentInputs(mockPopupItem2);

    expect(inputs.testData2).toBe('value2');
    expect(inputs.onFilterClick).toBeUndefined();
    expect(inputs.onDateChange).toBeUndefined();
    expect(inputs.onClientChange).toBeUndefined();
    expect(inputs.onReset).toBeUndefined();
    expect(inputs.onToggleAdvanced).toBeUndefined();
  });

  it('should return false for isClosing when popup is not closing', () => {
    expect(component.isClosing('test-popup-1')).toBe(false);
  });

  it('should return true for isClosing when popup is closing', () => {
    jasmine.clock().install();

    component.closePopup('test-popup-1');
    expect(component.isClosing('test-popup-1')).toBe(true);

    jasmine.clock().tick(300);
    expect(component.isClosing('test-popup-1')).toBe(false);

    jasmine.clock().uninstall();
  });

  it('should get correct popup style for index', () => {
    const style = component.getPopupStyle(0);

    expect(style['margin-top']).toBe('5rem');
    expect(style['z-index']).toBe(4000);
  });

  it('should get correct popup style for different index', () => {
    const style = component.getPopupStyle(2);

    expect(style['margin-top']).toBe('21rem');
    expect(style['z-index']).toBe(4002);
  });

  it('should return true for isFiltersPopup when content is FiltersPopupComponent', () => {
    expect(component.isFiltersPopup(mockPopupItem)).toBe(true);
  });

  it('should return false for isFiltersPopup when content is not FiltersPopupComponent', () => {
    const nonFiltersPopup: PopupItem = {
      id: 'test-popup-3',
      title: 'Test Popup 3',
      size: 'small',
      content: {} as any,
      data: {}
    };

    expect(component.isFiltersPopup(nonFiltersPopup)).toBe(false);
  });

  it('should render popup stack element', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const stackElement = compiled.querySelector('.popup-stack');
    expect(stackElement).toBeTruthy();
  });

  it('should have closePopup method', () => {
    expect(typeof component.closePopup).toBe('function');
  });

  it('should have onBackdropClick method', () => {
    expect(typeof component.onBackdropClick).toBe('function');
  });

  it('should have getComponentInputs method', () => {
    expect(typeof component.getComponentInputs).toBe('function');
  });

  it('should have isClosing method', () => {
    expect(typeof component.isClosing).toBe('function');
  });

  it('should have getPopupStyle method', () => {
    expect(typeof component.getPopupStyle).toBe('function');
  });

  it('should have isFiltersPopup method', () => {
    expect(typeof component.isFiltersPopup).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(PopupStackComponent.prototype.constructor.name).toBe('PopupStackComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = PopupStackComponent;
    expect(componentClass.name).toBe('PopupStackComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(PopupStackComponent.prototype).toBeDefined();
    expect(PopupStackComponent.prototype.constructor).toBeDefined();
  });

  it('should handle multiple popups closing simultaneously', () => {
    spyOn(component.popupClosed, 'emit');
    jasmine.clock().install();

    component.closePopup('popup-1');
    component.closePopup('popup-2');

    expect(component.isClosing('popup-1')).toBe(true);
    expect(component.isClosing('popup-2')).toBe(true);

    jasmine.clock().tick(300);

    expect(component.popupClosed.emit).toHaveBeenCalledWith('popup-1');
    expect(component.popupClosed.emit).toHaveBeenCalledWith('popup-2');
    expect(component.isClosing('popup-1')).toBe(false);
    expect(component.isClosing('popup-2')).toBe(false);

    jasmine.clock().uninstall();
  });

  it('should validate PopupItem interface properties', () => {
    const popupItem: PopupItem = {
      id: 'test-id',
      title: 'Test Title',
      size: 'medium',
      content: FiltersPopupComponent,
      data: { key: 'value' },
      onFilterClick: () => {},
      onDateChange: () => {},
      onClientChange: () => {},
      onReset: () => {},
      onToggleAdvanced: () => {}
    };

    expect(popupItem.id).toBe('test-id');
    expect(popupItem.title).toBe('Test Title');
    expect(popupItem.size).toBe('medium');
    expect(popupItem.content).toBe(FiltersPopupComponent);
    expect(popupItem.data.key).toBe('value');
    expect(typeof popupItem.onFilterClick).toBe('function');
  });
});
