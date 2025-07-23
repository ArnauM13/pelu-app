# 🎨 Sistema d'Inputs Unificats - PeluApp

## 📋 Visió General

El sistema d'inputs unificats de PeluApp proporciona una col·lecció completa de components d'entrada de dades amb estils consistents, validació integrada i accessibilitat completa. Tots els components segueixen el mateix patró de disseny i són totalment reutilitzables.

## 🎯 Característiques Principals

- ✅ **8 tipus d'inputs** disponibles
- ✅ **Mides unificades** per consistència visual
- ✅ **Estats visuals** (normal, focus, error, success, disabled)
- ✅ **Validació integrada** amb feedback immediat
- ✅ **Responsive design** optimitzat per tots els dispositius
- ✅ **Accessibilitat completa** (ARIA, navegació per teclat)
- ✅ **Suport multiidioma** amb traduccions dinàmiques
- ✅ **ControlValueAccessor** implementat per integració amb formularis

## 📦 Components Disponibles

### 1. **Input Text** (`pelu-input-text`)

Component per a entrades de text d'una sola línia.

```typescript
<pelu-input-text
  [config]="{
    type: 'text',
    label: 'Nom',
    placeholder: 'Introdueix el teu nom',
    required: true,
    showLabel: true
  }"
  [value]="formData.name"
  (valueChange)="onNameChange($event)">
</pelu-input-text>
```

**Característiques**:
- Mida unificada: 44px d'alçada
- Suport per diferents tipus (text, email, password, number)
- Validació en temps real
- Estats visuals amb feedback immediat

### 2. **Input Textarea** (`pelu-input-textarea`)

Component per a entrades de text llarg amb múltiples línies.

```typescript
<pelu-input-textarea
  [config]="{
    label: 'Descripció',
    placeholder: 'Introdueix una descripció...',
    rows: 4,
    autoResize: true,
    showLabel: true
  }"
  [value]="formData.description"
  (valueChange)="onDescriptionChange($event)">
</pelu-input-textarea>
```

**Característiques**:
- Mida unificada: 80px d'alçada mínima (mòbil: 88px)
- Auto-resize opcional
- Configuració de files
- Scroll automàtic

### 3. **Input Email** (`pelu-input-email`)

Component especialitzat per a entrades d'email amb validació automàtica.

```typescript
<pelu-input-email
  [config]="{
    label: 'Email',
    placeholder: 'exemple@email.com',
    required: true,
    showLabel: true
  }"
  [value]="formData.email"
  (valueChange)="onEmailChange($event)">
</pelu-input-email>
```

**Característiques**:
- Validació automàtica d'email
- Feedback visual immediat
- Suport per múltiples formats d'email

### 4. **Input Password** (`pelu-input-password`)

Component per a contrasenyes amb opció de mostrar/amagar.

```typescript
<pelu-input-password
  [config]="{
    label: 'Contrasenya',
    placeholder: 'Introdueix la teva contrasenya',
    required: true,
    showLabel: true
  }"
  [value]="formData.password"
  (valueChange)="onPasswordChange($event)">
</pelu-input-password>
```

**Característiques**:
- Toggle per mostrar/amagar contrasenya
- Indicador de força de contrasenya
- Validació de seguretat

### 5. **Input Number** (`pelu-input-number`)

Component per a entrades numèriques amb validació.

```typescript
<pelu-input-number
  [config]="{
    label: 'Edat',
    placeholder: 'Introdueix la teva edat',
    min: 0,
    max: 120,
    step: 1,
    showLabel: true
  }"
  [value]="formData.age"
  (valueChange)="onAgeChange($event)">
</pelu-input-number>
```

**Característiques**:
- Configuració de min/max/step
- Validació de rangs
- Suport per decimals

### 6. **Input Date** (`pelu-input-date`)

Component per a selecció de dates amb picker integrat.

```typescript
<pelu-input-date
  [config]="{
    label: 'Data de naixement',
    placeholder: 'Selecciona una data',
    required: true,
    showLabel: true
  }"
  [value]="formData.birthDate"
  (valueChange)="onDateChange($event)">
</pelu-input-date>
```

**Característiques**:
- Picker de data integrat
- Configuració de rangs de dates
- Format personalitzable
- Suport multiidioma

### 7. **Input Select** (`pelu-input-select`)

Component per a selecció d'opcions amb suport per colors i icones.

```typescript
<pelu-input-select
  [config]="{
    label: 'Categoria',
    placeholder: 'Selecciona una categoria',
    options: [
      { value: 'haircut', label: 'Tall de cabell', color: '#3B82F6' },
      { value: 'coloring', label: 'Coloració', color: '#EF4444' },
      { value: 'styling', label: 'Estil', color: '#10B981' }
    ],
    showLabel: true
  }"
  [value]="formData.category"
  (valueChange)="onCategoryChange($event)">
</pelu-input-select>
```

**Característiques**:
- Suport per colors i icones
- Opcions dinàmiques
- Búsqueda integrada
- Multi-selecció opcional

### 8. **Input Checkbox** (`pelu-input-checkbox`)

Component per a caselles de selecció amb estats múltiples.

```typescript
<pelu-input-checkbox
  [config]="{
    label: 'Accepto els termes i condicions',
    required: true,
    showLabel: true
  }"
  [value]="formData.termsAccepted"
  (valueChange)="onTermsChange($event)">
</pelu-input-checkbox>
```

**Característiques**:
- Estats múltiples (checked, unchecked, indeterminate)
- Suport per grups de checkboxes
- Validació de selecció mínima

## 🎨 Estils Unificats

### Mides Consistents

```scss
// Variables globals
:root {
  --input-height: 44px;
  --textarea-min-height: 80px;
  --textarea-mobile-min-height: 88px;
  --border-radius: 8px;
  --border-width: 2px;
  --padding: 0.75rem;
}
```

### Estats Visuals

```scss
// Estats dels inputs
.input-normal {
  border: var(--border-width) solid #e5e7eb;
  background-color: #ffffff;
}

.input-focus {
  border: var(--border-width) solid #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.input-error {
  border: var(--border-width) solid #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-success {
  border: var(--border-width) solid #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.input-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f9fafb;
}
```

### Responsive Design

```scss
// Breakpoints
@media (max-width: 768px) {
  .input-textarea {
    min-height: var(--textarea-mobile-min-height);
  }
  
  .input-label {
    font-size: 0.875rem;
  }
}
```

## 🔧 Configuració i Ús

### Configuració Bàsica

```typescript
interface InputConfig {
  type?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
  helpText?: string;
  errorText?: string;
  successText?: string;
}
```

### Integració amb Formularis

```typescript
import { Component, signal } from '@angular/core';
import { InputTextComponent, InputEmailComponent } from '@shared/components/inputs';

@Component({
  selector: 'app-form-example',
  standalone: true,
  imports: [InputTextComponent, InputEmailComponent],
  template: `
    <form (ngSubmit)="onSubmit()">
      <pelu-input-text
        [config]="nameConfig"
        [value]="formData().name"
        (valueChange)="updateField('name', $event)">
      </pelu-input-text>
      
      <pelu-input-email
        [config]="emailConfig"
        [value]="formData().email"
        (valueChange)="updateField('email', $event)">
      </pelu-input-email>
      
      <button type="submit">Enviar</button>
    </form>
  `
})
export class FormExampleComponent {
  formData = signal({
    name: '',
    email: ''
  });

  nameConfig = {
    label: 'Nom',
    placeholder: 'Introdueix el teu nom',
    required: true,
    showLabel: true
  };

  emailConfig = {
    label: 'Email',
    placeholder: 'exemple@email.com',
    required: true,
    showLabel: true
  };

  updateField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  onSubmit() {
    console.log('Form data:', this.formData());
  }
}
```

### Validació Personalitzada

```typescript
// Validació personalitzada
const customValidation = {
  name: {
    required: 'El nom és obligatori',
    minLength: 'El nom ha de tenir almenys 2 caràcters',
    pattern: 'El nom només pot contenir lletres'
  },
  email: {
    required: 'L\'email és obligatori',
    email: 'Format d\'email invàlid'
  }
};
```

## 🌐 Suport Multiidioma

Tots els components suporten traduccions dinàmiques:

```typescript
// Configuració amb traduccions
const configWithTranslations = {
  label: 'COMMON.FIELDS.NAME',
  placeholder: 'COMMON.PLACEHOLDERS.ENTER_NAME',
  helpText: 'COMMON.HELP.NAME_REQUIREMENTS',
  errorText: 'COMMON.ERRORS.NAME_REQUIRED'
};
```

```html
<!-- Ús en template -->
<pelu-input-text
  [config]="configWithTranslations"
  [value]="formData.name"
  (valueChange)="onNameChange($event)">
</pelu-input-text>
```

## ♿ Accessibilitat

Tots els components implementen les millors pràctiques d'accessibilitat:

- **ARIA labels** i descripcions
- **Navegació per teclat** completa
- **Focus management** adequat
- **Screen reader** support
- **Color contrast** complint WCAG 2.1

```html
<!-- Exemple d'accessibilitat -->
<pelu-input-text
  [config]="{
    label: 'Nom',
    ariaLabel: 'Camp per introduir el nom complet',
    ariaDescribedBy: 'name-help'
  }"
  [value]="formData.name"
  (valueChange)="onNameChange($event)">
</pelu-input-text>
<div id="name-help" class="sr-only">
  Introdueix el teu nom complet tal com apareix al DNI
</div>
```

## 🧪 Testing

### Tests Unitaris

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputTextComponent } from './input-text.component';

describe('InputTextComponent', () => {
  let component: InputTextComponent;
  let fixture: ComponentFixture<InputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit value change', () => {
    const spy = jest.spyOn(component.valueChange, 'emit');
    component.onInputChange('test value');
    expect(spy).toHaveBeenCalledWith('test value');
  });
});
```

### Tests d'Integració

```typescript
describe('Input Integration', () => {
  it('should work with reactive forms', () => {
    // Test d'integració amb ReactiveFormsModule
  });

  it('should work with template-driven forms', () => {
    // Test d'integració amb FormsModule
  });
});
```

## 🚀 Millores Futures

### Funcionalitats Planificades

- [ ] **Auto-complete** per inputs de text
- [ ] **Validació en temps real** amb debounce
- [ ] **Màscares d'entrada** per formats específics
- [ ] **Upload d'arxius** integrat
- [ ] **Rich text editor** per textareas
- [ ] **Date range picker** per intervals de dates

### Optimitzacions

- [ ] **Lazy loading** de components pesats
- [ ] **Virtual scrolling** per llistes llargues
- [ ] **Performance monitoring** per inputs crítics
- [ ] **Bundle optimization** per reduir mida

## 📚 Recursos Addicionals

- [Documentació d'Angular Forms](https://angular.dev/guide/forms)
- [Guia d'Accessibilitat WCAG](https://www.w3.org/WAI/WCAG21/quickref/)
- [Patrons de Disseny UI](https://www.designsystem.digital.gov/)
- [Millors Pràctiques de Formularis](https://www.smashingmagazine.com/2011/11/extensive-guide-web-form-usability/)

---

**Última actualització: Juliol 2025**
