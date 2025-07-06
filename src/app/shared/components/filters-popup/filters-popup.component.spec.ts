import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FiltersPopupComponent } from './filters-popup.component';

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-filters-popup
      [filterButtons]="testFilterButtons()"
      [filterDate]="testFilterDate()"
      [filterClient]="testFilterClient()"
      [showAdvancedFilters]="testShowAdvancedFilters()"
      [onFilterClick]="testOnFilterClick()"
      [onDateChange]="testOnDateChange()"
      [onClientChange]="testOnClientChange()"
      [onReset]="testOnReset()"
      [onToggleAdvanced]="testOnToggleAdvanced()">
    </pelu-filters-popup>
  `,
  imports: [FiltersPopupComponent],
  standalone: true
})
class TestWrapperComponent {
  testFilterButtons = signal<any[]>([]);
  testFilterDate = signal<string>('');
  testFilterClient = signal<string>('');
  testShowAdvancedFilters = signal<boolean>(false);
  testOnFilterClick = signal<Function | null>(null);
  testOnDateChange = signal<Function | null>(null);
  testOnClientChange = signal<Function | null>(null);
  testOnReset = signal<Function | null>(null);
  testOnToggleAdvanced = signal<Function | null>(null);
}

describe('FiltersPopupComponent', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let filtersPopupComponent: FiltersPopupComponent;

  const mockFilterButtons = [
    { label: 'Filter 1', active: true },
    { label: 'Filter 2', active: false },
    { label: 'Advanced', active: false }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
    component.testFilterButtons.set(mockFilterButtons);
    component.testFilterDate.set('2024-01-15');
    component.testFilterClient.set('John Doe');
    component.testShowAdvancedFilters.set(false);
    component.testOnFilterClick.set(() => {});
    component.testOnDateChange.set(() => {});
    component.testOnClientChange.set(() => {});
    component.testOnReset.set(() => {});
    component.testOnToggleAdvanced.set(() => {});
    fixture.detectChanges();

    filtersPopupComponent = fixture.debugElement.query(
      (de) => de.componentInstance instanceof FiltersPopupComponent
    ).componentInstance;
  });

  it('should create', () => {
    expect(filtersPopupComponent).toBeTruthy();
  });

  it('should have filterButtons input signal', () => {
    expect(filtersPopupComponent.filterButtons).toBeDefined();
    expect(typeof filtersPopupComponent.filterButtons).toBe('function');
  });

  it('should have filterDate input signal', () => {
    expect(filtersPopupComponent.filterDate).toBeDefined();
    expect(typeof filtersPopupComponent.filterDate).toBe('function');
  });

  it('should have filterClient input signal', () => {
    expect(filtersPopupComponent.filterClient).toBeDefined();
    expect(typeof filtersPopupComponent.filterClient).toBe('function');
  });

  it('should have showAdvancedFilters input signal', () => {
    expect(filtersPopupComponent.showAdvancedFilters).toBeDefined();
    expect(typeof filtersPopupComponent.showAdvancedFilters).toBe('function');
  });

  it('should have onFilterClick input signal', () => {
    expect(filtersPopupComponent.onFilterClick).toBeDefined();
    expect(typeof filtersPopupComponent.onFilterClick).toBe('function');
  });

  it('should have onDateChange input signal', () => {
    expect(filtersPopupComponent.onDateChange).toBeDefined();
    expect(typeof filtersPopupComponent.onDateChange).toBe('function');
  });

  it('should have onClientChange input signal', () => {
    expect(filtersPopupComponent.onClientChange).toBeDefined();
    expect(typeof filtersPopupComponent.onClientChange).toBe('function');
  });

  it('should have onReset input signal', () => {
    expect(filtersPopupComponent.onReset).toBeDefined();
    expect(typeof filtersPopupComponent.onReset).toBe('function');
  });

  it('should have onToggleAdvanced input signal', () => {
    expect(filtersPopupComponent.onToggleAdvanced).toBeDefined();
    expect(typeof filtersPopupComponent.onToggleAdvanced).toBe('function');
  });

  it('should have filterButtonsValue computed property', () => {
    expect(filtersPopupComponent.filterButtonsValue).toBeDefined();
    expect(typeof filtersPopupComponent.filterButtonsValue).toBe('function');
  });

  it('should have filterDateValue computed property', () => {
    expect(filtersPopupComponent.filterDateValue).toBeDefined();
    expect(typeof filtersPopupComponent.filterDateValue).toBe('function');
  });

  it('should have filterClientValue computed property', () => {
    expect(filtersPopupComponent.filterClientValue).toBeDefined();
    expect(typeof filtersPopupComponent.filterClientValue).toBe('function');
  });

  it('should have showAdvancedFiltersValue computed property', () => {
    expect(filtersPopupComponent.showAdvancedFiltersValue).toBeDefined();
    expect(typeof filtersPopupComponent.showAdvancedFiltersValue).toBe('function');
  });

  it('should return static value for filterButtonsValue when input is array', () => {
    spyOn(filtersPopupComponent, 'filterButtons').and.returnValue(mockFilterButtons);

    const result = filtersPopupComponent.filterButtonsValue();

    expect(result).toBe(mockFilterButtons);
  });

  it('should return signal value for filterButtonsValue when input is signal', () => {
    const mockSignal = signal(mockFilterButtons);
    spyOn(filtersPopupComponent, 'filterButtons').and.returnValue(mockSignal);

    const result = filtersPopupComponent.filterButtonsValue();

    expect(result).toBe(mockFilterButtons);
  });

  it('should return static value for filterDateValue when input is string', () => {
    spyOn(filtersPopupComponent, 'filterDate').and.returnValue('2024-01-15');

    const result = filtersPopupComponent.filterDateValue();

    expect(result).toBe('2024-01-15');
  });

  it('should return signal value for filterDateValue when input is signal', () => {
    const mockSignal = signal('2024-01-15');
    spyOn(filtersPopupComponent, 'filterDate').and.returnValue(mockSignal);

    const result = filtersPopupComponent.filterDateValue();

    expect(result).toBe('2024-01-15');
  });

  it('should return static value for filterClientValue when input is string', () => {
    spyOn(filtersPopupComponent, 'filterClient').and.returnValue('John Doe');

    const result = filtersPopupComponent.filterClientValue();

    expect(result).toBe('John Doe');
  });

  it('should return signal value for filterClientValue when input is signal', () => {
    const mockSignal = signal('John Doe');
    spyOn(filtersPopupComponent, 'filterClient').and.returnValue(mockSignal);

    const result = filtersPopupComponent.filterClientValue();

    expect(result).toBe('John Doe');
  });

  it('should return static value for showAdvancedFiltersValue when input is boolean', () => {
    spyOn(filtersPopupComponent, 'showAdvancedFilters').and.returnValue(true);

    const result = filtersPopupComponent.showAdvancedFiltersValue();

    expect(result).toBe(true);
  });

  it('should return signal value for showAdvancedFiltersValue when input is signal', () => {
    const mockSignal = signal(false);
    spyOn(filtersPopupComponent, 'showAdvancedFilters').and.returnValue(mockSignal);

    const result = filtersPopupComponent.showAdvancedFiltersValue();

    expect(result).toBe(false);
  });

  it('should call onFilterClick callback when onFilterClickHandler is called with non-last index', () => {
    const mockCallback = jasmine.createSpy('onFilterClick');
    spyOn(filtersPopupComponent, 'onFilterClick').and.returnValue(mockCallback);
    spyOn(filtersPopupComponent, 'filterButtonsValue').and.returnValue(mockFilterButtons);

    filtersPopupComponent.onFilterClickHandler(0);

    expect(mockCallback).toHaveBeenCalledWith(0);
  });

  it('should call onToggleAdvanced callback when onFilterClickHandler is called with last index', () => {
    const mockCallback = jasmine.createSpy('onToggleAdvanced');
    spyOn(filtersPopupComponent, 'onToggleAdvanced').and.returnValue(mockCallback);
    spyOn(filtersPopupComponent, 'filterButtonsValue').and.returnValue(mockFilterButtons);

    filtersPopupComponent.onFilterClickHandler(2); // Last index

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should not throw error when onFilterClick callback is undefined', () => {
    spyOn(filtersPopupComponent, 'onFilterClick').and.returnValue(undefined);
    spyOn(filtersPopupComponent, 'filterButtonsValue').and.returnValue(mockFilterButtons);

    expect(() => {
      filtersPopupComponent.onFilterClickHandler(0);
    }).not.toThrow();
  });

  it('should not throw error when onToggleAdvanced callback is undefined', () => {
    spyOn(filtersPopupComponent, 'onToggleAdvanced').and.returnValue(undefined);
    spyOn(filtersPopupComponent, 'filterButtonsValue').and.returnValue(mockFilterButtons);

    expect(() => {
      filtersPopupComponent.onFilterClickHandler(2);
    }).not.toThrow();
  });

  it('should call onDateChange callback when onDateChangeHandler is called', () => {
    const mockCallback = jasmine.createSpy('onDateChange');
    spyOn(filtersPopupComponent, 'onDateChange').and.returnValue(mockCallback);

    filtersPopupComponent.onDateChangeHandler('2024-01-16');

    expect(mockCallback).toHaveBeenCalledWith('2024-01-16');
  });

  it('should call onClientChange callback when onClientChangeHandler is called', () => {
    const mockCallback = jasmine.createSpy('onClientChange');
    spyOn(filtersPopupComponent, 'onClientChange').and.returnValue(mockCallback);

    filtersPopupComponent.onClientChangeHandler('Jane Doe');

    expect(mockCallback).toHaveBeenCalledWith('Jane Doe');
  });

  it('should call onReset callback when onResetHandler is called', () => {
    const mockCallback = jasmine.createSpy('onReset');
    spyOn(filtersPopupComponent, 'onReset').and.returnValue(mockCallback);

    filtersPopupComponent.onResetHandler();

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should render filters popup element', () => {
    const popupElement = fixture.nativeElement.querySelector('.filters-popup');
    expect(popupElement).toBeTruthy();
  });
});
