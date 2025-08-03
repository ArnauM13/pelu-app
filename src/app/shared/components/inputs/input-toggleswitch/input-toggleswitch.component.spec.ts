import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { InputToggleSwitchComponent } from './input-toggleswitch.component';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.FAVORITE': 'Favorit',
      'COMMON.NOTIFICATIONS': 'Notificacions',
      'COMMON.AUTO_SAVE': 'Desat automàtic',
      'INPUTS.TOGGLE_HELP': 'Activa o desactiva aquesta opció'
    });
  }
}

// Test wrapper component
@Component({
  selector: 'pelu-test-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputToggleSwitchComponent],
  template: `
    <form [formGroup]="form">
      <pelu-input-toggleswitch
        formControlName="toggleField"
        [label]="label()"
        [disabled]="disabled()"
        [required]="required()"
        [readonly]="readonly()"
        [invalid]="invalid()"
        [name]="name()"
        [styleClass]="styleClass()"
        [tabindex]="tabindex()"
        [trueValue]="trueValue()"
        [falseValue]="falseValue()"
        [helpText]="helpText()"
        [errorText]="errorText()"
        [successText]="successText()"
        (valueChange)="onValueChange($event)">
      </pelu-input-toggleswitch>
    </form>

    <div class="test-output">
      <p>Value: {{ currentValue() }}</p>
      <p>Form Value: {{ form.get('toggleField')?.value }}</p>
      <p>Form Valid: {{ form.valid }}</p>
      <p>Form Dirty: {{ form.dirty }}</p>
      <p>Form Touched: {{ form.touched }}</p>
    </div>
  `
})
class TestWrapperComponent {
  form: FormGroup;
  currentValue = signal<any>(false);

  // Configurable inputs
  label = signal('COMMON.FAVORITE');
  disabled = signal(false);
  required = signal(false);
  readonly = signal(false);
  invalid = signal(false);
  name = signal('');
  styleClass = signal('');
  tabindex = signal<number | null>(null);
  trueValue = signal<any>(true);
  falseValue = signal<any>(false);
  helpText = signal('');
  errorText = signal('');
  successText = signal('');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      toggleField: [false, this.required() ? Validators.required : null]
    });
  }

  onValueChange(value: any) {
    this.currentValue.set(value);
  }

  setFormValue(value: any) {
    this.form.patchValue({ toggleField: value });
  }

  getFormValue(): any {
    return this.form.get('toggleField')?.value;
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markFieldAsTouched() {
    this.form.get('toggleField')?.markAsTouched();
  }
}

describe('InputToggleSwitchComponent', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestWrapperComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Mounting', () => {
    it('should mount successfully with default configuration', () => {
      expect(component).toBeTruthy();
      expect(fixture.debugElement.query(By.css('pelu-input-toggleswitch'))).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label.set('COMMON.FAVORITE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-toggleswitch-label'));
      expect(labelElement).toBeTruthy();
      expect(labelElement.nativeElement.textContent.trim()).toBe('Favorit');
    });

    it('should not render label when empty', () => {
      component.label.set('');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-toggleswitch-label'));
      expect(labelElement).toBeFalsy();
    });

    it('should render required indicator when required is true', () => {
      component.required.set(true);
      component.label.set('COMMON.FAVORITE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-toggleswitch-label'));
      expect(labelElement.nativeElement.classList.contains('required')).toBe(true);
    });

    it('should render PrimeNG toggle switch component', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement).toBeTruthy();
    });

    it('should generate unique ID for each instance', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      const labelElement = fixture.debugElement.query(By.css('label'));

      expect(toggleElement.nativeElement.getAttribute('inputId')).toBeTruthy();
      expect(toggleElement.nativeElement.getAttribute('inputId')).toContain('toggleswitch-');
      expect(labelElement.nativeElement.getAttribute('for')).toBe(toggleElement.nativeElement.getAttribute('inputId'));
    });
  });

  describe('Toggle Switch Input Interaction', () => {
    it('should emit valueChange when toggle state changes', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      // Simulate toggle change
      toggleElement.componentInstance.onModelChange(true);
      fixture.detectChanges();

      expect(component.currentValue()).toBe(true);
    });

    it('should update form control value when toggle changes', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      // Simulate toggle change
      toggleElement.componentInstance.onModelChange(false);
      fixture.detectChanges();

      expect(component.getFormValue()).toBe(false);
    });

    it('should handle both true and false values correctly', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      // Test true value
      toggleElement.componentInstance.onModelChange(true);
      fixture.detectChanges();
      expect(component.currentValue()).toBe(true);

      // Test false value
      toggleElement.componentInstance.onModelChange(false);
      fixture.detectChanges();
      expect(component.currentValue()).toBe(false);
    });

    it('should handle blur event correctly', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      toggleElement.componentInstance.onBlur(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.get('toggleField')?.touched).toBe(true);
    });
  });

  describe('Component Configuration', () => {
    it('should apply disabled state correctly', () => {
      component.disabled.set(true);
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('disabled')).toBe('true');
    });

    it('should apply required state correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('required')).toBe('true');
    });

    it('should apply readonly state correctly', () => {
      component.readonly.set(true);
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('readonly')).toBe('true');
    });

    it('should apply invalid state correctly', () => {
      component.invalid.set(true);
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('invalid')).toBe('true');
    });
  });

  describe('Toggle Switch Specific Properties', () => {
    it('should apply name configuration correctly', () => {
      component.name.set('test-toggle');
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('name')).toBe('test-toggle');
    });

    it('should apply styleClass configuration correctly', () => {
      component.styleClass.set('custom-toggle');
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('styleclass')).toBe('custom-toggle');
    });

    it('should apply tabindex configuration correctly', () => {
      component.tabindex.set(1);
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('tabindex')).toBe('1');
    });

    it('should apply trueValue configuration correctly', () => {
      component.trueValue.set('ON');
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('truevalue')).toBe('ON');
    });

    it('should apply falseValue configuration correctly', () => {
      component.falseValue.set('OFF');
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.getAttribute('falsevalue')).toBe('OFF');
    });

    it('should handle custom true/false values correctly', () => {
      component.trueValue.set('ACTIVE');
      component.falseValue.set('INACTIVE');
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      // Test with custom values
      toggleElement.componentInstance.onModelChange('ACTIVE');
      fixture.detectChanges();
      expect(component.currentValue()).toBe('ACTIVE');

      toggleElement.componentInstance.onModelChange('INACTIVE');
      fixture.detectChanges();
      expect(component.currentValue()).toBe('INACTIVE');
    });
  });

  describe('Text Display', () => {
    it('should display help text when provided', () => {
      component.helpText.set('Això és un text d\'ajuda');
      fixture.detectChanges();

      const helpElement = fixture.debugElement.query(By.css('.input-help'));
      expect(helpElement).toBeTruthy();
      expect(helpElement.nativeElement.textContent.trim()).toBe('Això és un text d\'ajuda');
    });

    it('should display error text when provided', () => {
      component.errorText.set('Això és un error');
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('.input-error'));
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent.trim()).toBe('Això és un error');
    });

    it('should display success text when provided', () => {
      component.successText.set('Això és un èxit');
      fixture.detectChanges();

      const successElement = fixture.debugElement.query(By.css('.input-success'));
      expect(successElement).toBeTruthy();
      expect(successElement.nativeElement.textContent.trim()).toBe('Això és un èxit');
    });

    it('should not display text elements when not provided', () => {
      component.helpText.set('');
      component.errorText.set('');
      component.successText.set('');
      fixture.detectChanges();

      const helpElement = fixture.debugElement.query(By.css('.input-help'));
      const errorElement = fixture.debugElement.query(By.css('.input-error'));
      const successElement = fixture.debugElement.query(By.css('.input-success'));

      expect(helpElement).toBeFalsy();
      expect(errorElement).toBeFalsy();
      expect(successElement).toBeFalsy();
    });
  });

  describe('Form Integration', () => {
    it('should initialize with form control value', () => {
      component.setFormValue(true);
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.componentInstance.value).toBe(true);
    });

    it('should handle form validation correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      // Initially should be invalid (empty required field)
      expect(component.isFormValid()).toBe(false);

      // Set a value and should become valid
      component.setFormValue(true);
      fixture.detectChanges();
      expect(component.isFormValid()).toBe(true);
    });

    it('should mark form as dirty when value changes', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      toggleElement.componentInstance.onModelChange(true);
      fixture.detectChanges();

      expect(component.form.dirty).toBe(true);
    });

    it('should mark form as touched when input loses focus', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      toggleElement.componentInstance.onBlur(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.touched).toBe(true);
    });

    it('should handle boolean values correctly in form', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      // Test true value
      toggleElement.componentInstance.onModelChange(true);
      fixture.detectChanges();
      expect(component.getFormValue()).toBe(true);

      // Test false value
      toggleElement.componentInstance.onModelChange(false);
      fixture.detectChanges();
      expect(component.getFormValue()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      component.label.set('COMMON.FAVORITE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('label'));
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      expect(labelElement.nativeElement.getAttribute('for')).toBe(toggleElement.nativeElement.getAttribute('inputId'));
    });

    it('should have unique IDs for multiple instances', () => {
      // Create a second instance
      const secondFixture = TestBed.createComponent(TestWrapperComponent);
      secondFixture.detectChanges();

      const firstToggle = fixture.debugElement.query(By.css('p-toggleswitch'));
      const secondToggle = secondFixture.debugElement.query(By.css('p-toggleswitch'));

      expect(firstToggle.nativeElement.getAttribute('inputId')).not.toBe(secondToggle.nativeElement.getAttribute('inputId'));
    });

    it('should have proper label text', () => {
      component.label.set('COMMON.NOTIFICATIONS');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-toggleswitch-label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Notificacions');
    });
  });

  describe('Layout Structure', () => {
    it('should have proper container structure', () => {
      const containerElement = fixture.debugElement.query(By.css('.input-toggleswitch-container'));
      expect(containerElement).toBeTruthy();
    });

    it('should have wrapper for toggle switch', () => {
      const wrapperElement = fixture.debugElement.query(By.css('.toggleswitch-wrapper'));
      expect(wrapperElement).toBeTruthy();
    });

    it('should have proper CSS class on toggle switch', () => {
      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggleElement.nativeElement.classList.contains('pelu-toggleswitch')).toBe(true);
    });
  });

  describe('Custom Values', () => {
    it('should handle string values correctly', () => {
      component.trueValue.set('ENABLED');
      component.falseValue.set('DISABLED');
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      toggleElement.componentInstance.onModelChange('ENABLED');
      fixture.detectChanges();
      expect(component.currentValue()).toBe('ENABLED');

      toggleElement.componentInstance.onModelChange('DISABLED');
      fixture.detectChanges();
      expect(component.currentValue()).toBe('DISABLED');
    });

    it('should handle numeric values correctly', () => {
      component.trueValue.set(1);
      component.falseValue.set(0);
      fixture.detectChanges();

      const toggleElement = fixture.debugElement.query(By.css('p-toggleswitch'));

      toggleElement.componentInstance.onModelChange(1);
      fixture.detectChanges();
      expect(component.currentValue()).toBe(1);

      toggleElement.componentInstance.onModelChange(0);
      fixture.detectChanges();
      expect(component.currentValue()).toBe(0);
    });
  });
});
