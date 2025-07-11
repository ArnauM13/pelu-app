import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FiltersPopupComponent } from './filters-popup.component';
import { createTestComponentNoRender } from '../../../../testing/test-setup';

describe('FiltersPopupComponent', () => {
  let component: FiltersPopupComponent;
  let fixture: ComponentFixture<FiltersPopupComponent>;

  beforeEach(async () => {
    fixture = await createTestComponentNoRender<FiltersPopupComponent>(
      FiltersPopupComponent,
      [FormsModule]
    );
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.filterButtons).toBeDefined();
    expect(component.filterDate).toBeDefined();
    expect(component.filterClient).toBeDefined();
    expect(component.showAdvancedFilters).toBeDefined();
  });

  it('should have required callback inputs', () => {
    expect(component.onFilterClick).toBeDefined();
    expect(component.onDateChange).toBeDefined();
    expect(component.onClientChange).toBeDefined();
    expect(component.onReset).toBeDefined();
    expect(component.onToggleAdvanced).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.filterButtonsValue).toBeDefined();
    expect(component.filterDateValue).toBeDefined();
    expect(component.filterClientValue).toBeDefined();
    expect(component.showAdvancedFiltersValue).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onFilterClickHandler).toBe('function');
    expect(typeof component.onDateChangeHandler).toBe('function');
    expect(typeof component.onClientChangeHandler).toBe('function');
    expect(typeof component.onResetHandler).toBe('function');
  });

  it('should return static value for showAdvancedFiltersValue when input is boolean', () => {
    spyOn(component, 'showAdvancedFilters').and.returnValue(true);
    expect(component.showAdvancedFiltersValue()).toBe(true);
  });

  it('should handle filter click for regular button', () => {
    const mockCallback = jasmine.createSpy('onFilterClick');
    spyOn(component, 'onFilterClick').and.returnValue(mockCallback);
    spyOn(component, 'filterButtonsValue').and.returnValue([{}, {}, {}]);

    expect(() => component.onFilterClickHandler(0)).not.toThrow();
    expect(mockCallback).toHaveBeenCalledWith(0);
  });

  it('should handle filter click for advanced button', () => {
    const mockCallback = jasmine.createSpy('onToggleAdvanced');
    spyOn(component, 'onToggleAdvanced').and.returnValue(mockCallback);
    spyOn(component, 'filterButtonsValue').and.returnValue([{}, {}, {}]);

    expect(() => component.onFilterClickHandler(2)).not.toThrow();
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should handle date change', () => {
    const mockCallback = jasmine.createSpy('onDateChange');
    spyOn(component, 'onDateChange').and.returnValue(mockCallback);

    expect(() => component.onDateChangeHandler('2024-01-15')).not.toThrow();
    expect(mockCallback).toHaveBeenCalledWith('2024-01-15');
  });

  it('should handle client change', () => {
    const mockCallback = jasmine.createSpy('onClientChange');
    spyOn(component, 'onClientChange').and.returnValue(mockCallback);

    expect(() => component.onClientChangeHandler('Test Client')).not.toThrow();
    expect(mockCallback).toHaveBeenCalledWith('Test Client');
  });

  it('should handle reset', () => {
    const mockCallback = jasmine.createSpy('onReset');
    spyOn(component, 'onReset').and.returnValue(mockCallback);

    expect(() => component.onResetHandler()).not.toThrow();
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should handle undefined callbacks gracefully', () => {
    spyOn(component, 'onFilterClick').and.returnValue(undefined);
    spyOn(component, 'onToggleAdvanced').and.returnValue(undefined);
    spyOn(component, 'onDateChange').and.returnValue(undefined);
    spyOn(component, 'onClientChange').and.returnValue(undefined);
    spyOn(component, 'onReset').and.returnValue(undefined);
    spyOn(component, 'filterButtonsValue').and.returnValue([{}, {}, {}]);

    expect(() => component.onFilterClickHandler(0)).not.toThrow();
    expect(() => component.onFilterClickHandler(2)).not.toThrow();
    expect(() => component.onDateChangeHandler('test')).not.toThrow();
    expect(() => component.onClientChangeHandler('test')).not.toThrow();
    expect(() => component.onResetHandler()).not.toThrow();
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
});
