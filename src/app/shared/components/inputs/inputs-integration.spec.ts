import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import all input components
import { InputTextComponent } from './input-text/input-text.component';
import { InputTextareaComponent } from './input-textarea/input-textarea.component';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.NAME': 'Nom',
      'COMMON.EMAIL': 'Email',
      'AUTH.PASSWORD': 'Contrasenya',
      'COMMON.DESCRIPTION': 'Descripció',
      'COMMON.AGE': 'Edat',
      'COMMON.BIRTH_DATE': 'Data de naixement',
      'COMMON.APPOINTMENT_DATE': 'Data de cita',
      'COMMON.TERMS': 'Termes i condicions',
      'COMMON.CATEGORY': 'Categoria',
      'COMMON.SERVICE': 'Servei',
      'COMMON.NOTES': 'Notes',
      'COMMON.FAVORITE': 'Favorit',
      'INPUTS.TEXT_PLACEHOLDER': 'Introdueix text...',
      'INPUTS.TEXT_EMAIL_PLACEHOLDER': 'Introdueix email...',
      'INPUTS.TEXT_PASSWORD_PLACEHOLDER': 'Introdueix contrasenya...',
      'INPUTS.PASSWORD_PLACEHOLDER': 'Introdueix contrasenya...',
      'INPUTS.TEXTAREA_PLACEHOLDER': 'Introdueix text...',
      'INPUTS.SELECT_PLACEHOLDER': 'Selecciona una opció...',
      'INPUTS.NUMBER_PLACEHOLDER': 'Introdueix un número...',
      'INPUTS.DATE_PLACEHOLDER': 'Selecciona una data...'
    });
  }
}

// Test parent component that uses all input components
@Component({
  selector: 'pelu-test-parent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputTextareaComponent
  ],
  template: `
    <form [formGroup]="form">
      <!-- Text Input -->
      <pelu-input-text
        formControlName="name"
        [label]="'COMMON.NAME'"
        [placeholder]="'INPUTS.TEXT_PLACEHOLDER'"
        [required]="true"
        [type]="'text'"
        (valueChange)="onTextChange($event)">
      </pelu-input-text>

      <!-- Textarea -->
      <pelu-input-textarea
        formControlName="description"
        [label]="'COMMON.DESCRIPTION'"
        [placeholder]="'INPUTS.TEXTAREA_PLACEHOLDER'"
        [rows]="3"
        (valueChange)="onDescriptionChange($event)">
      </pelu-input-textarea>
    </form>

    <!-- Display current form values -->
    <div class="form-values">
      <h3>Form Values:</h3>
      <pre>{{ form.value | json }}</pre>
    </div>

    <!-- Display signal values -->
    <div class="signal-values">
      <h3>Signal Values:</h3>
      <pre>{{ signalValues() | json }}</pre>
    </div>
  `
})
class TestParentComponent {
  form: FormGroup;
  textValue = signal('');
  descriptionValue = signal('');
  signalValues = signal(() => ({
    text: this.textValue(),
    description: this.descriptionValue()
  }));
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['Valor inicial'],
      description: ['Descripció inicial']
    });
  }
  onTextChange(value: string) {
    this.textValue.set(value);
  }
  onDescriptionChange(value: string) {
    this.descriptionValue.set(value);
  }
  setFormValue(controlName: string, value: any) {
    this.form.get(controlName)?.setValue(value);
  }
  getFormValue(controlName: string) {
    return this.form.get(controlName)?.value;
  }
}

describe('Input Components Integration Tests', () => {
  let component: TestParentComponent;
  let fixture: ComponentFixture<TestParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestParentComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create parent component with all input components', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
  });

  it('should have initial form values', () => {
    const formValues = component.form.value;
    expect(formValues.name).toBe('Valor inicial');
    expect(formValues.description).toBe('Descripció inicial');
  });

  it('should have initial signal values', () => {
    expect(component.signalValues()().text).toBe('Valor inicial');
    expect(component.signalValues()().description).toBe('Descripció inicial');
  });

  describe('Text Input Integration', () => {
    it('should update form and signal when text input changes', () => {
      const testValue = 'John Doe';
      component.setFormValue('name', testValue);
      fixture.detectChanges();

      expect(component.getFormValue('name')).toBe(testValue);
      expect(component.textValue()).toBe(testValue);
      expect(component.signalValues()().text).toBe(testValue);
    });
  });

  describe('Textarea Integration', () => {
    it('should update form and signal when textarea content changes', () => {
      const testDescription = 'This is a test description with multiple lines.\nIt should handle line breaks properly.';
      component.setFormValue('description', testDescription);
      fixture.detectChanges();

      expect(component.getFormValue('description')).toBe(testDescription);
      expect(component.descriptionValue()).toBe(testDescription);
      expect(component.signalValues()().description).toBe(testDescription);
    });

    it('should handle empty textarea', () => {
      component.setFormValue('description', '');
      fixture.detectChanges();

      expect(component.getFormValue('description')).toBe('');
      expect(component.descriptionValue()).toBe('');
      expect(component.signalValues()().description).toBe('');
    });
  });

  describe('Form Validation Integration', () => {
    it('should validate required fields', () => {
      // Initially form should be invalid due to required fields
      expect(component.form.valid).toBe(false);

      // Fill required fields
      component.setFormValue('name', 'John Doe');
      fixture.detectChanges();

      // Form should now be valid
      expect(component.form.valid).toBe(true);
    });

    it('should handle form reset', () => {
      // Set some values
      component.setFormValue('name', 'John Doe');
      fixture.detectChanges();

      // Verify values are set
      expect(component.getFormValue('name')).toBe('John Doe');

      // Reset form
      component.form.reset();
      fixture.detectChanges();

      // Verify values are reset
      expect(component.getFormValue('name')).toBe('Valor inicial');
    });
  });

  describe('Multiple Input Changes Integration', () => {
    it('should handle multiple simultaneous input changes', () => {
      // Change multiple inputs at once
      component.setFormValue('name', 'Jane Doe');
      component.setFormValue('description', 'Jane Doe description');
      fixture.detectChanges();

      // Verify all values are updated
      const formValues = component.form.value;
      expect(formValues.name).toBe('Jane Doe');
      expect(formValues.description).toBe('Jane Doe description');

      expect(component.signalValues()().text).toBe('Jane Doe');
      expect(component.signalValues()().description).toBe('Jane Doe description');
    });

    it('should maintain data consistency between form and signals', () => {
      // Set initial values
      component.setFormValue('name', 'Initial Name');
      fixture.detectChanges();

      // Verify consistency
      expect(component.getFormValue('name')).toBe(component.textValue());

      // Change values
      component.setFormValue('name', 'Updated Name');
      fixture.detectChanges();

      // Verify consistency is maintained
      expect(component.getFormValue('name')).toBe(component.textValue());
    });
  });

  describe('Event Handler Integration', () => {
    it('should call event handlers when values change', () => {
      spyOn(component, 'onTextChange');
      spyOn(component, 'onDescriptionChange');

      // Trigger changes
      component.setFormValue('name', 'Test Name');
      component.setFormValue('description', 'Test Description');
      fixture.detectChanges();

      // Verify event handlers were called
      expect(component.onTextChange).toHaveBeenCalledWith('Test Name');
      expect(component.onDescriptionChange).toHaveBeenCalledWith('Test Description');
    });
  });
});
