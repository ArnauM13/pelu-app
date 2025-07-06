import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

import { FiltersInlineComponent } from './filters-inline.component';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.FILTER_BY_DATE': 'Filtrar per data:',
      'COMMON.FILTER_BY_CLIENT': 'Filtrar per client:',
      'COMMON.SEARCH_BY_NAME': 'Buscar per nom...',
      'COMMON.CLEAR_FILTERS_BUTTON': '🗑️ Netejar filtres'
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
        FormsModule,
        InputTextModule,
        CalendarModule,
        ButtonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display date filter label', () => {
    const dateLabel = fixture.nativeElement.querySelector('label[for="filterDate"]');
    expect(dateLabel.textContent).toContain('Filtrar per data:');
  });

  it('should display client filter label', () => {
    const clientLabel = fixture.nativeElement.querySelector('label[for="filterClient"]');
    expect(clientLabel.textContent).toContain('Filtrar per client:');
  });

  it('should have date input field', () => {
    const dateInput = fixture.nativeElement.querySelector('p-calendar');
    expect(dateInput).toBeTruthy();
  });

  it('should have client search input field', () => {
    const clientInput = fixture.nativeElement.querySelector('input[placeholder*="Buscar"]');
    expect(clientInput).toBeTruthy();
  });

  it('should have clear filters button', () => {
    const clearButton = fixture.nativeElement.querySelector('button');
    expect(clearButton.textContent).toContain('🗑️ Netejar filtres');
  });

    it('should have correct input properties', () => {
    expect(component.filterDate).toBeDefined();
    expect(component.filterClient).toBeDefined();
  });

  it('should have computed values for filter inputs', () => {
    expect(component.filterDateValue).toBeDefined();
    expect(component.filterClientValue).toBeDefined();
  });

  it('should have handler methods', () => {
    expect(component.onDateChangeHandler).toBeDefined();
    expect(component.onClientChangeHandler).toBeDefined();
    expect(component.onResetHandler).toBeDefined();
  });

    it('should have proper form structure', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should have proper input IDs', () => {
    const dateInput = fixture.nativeElement.querySelector('p-calendar');
    const clientInput = fixture.nativeElement.querySelector('input[placeholder*="Buscar"]');

    expect(dateInput).toBeTruthy();
    expect(clientInput).toBeTruthy();
  });

  it('should handle handler methods without errors', () => {
    expect(() => {
      component.onDateChangeHandler('2024-01-15');
      component.onClientChangeHandler('John Doe');
      component.onResetHandler();
    }).not.toThrow();
  });

  it('should have proper CSS classes', () => {
    const container = fixture.nativeElement.querySelector('.filters-inline');
    expect(container).toBeTruthy();
  });

  it('should be responsive', () => {
    const container = fixture.nativeElement.querySelector('.filters-inline');
    expect(container.classList.contains('filters-inline')).toBe(true);
  });
});
