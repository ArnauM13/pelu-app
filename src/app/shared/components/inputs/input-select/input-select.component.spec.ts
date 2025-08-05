import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { InputSelectComponent, SelectOption } from './input-select.component';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.CATEGORY': 'Categoria',
      'COMMON.SERVICE': 'Servei',
      'INPUTS.SELECT_PLACEHOLDER': 'Selecciona una opció...',
      'INPUTS.SELECT_FILTER_PLACEHOLDER': 'Cerca...'
    });
  }
}

// Test wrapper component
@Component({
  selector: 'pelu-test-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputSelectComponent],
  template: `
    <form [formGroup]="form">
      <pelu-input-select
        formControlName="selectField"
        [label]="label()"
        [placeholder]="placeholder()"
        [required]="required()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [options]="options()"
        [multiple]="multiple()"
        [clearable]="clearable()"
        [searchable]="searchable()"
        [loading]="loading()"
        [editable]="editable()"
        [checkmark]="checkmark()"
        [filter]="filter()"
        [filterBy]="filterBy()"
        [filterMatchMode]="filterMatchMode()"
        [filterPlaceholder]="filterPlaceholder()"
        [showClear]="showClear()"
        [appendTo]="appendTo()"
        [scrollHeight]="scrollHeight()"
        [virtualScroll]="virtualScroll()"
        [virtualScrollItemSize]="virtualScrollItemSize()"
        [optionLabel]="optionLabel()"
        [optionValue]="optionValue()"
        [optionDisabled]="optionDisabled()"
        [group]="group()"
        [helpText]="helpText()"
        [errorText]="errorText()"
        [successText]="successText()"
        (valueChange)="onValueChange($event)">
      </pelu-input-select>
    </form>

    <div class="test-output">
      <p>Value: {{ currentValue() }}</p>
      <p>Form Value: {{ form.get('selectField')?.value }}</p>
      <p>Form Valid: {{ form.valid }}</p>
      <p>Form Dirty: {{ form.dirty }}</p>
      <p>Form Touched: {{ form.touched }}</p>
    </div>
  `
})
class TestWrapperComponent {
  form: FormGroup;
  currentValue = signal<string | number | undefined>(undefined);

  // Configurable inputs
  label = signal('COMMON.CATEGORY');
  placeholder = signal('INPUTS.SELECT_PLACEHOLDER');
  required = signal(false);
  disabled = signal(false);
  readonly = signal(false);
  options = signal<SelectOption[]>([
    { label: 'Opció 1', value: 'option1' },
    { label: 'Opció 2', value: 'option2' },
    { label: 'Opció 3', value: 'option3', disabled: true }
  ]);
  multiple = signal(false);
  clearable = signal(false);
  searchable = signal(false);
  loading = signal(false);
  editable = signal(false);
  checkmark = signal(false);
  filter = signal(true);
  filterBy = signal('label');
  filterMatchMode = signal<'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte'>('contains');
  filterPlaceholder = signal('INPUTS.SELECT_FILTER_PLACEHOLDER');
  showClear = signal(false);
  appendTo = signal('body');
  scrollHeight = signal('200px');
  virtualScroll = signal(false);
  virtualScrollItemSize = signal(38);
  optionLabel = signal('label');
  optionValue = signal('value');
  optionDisabled = signal('disabled');
  group = signal(false);
  helpText = signal('');
  errorText = signal('');
  successText = signal('');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      selectField: ['', this.required() ? Validators.required : null]
    });
  }

  onValueChange(value: string | number | undefined) {
    this.currentValue.set(value);
  }

  setFormValue(value: string | number | undefined) {
    this.form.patchValue({ selectField: value });
  }

  getFormValue(): string | number | undefined {
    return this.form.get('selectField')?.value;
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markFieldAsTouched() {
    this.form.get('selectField')?.markAsTouched();
  }
}

describe('InputSelectComponent', () => {
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
      expect(fixture.debugElement.query(By.css('pelu-input-select'))).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label.set('COMMON.CATEGORY');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-select-label'));
      expect(labelElement).toBeTruthy();
      expect(labelElement.nativeElement.textContent.trim()).toBe('Categoria');
    });

    it('should not render label when empty', () => {
      component.label.set('');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-select-label'));
      expect(labelElement).toBeFalsy();
    });

    it('should render required indicator when required is true', () => {
      component.required.set(true);
      component.label.set('COMMON.CATEGORY');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.input-select-label'));
      expect(labelElement.nativeElement.classList.contains('required')).toBe(true);
    });

    it('should render PrimeNG select component', () => {
      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement).toBeTruthy();
    });

    it('should generate unique ID for each instance', () => {
      const selectElement = fixture.debugElement.query(By.css('p-select'));
      const labelElement = fixture.debugElement.query(By.css('label'));

      expect(selectElement.nativeElement.getAttribute('inputId')).toBeTruthy();
      expect(selectElement.nativeElement.getAttribute('inputId')).toContain('select-');
      expect(labelElement.nativeElement.getAttribute('for')).toBe(selectElement.nativeElement.getAttribute('inputId'));
    });
  });

  describe('Select Input Interaction', () => {
    it('should emit valueChange when selection changes', () => {
      const selectElement = fixture.debugElement.query(By.css('p-select'));
      const testValue = 'option2';

      // Simulate selection change
      selectElement.componentInstance.onChange({ value: testValue });
      fixture.detectChanges();

      expect(component.currentValue()).toBe(testValue);
    });

    it('should update form control value when selection changes', () => {
      const selectElement = fixture.debugElement.query(By.css('p-select'));
      const testValue = 'option1';

      // Simulate selection change
      selectElement.componentInstance.onChange({ value: testValue });
      fixture.detectChanges();

      expect(component.getFormValue()).toBe(testValue);
    });

    it('should handle blur event correctly', () => {
      const selectElement = fixture.debugElement.query(By.css('p-select'));

      selectElement.componentInstance.onBlur(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.get('selectField')?.touched).toBe(true);
    });

    it('should handle multiple selection correctly', () => {
      component.multiple.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('multiple')).toBe('true');
    });
  });

  describe('Component Configuration', () => {
    it('should apply disabled state correctly', () => {
      component.disabled.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('disabled')).toBe('true');
    });

    it('should apply required state correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('required')).toBe('true');
    });

    it('should apply readonly state correctly', () => {
      component.readonly.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('readonly')).toBe('true');
    });

    it('should apply loading state correctly', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('loading')).toBe('true');
    });

    it('should apply editable state correctly', () => {
      component.editable.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('editable')).toBe('true');
    });

    it('should apply checkmark state correctly', () => {
      component.checkmark.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('checkmark')).toBe('true');
    });
  });

  describe('Filter Configuration', () => {
    it('should apply filter configuration correctly', () => {
      component.filter.set(false);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('filter')).toBe('false');
    });

    it('should apply filterBy configuration correctly', () => {
      component.filterBy.set('value');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('filterby')).toBe('value');
    });

    it('should apply filterMatchMode configuration correctly', () => {
      component.filterMatchMode.set('startsWith');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('filtermatchmode')).toBe('startsWith');
    });

    it('should apply filterPlaceholder correctly', () => {
      component.filterPlaceholder.set('Custom filter placeholder');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('filterplaceholder')).toBe('Custom filter placeholder');
    });
  });

  describe('Options Configuration', () => {
    it('should pass options to PrimeNG select', () => {
      const testOptions: SelectOption[] = [
        { label: 'Test 1', value: 'test1' },
        { label: 'Test 2', value: 'test2' }
      ];
      component.options.set(testOptions);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.componentInstance.options).toEqual(testOptions);
    });

    it('should apply optionLabel configuration correctly', () => {
      component.optionLabel.set('name');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('optionlabel')).toBe('name');
    });

    it('should apply optionValue configuration correctly', () => {
      component.optionValue.set('id');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('optionvalue')).toBe('id');
    });

    it('should apply optionDisabled configuration correctly', () => {
      component.optionDisabled.set('isDisabled');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('optiondisabled')).toBe('isDisabled');
    });
  });

  describe('Advanced Configuration', () => {
    it('should apply showClear configuration correctly', () => {
      component.showClear.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('showclear')).toBe('true');
    });

    it('should apply appendTo configuration correctly', () => {
      component.appendTo.set('document.body');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('appendto')).toBe('document.body');
    });

    it('should apply scrollHeight configuration correctly', () => {
      component.scrollHeight.set('300px');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('scrollheight')).toBe('300px');
    });

    it('should apply virtualScroll configuration correctly', () => {
      component.virtualScroll.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('virtualscroll')).toBe('true');
    });

    it('should apply virtualScrollItemSize configuration correctly', () => {
      component.virtualScrollItemSize.set(50);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('virtualscrollitemsize')).toBe('50');
    });

    it('should apply group configuration correctly', () => {
      component.group.set(true);
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('group')).toBe('true');
    });
  });

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      component.placeholder.set('Custom select placeholder');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('placeholder')).toBe('Custom select placeholder');
    });

    it('should use default placeholder when no custom placeholder provided', () => {
      component.placeholder.set('');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.nativeElement.getAttribute('placeholder')).toBe('Selecciona una opció...');
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
      component.setFormValue('option1');
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css('p-select'));
      expect(selectElement.componentInstance.value).toBe('option1');
    });

    it('should handle form validation correctly', () => {
      component.required.set(true);
      fixture.detectChanges();

      // Initially should be invalid (empty required field)
      expect(component.isFormValid()).toBe(false);

      // Set a value and should become valid
      component.setFormValue('option1');
      fixture.detectChanges();
      expect(component.isFormValid()).toBe(true);
    });

    it('should mark form as dirty when value changes', () => {
      const selectElement = fixture.debugElement.query(By.css('p-select'));

      selectElement.componentInstance.onChange({ value: 'option2' });
      fixture.detectChanges();

      expect(component.form.dirty).toBe(true);
    });

    it('should mark form as touched when input loses focus', () => {
      const selectElement = fixture.debugElement.query(By.css('p-select'));

      selectElement.componentInstance.onBlur(new Event('blur'));
      fixture.detectChanges();

      expect(component.form.touched).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      component.label.set('COMMON.CATEGORY');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('label'));
      const selectElement = fixture.debugElement.query(By.css('p-select'));

      expect(labelElement.nativeElement.getAttribute('for')).toBe(selectElement.nativeElement.getAttribute('inputId'));
    });

    it('should have unique IDs for multiple instances', () => {
      // Create a second instance
      const secondFixture = TestBed.createComponent(TestWrapperComponent);
      secondFixture.detectChanges();

      const firstSelect = fixture.debugElement.query(By.css('p-select'));
      const secondSelect = secondFixture.debugElement.query(By.css('p-select'));

      expect(firstSelect.nativeElement.getAttribute('inputId')).not.toBe(secondSelect.nativeElement.getAttribute('inputId'));
    });
  });
});
