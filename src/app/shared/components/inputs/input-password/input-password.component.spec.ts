import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { InputPasswordComponent } from './input-password.component';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'AUTH.PASSWORD': 'Contrasenya',
      'INPUTS.PASSWORD_PLACEHOLDER': 'Introdueix contrasenya...',
      'INPUTS.PASSWORD_PROMPT_LABEL': 'Introdueix la contrasenya',
      'INPUTS.PASSWORD_WEAK_LABEL': 'Débil',
      'INPUTS.PASSWORD_MEDIUM_LABEL': 'Mitjana',
      'INPUTS.PASSWORD_STRONG_LABEL': 'Forta'
    });
  }
}

// Test wrapper component
@Component({
  selector: 'pelu-test-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputPasswordComponent],
  template: `
    <form [formGroup]="form">
      <pelu-input-password
        formControlName="passwordField"
        [label]="label()"
        [placeholder]="placeholder()"
        [required]="required()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [size]="size()"
        [variant]="variant()"
        [invalid]="invalid()"
        [fluid]="fluid()"
        [feedback]="feedback()"
        [toggleMask]="toggleMask()"
        [promptLabel]="promptLabel()"
        [weakLabel]="weakLabel()"
        [mediumLabel]="mediumLabel()"
        [strongLabel]="strongLabel()"
        (valueChange)="onValueChange($event)">
      </pelu-input-password>
    </form>

    <div class="test-output">
      <p>Value: {{ currentValue() }}</p>
      <p>Form Value: {{ form.get('passwordField')?.value }}</p>
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
  label = signal('AUTH.PASSWORD');
  placeholder = signal('INPUTS.PASSWORD_PLACEHOLDER');
  required = signal(false);
  disabled = signal(false);
  readonly = signal(false);
  size = signal<'small' | 'large'>('small');
  variant = signal<'outlined' | 'filled'>('outlined');
  invalid = signal(false);
  fluid = signal(true);
  feedback = signal(true);
  toggleMask = signal(true);
  promptLabel = signal('INPUTS.PASSWORD_PROMPT_LABEL');
  weakLabel = signal('INPUTS.PASSWORD_WEAK_LABEL');
  mediumLabel = signal('INPUTS.PASSWORD_MEDIUM_LABEL');
  strongLabel = signal('INPUTS.PASSWORD_STRONG_LABEL');

  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.group({
      passwordField: ['', this.required() ? Validators.required : null]
    });
  }

  onValueChange(value: string) {
    this.currentValue.set(value);
  }

  setFormValue(value: string) {
    this.form.patchValue({ passwordField: value });
  }

  getFormValue(): string {
    return this.form.get('passwordField')?.value || '';
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markFieldAsTouched() {
    this.form.get('passwordField')?.markAsTouched();
  }
}

describe('InputPasswordComponent', () => {
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
      expect(fixture.debugElement.query(By.css('pelu-input-password'))).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label.set('AUTH.PASSWORD');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-password-label'));
      expect(labelElement).toBeTruthy();
      expect(labelElement.nativeElement.textContent.trim()).toBe('Contrasenya');
    });

    it('should not render label when empty', () => {
      component.label.set('');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-password-label'));
      expect(labelElement).toBeFalsy();
    });

    it('should render required indicator when required is true', () => {
      component.required.set(true);
      component.label.set('AUTH.PASSWORD');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-password-label'));
      expect(labelElement.nativeElement.classList.contains('required')).toBe(true);
    });

    it('should render PrimeNG password component', () => {
      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement).toBeTruthy();
    });

    it('should generate unique ID for each instance', () => {
      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      const labelElement = fixture.debugElement.query(By.css('label'));

      expect(passwordElement.nativeElement.getAttribute('inputId')).toBeTruthy();
      expect(passwordElement.nativeElement.getAttribute('inputId')).toContain('input-password-');
      expect(labelElement.nativeElement.getAttribute('for')).toBe(passwordElement.nativeElement.getAttribute('inputId'));
    });
  });

  describe('Password Input Interaction', () => {
    it('should emit valueChange when password value changes', () => {
      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      const testValue = 'testPassword123';

      // Simulate password change
      passwordElement.componentInstance.onModelChange(testValue);
      fixture.detectChanges();

      expect(component.currentValue()).toBe(testValue);
    });

    it('should update form control value when password changes', () => {
      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      const testValue = 'formPassword123';

      // Simulate password change
      passwordElement.componentInstance.onModelChange(testValue);
      fixture.detectChanges();

      expect(component.getFormValue()).toBe(testValue);
    });

    it('should handle blur event correctly', () => {
      const passwordElement = fixture.debugElement.query(By.css('p-password'));

      passwordElement.componentInstance.onBlur();
      fixture.detectChanges();

      expect(component.form.get('passwordField')?.touched).toBe(true);
    });
  });

  describe('Component Configuration', () => {
    it('should apply disabled state correctly', () => {
      component.disabled.set(true);
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('disabled')).toBe('true');
    });

    it('should apply required state correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('required')).toBe('true');
    });

    it('should apply invalid state correctly', () => {
      component.invalid.set(true);
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('invalid')).toBe('true');
    });

    it('should apply size configuration correctly', () => {
      component.size.set('large');
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('size')).toBe('large');
    });

    it('should apply variant configuration correctly', () => {
      component.variant.set('filled');
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('variant')).toBe('filled');
    });

    it('should apply fluid configuration correctly', () => {
      component.fluid.set(false);
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('fluid')).toBe('false');
    });
  });

  describe('Password Specific Features', () => {
    it('should apply feedback configuration correctly', () => {
      component.feedback.set(false);
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('feedback')).toBe('false');
    });

    it('should apply toggle mask configuration correctly', () => {
      component.toggleMask.set(false);
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('togglemask')).toBe('false');
    });

    it('should apply custom labels correctly', () => {
      component.promptLabel.set('Custom prompt');
      component.weakLabel.set('Custom weak');
      component.mediumLabel.set('Custom medium');
      component.strongLabel.set('Custom strong');
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('promptlabel')).toBe('Custom prompt');
      expect(passwordElement.nativeElement.getAttribute('weaklabel')).toBe('Custom weak');
      expect(passwordElement.nativeElement.getAttribute('mediumlabel')).toBe('Custom medium');
      expect(passwordElement.nativeElement.getAttribute('stronglabel')).toBe('Custom strong');
    });

    it('should have autocomplete disabled', () => {
      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('autocomplete')).toBe('off');
    });
  });

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      component.placeholder.set('Custom password placeholder');
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('placeholder')).toBe('Custom password placeholder');
    });

    it('should use default placeholder when no custom placeholder provided', () => {
      component.placeholder.set('');
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.nativeElement.getAttribute('placeholder')).toBe('Introdueix contrasenya...');
    });
  });

  describe('Form Integration', () => {
    it('should initialize with form control value', () => {
      component.setFormValue('initialPassword');
      fixture.detectChanges();

      const passwordElement = fixture.debugElement.query(By.css('p-password'));
      expect(passwordElement.componentInstance.value).toBe('initialPassword');
    });

    it('should handle form validation correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      // Initially should be invalid (empty required field)
      expect(component.isFormValid()).toBe(false);

      // Set a value and should become valid
      component.setFormValue('testPassword');
      fixture.detectChanges();
      expect(component.isFormValid()).toBe(true);
    });

    it('should mark form as dirty when value changes', () => {
      const passwordElement = fixture.debugElement.query(By.css('p-password'));

      passwordElement.componentInstance.onModelChange('newPassword');
      fixture.detectChanges();

      expect(component.form.dirty).toBe(true);
    });

    it('should mark form as touched when input loses focus', () => {
      const passwordElement = fixture.debugElement.query(By.css('p-password'));

      passwordElement.componentInstance.onBlur();
      fixture.detectChanges();

      expect(component.form.touched).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      component.label.set('AUTH.PASSWORD');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('label'));
      const passwordElement = fixture.debugElement.query(By.css('p-password'));

      expect(labelElement.nativeElement.getAttribute('for')).toBe(passwordElement.nativeElement.getAttribute('inputId'));
    });

    it('should have unique IDs for multiple instances', () => {
      // Create a second instance
      const secondFixture = TestBed.createComponent(TestWrapperComponent);
      secondFixture.detectChanges();

      const firstPassword = fixture.debugElement.query(By.css('p-password'));
      const secondPassword = secondFixture.debugElement.query(By.css('p-password'));

      expect(firstPassword.nativeElement.getAttribute('inputId')).not.toBe(secondPassword.nativeElement.getAttribute('inputId'));
    });
  });
});
