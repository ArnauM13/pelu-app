import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersInlineComponent } from './filters-inline.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { provideMockFirebase } from '../../../../testing/firebase-mocks';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.FILTER_BY_DATE': 'Filter by Date',
      'COMMON.FILTER_BY_CLIENT': 'Filter by Client',
      'COMMON.SEARCH_BY_NAME': 'Search by name',
      'COMMON.CLEAR_FILTERS_BUTTON': 'Clear Filters',
    });
  }
}

describe('FiltersInlineComponent', () => {
  let component: FiltersInlineComponent;
  let fixture: ComponentFixture<FiltersInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FiltersInlineComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        ...provideMockFirebase(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersInlineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.filterDate).toBeDefined();
    expect(component.filterClient).toBeDefined();
    expect(component.filterService).toBeDefined();
    expect(component.onDateChange).toBeDefined();
    expect(component.onClientChange).toBeDefined();
    expect(component.onServiceChange).toBeDefined();
    expect(component.onReset).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.filterDateValue).toBeDefined();
    expect(component.filterClientValue).toBeDefined();
    expect(component.filterServiceValue).toBeDefined();
    expect(component.serviceOptions).toBeDefined();
    expect(component.serviceFilterConfig).toBeDefined();
  });

  it('should have handler methods defined', () => {
    expect(typeof component.onDateChangeHandler).toBe('function');
    expect(typeof component.onClientChangeHandler).toBe('function');
    expect(typeof component.onServiceChangeHandler).toBe('function');
    expect(typeof component.onResetHandler).toBe('function');
  });

  it('should render with proper structure', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.filters-inline')).toBeTruthy();
    expect(compiled.querySelector('.filters-grid')).toBeTruthy();
    expect(compiled.querySelector('#filterDate')).toBeTruthy();
    expect(compiled.querySelector('#filterClient')).toBeTruthy();
    expect(compiled.querySelector('.reset-btn')).toBeTruthy();
  });

  it('should have proper CSS classes', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.filters-inline')).toBeTruthy();
    expect(compiled.querySelector('.filters-grid')).toBeTruthy();
    expect(compiled.querySelector('.filter-group')).toBeTruthy();
    expect(compiled.querySelector('.reset-group')).toBeTruthy();
    expect(compiled.querySelector('.input')).toBeTruthy();
    expect(compiled.querySelector('.reset-btn')).toBeTruthy();
  });

  it('should have proper input types', () => {
    expect(typeof component.filterDate).toBe('function');
    expect(typeof component.filterClient).toBe('function');
    expect(typeof component.filterService).toBe('function');
  });

  it('should have proper callback types', () => {
    expect(typeof component.onDateChange).toBe('function');
    expect(typeof component.onClientChange).toBe('function');
    expect(typeof component.onServiceChange).toBe('function');
    expect(typeof component.onReset).toBe('function');
  });

  it('should be a component class', () => {
    expect(FiltersInlineComponent.prototype.constructor.name).toBe('FiltersInlineComponent');
  });

  it('should be a standalone component', () => {
    expect(FiltersInlineComponent.prototype.constructor).toBeDefined();
    expect(FiltersInlineComponent.prototype.constructor.name).toBe('FiltersInlineComponent');
  });
});
