# 📝 Exemples i Casos d'Ús - Sistema d'Inputs

## 📋 Visió General

Aquest document proporciona exemples pràctics i casos d'ús del sistema d'inputs de PeluApp, mostrant com utilitzar cada component en diferents escenaris.

## 🎯 Casos d'Ús Comuns

### 1. Formulari de Registre d'Usuari

```typescript
import { Component, signal } from '@angular/core';
import { 
  InputTextComponent, 
  InputEmailComponent, 
  InputPasswordComponent,
  InputCheckboxComponent 
} from '@shared/components/inputs';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [
    InputTextComponent,
    InputEmailComponent,
    InputPasswordComponent,
    InputCheckboxComponent
  ],
  template: `
    <form (ngSubmit)="onSubmit()" class="registration-form">
      <h2>Registre d'Usuari</h2>
      
      <pelu-input-text
        [config]="nameConfig"
        [value]="formData().name"
        (valueChange)="updateField('name', $event)">
      </pelu-input-text>
      
      <pelu-input-text
        [config]="surnameConfig"
        [value]="formData().surname"
        (valueChange)="updateField('surname', $event)">
      </pelu-input-text>
      
      <pelu-input-email
        [config]="emailConfig"
        [value]="formData().email"
        (valueChange)="updateField('email', $event)">
      </pelu-input-email>
      
      <pelu-input-password
        [config]="passwordConfig"
        [value]="formData().password"
        (valueChange)="updateField('password', $event)">
      </pelu-input-password>
      
      <pelu-input-password
        [config]="confirmPasswordConfig"
        [value]="formData().confirmPassword"
        (valueChange)="updateField('confirmPassword', $event)">
      </pelu-input-password>
      
      <pelu-input-checkbox
        [config]="termsConfig"
        [value]="formData().acceptTerms"
        (valueChange)="updateField('acceptTerms', $event)">
      </pelu-input-checkbox>
      
      <button type="submit" [disabled]="!isFormValid()">
        Registrar-se
      </button>
    </form>
  `
})
export class UserRegistrationComponent {
  formData = signal({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Configuracions dels inputs
  nameConfig = {
    label: 'Nom',
    placeholder: 'Introdueix el teu nom',
    required: true,
    showLabel: true,
    helpText: 'Només lletres i espais'
  };

  surnameConfig = {
    label: 'Cognom',
    placeholder: 'Introdueix el teu cognom',
    required: true,
    showLabel: true
  };

  emailConfig = {
    label: 'Email',
    placeholder: 'exemple@email.com',
    required: true,
    showLabel: true,
    helpText: 'Utilitzarem aquest email per contactar-te'
  };

  passwordConfig = {
    label: 'Contrasenya',
    placeholder: 'Introdueix una contrasenya segura',
    required: true,
    showLabel: true,
    helpText: 'Mínim 8 caràcters, incloent majúscules i números'
  };

  confirmPasswordConfig = {
    label: 'Confirmar Contrasenya',
    placeholder: 'Repeteix la contrasenya',
    required: true,
    showLabel: true
  };

  termsConfig = {
    label: 'Accepto els termes i condicions',
    required: true,
    showLabel: true
  };

  updateField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  isFormValid(): boolean {
    const data = this.formData();
    return !!(
      data.name &&
      data.surname &&
      data.email &&
      data.password &&
      data.confirmPassword &&
      data.acceptTerms &&
      data.password === data.confirmPassword
    );
  }

  onSubmit() {
    if (this.isFormValid()) {
      console.log('Form data:', this.formData());
      // Enviar dades al servidor
    }
  }
}
```

### 2. Formulari de Reserva de Servei

```typescript
import { Component, signal } from '@angular/core';
import { 
  InputTextComponent,
  InputTextareaComponent,
  InputDateComponent,
  InputSelectComponent,
  InputNumberComponent
} from '@shared/components/inputs';

@Component({
  selector: 'app-service-booking',
  standalone: true,
  imports: [
    InputTextComponent,
    InputTextareaComponent,
    InputDateComponent,
    InputSelectComponent,
    InputNumberComponent
  ],
  template: `
    <form (ngSubmit)="onSubmit()" class="booking-form">
      <h2>Reserva de Servei</h2>
      
      <pelu-input-text
        [config]="nameConfig"
        [value]="formData().customerName"
        (valueChange)="updateField('customerName', $event)">
      </pelu-input-text>
      
      <pelu-input-text
        [config]="phoneConfig"
        [value]="formData().phone"
        (valueChange)="updateField('phone', $event)">
      </pelu-input-text>
      
      <pelu-input-select
        [label]="'Servei'"
        [placeholder]="'Selecciona un servei'"
        [required]="true"
        [options]="serviceOptions"
        [value]="formData().service"
        (valueChange)="updateField('service', $event)">
      </pelu-input-select>
      
      <!-- Input Select amb Plantilles Avançades -->
      <pelu-input-select
        [label]="'Servei Premium'"
        [placeholder]="'Selecciona un servei premium'"
        [required]="true"
        [options]="premiumServiceOptions"
        [filter]="true"
        [showClear]="true"
        [value]="formData().premiumService"
        (valueChange)="updateField('premiumService', $event)"
      >
        <!-- Template per l'element seleccionat -->
        <ng-template #selectedItem let-selectedOption>
          <div class="flex items-center gap-3" *ngIf="selectedOption">
            <div class="w-6 h-6 rounded-full flex items-center justify-center" 
                 [style.background-color]="selectedOption.color">
              <i [class]="selectedOption.icon" class="text-white text-sm"></i>
            </div>
            <div>
              <div class="font-semibold">{{ selectedOption.label }}</div>
              <div class="text-xs text-gray-500">{{ selectedOption.category }}</div>
            </div>
            <div class="ml-auto">
              <span class="text-lg font-bold text-green-600">{{ selectedOption.price }}€</span>
            </div>
          </div>
        </ng-template>

        <!-- Template per les opcions del dropdown -->
        <ng-template #item let-service>
          <div class="flex items-center justify-between w-full p-2">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" 
                   [style.background-color]="service.color">
                <i [class]="service.icon" class="text-white"></i>
              </div>
              <div>
                <div class="font-medium">{{ service.label }}</div>
                <div class="text-sm text-gray-500">{{ service.description }}</div>
                <div class="text-xs text-blue-600">{{ service.category }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg text-green-600">{{ service.price }}€</div>
              <div class="text-sm text-gray-500">{{ service.duration }}min</div>
              @if (service.popular) {
                <div class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  Popular
                </div>
              }
            </div>
          </div>
        </ng-template>

        <!-- Template per l'encapçalament -->
        <ng-template #header>
          <div class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200">
            <h4 class="font-bold text-blue-900 mb-1">Serveis Premium</h4>
            <p class="text-sm text-blue-700">Descobreix els nostres serveis exclusius</p>
            <div class="flex items-center gap-2 mt-2">
              <i class="pi pi-star-fill text-yellow-500"></i>
              <span class="text-xs text-blue-600">Qualitat garantida</span>
            </div>
          </div>
        </ng-template>

        <!-- Template per el peu -->
        <ng-template #footer>
          <div class="p-3 bg-gray-50 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <button class="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                <i class="pi pi-plus mr-2"></i>Nou Servei
              </button>
              <button class="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                <i class="pi pi-calendar mr-2"></i>Reservar
              </button>
            </div>
          </div>
        </ng-template>
      </pelu-input-select>
      
      <pelu-input-date
        [config]="dateConfig"
        [value]="formData().date"
        (valueChange)="updateField('date', $event)">
      </pelu-input-date>
      
      <pelu-input-number
        [label]="'Durada (minuts)'"
        [placeholder]="'60'"
        [required]="true"
        [min]="30"
        [max]="180"
        [step]="15"
        [helpText]="'Durada estimada del servei'"
        [value]="formData().duration"
        (valueChange)="updateField('duration', $event)">
      </pelu-input-number>
      
      <pelu-input-textarea
        [config]="notesConfig"
        [value]="formData().notes"
        (valueChange)="updateField('notes', $event)">
      </pelu-input-textarea>
      
      <button type="submit" [disabled]="!isFormValid()">
        Confirmar Reserva
      </button>
    </form>
  `
})
export class ServiceBookingComponent {
  formData = signal({
    customerName: '',
    phone: '',
    service: '',
    premiumService: '',
    date: '',
    duration: 60,
    notes: ''
  });

  nameConfig = {
    label: 'Nom del Client',
    placeholder: 'Introdueix el nom complet',
    required: true,
    showLabel: true
  };

  phoneConfig = {
    label: 'Telèfon',
    placeholder: '+34 600 000 000',
    required: true,
    showLabel: true,
    helpText: 'Utilitzarem aquest telèfon per contactar-te'
  };

  // Service configuration is now passed directly as properties
  // serviceConfig = {
  //   label: 'Servei',
  //   placeholder: 'Selecciona un servei',
  //   required: true,
  //   showLabel: true,
  //   options: [
  //     { value: 'haircut', label: 'Tall de Cabell', color: '#3B82F6', price: 25 },
  //     { value: 'coloring', label: 'Coloració', color: '#EF4444', price: 45 },
  //     { value: 'styling', label: 'Estil', color: '#10B981', price: 35 },
  //     { value: 'treatment', label: 'Tractament', color: '#F59E0B', price: 55 }
  //   ]
  // };

  serviceOptions = [
    { value: 'haircut', label: 'Tall de Cabell', color: '#3B82F6', price: 25 },
    { value: 'coloring', label: 'Coloració', color: '#EF4444', price: 45 },
    { value: 'styling', label: 'Estil', color: '#10B981', price: 35 },
    { value: 'treatment', label: 'Tractament', color: '#F59E0B', price: 55 }
  ];

  premiumServiceOptions = [
    { value: 'premium_haircut', label: 'Tall Premium', color: '#4F46E5', icon: 'pi pi-user', category: 'Cabell', description: 'Tall de cabell amb productes de luxe', price: 45, duration: 60, popular: true },
    { value: 'premium_coloring', label: 'Coloració Premium', color: '#10B981', icon: 'pi pi-palette', category: 'Coloració', description: 'Coloració amb productes exclusius', price: 65, duration: 90, popular: false },
    { value: 'premium_styling', label: 'Estil Premium', color: '#F59E0B', icon: 'pi pi-brush', category: 'Estil', description: 'Estilització amb tècniques avançades', price: 55, duration: 75, popular: true },
    { value: 'premium_treatment', label: 'Tractament Premium', color: '#EF4444', icon: 'pi pi-heart', category: 'Tractament', description: 'Tractament facial amb productes naturals', price: 80, duration: 120, popular: false }
  ];

  dateConfig = {
    label: 'Data de la Cita',
    placeholder: 'Selecciona una data',
    required: true,
    showLabel: true,
    minDate: new Date(),
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dies
  };

  // Duration configuration is now passed directly as properties
  // durationConfig = {
  //   label: 'Durada (minuts)',
  //   placeholder: '60',
  //   required: true,
  //   showLabel: true,
  //   min: 30,
  //   max: 180,
  //   step: 15,
  //   helpText: 'Durada estimada del servei'
  // };

  notesConfig = {
    label: 'Notes Addicionals',
    placeholder: 'Alguna preferència o comentari especial?',
    required: false,
    showLabel: true,
    rows: 4,
    helpText: 'Opcional: informació addicional per al servei'
  };

  updateField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  isFormValid(): boolean {
    const data = this.formData();
    return !!(
      data.customerName &&
      data.phone &&
      data.service &&
      data.date &&
      data.duration
    );
  }

  onSubmit() {
    if (this.isFormValid()) {
      console.log('Booking data:', this.formData());
      // Processar reserva
    }
  }
}
```

### 3. Formulari de Configuració d'Admin

```typescript
import { Component, signal } from '@angular/core';
import { 
  InputTextComponent,
  InputTextareaComponent,
  InputNumberComponent,
  InputSelectComponent,
  InputCheckboxComponent
} from '@shared/components/inputs';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    InputTextComponent,
    InputTextareaComponent,
    InputNumberComponent,
    InputSelectComponent,
    InputCheckboxComponent
  ],
  template: `
    <form (ngSubmit)="onSubmit()" class="admin-settings-form">
      <h2>Configuració de l'Establiment</h2>
      
      <pelu-input-text
        [config]="businessNameConfig"
        [value]="formData().businessName"
        (valueChange)="updateField('businessName', $event)">
      </pelu-input-text>
      
      <pelu-input-textarea
        [config]="descriptionConfig"
        [value]="formData().description"
        (valueChange)="updateField('description', $event)">
      </pelu-input-textarea>
      
      <pelu-input-text
        [config]="addressConfig"
        [value]="formData().address"
        (valueChange)="updateField('address', $event)">
      </pelu-input-text>
      
      <pelu-input-text
        [config]="phoneConfig"
        [value]="formData().phone"
        (valueChange)="updateField('phone', $event)">
      </pelu-input-text>
      
      <pelu-input-email
        [config]="emailConfig"
        [value]="formData().email"
        (valueChange)="updateField('email', $event)">
      </pelu-input-email>
      
      <pelu-input-select
        [label]="'Zona Horària'"
        [placeholder]="'Selecciona la zona horària'"
        [required]="true"
        [options]="timezoneOptions"
        [value]="formData().timezone"
        (valueChange)="updateField('timezone', $event)">
      </pelu-input-select>
      
      <pelu-input-number
        [label]="'Màxim de Reserves Simultànies'"
        [placeholder]="'10'"
        [required]="true"
        [min]="1"
        [max]="50"
        [helpText]="'Nombre màxim de reserves que pots gestionar alhora'"
        [value]="formData().maxBookings"
        (valueChange)="updateField('maxBookings', $event)">
      </pelu-input-number>
      
      <pelu-input-checkbox
        [config]="autoConfirmConfig"
        [value]="formData().autoConfirm"
        (valueChange)="updateField('autoConfirm', $event)">
      </pelu-input-checkbox>
      
      <pelu-input-checkbox
        [config]="notificationsConfig"
        [value]="formData().notifications"
        (valueChange)="updateField('notifications', $event)">
      </pelu-input-checkbox>
      
      <button type="submit">
        Guardar Configuració
      </button>
    </form>
  `
})
export class AdminSettingsComponent {
  formData = signal({
    businessName: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    timezone: 'Europe/Madrid',
    maxBookings: 10,
    autoConfirm: false,
    notifications: true
  });

  businessNameConfig = {
    label: 'Nom de l\'Establiment',
    placeholder: 'Ex: Perruqueria Maria',
    required: true,
    showLabel: true
  };

  descriptionConfig = {
    label: 'Descripció',
    placeholder: 'Descriu els teus serveis i especialitats...',
    required: false,
    showLabel: true,
    rows: 4
  };

  addressConfig = {
    label: 'Adreça',
    placeholder: 'Carrer Major, 123, Barcelona',
    required: true,
    showLabel: true
  };

  phoneConfig = {
    label: 'Telèfon',
    placeholder: '+34 93 123 45 67',
    required: true,
    showLabel: true
  };

  emailConfig = {
    label: 'Email de Contacte',
    placeholder: 'info@perruqueria.com',
    required: true,
    showLabel: true
  };

  // Timezone configuration is now passed directly as properties
  // timezoneConfig = {
  //   label: 'Zona Horària',
  //   placeholder: 'Selecciona la zona horària',
  //   required: true,
  //   showLabel: true,
  //   options: [
  //     { value: 'Europe/Madrid', label: 'Espanya (CET)' },
  //     { value: 'Europe/London', label: 'Regne Unit (GMT)' },
  //     { value: 'America/New_York', label: 'Nova York (EST)' }
  //   ]
  // };

  timezoneOptions = [
    { value: 'Europe/Madrid', label: 'Espanya (CET)' },
    { value: 'Europe/London', label: 'Regne Unit (GMT)' },
    { value: 'America/New_York', label: 'Nova York (EST)' }
  ];

  // MaxBookings configuration is now passed directly as properties
  // maxBookingsConfig = {
  //   label: 'Màxim de Reserves Simultànies',
  //   placeholder: '10',
  //   required: true,
  //   showLabel: true,
  //   min: 1,
  //   max: 50,
  //   helpText: 'Nombre màxim de reserves que pots gestionar alhora'
  // };

  autoConfirmConfig = {
    label: 'Confirmació Automàtica',
    required: false,
    showLabel: true,
    helpText: 'Les reserves es confirmen automàticament sense revisió manual'
  };

  notificationsConfig = {
    label: 'Notificacions per Email',
    required: false,
    showLabel: true,
    helpText: 'Rebràs notificacions per email de les noves reserves'
  };

  updateField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  onSubmit() {
    console.log('Settings data:', this.formData());
    // Guardar configuració
  }
}
```

## 🎨 Exemples d'Estils

### Formulari Responsive

```scss
.registration-form,
.booking-form,
.admin-settings-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  
  h2 {
    margin-bottom: 2rem;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  // Espaiat entre inputs
  pelu-input-text,
  pelu-input-email,
  pelu-input-password,
  pelu-input-textarea,
  pelu-input-date,
  pelu-input-select,
  pelu-input-number,
  pelu-input-checkbox {
    margin-bottom: 1.5rem;
  }
  
  // Botó d'enviament
  button[type="submit"] {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover:not(:disabled) {
      background-color: var(--primary-color-dark);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .registration-form,
  .booking-form,
  .admin-settings-form {
    padding: 1rem;
    
    h2 {
      font-size: 1.25rem;
    }
  }
}
```

### Estats d'Error i Validació

```typescript
// Exemple de validació personalitzada
export class FormValidationService {
  validateEmail(email: string): { isValid: boolean; message?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return { isValid: false, message: 'L\'email és obligatori' };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Format d\'email invàlid' };
    }
    
    return { isValid: true };
  }

  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password) {
      return { isValid: false, message: 'La contrasenya és obligatòria' };
    }
    
    if (password.length < 8) {
      return { isValid: false, message: 'La contrasenya ha de tenir almenys 8 caràcters' };
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'La contrasenya ha d\'incloure majúscules, minúscules i números' };
    }
    
    return { isValid: true };
  }

  validatePhone(phone: string): { isValid: boolean; message?: string } {
    const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
    
    if (!phone) {
      return { isValid: false, message: 'El telèfon és obligatori' };
    }
    
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { isValid: false, message: 'Format de telèfon invàlid' };
    }
    
    return { isValid: true };
  }
}
```

## 🌐 Exemples amb Traduccions

### Configuració Multiidioma

```typescript
// Configuració amb traduccions
const translatedConfigs = {
  name: {
    label: 'COMMON.FIELDS.NAME',
    placeholder: 'COMMON.PLACEHOLDERS.ENTER_NAME',
    helpText: 'COMMON.HELP.NAME_REQUIREMENTS',
    errorText: 'COMMON.ERRORS.NAME_REQUIRED'
  },
  
  email: {
    label: 'COMMON.FIELDS.EMAIL',
    placeholder: 'COMMON.PLACEHOLDERS.ENTER_EMAIL',
    helpText: 'COMMON.HELP.EMAIL_FORMAT',
    errorText: 'COMMON.ERRORS.EMAIL_INVALID'
  },
  
  password: {
    label: 'AUTH.PASSWORD',
    placeholder: 'COMMON.PLACEHOLDERS.ENTER_PASSWORD',
    helpText: 'COMMON.HELP.PASSWORD_REQUIREMENTS',
    errorText: 'COMMON.ERRORS.PASSWORD_WEAK'
  }
};

// Fitxer de traduccions (ca.json)
{
  "COMMON": {
    "FIELDS": {
      "NAME": "Nom",
      "EMAIL": "Email",
      "PASSWORD": "Contrasenya"
    },
    "PLACEHOLDERS": {
      "ENTER_NAME": "Introdueix el teu nom",
      "ENTER_EMAIL": "exemple@email.com",
      "ENTER_PASSWORD": "Introdueix la teva contrasenya"
    },
    "HELP": {
      "NAME_REQUIREMENTS": "Només lletres i espais",
      "EMAIL_FORMAT": "Format d'email vàlid",
      "PASSWORD_REQUIREMENTS": "Mínim 8 caràcters"
    },
    "ERRORS": {
      "NAME_REQUIRED": "El nom és obligatori",
      "EMAIL_INVALID": "Format d'email invàlid",
      "PASSWORD_WEAK": "La contrasenya és massa feble"
    }
  }
}
```

## ♿ Exemples d'Accessibilitat

### Implementació Completa d'Accessibilitat

```typescript
@Component({
  template: `
    <form (ngSubmit)="onSubmit()" class="accessible-form">
      <fieldset>
        <legend>Informació Personal</legend>
        
        <pelu-input-text
          [config]="accessibleNameConfig"
          [value]="formData().name"
          (valueChange)="updateField('name', $event)">
        </pelu-input-text>
        
        <div id="name-help" class="sr-only">
          Introdueix el teu nom complet tal com apareix al DNI
        </div>
      </fieldset>
      
      <fieldset>
        <legend>Informació de Contacte</legend>
        
        <pelu-input-email
          [config]="accessibleEmailConfig"
          [value]="formData().email"
          (valueChange)="updateField('email', $event)">
        </pelu-input-email>
      </fieldset>
    </form>
  `
})
export class AccessibleFormComponent {
  accessibleNameConfig = {
    label: 'Nom Complet',
    placeholder: 'Introdueix el teu nom complet',
    required: true,
    showLabel: true,
    ariaLabel: 'Camp per introduir el nom complet',
    ariaDescribedBy: 'name-help',
    ariaRequired: true
  };

  accessibleEmailConfig = {
    label: 'Adreça de Correu Electrònic',
    placeholder: 'exemple@email.com',
    required: true,
    showLabel: true,
    ariaLabel: 'Camp per introduir l\'adreça de correu electrònic',
    ariaRequired: true,
    ariaInvalid: false
  };
}
```

## 🧪 Exemples de Testing

### Tests Complets d'Inputs

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputTextComponent } from './input-text.component';
import { By } from '@angular/platform-browser';

describe('InputTextComponent', () => {
  let component: InputTextComponent;
  let fixture: ComponentFixture<InputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label when showLabel is true', () => {
    component.config = { label: 'Test Label', showLabel: true };
    fixture.detectChanges();
    
    const labelElement = fixture.debugElement.query(By.css('.input-label'));
    expect(labelElement.nativeElement.textContent).toContain('Test Label');
  });

  it('should not display label when showLabel is false', () => {
    component.config = { label: 'Test Label', showLabel: false };
    fixture.detectChanges();
    
    const labelElement = fixture.debugElement.query(By.css('.input-label'));
    expect(labelElement).toBeNull();
  });

  it('should emit value change when input changes', () => {
    const spy = jest.spyOn(component.valueChange, 'emit');
    component.config = { label: 'Test' };
    fixture.detectChanges();
    
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.value = 'test value';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    
    expect(spy).toHaveBeenCalledWith('test value');
  });

  it('should show error state when validation fails', () => {
    component.config = { label: 'Test', required: true };
    component.errorText = 'Camp obligatori';
    fixture.detectChanges();
    
    const errorElement = fixture.debugElement.query(By.css('.input-error-message'));
    expect(errorElement.nativeElement.textContent).toContain('Camp obligatori');
  });

  it('should be disabled when config.disabled is true', () => {
    component.config = { label: 'Test', disabled: true };
    fixture.detectChanges();
    
    const inputElement = fixture.debugElement.query(By.css('input'));
    expect(inputElement.nativeElement.disabled).toBe(true);
  });
});
```

---

**Última actualització: Juliol 2025** 
