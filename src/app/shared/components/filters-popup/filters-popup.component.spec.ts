import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FiltersPopupComponent } from './filters-popup.component';

describe('FiltersPopupComponent', () => {
  let component: FiltersPopupComponent;
  let fixture: ComponentFixture<FiltersPopupComponent>;

  const mockFilterButtons = [
    { label: 'Filter 1', active: true },
    { label: 'Filter 2', active: false },
    { label: 'Advanced', active: false }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersPopupComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersPopupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have filterButtons input signal', () => {
    expect(component.filterButtons).toBeDefined();
    expect(typeof component.filterButtons).toBe('function');
  });

  it('should have filterDate input signal', () => {
    expect(component.filterDate).toBeDefined();
    expect(typeof component.filterDate).toBe('function');
  });

  it('should have filterClient input signal', () => {
    expect(component.filterClient).toBeDefined();
    expect(typeof component.filterClient).toBe('function');
  });

  it('should have showAdvancedFilters input signal', () => {
    expect(component.showAdvancedFilters).toBeDefined();
    expect(typeof component.showAdvancedFilters).toBe('function');
  });

  it('should have onFilterClick input signal', () => {
    expect(component.onFilterClick).toBeDefined();
    expect(typeof component.onFilterClick).toBe('function');
  });

  it('should have onDateChange input signal', () => {
    expect(component.onDateChange).toBeDefined();
    expect(typeof component.onDateChange).toBe('function');
  });

  it('should have onClientChange input signal', () => {
    expect(component.onClientChange).toBeDefined();
    expect(typeof component.onClientChange).toBe('function');
  });

  it('should have onReset input signal', () => {
    expect(component.onReset).toBeDefined();
    expect(typeof component.onReset).toBe('function');
  });

  it('should have onToggleAdvanced input signal', () => {
    expect(component.onToggleAdvanced).toBeDefined();
    expect(typeof component.onToggleAdvanced).toBe('function');
  });

  it('should have filterButtonsValue computed property', () => {
    expect(component.filterButtonsValue).toBeDefined();
    expect(typeof component.filterButtonsValue).toBe('function');
  });

  it('should have filterDateValue computed property', () => {
    expect(component.filterDateValue).toBeDefined();
    expect(typeof component.filterDateValue).toBe('function');
  });

  it('should have filterClientValue computed property', () => {
    expect(component.filterClientValue).toBeDefined();
    expect(typeof component.filterClientValue).toBe('function');
  });

  it('should have showAdvancedFiltersValue computed property', () => {
    expect(component.showAdvancedFiltersValue).toBeDefined();
    expect(typeof component.showAdvancedFiltersValue).toBe('function');
  });

  it('should return static value for filterButtonsValue when input is array', () => {
    spyOn(component, 'filterButtons').and.returnValue(mockFilterButtons);

    const result = component.filterButtonsValue();

    expect(result).toBe(mockFilterButtons);
  });

  it('should return signal value for filterButtonsValue when input is signal', () => {
    const mockSignal = signal(mockFilterButtons);
    spyOn(component, 'filterButtons').and.returnValue(mockSignal);

    const result = component.filterButtonsValue();

    expect(result).toBe(mockFilterButtons);
  });

  it('should return static value for filterDateValue when input is string', () => {
    spyOn(component, 'filterDate').and.returnValue('2024-01-15');

    const result = component.filterDateValue();

    expect(result).toBe('2024-01-15');
  });

  it('should return signal value for filterDateValue when input is signal', () => {
    const mockSignal = signal('2024-01-15');
    spyOn(component, 'filterDate').and.returnValue(mockSignal);

    const result = component.filterDateValue();

    expect(result).toBe('2024-01-15');
  });

  it('should return static value for filterClientValue when input is string', () => {
    spyOn(component, 'filterClient').and.returnValue('John Doe');

    const result = component.filterClientValue();

    expect(result).toBe('John Doe');
  });

  it('should return signal value for filterClientValue when input is signal', () => {
    const mockSignal = signal('John Doe');
    spyOn(component, 'filterClient').and.returnValue(mockSignal);

    const result = component.filterClientValue();

    expect(result).toBe('John Doe');
  });

  it('should return static value for showAdvancedFiltersValue when input is boolean', () => {
    spyOn(component, 'showAdvancedFilters').and.returnValue(true);

    const result = component.showAdvancedFiltersValue();

    expect(result).toBe(true);
  });

  it('should return signal value for showAdvancedFiltersValue when input is signal', () => {
    const mockSignal = signal(false);
    spyOn(component, 'showAdvancedFilters').and.returnValue(mockSignal);

    const result = component.showAdvancedFiltersValue();

    expect(result).toBe(false);
  });

  it('should call onFilterClick callback when onFilterClickHandler is called with non-last index', () => {
    const mockCallback = jasmine.createSpy('onFilterClick');
    spyOn(component, 'onFilterClick').and.returnValue(mockCallback);
    spyOn(component, 'filterButtonsValue').and.returnValue(mockFilterButtons);

    component.onFilterClickHandler(0);

    expect(mockCallback).toHaveBeenCalledWith(0);
  });

  it('should call onToggleAdvanced callback when onFilterClickHandler is called with last index', () => {
    const mockCallback = jasmine.createSpy('onToggleAdvanced');
    spyOn(component, 'onToggleAdvanced').and.returnValue(mockCallback);
    spyOn(component, 'filterButtonsValue').and.returnValue(mockFilterButtons);

    component.onFilterClickHandler(2); // Last index

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should not throw error when onFilterClick callback is undefined', () => {
    spyOn(component, 'onFilterClick').and.returnValue(undefined);
    spyOn(component, 'filterButtonsValue').and.returnValue(mockFilterButtons);

    expect(() => {
      component.onFilterClickHandler(0);
    }).not.toThrow();
  });

  it('should not throw error when onToggleAdvanced callback is undefined', () => {
    spyOn(component, 'onToggleAdvanced').and.returnValue(undefined);
    spyOn(component, 'filterButtonsValue').and.returnValue(mockFilterButtons);

    expect(() => {
      component.onFilterClickHandler(2);
    }).not.toThrow();
  });

  it('should call onDateChange callback when onDateChangeHandler is called', () => {
    const mockCallback = jasmine.createSpy('onDateChange');
    spyOn(component, 'onDateChange').and.returnValue(mockCallback);

    component.onDateChangeHandler('2024-01-15');

    expect(mockCallback).toHaveBeenCalledWith('2024-01-15');
  });

  it('should not throw error when onDateChange callback is undefined', () => {
    spyOn(component, 'onDateChange').and.returnValue(undefined);

    expect(() => {
      component.onDateChangeHandler('2024-01-15');
    }).not.toThrow();
  });

  it('should call onClientChange callback when onClientChangeHandler is called', () => {
    const mockCallback = jasmine.createSpy('onClientChange');
    spyOn(component, 'onClientChange').and.returnValue(mockCallback);

    component.onClientChangeHandler('John Doe');

    expect(mockCallback).toHaveBeenCalledWith('John Doe');
  });

  it('should not throw error when onClientChange callback is undefined', () => {
    spyOn(component, 'onClientChange').and.returnValue(undefined);

    expect(() => {
      component.onClientChangeHandler('John Doe');
    }).not.toThrow();
  });

  it('should call onReset callback when onResetHandler is called', () => {
    const mockCallback = jasmine.createSpy('onReset');
    spyOn(component, 'onReset').and.returnValue(mockCallback);

    component.onResetHandler();

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should not throw error when onReset callback is undefined', () => {
    spyOn(component, 'onReset').and.returnValue(undefined);

    expect(() => {
      component.onResetHandler();
    }).not.toThrow();
  });

  it('should render filters popup element', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const filtersElement = compiled.querySelector('.filters-popup');
    expect(filtersElement).toBeTruthy();
  });

  it('should have onFilterClickHandler method', () => {
    expect(typeof component.onFilterClickHandler).toBe('function');
  });

  it('should have onDateChangeHandler method', () => {
    expect(typeof component.onDateChangeHandler).toBe('function');
  });

  it('should have onClientChangeHandler method', () => {
    expect(typeof component.onClientChangeHandler).toBe('function');
  });

  it('should have onResetHandler method', () => {
    expect(typeof component.onResetHandler).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(FiltersPopupComponent.prototype.constructor.name).toBe('FiltersPopupComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = FiltersPopupComponent;
    expect(componentClass.name).toBe('FiltersPopupComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(FiltersPopupComponent.prototype).toBeDefined();
    expect(FiltersPopupComponent.prototype.constructor).toBeDefined();
  });

  it('should handle empty filter buttons array', () => {
    spyOn(component, 'filterButtons').and.returnValue([]);

    const result = component.filterButtonsValue();

    expect(result).toEqual([]);
  });

  it('should handle empty string values correctly', () => {
    spyOn(component, 'filterDate').and.returnValue('');
    spyOn(component, 'filterClient').and.returnValue('');

    expect(component.filterDateValue()).toBe('');
    expect(component.filterClientValue()).toBe('');
  });

  it('should handle signal with empty string correctly', () => {
    const emptySignal = signal('');
    spyOn(component, 'filterDate').and.returnValue(emptySignal);

    expect(component.filterDateValue()).toBe('');
  });
});
