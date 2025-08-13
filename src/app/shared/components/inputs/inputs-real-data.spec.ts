import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import all input components
import { InputTextComponent } from './input-text/input-text.component';
import { InputPasswordComponent } from './input-password/input-password.component';
import { InputCheckboxComponent } from './input-checkbox/input-checkbox.component';
import { InputToggleSwitchComponent } from './input-toggleswitch/input-toggleswitch.component';
import { InputTextareaComponent } from './input-textarea/input-textarea.component';
import { InputSelectComponent, SelectOption } from './input-select/input-select.component';
import { InputNumberComponent } from './input-number/input-number.component';
import { InputDateComponent } from './input-date/input-date.component';

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
      'COMMON.PRICE': 'Preu',
      'COMMON.DURATION': 'Durada',
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

// Test component for real data scenarios
@Component({
  selector: 'pelu-test-real-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputPasswordComponent,
    InputCheckboxComponent,
    InputToggleSwitchComponent,
    InputTextareaComponent,
    InputSelectComponent,
    InputNumberComponent,
    InputDateComponent
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- User Registration Form -->
      <div class="user-registration">
        <h3>Registre d'Usuari</h3>

        <pelu-input-text
          formControlName="name"
          [label]="'COMMON.NAME'"
          [placeholder]="'INPUTS.TEXT_PLACEHOLDER'"
          [required]="true"
          [type]="'text'"
          [invalid]="isFieldInvalid('name')"
          [errorText]="getFieldError('name')"
          (valueChange)="onNameChange($event)">
        </pelu-input-text>

        <pelu-input-text
          formControlName="email"
          [label]="'COMMON.EMAIL'"
          [placeholder]="'INPUTS.TEXT_EMAIL_PLACEHOLDER'"
          [required]="true"
          [type]="'email'"
          [invalid]="isFieldInvalid('email')"
          [errorText]="getFieldError('email')"
          (valueChange)="onEmailChange($event)">
        </pelu-input-text>

        <pelu-input-password
          formControlName="password"
          [label]="'AUTH.PASSWORD'"
          [placeholder]="'INPUTS.PASSWORD_PLACEHOLDER'"
          [required]="true"
          [feedback]="true"
          [invalid]="isFieldInvalid('password')"
          [errorText]="getFieldError('password')"
          (valueChange)="onPasswordChange($event)">
        </pelu-input-password>

        <pelu-input-number
          formControlName="age"
          [label]="'COMMON.AGE'"
          [placeholder]="'INPUTS.NUMBER_PLACEHOLDER'"
          [min]="0"
          [max]="120"
          [mode]="'decimal'"
          [invalid]="isFieldInvalid('age')"
          [errorText]="getFieldError('age')"
          (valueChange)="onAgeChange($event)">
        </pelu-input-number>

        <pelu-input-date
          formControlName="birthDate"
          [label]="'COMMON.BIRTH_DATE'"
          [placeholder]="'INPUTS.DATE_PLACEHOLDER'"
          [dateFormat]="'dd/mm/yy'"
          [showIcon]="true"
          [invalid]="isFieldInvalid('birthDate')"
          [errorText]="getFieldError('birthDate')"
          (valueChange)="onBirthDateChange($event)">
        </pelu-input-date>

        <pelu-input-checkbox
          formControlName="terms"
          [label]="'COMMON.TERMS'"
          [required]="true"
          [invalid]="isFieldInvalid('terms')"
          (valueChange)="onTermsChange($event)">
        </pelu-input-checkbox>
      </div>

      <!-- Service Booking Form -->
      <div class="service-booking">
        <h3>Reserva de Servei</h3>

        <pelu-input-select
          formControlName="service"
          [label]="'COMMON.SERVICE'"
          [placeholder]="'INPUTS.SELECT_PLACEHOLDER'"
          [options]="serviceOptions()"
          [clearable]="true"
          [searchable]="true"
          [invalid]="isFieldInvalid('service')"
          [errorText]="getFieldError('service')"
          (valueChange)="onServiceChange($event)">
        </pelu-input-select>

        <pelu-input-date
          formControlName="appointmentDate"
          [label]="'COMMON.APPOINTMENT_DATE'"
          [placeholder]="'INPUTS.DATE_PLACEHOLDER'"
          [dateFormat]="'dd/mm/yy'"
          [showIcon]="true"
          [preventPastMonths]="true"
          [invalid]="isFieldInvalid('appointmentDate')"
          [errorText]="getFieldError('appointmentDate')"
          (valueChange)="onAppointmentDateChange($event)">
        </pelu-input-date>

        <pelu-input-textarea
          formControlName="notes"
          [label]="'COMMON.NOTES'"
          [placeholder]="'INPUTS.TEXTAREA_PLACEHOLDER'"
          [rows]="3"
          [maxlength]="500"
          [invalid]="isFieldInvalid('notes')"
          [errorText]="getFieldError('notes')"
          (valueChange)="onNotesChange($event)">
        </pelu-input-textarea>

        <pelu-input-toggleswitch
          formControlName="favorite"
          [label]="'COMMON.FAVORITE'"
          (valueChange)="onFavoriteChange($event)">
        </pelu-input-toggleswitch>
      </div>

      <button type="submit" [disabled]="!form.valid">Enviar</button>
    </form>

    <!-- Form Status -->
    <div class="form-status">
      <h4>Estat del Formulari:</h4>
      <p>Vàlid: {{ form.valid }}</p>
      <p>Dirty: {{ form.dirty }}</p>
      <p>Touched: {{ form.touched }}</p>
      <p>Errors: {{ form.errors | json }}</p>
    </div>

    <!-- Current Values -->
    <div class="current-values">
      <h4>Valors Actuals:</h4>
      <pre>{{ form.value | json }}</pre>
    </div>
  `
})
class TestRealDataComponent {
  private readonly fb = inject(FormBuilder);
  form: FormGroup;

  // Signals to track changes
  nameValue = signal('');
  emailValue = signal('');
  passwordValue = signal('');
  ageValue = signal<number | null>(null);
  birthDateValue = signal<Date | null>(null);
  termsValue = signal(false);
  serviceValue = signal('');
  appointmentDateValue = signal<Date | null>(null);
  notesValue = signal('');
  favoriteValue = signal(false);

  // Service options with real data
  serviceOptions = signal<SelectOption[]>([
    {
      label: 'Tall de Cabell',
      value: 'haircut',
      color: '#3b82f6',
      price: 25,
      duration: 30,
      description: 'Tall de cabell professional',
      category: 'Cabell',
      icon: 'pi pi-user',
      isPopular: true,
      new: false,
      discount: 0,
      available: true
    },
    {
      label: 'Coloració',
      value: 'coloring',
      color: '#10b981',
      price: 45,
      duration: 60,
      description: 'Coloració professional',
      category: 'Cabell',
      icon: 'pi pi-palette',
      isPopular: true,
      new: false,
      discount: 10,
      available: true
    },
    {
      label: 'Estilitzat',
      value: 'styling',
      color: '#f59e0b',
      price: 35,
      duration: 45,
      description: 'Estilitzat professional',
      category: 'Cabell',
      icon: 'pi pi-star',
      isPopular: false,
      new: false,
      discount: 0,
      available: true
    },
    {
      label: 'Tractament',
      value: 'treatment',
      color: '#8b5cf6',
      price: 55,
      duration: 90,
      description: 'Tractament capil·lar',
      category: 'Tractament',
      icon: 'pi pi-heart',
      isPopular: false,
      new: true,
      discount: 0,
      available: true
    }
  ]);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      age: [null, [Validators.required, Validators.min(0), Validators.max(120)]],
      birthDate: [null, [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
      service: ['', [Validators.required]],
      appointmentDate: [null, [Validators.required]],
      notes: ['', [Validators.maxLength(500)]],
      favorite: [false]
    });

    // Subscribe to form changes
    this.form.valueChanges.subscribe(values => {
      this.nameValue.set(values.name);
      this.emailValue.set(values.email);
      this.passwordValue.set(values.password);
      this.ageValue.set(values.age);
      this.birthDateValue.set(values.birthDate);
      this.termsValue.set(values.terms);
      this.serviceValue.set(values.service);
      this.appointmentDateValue.set(values.appointmentDate);
      this.notesValue.set(values.notes);
      this.favoriteValue.set(values.favorite);
    });
  }

  // Event handlers
  onNameChange(value: string) {
    this.nameValue.set(value);
  }

  onEmailChange(value: string) {
    this.emailValue.set(value);
  }

  onPasswordChange(value: string) {
    this.passwordValue.set(value);
  }

  onAgeChange(value: number | null) {
    this.ageValue.set(value);
  }

  onBirthDateChange(value: Date | null) {
    this.birthDateValue.set(value);
  }

  onTermsChange(value: boolean) {
    this.termsValue.set(value);
  }

  onServiceChange(value: string) {
    this.serviceValue.set(value);
  }

  onAppointmentDateChange(value: Date | null) {
    this.appointmentDateValue.set(value);
  }

  onNotesChange(value: string) {
    this.notesValue.set(value);
  }

  onFavoriteChange(value: boolean) {
    this.favoriteValue.set(value);
  }

  // Helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Aquest camp és obligatori';
      if (field.errors['email']) return 'Format d\'email invàlid';
      if (field.errors['minlength']) return `Mínim ${field.errors['minlength'].requiredLength} caràcters`;
      if (field.errors['maxlength']) return `Màxim ${field.errors['maxlength'].requiredLength} caràcters`;
      if (field.errors['min']) return `Valor mínim: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor màxim: ${field.errors['max'].max}`;
      if (field.errors['requiredTrue']) return 'Has d\'acceptar els termes';
    }
    return '';
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
    }
  }

  // Test helper methods
  setFormValue(controlName: string, value: unknown) {
    this.form.get(controlName)?.setValue(value);
  }

  getFormValue(controlName: string) {
    return this.form.get(controlName)?.value;
  }

  isFormValid() {
    return this.form.valid;
  }

  getFormErrors(controlName: string) {
    return this.form.get(controlName)?.errors;
  }

  markFieldAsTouched(controlName: string) {
    this.form.get(controlName)?.markAsTouched();
  }
}

describe('Input Components Real Data Tests', () => {
  let component: TestRealDataComponent;
  let fixture: ComponentFixture<TestRealDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestRealDataComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestRealDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component with real data form', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
  });

  it('should have service options with real data', () => {
    const options = component.serviceOptions();
    expect(options).toHaveSize(4);

    // Check first service
    expect(options[0]).toEqual({
      label: 'Tall de Cabell',
      value: 'haircut',
      color: '#3b82f6',
      price: 25,
      duration: 30,
      description: 'Tall de cabell professional',
      category: 'Cabell',
      icon: 'pi pi-user',
      isPopular: true,
      new: false,
      discount: 0,
      available: true
    });

    // Check popular services
    const popularServices = options.filter(service => service.isPopular);
    expect(popularServices).toHaveSize(2);
    expect(popularServices[0].label).toBe('Tall de Cabell');
    expect(popularServices[1].label).toBe('Coloració');

    // Check new service
    const newServices = options.filter(service => service.new);
    expect(newServices).toHaveSize(1);
    expect(newServices[0].label).toBe('Tractament');

    // Check discounted services
    const discountedServices = options.filter(service => service.discount && service.discount > 0);
    expect(discountedServices).toHaveSize(1);
    expect(discountedServices[0].label).toBe('Coloració');
  });

  describe('User Registration Form Validation', () => {
    it('should validate required name field', () => {
      // Initially form should be invalid
      expect(component.isFormValid()).toBe(false);

      // Set invalid name (too short)
      component.setFormValue('name', 'A');
      component.markFieldAsTouched('name');
      fixture.detectChanges();

      expect(component.isFieldInvalid('name')).toBe(true);
      expect(component.getFieldError('name')).toBe('Mínim 2 caràcters');

      // Set valid name
      component.setFormValue('name', 'John Doe');
      fixture.detectChanges();

      expect(component.isFieldInvalid('name')).toBe(false);
      expect(component.getFieldError('name')).toBe('');
    });

    it('should validate email format', () => {
      // Set invalid email
      component.setFormValue('email', 'invalid-email');
      component.markFieldAsTouched('email');
      fixture.detectChanges();

      expect(component.isFieldInvalid('email')).toBe(true);
      expect(component.getFieldError('email')).toBe('Format d\'email invàlid');

      // Set valid email
      component.setFormValue('email', 'john@example.com');
      fixture.detectChanges();

      expect(component.isFieldInvalid('email')).toBe(false);
      expect(component.getFieldError('email')).toBe('');
    });

    it('should validate password length', () => {
      // Set invalid password (too short)
      component.setFormValue('password', '123');
      component.markFieldAsTouched('password');
      fixture.detectChanges();

      expect(component.isFieldInvalid('password')).toBe(true);
      expect(component.getFieldError('password')).toBe('Mínim 8 caràcters');

      // Set valid password
      component.setFormValue('password', 'secret123');
      fixture.detectChanges();

      expect(component.isFieldInvalid('password')).toBe(false);
      expect(component.getFieldError('password')).toBe('');
    });

    it('should validate age range', () => {
      // Set invalid age (negative)
      component.setFormValue('age', -5);
      component.markFieldAsTouched('age');
      fixture.detectChanges();

      expect(component.isFieldInvalid('age')).toBe(true);
      expect(component.getFieldError('age')).toBe('Valor mínim: 0');

      // Set invalid age (too high)
      component.setFormValue('age', 150);
      fixture.detectChanges();

      expect(component.isFieldInvalid('age')).toBe(true);
      expect(component.getFieldError('age')).toBe('Valor màxim: 120');

      // Set valid age
      component.setFormValue('age', 25);
      fixture.detectChanges();

      expect(component.isFieldInvalid('age')).toBe(false);
      expect(component.getFieldError('age')).toBe('');
    });

    it('should validate required terms acceptance', () => {
      // Initially terms should be false
      expect(component.getFormValue('terms')).toBe(false);

      // Accept terms
      component.setFormValue('terms', true);
      fixture.detectChanges();

      expect(component.getFormValue('terms')).toBe(true);
      expect(component.isFieldInvalid('terms')).toBe(false);
    });
  });

  describe('Service Booking Form Validation', () => {
    it('should validate required service selection', () => {
      // Initially no service selected
      expect(component.getFormValue('service')).toBe('');

      // Select a service
      component.setFormValue('service', 'haircut');
      fixture.detectChanges();

      expect(component.getFormValue('service')).toBe('haircut');
      expect(component.isFieldInvalid('service')).toBe(false);
    });

    it('should validate appointment date', () => {
      // Set past date (should be invalid with preventPastMonths)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      component.setFormValue('appointmentDate', pastDate);
      fixture.detectChanges();

      // Set future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      component.setFormValue('appointmentDate', futureDate);
      fixture.detectChanges();

      expect(component.getFormValue('appointmentDate')).toEqual(futureDate);
      expect(component.isFieldInvalid('appointmentDate')).toBe(false);
    });

    it('should validate notes length', () => {
      // Set notes within limit
      const shortNotes = 'Short notes';
      component.setFormValue('notes', shortNotes);
      fixture.detectChanges();

      expect(component.getFormValue('notes')).toBe(shortNotes);
      expect(component.isFieldInvalid('notes')).toBe(false);

      // Set notes exceeding limit
      const longNotes = 'A'.repeat(501);
      component.setFormValue('notes', longNotes);
      component.markFieldAsTouched('notes');
      fixture.detectChanges();

      expect(component.isFieldInvalid('notes')).toBe(true);
      expect(component.getFieldError('notes')).toBe('Màxim 500 caràcters');
    });
  });

  describe('Complete Form Submission', () => {
    it('should allow form submission with valid data', () => {
      // Fill all required fields with valid data
      component.setFormValue('name', 'John Doe');
      component.setFormValue('email', 'john@example.com');
      component.setFormValue('password', 'secret123');
      component.setFormValue('age', 25);
      component.setFormValue('birthDate', new Date('1990-01-15'));
      component.setFormValue('terms', true);
      component.setFormValue('service', 'haircut');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      component.setFormValue('appointmentDate', futureDate);

      fixture.detectChanges();

      // Form should be valid
      expect(component.isFormValid()).toBe(true);
    });

    it('should prevent form submission with invalid data', () => {
      // Fill only some required fields
      component.setFormValue('name', 'John Doe');
      component.setFormValue('email', 'invalid-email');
      // Missing other required fields
      fixture.detectChanges();

      // Form should be invalid
      expect(component.isFormValid()).toBe(false);
    });
  });

  describe('Real Data Scenarios', () => {
    it('should handle complete user registration scenario', () => {
      // Simulate user filling registration form
      const userData = {
        name: 'Maria García',
        email: 'maria.garcia@example.com',
        password: 'securePassword123',
        age: 28,
        birthDate: new Date('1995-06-15'),
        terms: true
      };

      // Set user data
      Object.entries(userData).forEach(([field, value]) => {
        component.setFormValue(field, value);
      });
      fixture.detectChanges();

      // Verify all values are set correctly
      expect(component.getFormValue('name')).toBe(userData.name);
      expect(component.getFormValue('email')).toBe(userData.email);
      expect(component.getFormValue('password')).toBe(userData.password);
      expect(component.getFormValue('age')).toBe(userData.age);
      expect(component.getFormValue('birthDate')).toEqual(userData.birthDate);
      expect(component.getFormValue('terms')).toBe(userData.terms);

      // Verify signals are updated
      expect(component.nameValue()).toBe(userData.name);
      expect(component.emailValue()).toBe(userData.email);
      expect(component.passwordValue()).toBe(userData.password);
      expect(component.ageValue()).toBe(userData.age);
      expect(component.birthDateValue()).toEqual(userData.birthDate);
      expect(component.termsValue()).toBe(userData.terms);
    });

    it('should handle service booking scenario', () => {
      // Simulate service booking
      const bookingData = {
        service: 'coloring',
        appointmentDate: new Date('2024-02-15'),
        notes: 'Vull un color més fosc que l\'actual',
        favorite: true
      };

      // Set booking data
      Object.entries(bookingData).forEach(([field, value]) => {
        component.setFormValue(field, value);
      });
      fixture.detectChanges();

      // Verify all values are set correctly
      expect(component.getFormValue('service')).toBe(bookingData.service);
      expect(component.getFormValue('appointmentDate')).toEqual(bookingData.appointmentDate);
      expect(component.getFormValue('notes')).toBe(bookingData.notes);
      expect(component.getFormValue('favorite')).toBe(bookingData.favorite);

      // Verify signals are updated
      expect(component.serviceValue()).toBe(bookingData.service);
      expect(component.appointmentDateValue()).toEqual(bookingData.appointmentDate);
      expect(component.notesValue()).toBe(bookingData.notes);
      expect(component.favoriteValue()).toBe(bookingData.favorite);
    });

    it('should handle form reset and re-fill scenario', () => {
      // Fill form with data
      component.setFormValue('name', 'Initial Name');
      component.setFormValue('email', 'initial@example.com');
      component.setFormValue('service', 'haircut');
      fixture.detectChanges();

      // Verify data is set
      expect(component.getFormValue('name')).toBe('Initial Name');
      expect(component.getFormValue('email')).toBe('initial@example.com');
      expect(component.getFormValue('service')).toBe('haircut');

      // Reset form
      component.form.reset();
      fixture.detectChanges();

      // Verify form is reset
      expect(component.getFormValue('name')).toBe('');
      expect(component.getFormValue('email')).toBe('');
      expect(component.getFormValue('service')).toBe('');

      // Re-fill with new data
      component.setFormValue('name', 'New Name');
      component.setFormValue('email', 'new@example.com');
      component.setFormValue('service', 'styling');
      fixture.detectChanges();

      // Verify new data is set
      expect(component.getFormValue('name')).toBe('New Name');
      expect(component.getFormValue('email')).toBe('new@example.com');
      expect(component.getFormValue('service')).toBe('styling');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty string inputs correctly', () => {
      component.setFormValue('name', '');
      component.setFormValue('email', '');
      component.setFormValue('notes', '');
      fixture.detectChanges();

      expect(component.getFormValue('name')).toBe('');
      expect(component.getFormValue('email')).toBe('');
      expect(component.getFormValue('notes')).toBe('');
    });

    it('should handle null values correctly', () => {
      component.setFormValue('age', null);
      component.setFormValue('birthDate', null);
      component.setFormValue('appointmentDate', null);
      fixture.detectChanges();

      expect(component.getFormValue('age')).toBe(null);
      expect(component.getFormValue('birthDate')).toBe(null);
      expect(component.getFormValue('appointmentDate')).toBe(null);
    });

    it('should handle special characters in text inputs', () => {
      const specialText = 'Nom amb accents: María José, números: 123, símbols: @#$%';
      component.setFormValue('name', specialText);
      component.setFormValue('notes', specialText);
      fixture.detectChanges();

      expect(component.getFormValue('name')).toBe(specialText);
      expect(component.getFormValue('notes')).toBe(specialText);
    });

    it('should handle very long text inputs', () => {
      const longText = 'A'.repeat(1000);
      component.setFormValue('notes', longText);
      component.markFieldAsTouched('notes');
      fixture.detectChanges();

      expect(component.isFieldInvalid('notes')).toBe(true);
      expect(component.getFieldError('notes')).toBe('Màxim 500 caràcters');
    });
  });
});
