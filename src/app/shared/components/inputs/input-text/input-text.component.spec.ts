import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { InputTextComponent } from './input-text.component';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.NAME': 'Nom',
      'COMMON.EMAIL': 'Email',
      'INPUTS.TEXT_PLACEHOLDER': 'Introdueix text...',
      'INPUTS.TEXT_EMAIL_PLACEHOLDER': 'Introdueix email...',
      'INPUTS.TEXT_PASSWORD_PLACEHOLDER': 'Introdueix contrasenya...'
    });
  }
}

// Test wrapper component
@Component({
  selector: 'pelu-test-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextComponent],
  template: `
    <form [formGroup]="form">
      <pelu-input-text
        formControlName="testField"
        [label]="label()"
        [placeholder]="placeholder()"
        [required]="required()"
        [type]="type()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [size]="size()"
        [variant]="variant()"
        [invalid]="invalid()"
        [fluid]="fluid()"
        (valueChange)="onValueChange($event)">
      </pelu-input-text>
    </form>

    <div class="test-output">
      <p>Value: {{ currentValue() }}</p>
      <p>Form Value: {{ form.get('testField')?.value }}</p>
      <p>Form Valid: {{ form.valid }}</p>
      <p>Form Dirty: {{ form.dirty }}</p>
      <p>Form Touched: {{ form.touched }}</p>
    </div>
  `
})
class TestWrapperComponent {
  form: FormGroup;
  currentValue = signal('');

  // Configurable inputs
  label = signal('COMMON.NAME');
  placeholder = signal('INPUTS.TEXT_PLACEHOLDER');
  required = signal(false);
  type = signal<'text' | 'email' | 'password'>('text');
  disabled = signal(false);
  readonly = signal(false);
  size = signal<'small' | 'large'>('small');
  variant = signal<'outlined' | 'filled'>('outlined');
  invalid = signal(false);
  fluid = signal(true);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      testField: ['', this.required() ? Validators.required : null]
    });
  }

  onValueChange(value: string) {
    this.currentValue.set(value);
  }

  setFormValue(value: string) {
    this.form.patchValue({ testField: value });
  }

  getFormValue(): string {
    return this.form.get('testField')?.value || '';
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markFieldAsTouched() {
    this.form.get('testField')?.markAsTouched();
  }
}

describe('InputTextComponent', () => {
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
      expect(fixture.debugElement.query(By.css('pelu-input-text'))).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label.set('COMMON.NAME');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-text-label'));
      expect(labelElement).toBeTruthy();
      expect(labelElement.nativeElement.textContent.trim()).toBe('Nom');
    });

    it('should not render label when empty', () => {
      component.label.set('');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-text-label'));
      expect(labelElement).toBeFalsy();
    });

    it('should render required indicator when required is true', () => {
      component.required.set(true);
      component.label.set('COMMON.NAME');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-text-label'));
      expect(labelElement.nativeElement.classList.contains('required')).toBe(true);
    });

    it('should render input with correct attributes', () => {
      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement).toBeTruthy();
      expect(inputElement.nativeElement.type).toBe('text');
      expect(inputElement.nativeElement.placeholder).toBe('Introdueix text...');
    });

    it('should generate unique ID for each instance', () => {
      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      const labelElement = fixture.debugElement.query(By.css('label'));

      expect(inputElement.nativeElement.id).toBeTruthy();
      expect(inputElement.nativeElement.id).toContain('input-text-');
      expect(labelElement.nativeElement.getAttribute('for')).toBe(inputElement.nativeElement.id);
    });
  });

  describe('Input Interaction', () => {
    it('should emit valueChange when input value changes', () => {
      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      const testValue = 'test input value';

      inputElement.nativeElement.value = testValue;
      inputElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.currentValue()).toBe(testValue);
    });

    it('should update form control value when input changes', () => {
      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      const testValue = 'form test value';

      inputElement.nativeElement.value = testValue;
      inputElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.getFormValue()).toBe(testValue);
    });

    it('should handle blur event correctly', () => {
      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));

      inputElement.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.get('testField')?.touched).toBe(true);
    });

    it('should handle different input types', () => {
      const testTypes: Array<'text' | 'email' | 'password'> = ['text', 'email', 'password'];

      testTypes.forEach(type => {
        component.type.set(type);
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
        expect(inputElement.nativeElement.type).toBe(type);
      });
    });
  });

  describe('Component Configuration', () => {
    it('should apply disabled state correctly', () => {
      component.disabled.set(true);
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.disabled).toBe(true);
    });

    it('should apply readonly state correctly', () => {
      component.readonly.set(true);
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.readOnly).toBe(true);
    });

    it('should apply invalid state correctly', () => {
      component.invalid.set(true);
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.getAttribute('invalid')).toBe('true');
    });

    it('should apply size configuration correctly', () => {
      component.size.set('large');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.getAttribute('psize')).toBe('large');
    });

    it('should apply variant configuration correctly', () => {
      component.variant.set('filled');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.getAttribute('variant')).toBe('filled');
    });

    it('should apply fluid configuration correctly', () => {
      component.fluid.set(false);
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.getAttribute('fluid')).toBe('false');
    });
  });

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      component.placeholder.set('Custom placeholder');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.placeholder).toBe('Custom placeholder');
    });

    it('should use default placeholder for text type when no custom placeholder', () => {
      component.placeholder.set('');
      component.type.set('text');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.placeholder).toBe('Introdueix text...');
    });

    it('should use email placeholder for email type when no custom placeholder', () => {
      component.placeholder.set('');
      component.type.set('email');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.placeholder).toBe('Introdueix email...');
    });

    it('should use password placeholder for password type when no custom placeholder', () => {
      component.placeholder.set('');
      component.type.set('password');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.placeholder).toBe('Introdueix contrasenya...');
    });
  });

  describe('Form Integration', () => {
    it('should initialize with form control value', () => {
      component.setFormValue('initial value');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(inputElement.nativeElement.value).toBe('initial value');
    });

    it('should handle form validation correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      // Initially should be invalid (empty required field)
      expect(component.isFormValid()).toBe(false);

      // Set a value and should become valid
      component.setFormValue('test value');
      fixture.detectChanges();
      expect(component.isFormValid()).toBe(true);
    });

    it('should mark form as dirty when value changes', () => {
      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));

      inputElement.nativeElement.value = 'new value';
      inputElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.form.dirty).toBe(true);
    });

    it('should mark form as touched when input loses focus', () => {
      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));

      inputElement.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.touched).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      component.label.set('COMMON.NAME');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('label'));
      const inputElement = fixture.debugElement.query(By.css('input[pInputText]'));

      expect(labelElement.nativeElement.getAttribute('for')).toBe(inputElement.nativeElement.id);
    });

    it('should have unique IDs for multiple instances', () => {
      // Create a second instance
      const secondFixture = TestBed.createComponent(TestWrapperComponent);
      secondFixture.detectChanges();

      const firstInput = fixture.debugElement.query(By.css('input[pInputText]'));
      const secondInput = secondFixture.debugElement.query(By.css('input[pInputText]'));

      expect(firstInput.nativeElement.id).not.toBe(secondInput.nativeElement.id);
    });
  });
});
