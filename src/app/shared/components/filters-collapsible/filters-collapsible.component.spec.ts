import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FiltersCollapsibleComponent } from './filters-collapsible.component';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';
import { of } from 'rxjs';
import { signal } from '@angular/core';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.FILTERS.TITLE': 'Filters',
      'COMMON.FILTERS.EXPAND': 'Expand',
      'COMMON.FILTERS.COLLAPSE': 'Collapse',
      'COMMON.FILTERS.CLEAR_FILTERS_BUTTON': 'Clear Filters',
      'COMMON.REMOVE_FILTER': 'Remove Filter',
      'APPOINTMENTS.MESSAGES.TODAY_APPOINTMENTS_FILTER': 'Today',
      'APPOINTMENTS.MESSAGES.UPCOMING_APPOINTMENTS_FILTER': 'Upcoming',
      'APPOINTMENTS.MESSAGES.PAST_APPOINTMENTS_FILTER': 'Past',
      'APPOINTMENTS.MESSAGES.MY_APPOINTMENTS_FILTER': 'Mine',
      'COMMON.FILTERS.DATE_FILTER': 'Date Filter',
      'COMMON.FILTERS.CLIENT_FILTER': 'Client Filter',
      'COMMON.FILTERS.SERVICE_FILTER': 'Service Filter',
    });
  }
}

describe('FiltersCollapsibleComponent', () => {
  let component: FiltersCollapsibleComponent;
  let fixture: ComponentFixture<FiltersCollapsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FiltersCollapsibleComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        ...provideMockFirebase(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersCollapsibleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.stats).toBeDefined();
    expect(component.filterDate).toBeDefined();
    expect(component.filterClient).toBeDefined();
    expect(component.filterService).toBeDefined();
    expect(component.hasActiveFilters).toBeDefined();
    expect(component.quickFilter).toBeDefined();
  });

  it('should have callback inputs', () => {
    expect(component.onDateChange).toBeDefined();
    expect(component.onClientChange).toBeDefined();
    expect(component.onServiceChange).toBeDefined();
    expect(component.onReset).toBeDefined();
  });

  it('should have output events', () => {
    expect(component.quickFilterChange).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.isCollapsed).toBeDefined();
    expect(component.filterDateValue).toBeDefined();
    expect(component.filterClientValue).toBeDefined();
    expect(component.filterServiceValue).toBeDefined();
    expect(component.activeFiltersChips).toBeDefined();
  });

  it('should have methods', () => {
    expect(component.toggleCollapse).toBeDefined();
    expect(component.removeFilter).toBeDefined();
  });

  it('should render with proper structure', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('pelu-card')).toBeTruthy();
    expect(compiled.querySelector('.filters-header')).toBeTruthy();
    expect(compiled.querySelector('.header-left')).toBeTruthy();
    expect(compiled.querySelector('.header-center')).toBeTruthy();
    expect(compiled.querySelector('.header-right')).toBeTruthy();
  });

  it('should handle collapse/expand functionality', () => {
    fixture.detectChanges();

    // Initially collapsed
    expect(component.isCollapsed()).toBe(true);

    // Toggle to expand
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(false);

    // Toggle to collapse
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(true);
  });

  it('should handle active filter chips for quick filters', () => {
    // Set up quick filters
    const mockStats = {
      total: 10,
      today: 3,
      upcoming: 5,
      past: 2,
      mine: 1
    };

    // Mock the component inputs
    component.stats.set(mockStats);
    component.quickFilter.set('today,upcoming');
    component.filterDate.set('');
    component.filterClient.set('');
    component.filterService.set('');

    fixture.detectChanges();

    const chips = component.activeFiltersChips();
    expect(chips.length).toBe(2);

    const todayChip = chips.find(chip => chip.value === 'today');
    const upcomingChip = chips.find(chip => chip.value === 'upcoming');

    expect(todayChip).toBeDefined();
    expect(upcomingChip).toBeDefined();
    expect(todayChip?.type).toBe('quick');
    expect(upcomingChip?.type).toBe('quick');
  });

  it('should handle active filter chips for individual filters', () => {
    // Set up individual filters
    component.stats.set({ total: 10, today: 3, upcoming: 5, past: 2, mine: 1 });
    component.quickFilter.set('');
    component.filterDate.set('2024-01-15');
    component.filterClient.set('John');
    component.filterService.set('service1');

    fixture.detectChanges();

    const chips = component.activeFiltersChips();
    expect(chips.length).toBe(3);

    const dateChip = chips.find(chip => chip.type === 'date');
    const clientChip = chips.find(chip => chip.type === 'client');
    const serviceChip = chips.find(chip => chip.type === 'service');

    expect(dateChip).toBeDefined();
    expect(clientChip).toBeDefined();
    expect(serviceChip).toBeDefined();
  });

  it('should handle mixed filter chips', () => {
    // Set up mixed filters
    component.stats.set({ total: 10, today: 3, upcoming: 5, past: 2, mine: 1 });
    component.quickFilter.set('today');
    component.filterDate.set('2024-01-15');
    component.filterClient.set('');

    fixture.detectChanges();

    const chips = component.activeFiltersChips();
    expect(chips.length).toBe(2);

    const quickChip = chips.find(chip => chip.type === 'quick');
    const dateChip = chips.find(chip => chip.type === 'date');

    expect(quickChip).toBeDefined();
    expect(dateChip).toBeDefined();
  });

  it('should handle filter removal for quick filters', () => {
    const spy = spyOn(component.quickFilterChange, 'emit');

    const chip = {
      id: 'quick-today',
      type: 'quick' as const,
      icon: '🎯',
      label: 'Today',
      value: 'today'
    };

    component.removeFilter(chip);

    expect(spy).toHaveBeenCalledWith('today');
  });

  it('should handle filter removal for date filter', () => {
    const spy = spyOn(component.onDateChange(), 'call');

    const chip = {
      id: 'date-filter',
      type: 'date' as const,
      icon: '📅',
      label: 'Date Filter',
      value: '2024-01-15'
    };

    component.removeFilter(chip);

    expect(spy).toHaveBeenCalledWith('');
  });

  it('should handle filter removal for client filter', () => {
    const spy = spyOn(component.onClientChange(), 'call');

    const chip = {
      id: 'client-filter',
      type: 'client' as const,
      icon: '👤',
      label: 'Client Filter',
      value: 'John'
    };

    component.removeFilter(chip);

    expect(spy).toHaveBeenCalledWith('');
  });

  it('should handle filter removal for service filter', () => {
    const spy = spyOn(component.onServiceChange(), 'call');

    const chip = {
      id: 'service-filter',
      type: 'service' as const,
      icon: '✂️',
      label: 'Service Filter',
      value: 'service1'
    };

    component.removeFilter(chip);

    expect(spy).toHaveBeenCalledWith('');
  });

  it('should render reset button in correct position', () => {
    // Set up component to be expanded
    component.stats.set({ total: 10, today: 3, upcoming: 5, past: 2, mine: 1 });
    component.toggleCollapse(); // Expand the component

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const resetButton = compiled.querySelector('.reset-button-container');
    expect(resetButton).toBeTruthy();

    const button = resetButton.querySelector('p-button');
    expect(button).toBeTruthy();
  });

  it('should handle reset button click', () => {
    const spy = spyOn(component.onReset(), 'call');

    // Set up component to be expanded
    component.stats.set({ total: 10, today: 3, upcoming: 5, past: 2, mine: 1 });
    component.toggleCollapse(); // Expand the component

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const resetButton = compiled.querySelector('.reset-button-container p-button');

    // Simulate button click
    resetButton.dispatchEvent(new Event('onClick'));

    expect(spy).toHaveBeenCalled();
  });

  it('should handle signal inputs correctly', () => {
    const dateSignal = signal('2024-01-15');
    const clientSignal = signal('John');
    const serviceSignal = signal('service1');

    component.filterDate.set(dateSignal);
    component.filterClient.set(clientSignal);
    component.filterService.set(serviceSignal);

    fixture.detectChanges();

    expect(component.filterDateValue()).toBe('2024-01-15');
    expect(component.filterClientValue()).toBe('John');
    expect(component.filterServiceValue()).toBe('service1');
  });

  it('should handle string inputs correctly', () => {
    component.filterDate.set('2024-01-15');
    component.filterClient.set('John');
    component.filterService.set('service1');

    fixture.detectChanges();

    expect(component.filterDateValue()).toBe('2024-01-15');
    expect(component.filterClientValue()).toBe('John');
    expect(component.filterServiceValue()).toBe('service1');
  });
});
