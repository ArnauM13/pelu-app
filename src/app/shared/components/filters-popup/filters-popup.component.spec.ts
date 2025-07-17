import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersPopupComponent } from './filters-popup.component';
import { configureTestBed, resetMocks, setupDefaultMocks } from '../../../../testing/test-setup';
import { signal, Component } from '@angular/core';

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-filters-popup
      [filterButtons]="filterButtons()"
      [filterDate]="filterDate()"
      [filterClient]="filterClient()"
      [showAdvancedFilters]="showAdvancedFilters()"
      [onFilterClick]="onFilterClick"
      [onDateChange]="onDateChange"
      [onClientChange]="onClientChange"
      [onReset]="onReset"
      [onToggleAdvanced]="onToggleAdvanced">
    </pelu-filters-popup>
  `,
  imports: [FiltersPopupComponent],
  standalone: true
})
class TestWrapperComponent {
  filterButtons = signal([{}, {}, {}]);
  filterDate = signal('');
  filterClient = signal('');
  showAdvancedFilters = signal(false);

  onFilterClick = (index: number) => {};
  onDateChange = (value: string) => {};
  onClientChange = (value: string) => {};
  onReset = () => {};
  onToggleAdvanced = () => {};
}

describe('FiltersPopupComponent', () => {
  let component: FiltersPopupComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let wrapperComponent: TestWrapperComponent;

  beforeEach(async () => {
    setupDefaultMocks();

    await configureTestBed([TestWrapperComponent]).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;

    resetMocks();
    fixture.detectChanges();
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

  it('should handle filter click for regular button', () => {
    const mockCallback = jasmine.createSpy('onFilterClick');
    wrapperComponent.onFilterClick = mockCallback;

    fixture.detectChanges();

    component.onFilterClickHandler(0);
    expect(mockCallback).toHaveBeenCalledWith(0);
  });

  it('should handle filter click for advanced button', () => {
    const mockCallback = jasmine.createSpy('onToggleAdvanced');
    wrapperComponent.onToggleAdvanced = mockCallback;

    fixture.detectChanges();

    component.onFilterClickHandler(2);
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should handle date change', () => {
    const mockCallback = jasmine.createSpy('onDateChange');
    wrapperComponent.onDateChange = mockCallback;

    fixture.detectChanges();

    component.onDateChangeHandler('2024-01-15');
    expect(mockCallback).toHaveBeenCalledWith('2024-01-15');
  });

  it('should handle client change', () => {
    const mockCallback = jasmine.createSpy('onClientChange');
    wrapperComponent.onClientChange = mockCallback;

    fixture.detectChanges();

    component.onClientChangeHandler('Test Client');
    expect(mockCallback).toHaveBeenCalledWith('Test Client');
  });

  it('should handle reset', () => {
    const mockCallback = jasmine.createSpy('onReset');
    wrapperComponent.onReset = mockCallback;

    fixture.detectChanges();

    component.onResetHandler();
    expect(mockCallback).toHaveBeenCalled();
  });
});
