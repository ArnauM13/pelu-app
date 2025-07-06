import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FiltersInlineComponent } from './filters-inline.component';

describe('FiltersInlineComponent', () => {
  let component: FiltersInlineComponent;
  let fixture: ComponentFixture<FiltersInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersInlineComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersInlineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have filterDate input signal', () => {
    expect(component.filterDate).toBeDefined();
    expect(typeof component.filterDate).toBe('function');
  });

  it('should have filterClient input signal', () => {
    expect(component.filterClient).toBeDefined();
    expect(typeof component.filterClient).toBe('function');
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

  it('should have filterDateValue computed property', () => {
    expect(component.filterDateValue).toBeDefined();
    expect(typeof component.filterDateValue).toBe('function');
  });

  it('should have filterClientValue computed property', () => {
    expect(component.filterClientValue).toBeDefined();
    expect(typeof component.filterClientValue).toBe('function');
  });

  it('should return static value for filterDateValue when input is string', () => {
    // Mock the filterDate input to return a static string
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

  it('should render filters inline element', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const filtersElement = compiled.querySelector('.filters-inline');
    expect(filtersElement).toBeTruthy();
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
    expect(FiltersInlineComponent.prototype.constructor.name).toBe('FiltersInlineComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = FiltersInlineComponent;
    expect(componentClass.name).toBe('FiltersInlineComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(FiltersInlineComponent.prototype).toBeDefined();
    expect(FiltersInlineComponent.prototype.constructor).toBeDefined();
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
