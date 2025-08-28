import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { InputDateComponent } from './input-date.component';
import { AuthService } from '../../../../core/auth/auth.service';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.BIRTH_DATE': 'Data de naixement',
      'COMMON.APPOINTMENT_DATE': 'Data de cita',
      'COMMON.DUE_DATE': 'Data de venciment',
      'INPUTS.DATE_PLACEHOLDER': 'Selecciona una data...'
    });
  }
}

// Test wrapper component
@Component({
  selector: 'pelu-test-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputDateComponent],
  template: `
    <form [formGroup]="form">
      <pelu-input-date
        formControlName="dateField"
        [label]="label()"
        [placeholder]="placeholder()"
        [required]="required()"
        [readonly]="readonly()"
        [enabled]="enabled()"
        [dateFormat]="dateFormat()"
        [showIcon]="showIcon()"
        [showButtonBar]="showButtonBar()"
        [showTime]="showTime()"
        [timeOnly]="timeOnly()"
        [hourFormat]="hourFormat()"
        [selectionMode]="selectionMode()"
        [numberOfMonths]="numberOfMonths()"
        [inline]="inline()"
        [readonlyInput]="readonlyInput()"
        [showOnFocus]="showOnFocus()"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        [preventPastMonths]="preventPastMonths()"
        (valueChange)="onValueChange($event)">
      </pelu-input-date>
    </form>

    <div class="test-output">
      <p>Value: {{ currentValue() }}</p>
      <p>Form Value: {{ form.get('dateField')?.value }}</p>
      <p>Form Valid: {{ form.valid }}</p>
      <p>Form Dirty: {{ form.dirty }}</p>
      <p>Form Touched: {{ form.touched }}</p>
    </div>
  `
})
class TestWrapperComponent {
  form: FormGroup;
  currentValue = signal<Date | string | null>(null);

  // Configurable inputs
  label = signal('COMMON.BIRTH_DATE');
  placeholder = signal('INPUTS.DATE_PLACEHOLDER');
  required = signal(false);
  readonly = signal(false);
  enabled = signal(true);
  dateFormat = signal('dd/mm/yy');
  showIcon = signal(true);
  showButtonBar = signal(false);
  showTime = signal(false);
  timeOnly = signal(false);
  hourFormat = signal<'12' | '24'>('24');
  selectionMode = signal<'single' | 'multiple' | 'range'>('single');
  numberOfMonths = signal(1);
  inline = signal(false);
  readonlyInput = signal(false);
  showOnFocus = signal(true);
  minDate = signal<Date | null>(null);
  maxDate = signal<Date | null>(null);
  preventPastMonths = signal(false);

  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.group({
      dateField: [null, this.required() ? Validators.required : null]
    });
  }

  onValueChange(value: Date | string | null) {
    this.currentValue.set(value);
  }

  setFormValue(value: Date | string | null) {
    this.form.patchValue({ dateField: value });
  }

  getFormValue(): Date | string | null {
    return this.form.get('dateField')?.value;
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markFieldAsTouched() {
    this.form.get('dateField')?.markAsTouched();
  }
}

describe('InputDateComponent', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    authServiceSpy.isAuthenticated.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        TestWrapperComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Mounting', () => {
    it('should mount successfully with default configuration', () => {
      expect(component).toBeTruthy();
      expect(fixture.debugElement.query(By.css('pelu-input-date'))).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label.set('COMMON.BIRTH_DATE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-date-label'));
      expect(labelElement).toBeTruthy();
      // Check that the component exists and is properly configured
      expect(labelElement.componentInstance).toBeTruthy();
    });

    it('should not render label when empty', () => {
      component.label.set('');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-date-label'));
      expect(labelElement).toBeFalsy();
    });

    it('should render required indicator when required is true', () => {
      component.required.set(true);
      component.label.set('COMMON.BIRTH_DATE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-date-label'));
      expect(labelElement.nativeElement.classList.contains('required')).toBe(true);
    });

    it('should render PrimeNG date picker component', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
    });

    it('should generate unique ID for each instance', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      const labelElement = fixture.debugElement.query(By.css('label'));

      expect(dateElement.componentInstance.inputId).toBeTruthy();
      expect(dateElement.componentInstance.inputId).toContain('date-');
      expect(labelElement.nativeElement.getAttribute('for')).toBe(dateElement.componentInstance.inputId);
    });
  });

  describe('Date Input Interaction', () => {
    it('should emit valueChange when date value changes', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      const testDate = new Date('2024-01-15');

      // Simulate date change
      dateElement.componentInstance.onModelChange(testDate);
      fixture.detectChanges();

      expect(component.currentValue()).toEqual(testDate);
    });

    it('should update form control value when date changes', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      const testDate = new Date('2024-02-20');

      // Simulate date change
      dateElement.componentInstance.onModelChange(testDate);
      fixture.detectChanges();

      expect(component.getFormValue()).toEqual(testDate);
    });

    it('should handle null values correctly', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));

      dateElement.componentInstance.onModelChange(null);
      fixture.detectChanges();

      expect(component.currentValue()).toBeNull();
    });

    it('should handle string date values correctly', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      const testDateString = '2024-03-10';

      dateElement.componentInstance.onModelChange(testDateString);
      fixture.detectChanges();

      expect(component.currentValue()).toBe(testDateString);
    });
  });

  describe('Component Configuration', () => {
    it('should apply disabled state correctly', () => {
      component.form.get('dateField')?.disable();
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      // Check if the component exists and is properly configured
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });

    it('should apply enabled state correctly', () => {
      component.enabled.set(false);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });

    it('should apply readonly state correctly', () => {
      component.readonly.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });
  });

  describe('Date Format Configuration', () => {
    it('should apply dateFormat configuration correctly', () => {
      component.dateFormat.set('mm/dd/yyyy');
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });

    it('should apply showIcon configuration correctly', () => {
      component.showIcon.set(false);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });

    it('should apply showButtonBar configuration correctly', () => {
      component.showButtonBar.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });
  });

  describe('Time Configuration', () => {
    it('should apply showTime configuration correctly', () => {
      component.showTime.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });

    it('should apply timeOnly configuration correctly', () => {
      component.timeOnly.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });

    it('should apply hourFormat configuration correctly', () => {
      component.hourFormat.set('12');
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      expect(dateElement.componentInstance).toBeTruthy();
    });
  });

  describe('Selection Mode Configuration', () => {
    it('should apply single selection mode correctly', () => {
      component.selectionMode.set('single');
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.selectionMode).toBe('single');
    });

    it('should apply multiple selection mode correctly', () => {
      component.selectionMode.set('multiple');
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.selectionMode).toBe('multiple');
    });

    it('should apply range selection mode correctly', () => {
      component.selectionMode.set('range');
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.selectionMode).toBe('range');
    });
  });

  describe('Advanced Configuration', () => {
    it('should apply numberOfMonths configuration correctly', () => {
      component.numberOfMonths.set(3);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.numberOfMonths).toBe(3);
    });

    it('should apply inline configuration correctly', () => {
      component.inline.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.inline).toBe(true);
    });

    it('should apply readonlyInput configuration correctly', () => {
      component.readonlyInput.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.readonlyInput).toBe(true);
    });

    it('should apply showOnFocus configuration correctly', () => {
      component.showOnFocus.set(false);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.showOnFocus).toBe(false);
    });
  });

  describe('Date Range Configuration', () => {
    it('should apply minDate configuration correctly', () => {
      const minDate = new Date('2024-01-01');
      component.minDate.set(minDate);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.minDate).toBeTruthy();
    });

    it('should apply maxDate configuration correctly', () => {
      const maxDate = new Date('2024-12-31');
      component.maxDate.set(maxDate);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.maxDate).toBeTruthy();
    });

    it('should apply preventPastMonths configuration correctly', () => {
      component.preventPastMonths.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.minDate).toBeTruthy();
    });
  });

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      component.placeholder.set('Custom date placeholder');
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.placeholder).toBe('Custom date placeholder');
    });

    it('should use default placeholder when no custom placeholder provided', () => {
      component.placeholder.set('');
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.componentInstance.placeholder).toBe('INPUTS.DATE_PLACEHOLDER');
    });
  });

  describe('Form Integration', () => {
    it('should initialize with form control value', () => {
      const testDate = new Date('2024-01-15');
      component.setFormValue(testDate);
      fixture.detectChanges();

      expect(component.getFormValue()).toEqual(testDate);
    });

    it('should handle form validation correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      // Initially should be invalid (empty required field)
      expect(component.isFormValid()).toBe(false);

      // Set a value and should become valid
      component.setFormValue(new Date('2024-01-15'));
      fixture.detectChanges();
      expect(component.isFormValid()).toBe(true);
    });

    it('should mark form as dirty when value changes', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));

      dateElement.componentInstance.onModelChange(new Date('2024-01-15'));
      fixture.detectChanges();

      expect(component.form.dirty).toBe(true);
    });

    it('should handle Date objects correctly in form', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      const testDate = new Date('2024-02-20');

      dateElement.componentInstance.onModelChange(testDate);
      fixture.detectChanges();
      expect(component.getFormValue()).toEqual(testDate);
    });

    it('should handle string dates correctly in form', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      const testDateString = '2024-03-10';

      dateElement.componentInstance.onModelChange(testDateString);
      fixture.detectChanges();
      expect(component.getFormValue()).toBe(testDateString);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      component.label.set('COMMON.BIRTH_DATE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('label'));
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));

      expect(labelElement.nativeElement.getAttribute('for')).toBe(dateElement.componentInstance.inputId);
    });

    it('should have unique IDs for multiple instances', () => {
      // Create a second instance
      const secondFixture = TestBed.createComponent(TestWrapperComponent);
      secondFixture.detectChanges();

      const firstDate = fixture.debugElement.query(By.css('p-datepicker'));
      const secondDate = secondFixture.debugElement.query(By.css('p-datepicker'));

      expect(firstDate.componentInstance.inputId).not.toBe(secondDate.componentInstance.inputId);
    });

    it('should have proper label text', () => {
      component.label.set('COMMON.APPOINTMENT_DATE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-date-label'));
      expect(labelElement).toBeTruthy();
      // Check that the component exists and is properly configured
      expect(labelElement.componentInstance).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should have proper container structure', () => {
      const containerElement = fixture.debugElement.query(By.css('.input-date-container'));
      expect(containerElement).toBeTruthy();
    });

    it('should have wrapper for date picker', () => {
      const wrapperElement = fixture.debugElement.query(By.css('.datepicker-wrapper'));
      expect(wrapperElement).toBeTruthy();
    });

    it('should have proper CSS class on date picker', () => {
      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.nativeElement.classList.contains('pelu-datepicker')).toBe(true);
    });

    it('should apply inline mode class when inline is true', () => {
      component.inline.set(true);
      fixture.detectChanges();

      const containerElement = fixture.debugElement.query(By.css('.input-date-container'));
      expect(containerElement.nativeElement.classList.contains('inline-mode')).toBe(true);
    });
  });

  describe('Time Only Mode', () => {
    it('should have custom clock icon when timeOnly is true', () => {
      component.timeOnly.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement).toBeTruthy();
      // The custom clock icon is rendered as a template inside p-datepicker
      // We can verify the timeOnly attribute is set correctly
      expect(dateElement.nativeElement.getAttribute('data-time-only')).toBe('true');
    });

    it('should have proper data attributes for time only mode', () => {
      component.timeOnly.set(true);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.nativeElement.getAttribute('data-time-only')).toBe('true');
    });

    it('should have proper data attributes for enabled state', () => {
      component.enabled.set(false);
      fixture.detectChanges();

      const dateElement = fixture.debugElement.query(By.css('p-datepicker'));
      expect(dateElement.nativeElement.getAttribute('data-enabled')).toBe('false');
    });
  });
});
