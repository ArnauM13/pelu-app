import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { InputTextareaComponent } from './input-textarea.component';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.DESCRIPTION': 'Descripció',
      'COMMON.NOTES': 'Notes',
      'COMMON.COMMENTS': 'Comentaris',
      'INPUTS.TEXTAREA_PLACEHOLDER': 'Introdueix text...'
    });
  }
}

// Test wrapper component
@Component({
  selector: 'pelu-test-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextareaComponent],
  template: `
    <form [formGroup]="form">
      <pelu-input-textarea
        formControlName="textareaField"
        [label]="label()"
        [placeholder]="placeholder()"
        [required]="required()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [rows]="rows()"
        [cols]="cols()"
        [maxlength]="maxlength()"
        [minlength]="minlength()"
        [spellcheck]="spellcheck()"
        [tabindex]="tabindex()"
        [name]="name()"
        [id]="id()"
        [class]="class()"
        [style]="style()"
        [size]="size()"
        [variant]="variant()"
        [invalid]="invalid()"
        [fluid]="fluid()"
        [autoResize]="autoResize()"
        [resize]="resize()"
        (valueChange)="onValueChange($event)">
      </pelu-input-textarea>
    </form>

    <div class="test-output">
      <p>Value: {{ currentValue() }}</p>
      <p>Form Value: {{ form.get('textareaField')?.value }}</p>
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
  label = signal('COMMON.DESCRIPTION');
  placeholder = signal('INPUTS.TEXTAREA_PLACEHOLDER');
  required = signal(false);
  disabled = signal(false);
  readonly = signal(false);
  rows = signal(3);
  cols = signal<number | undefined>(undefined);
  maxlength = signal<number | undefined>(undefined);
  minlength = signal<number | undefined>(undefined);
  spellcheck = signal<boolean | undefined>(undefined);
  tabindex = signal<number | undefined>(undefined);
  name = signal('');
  id = signal('');
  class = signal('');
  style = signal('');
  size = signal<'small' | 'large'>('small');
  variant = signal<'outlined' | 'filled'>('outlined');
  invalid = signal(false);
  fluid = signal(true);
  autoResize = signal(false);
  resize = signal<'none' | 'both' | 'horizontal' | 'vertical'>('vertical');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      textareaField: ['', this.required() ? Validators.required : null]
    });
  }

  onValueChange(value: string) {
    this.currentValue.set(value);
  }

  setFormValue(value: string) {
    this.form.patchValue({ textareaField: value });
  }

  getFormValue(): string {
    return this.form.get('textareaField')?.value || '';
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markFieldAsTouched() {
    this.form.get('textareaField')?.markAsTouched();
  }
}

describe('InputTextareaComponent', () => {
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
      expect(fixture.debugElement.query(By.css('pelu-input-textarea'))).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label.set('COMMON.DESCRIPTION');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-textarea-label'));
      expect(labelElement).toBeTruthy();
      expect(labelElement.nativeElement.textContent.trim()).toBe('Descripció');
    });

    it('should not render label when empty', () => {
      component.label.set('');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-textarea-label'));
      expect(labelElement).toBeFalsy();
    });

    it('should render required indicator when required is true', () => {
      component.required.set(true);
      component.label.set('COMMON.DESCRIPTION');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-textarea-label'));
      expect(labelElement.nativeElement.classList.contains('required')).toBe(true);
    });

    it('should render PrimeNG textarea component', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement).toBeTruthy();
    });

    it('should generate unique ID for each instance', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      const labelElement = fixture.debugElement.query(By.css('label'));

      expect(textareaElement.nativeElement.id).toBeTruthy();
      expect(textareaElement.nativeElement.id).toContain('input-textarea-');
      expect(labelElement.nativeElement.getAttribute('for')).toBe(textareaElement.nativeElement.id);
    });
  });

  describe('Textarea Input Interaction', () => {
    it('should emit valueChange when textarea value changes', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      const testValue = 'This is a test textarea value';

      textareaElement.nativeElement.value = testValue;
      textareaElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.currentValue()).toBe(testValue);
    });

    it('should update form control value when textarea changes', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      const testValue = 'Form test value';

      textareaElement.nativeElement.value = testValue;
      textareaElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.getFormValue()).toBe(testValue);
    });

    it('should handle blur event correctly', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));

      textareaElement.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.get('textareaField')?.touched).toBe(true);
    });

    it('should handle multiline text correctly', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      const multilineText = 'Line 1\nLine 2\nLine 3';

      textareaElement.nativeElement.value = multilineText;
      textareaElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.currentValue()).toBe(multilineText);
    });
  });

  describe('Component Configuration', () => {
    it('should apply disabled state correctly', () => {
      component.disabled.set(true);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.disabled).toBe(true);
    });

    it('should apply readonly state correctly', () => {
      component.readonly.set(true);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.readOnly).toBe(true);
    });

    it('should apply invalid state correctly', () => {
      component.invalid.set(true);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.getAttribute('invalid')).toBe('true');
    });

    it('should apply size configuration correctly', () => {
      component.size.set('large');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.getAttribute('psize')).toBe('large');
    });

    it('should apply variant configuration correctly', () => {
      component.variant.set('filled');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.getAttribute('variant')).toBe('filled');
    });

    it('should apply fluid configuration correctly', () => {
      component.fluid.set(false);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.getAttribute('fluid')).toBe('false');
    });
  });

  describe('Textarea Specific Properties', () => {
    it('should apply rows configuration correctly', () => {
      component.rows.set(5);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.rows).toBe(5);
    });

    it('should apply cols configuration correctly', () => {
      component.cols.set(50);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.cols).toBe(50);
    });

    it('should apply maxlength configuration correctly', () => {
      component.maxlength.set(100);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.getAttribute('maxlength')).toBe('100');
    });

    it('should apply minlength configuration correctly', () => {
      component.minlength.set(10);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.getAttribute('minlength')).toBe('10');
    });

    it('should apply spellcheck configuration correctly', () => {
      component.spellcheck.set(true);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.spellcheck).toBe(true);
    });

    it('should apply tabindex configuration correctly', () => {
      component.tabindex.set(1);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.tabIndex).toBe(1);
    });
  });

  describe('Advanced Configuration', () => {
    it('should apply name configuration correctly', () => {
      component.name.set('test-textarea');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.name).toBe('test-textarea');
    });

    it('should apply custom id configuration correctly', () => {
      component.id.set('custom-textarea-id');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.id).toBe('custom-textarea-id');
    });

    it('should apply custom class configuration correctly', () => {
      component.class.set('custom-textarea-class');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.classList.contains('custom-textarea-class')).toBe(true);
    });

    it('should apply style configuration correctly', () => {
      component.style.set('background-color: red;');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.style.backgroundColor).toBe('red');
    });

    it('should apply autoResize configuration correctly', () => {
      component.autoResize.set(true);
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.getAttribute('autoresize')).toBe('true');
    });

    it('should apply resize configuration correctly', () => {
      component.resize.set('both');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.style.resize).toBe('both');
    });
  });

  describe('Resize Variants', () => {
    it('should apply none resize correctly', () => {
      component.resize.set('none');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.style.resize).toBe('none');
    });

    it('should apply horizontal resize correctly', () => {
      component.resize.set('horizontal');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.style.resize).toBe('horizontal');
    });

    it('should apply vertical resize correctly', () => {
      component.resize.set('vertical');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.style.resize).toBe('vertical');
    });

    it('should apply both resize correctly', () => {
      component.resize.set('both');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.style.resize).toBe('both');
    });
  });

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      component.placeholder.set('Custom textarea placeholder');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.placeholder).toBe('Custom textarea placeholder');
    });

    it('should use default placeholder when no custom placeholder provided', () => {
      component.placeholder.set('');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.placeholder).toBe('Introdueix text...');
    });
  });

  describe('Form Integration', () => {
    it('should initialize with form control value', () => {
      component.setFormValue('Initial textarea value');
      fixture.detectChanges();

      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.value).toBe('Initial textarea value');
    });

    it('should handle form validation correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      // Initially should be invalid (empty required field)
      expect(component.isFormValid()).toBe(false);

      // Set a value and should become valid
      component.setFormValue('Test value');
      fixture.detectChanges();
      expect(component.isFormValid()).toBe(true);
    });

    it('should mark form as dirty when value changes', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));

      textareaElement.nativeElement.value = 'New value';
      textareaElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.form.dirty).toBe(true);
    });

    it('should mark form as touched when input loses focus', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));

      textareaElement.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.touched).toBe(true);
    });

    it('should handle long text correctly in form', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      const longText = 'This is a very long text that should be handled correctly by the textarea component. It contains multiple sentences and should test the component\'s ability to handle large amounts of text input.';

      textareaElement.nativeElement.value = longText;
      textareaElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.getFormValue()).toBe(longText);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      component.label.set('COMMON.DESCRIPTION');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('label'));
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));

      expect(labelElement.nativeElement.getAttribute('for')).toBe(textareaElement.nativeElement.id);
    });

    it('should have unique IDs for multiple instances', () => {
      // Create a second instance
      const secondFixture = TestBed.createComponent(TestWrapperComponent);
      secondFixture.detectChanges();

      const firstTextarea = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      const secondTextarea = secondFixture.debugElement.query(By.css('textarea[pTextarea]'));

      expect(firstTextarea.nativeElement.id).not.toBe(secondTextarea.nativeElement.id);
    });

    it('should have proper label text', () => {
      component.label.set('COMMON.NOTES');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-textarea-label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Notes');
    });
  });

  describe('Layout Structure', () => {
    it('should have proper container structure', () => {
      const containerElement = fixture.debugElement.query(By.css('.input-textarea-container'));
      expect(containerElement).toBeTruthy();
    });

    it('should have wrapper for textarea', () => {
      const wrapperElement = fixture.debugElement.query(By.css('.input-wrapper'));
      expect(wrapperElement).toBeTruthy();
    });

    it('should have proper CSS class on textarea', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea[pTextarea]'));
      expect(textareaElement.nativeElement.classList.contains('pelu-input-textarea')).toBe(true);
    });
  });
});
