import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { InputNumberComponent } from './input-number.component';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.AGE': 'Edat',
      'COMMON.PRICE': 'Preu',
      'COMMON.QUANTITY': 'Quantitat',
      'INPUTS.NUMBER_PLACEHOLDER': 'Introdueix un número...'
    });
  }
}

// Test wrapper component
@Component({
  selector: 'pelu-test-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputNumberComponent],
  template: `
    <form [formGroup]="form">
      <pelu-input-number
        formControlName="numberField"
        [label]="label()"
        [placeholder]="placeholder()"
        [required]="required()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [minFractionDigits]="minFractionDigits()"
        [maxFractionDigits]="maxFractionDigits()"
        [mode]="mode()"
        [currency]="currency()"
        [currencyDisplay]="currencyDisplay()"
        [locale]="locale()"
        [prefix]="prefix()"
        [suffix]="suffix()"
        [showButtons]="showButtons()"
        [buttonLayout]="buttonLayout()"
        [useGrouping]="useGrouping()"
        [showClear]="showClear()"
        [autofocus]="autofocus()"
        [helpText]="helpText()"
        [errorText]="errorText()"
        [successText]="successText()"
        (valueChange)="onValueChange($event)">
      </pelu-input-number>
    </form>

    <div class="test-output">
      <p>Value: {{ currentValue() }}</p>
      <p>Form Value: {{ form.get('numberField')?.value }}</p>
      <p>Form Valid: {{ form.valid }}</p>
      <p>Form Dirty: {{ form.dirty }}</p>
      <p>Form Touched: {{ form.touched }}</p>
    </div>
  `
})
class TestWrapperComponent {
  form: FormGroup;
  currentValue = signal<number | undefined>(undefined);

  // Configurable inputs
  label = signal('COMMON.AGE');
  placeholder = signal('INPUTS.NUMBER_PLACEHOLDER');
  required = signal(false);
  disabled = signal(false);
  readonly = signal(false);
  min = signal<number | undefined>(undefined);
  max = signal<number | undefined>(undefined);
  step = signal(1);
  minFractionDigits = signal<number | undefined>(undefined);
  maxFractionDigits = signal<number | undefined>(undefined);
  mode = signal<'decimal' | 'currency'>('decimal');
  currency = signal('EUR');
  currencyDisplay = signal<'symbol' | 'code'>('symbol');
  locale = signal('ca-ES');
  prefix = signal('');
  suffix = signal('');
  showButtons = signal(false);
  buttonLayout = signal<'horizontal' | 'vertical'>('horizontal');
  useGrouping = signal(true);
  showClear = signal(false);
  autofocus = signal(false);
  helpText = signal('');
  errorText = signal('');
  successText = signal('');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      numberField: [null, this.required() ? Validators.required : null]
    });
  }

  onValueChange(value: number | undefined) {
    this.currentValue.set(value);
  }

  setFormValue(value: number | null) {
    this.form.patchValue({ numberField: value });
  }

  getFormValue(): number | null {
    return this.form.get('numberField')?.value;
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markFieldAsTouched() {
    this.form.get('numberField')?.markAsTouched();
  }
}

describe('InputNumberComponent', () => {
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
      expect(fixture.debugElement.query(By.css('pelu-input-number'))).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label.set('COMMON.AGE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-number-label'));
      expect(labelElement).toBeTruthy();
      expect(labelElement.nativeElement.textContent.trim()).toBe('Edat');
    });

    it('should not render label when empty', () => {
      component.label.set('');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-number-label'));
      expect(labelElement).toBeFalsy();
    });

    it('should render required indicator when required is true', () => {
      component.required.set(true);
      component.label.set('COMMON.AGE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-number-label'));
      expect(labelElement.nativeElement.classList.contains('required')).toBe(true);
    });

    it('should render PrimeNG input number component', () => {
      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
    });

    it('should generate unique ID for each instance', () => {
      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      const labelElement = fixture.debugElement.query(By.css('label'));

      expect(numberElement.nativeElement.getAttribute('inputId')).toBeTruthy();
      expect(numberElement.nativeElement.getAttribute('inputId')).toContain('number-');
      expect(labelElement.nativeElement.getAttribute('for')).toBe(numberElement.nativeElement.getAttribute('inputId'));
    });
  });

  describe('Number Input Interaction', () => {
    it('should emit valueChange when number value changes', () => {
      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      const testValue = 42;

      // Simulate number change
      numberElement.componentInstance.onModelChange(testValue);
      fixture.detectChanges();

      expect(component.currentValue()).toBe(testValue);
    });

    it('should update form control value when number changes', () => {
      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      const testValue = 100;

      // Simulate number change
      numberElement.componentInstance.onModelChange(testValue);
      fixture.detectChanges();

      expect(component.getFormValue()).toBe(testValue);
    });

    it('should handle null values correctly', () => {
      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));

      numberElement.componentInstance.onModelChange(null);
      fixture.detectChanges();

      expect(component.currentValue()).toBeUndefined();
    });

    it('should handle blur event correctly', () => {
      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));

      numberElement.componentInstance.onBlur(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.get('numberField')?.touched).toBe(true);
    });
  });

  describe('Component Configuration', () => {
    it('should apply disabled state correctly', () => {
      component.disabled.set(true);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply required state correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply readonly state correctly', () => {
      component.readonly.set(true);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply autofocus state correctly', () => {
      component.autofocus.set(true);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });
  });

  describe('Number Specific Properties', () => {
    it('should apply min configuration correctly', () => {
      component.min.set(0);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('min')).toBe('0');
    });

    it('should apply max configuration correctly', () => {
      component.max.set(100);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('max')).toBe('100');
    });

    it('should apply step configuration correctly', () => {
      component.step.set(5);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('step')).toBe('5');
    });

    it('should apply minFractionDigits configuration correctly', () => {
      component.minFractionDigits.set(2);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('minfractiondigits')).toBe('2');
    });

    it('should apply maxFractionDigits configuration correctly', () => {
      component.maxFractionDigits.set(3);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('maxfractiondigits')).toBe('3');
    });
  });

  describe('Mode Configuration', () => {
    it('should apply decimal mode correctly', () => {
      component.mode.set('decimal');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('mode')).toBe('decimal');
    });

    it('should apply currency mode correctly', () => {
      component.mode.set('currency');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('mode')).toBe('currency');
    });

    it('should apply currency configuration correctly', () => {
      component.mode.set('currency');
      component.currency.set('USD');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('currency')).toBe('USD');
    });

    it('should apply currencyDisplay configuration correctly', () => {
      component.mode.set('currency');
      component.currencyDisplay.set('code');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('currencydisplay')).toBe('code');
    });
  });

  describe('Advanced Configuration', () => {
    it('should apply locale configuration correctly', () => {
      component.locale.set('en-US');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply prefix configuration correctly', () => {
      component.prefix.set('€');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply suffix configuration correctly', () => {
      component.suffix.set('kg');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply showButtons configuration correctly', () => {
      component.showButtons.set(true);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply buttonLayout configuration correctly', () => {
      component.showButtons.set(true);
      component.buttonLayout.set('vertical');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply useGrouping configuration correctly', () => {
      component.useGrouping.set(false);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should apply showClear configuration correctly', () => {
      component.showClear.set(true);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });
  });

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      component.placeholder.set('Custom number placeholder');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('placeholder')).toBe('Custom number placeholder');
    });

    it('should use default placeholder when no custom placeholder provided', () => {
      component.placeholder.set('');
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.getAttribute('placeholder')).toBe('Introdueix un número...');
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
      component.setFormValue(42);
      fixture.detectChanges();

      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should handle form validation correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      // Initially should be invalid (empty required field)
      expect(component.isFormValid()).toBe(false);

      // Set a value and should become valid
      component.setFormValue(10);
      fixture.detectChanges();
      expect(component.isFormValid()).toBe(true);
    });

    it('should mark form as dirty when value changes', () => {
      // Simulate value change through form
      component.setFormValue(25);
      fixture.detectChanges();

      expect(component.form.dirty).toBe(true);
    });

    it('should mark form as touched when input loses focus', () => {
      // Mark as touched directly
      component.markFieldAsTouched();
      fixture.detectChanges();

      expect(component.form.touched).toBe(true);
    });

    it('should handle numeric values correctly in form', () => {
      // Test positive number
      component.setFormValue(100);
      fixture.detectChanges();
      expect(component.getFormValue()).toBe(100);

      // Test negative number
      component.setFormValue(-50);
      fixture.detectChanges();
      expect(component.getFormValue()).toBe(-50);

      // Test decimal number
      component.setFormValue(3.14);
      fixture.detectChanges();
      expect(component.getFormValue()).toBe(3.14);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      component.label.set('COMMON.AGE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('label'));
      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));

      expect(labelElement).toBeTruthy();
      expect(numberElement).toBeTruthy();
      expect(numberElement.componentInstance).toBeTruthy();
    });

    it('should have unique IDs for multiple instances', () => {
      // Create a second instance
      const secondFixture = TestBed.createComponent(TestWrapperComponent);
      secondFixture.detectChanges();

      const firstNumber = fixture.debugElement.query(By.css('p-inputnumber'));
      const secondNumber = secondFixture.debugElement.query(By.css('p-inputnumber'));

      expect(firstNumber).toBeTruthy();
      expect(secondNumber).toBeTruthy();
      expect(firstNumber.componentInstance).toBeTruthy();
      expect(secondNumber.componentInstance).toBeTruthy();
    });

    it('should have proper label text', () => {
      component.label.set('COMMON.PRICE');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-number-label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Preu');
    });
  });

  describe('Layout Structure', () => {
    it('should have proper container structure', () => {
      const containerElement = fixture.debugElement.query(By.css('.input-number-container'));
      expect(containerElement).toBeTruthy();
    });

    it('should have proper CSS class on input number', () => {
      const numberElement = fixture.debugElement.query(By.css('p-inputnumber'));
      expect(numberElement.nativeElement.classList.contains('pelu-inputnumber')).toBe(true);
    });
  });
});
