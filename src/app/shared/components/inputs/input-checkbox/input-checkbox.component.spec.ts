import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { InputCheckboxComponent } from './input-checkbox.component';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.TERMS': 'Accepto els termes i condicions',
      'COMMON.NEWSLETTER': 'Vull rebre el newsletter',
      'COMMON.PRIVACY': 'Accepto la política de privadesa'
    });
  }
}

// Test wrapper component
@Component({
  selector: 'pelu-test-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputCheckboxComponent],
  template: `
    <form [formGroup]="form">
      <pelu-input-checkbox
        formControlName="checkboxField"
        [label]="label()"
        [size]="size()"
        [variant]="variant()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [invalid]="invalid()"
        (valueChange)="onValueChange($event)">
      </pelu-input-checkbox>
    </form>

    <div class="test-output">
      <p>Value: {{ currentValue() }}</p>
      <p>Form Value: {{ form.get('checkboxField')?.value }}</p>
      <p>Form Valid: {{ form.valid }}</p>
      <p>Form Dirty: {{ form.dirty }}</p>
      <p>Form Touched: {{ form.touched }}</p>
    </div>
  `
})
class TestWrapperComponent {
  form: FormGroup;
  currentValue = signal<boolean>(false);

  // Configurable inputs
  label = signal('COMMON.TERMS');
  size = signal<'small' | 'large' | undefined>(undefined);
  variant = signal<'outlined' | 'filled'>('outlined');
  disabled = signal(false);
  readonly = signal(false);
  invalid = signal(false);

  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.group({
      checkboxField: [false, this.required() ? Validators.requiredTrue : null]
    });
  }

  onValueChange(value: boolean) {
    this.currentValue.set(value);
  }

  setFormValue(value: boolean) {
    this.form.patchValue({ checkboxField: value });
  }

  getFormValue(): boolean {
    return this.form.get('checkboxField')?.value || false;
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markFieldAsTouched() {
    this.form.get('checkboxField')?.markAsTouched();
  }

  private required(): boolean {
    return false; // Override in tests if needed
  }
}

describe('InputCheckboxComponent', () => {
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
      expect(fixture.debugElement.query(By.css('pelu-input-checkbox'))).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label.set('COMMON.TERMS');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.checkbox-label'));
      expect(labelElement).toBeTruthy();
      expect(labelElement.nativeElement.textContent.trim()).toBe('Accepto els termes i condicions');
    });

    it('should render PrimeNG checkbox component', () => {
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement).toBeTruthy();
    });

    it('should generate unique ID for each instance', () => {
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      const labelElement = fixture.debugElement.query(By.css('label'));

      expect(checkboxElement.nativeElement.getAttribute('inputId')).toBeTruthy();
      expect(checkboxElement.nativeElement.getAttribute('inputId')).toContain('checkbox-');
      expect(labelElement.nativeElement.getAttribute('for')).toBe(checkboxElement.nativeElement.getAttribute('inputId'));
    });

    it('should have binary mode enabled', () => {
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('binary')).toBe('true');
    });
  });

  describe('Checkbox Input Interaction', () => {
    it('should emit valueChange when checkbox state changes', () => {
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));

      // Simulate checkbox change
      checkboxElement.componentInstance.onModelChange(true);
      fixture.detectChanges();

      expect(component.currentValue()).toBe(true);
    });

    it('should update form control value when checkbox changes', () => {
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));

      // Simulate checkbox change
      checkboxElement.componentInstance.onModelChange(false);
      fixture.detectChanges();

      expect(component.getFormValue()).toBe(false);
    });

    it('should handle both true and false values correctly', () => {
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));

      // Test true value
      checkboxElement.componentInstance.onModelChange(true);
      fixture.detectChanges();
      expect(component.currentValue()).toBe(true);

      // Test false value
      checkboxElement.componentInstance.onModelChange(false);
      fixture.detectChanges();
      expect(component.currentValue()).toBe(false);
    });
  });

  describe('Component Configuration', () => {
    it('should apply disabled state correctly', () => {
      component.disabled.set(true);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('disabled')).toBe('true');
    });

    it('should apply readonly state correctly', () => {
      component.readonly.set(true);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('disabled')).toBe('true');
    });

    it('should apply invalid state correctly', () => {
      component.invalid.set(true);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('invalid')).toBe('true');
    });

    it('should apply size configuration correctly when provided', () => {
      component.size.set('large');
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('size')).toBe('large');
    });

    it('should not apply size attribute when size is undefined', () => {
      component.size.set(undefined);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('size')).toBeFalsy();
    });

    it('should apply variant configuration correctly', () => {
      component.variant.set('filled');
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('variant')).toBe('filled');
    });
  });

  describe('Size Variants', () => {
    it('should render with small size', () => {
      component.size.set('small');
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('size')).toBe('small');
    });

    it('should render with large size', () => {
      component.size.set('large');
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('size')).toBe('large');
    });

    it('should render without size attribute when undefined', () => {
      component.size.set(undefined);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.hasAttribute('size')).toBe(false);
    });
  });

  describe('Variant Configuration', () => {
    it('should apply outlined variant correctly', () => {
      component.variant.set('outlined');
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('variant')).toBe('outlined');
    });

    it('should apply filled variant correctly', () => {
      component.variant.set('filled');
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('variant')).toBe('filled');
    });
  });

  describe('State Management', () => {
    it('should handle disabled state correctly', () => {
      component.disabled.set(true);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('disabled')).toBe('true');
    });

    it('should handle readonly state correctly (should be disabled)', () => {
      component.readonly.set(true);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('disabled')).toBe('true');
    });

    it('should handle invalid state correctly', () => {
      component.invalid.set(true);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.nativeElement.getAttribute('invalid')).toBe('true');
    });
  });

  describe('Form Integration', () => {
    it('should initialize with form control value', () => {
      component.setFormValue(true);
      fixture.detectChanges();

      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));
      expect(checkboxElement.componentInstance.value).toBe(true);
    });

    it('should handle form validation correctly', () => {
      // Create a new component with required validation
      const requiredComponent = TestBed.createComponent(TestWrapperComponent);
      const requiredForm = new FormBuilder().group({
        checkboxField: [false, Validators.requiredTrue]
      });
      requiredComponent.componentInstance.form = requiredForm;
      requiredComponent.detectChanges();

      // Initially should be invalid (unchecked required field)
      expect(requiredForm.valid).toBe(false);

      // Set to true and should become valid
      requiredForm.patchValue({ checkboxField: true });
      expect(requiredForm.valid).toBe(true);
    });

    it('should mark form as dirty when value changes', () => {
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));

      checkboxElement.componentInstance.onModelChange(true);
      fixture.detectChanges();

      expect(component.form.dirty).toBe(true);
    });

    it('should handle boolean values correctly in form', () => {
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));

      // Test true value
      checkboxElement.componentInstance.onModelChange(true);
      fixture.detectChanges();
      expect(component.getFormValue()).toBe(true);

      // Test false value
      checkboxElement.componentInstance.onModelChange(false);
      fixture.detectChanges();
      expect(component.getFormValue()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      component.label.set('COMMON.TERMS');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('label'));
      const checkboxElement = fixture.debugElement.query(By.css('p-checkbox'));

      expect(labelElement.nativeElement.getAttribute('for')).toBe(checkboxElement.nativeElement.getAttribute('inputId'));
    });

    it('should have unique IDs for multiple instances', () => {
      // Create a second instance
      const secondFixture = TestBed.createComponent(TestWrapperComponent);
      secondFixture.detectChanges();

      const firstCheckbox = fixture.debugElement.query(By.css('p-checkbox'));
      const secondCheckbox = secondFixture.debugElement.query(By.css('p-checkbox'));

      expect(firstCheckbox.nativeElement.getAttribute('inputId')).not.toBe(secondCheckbox.nativeElement.getAttribute('inputId'));
    });

    it('should have proper label text', () => {
      component.label.set('COMMON.NEWSLETTER');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.checkbox-label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Vull rebre el newsletter');
    });
  });

  describe('Layout Structure', () => {
    it('should have proper flex layout', () => {
      const containerElement = fixture.debugElement.query(By.css('.flex'));
      expect(containerElement).toBeTruthy();
      expect(containerElement.nativeElement.classList.contains('items-center')).toBe(true);
      expect(containerElement.nativeElement.classList.contains('gap-2')).toBe(true);
    });

    it('should have checkbox before label', () => {
      const containerElement = fixture.debugElement.query(By.css('.flex'));
      const children = containerElement.nativeElement.children;

      expect(children[0].tagName.toLowerCase()).toBe('p-checkbox');
      expect(children[1].tagName.toLowerCase()).toBe('label');
    });
  });
});
