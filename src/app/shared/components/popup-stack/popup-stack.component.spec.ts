import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupStackComponent, PopupItem } from './popup-stack.component';
import { FiltersPopupComponent } from '../filters-popup/filters-popup.component';

describe('PopupStackComponent', () => {
  let component: PopupStackComponent;
  let fixture: ComponentFixture<PopupStackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupStackComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PopupStackComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Clean up any pending timers
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have input signals defined', () => {
    expect(component.popups).toBeDefined();
  });

  it('should have output signals defined', () => {
    expect(component.popupClosed).toBeDefined();
  });

  it('should have computed properties defined', () => {
    expect(component.hasPopups).toBeDefined();
    expect(component.topPopup).toBeDefined();
  });

  it('should initialize with no popups', () => {
    expect(component.hasPopups()).toBe(false);
    expect(component.topPopup()).toBeNull();
  });

  it('should have utility methods defined', () => {
    expect(typeof component.closePopup).toBe('function');
    expect(typeof component.onBackdropClick).toBe('function');
    expect(typeof component.getComponentInputs).toBe('function');
    expect(typeof component.isClosing).toBe('function');
    expect(typeof component.getPopupStyle).toBe('function');
    expect(typeof component.isFiltersPopup).toBe('function');
  });

  it('should identify filters popup correctly', () => {
    const filtersPopup: PopupItem = {
      id: 'filters-1',
      size: 'medium',
      content: FiltersPopupComponent,
      data: {}
    };

    const regularPopup: PopupItem = {
      id: 'regular-1',
      size: 'medium',
      content: class MockComponent {},
      data: {}
    };

    expect(component.isFiltersPopup(filtersPopup)).toBe(true);
    expect(component.isFiltersPopup(regularPopup)).toBe(false);
  });

  it('should generate correct popup style', () => {
    const style1 = component.getPopupStyle(0);
    expect(style1['margin-top']).toBe('5rem');
    expect(style1['z-index']).toBe(4000);

    const style2 = component.getPopupStyle(1);
    expect(style2['margin-top']).toBe('13rem');
    expect(style2['z-index']).toBe(4001);

    const style3 = component.getPopupStyle(2);
    expect(style3['margin-top']).toBe('21rem');
    expect(style3['z-index']).toBe(4002);
  });

  it('should check if popup is closing', () => {
    const popupId = 'test-popup';
    expect(component.isClosing(popupId)).toBe(false);
  });

  it('should get component inputs correctly', () => {
    const mockOnFilterClick = (index: number) => {};
    const mockOnDateChange = (value: string) => {};

    const popup: PopupItem = {
      id: 'test-popup',
      size: 'medium',
      content: class MockComponent {},
      data: { testData: 'value' },
      onFilterClick: mockOnFilterClick,
      onDateChange: mockOnDateChange
    };

    const inputs = component.getComponentInputs(popup);

    expect(inputs.testData).toBe('value');
    expect(inputs.onFilterClick).toBe(mockOnFilterClick);
    expect(inputs.onDateChange).toBe(mockOnDateChange);
    expect(inputs.onClientChange).toBeUndefined();
    expect(inputs.onReset).toBeUndefined();
    expect(inputs.onToggleAdvanced).toBeUndefined();
  });

  it('should get component inputs with all callbacks', () => {
    const mockOnFilterClick = (index: number) => {};
    const mockOnDateChange = (value: string) => {};
    const mockOnClientChange = (value: string) => {};
    const mockOnReset = () => {};
    const mockOnToggleAdvanced = () => {};

    const popup: PopupItem = {
      id: 'test-popup',
      size: 'medium',
      content: class MockComponent {},
      data: { testData: 'value' },
      onFilterClick: mockOnFilterClick,
      onDateChange: mockOnDateChange,
      onClientChange: mockOnClientChange,
      onReset: mockOnReset,
      onToggleAdvanced: mockOnToggleAdvanced
    };

    const inputs = component.getComponentInputs(popup);

    expect(inputs.testData).toBe('value');
    expect(inputs.onFilterClick).toBe(mockOnFilterClick);
    expect(inputs.onDateChange).toBe(mockOnDateChange);
    expect(inputs.onClientChange).toBe(mockOnClientChange);
    expect(inputs.onReset).toBe(mockOnReset);
    expect(inputs.onToggleAdvanced).toBe(mockOnToggleAdvanced);
  });

  it('should emit popup closed event', (done) => {
    spyOn(component.popupClosed, 'emit');
    const popupId = 'test-popup';

    component.closePopup(popupId);

    // The emit happens after a timeout, so we need to wait
    setTimeout(() => {
      expect(component.popupClosed.emit).toHaveBeenCalledWith(popupId);
      done();
    }, 350);
  });

  it('should handle backdrop click when target equals currentTarget', () => {
    // Test that the method exists and can be called
    expect(component.onBackdropClick).toBeDefined();
    expect(typeof component.onBackdropClick).toBe('function');

    const sameElement = document.createElement('div');
    const mockEvent = {
      target: sameElement,
      currentTarget: sameElement
    } as unknown as Event;

    // Should not throw when called
    expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
  });

  it('should not handle backdrop click when target is different from currentTarget', () => {
    spyOn(component, 'closePopup');

    const mockEvent = {
      target: document.createElement('span'),
      currentTarget: document.createElement('div')
    } as unknown as Event;

    component.onBackdropClick(mockEvent);

    expect(component.closePopup).not.toHaveBeenCalled();
  });

  it('should handle PopupItem interface correctly', () => {
    const popup: PopupItem = {
      id: 'test-popup',
      title: 'Test Popup',
      size: 'medium',
      content: class MockComponent {},
      data: { testData: 'value' }
    };

    expect(popup.id).toBe('test-popup');
    expect(popup.title).toBe('Test Popup');
    expect(popup.size).toBe('medium');
    expect(popup.content).toBeDefined();
    expect(popup.data).toEqual({ testData: 'value' });
    expect(popup.onFilterClick).toBeUndefined();
    expect(popup.onDateChange).toBeUndefined();
    expect(popup.onClientChange).toBeUndefined();
    expect(popup.onReset).toBeUndefined();
    expect(popup.onToggleAdvanced).toBeUndefined();
  });

  it('should handle PopupItem with all optional properties', () => {
    const mockOnFilterClick = (index: number) => {};
    const mockOnDateChange = (value: string) => {};
    const mockOnClientChange = (value: string) => {};
    const mockOnReset = () => {};
    const mockOnToggleAdvanced = () => {};

    const popup: PopupItem = {
      id: 'test-popup',
      title: 'Test Popup',
      size: 'large',
      content: class MockComponent {},
      data: { testData: 'value' },
      onFilterClick: mockOnFilterClick,
      onDateChange: mockOnDateChange,
      onClientChange: mockOnClientChange,
      onReset: mockOnReset,
      onToggleAdvanced: mockOnToggleAdvanced
    };

    expect(popup.id).toBe('test-popup');
    expect(popup.title).toBe('Test Popup');
    expect(popup.size).toBe('large');
    expect(popup.content).toBeDefined();
    expect(popup.data).toEqual({ testData: 'value' });
    expect(popup.onFilterClick).toBe(mockOnFilterClick);
    expect(popup.onDateChange).toBe(mockOnDateChange);
    expect(popup.onClientChange).toBe(mockOnClientChange);
    expect(popup.onReset).toBe(mockOnReset);
    expect(popup.onToggleAdvanced).toBe(mockOnToggleAdvanced);
  });
});
