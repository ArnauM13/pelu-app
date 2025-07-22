# Components d'Input Unificats

Aquesta carpeta conté tots els components d'input unificats amb mides i estils consistents.

## 📋 Components Disponibles

### 1. **Input Text** (`pelu-input-text`)
Per a entrades de text d'una sola línia.

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

**Mida unificada**: 44px d'alçada

### 2. **Input Textarea** (`pelu-input-textarea`)
Per a entrades de text llarg amb múltiples línies.

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

**Mida unificada**: 80px d'alçada mínima (mòbil: 88px)

### 3. **Input Email** (`pelu-input-email`)
Per a entrades d'email amb validació.

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

### 4. **Input Password** (`pelu-input-password`)
Per a contrasenyes amb opció de mostrar/amagar.

```typescript
<pelu-input-password
  [config]="{
    label: 'Contrasenya',
    placeholder: 'Introdueix la contrasenya',
    required: true,
    showLabel: true
  }"
  [value]="formData.password"
  (valueChange)="onPasswordChange($event)">
</pelu-input-password>
```

### 5. **Input Number** (`pelu-input-number`)
Per a entrades numèriques.

```typescript
<pelu-input-number
  [config]="{
    label: 'Edat',
    placeholder: '25',
    min: 0,
    max: 120,
    showLabel: true
  }"
  [value]="formData.age"
  (valueChange)="onAgeChange($event)">
</pelu-input-number>
```

### 6. **Input Date** (`pelu-input-date`)
Per a selecció de dates.

```typescript
<pelu-input-date
  [config]="{
    label: 'Data de naixement',
    placeholder: 'Selecciona una data',
    showLabel: true
  }"
  [value]="formData.birthDate"
  (valueChange)="onDateChange($event)">
</pelu-input-date>
```

### 7. **Input Select** (`pelu-input-select`)
Per a selecció d'opcions amb suport per colors.

```typescript
<pelu-input-select
  [config]="{
    label: 'Categoria',
    placeholder: 'Selecciona una categoria',
    options: categoryOptions,
    showLabel: true
  }"
  [value]="formData.category"
  (valueChange)="onCategoryChange($event)">
</pelu-input-select>
```

### 8. **Input Checkbox** (`pelu-input-checkbox`)
Per a caselles de selecció.

```typescript
<pelu-input-checkbox
  [config]="{
    label: 'Accepto els termes i condicions',
    required: true,
    showLabel: true
  }"
  [value]="formData.terms"
  (valueChange)="onTermsChange($event)">
</pelu-input-checkbox>
```

## 🎨 Característiques Unificades

### **Mides Consistents**
- **Inputs de text**: 44px d'alçada
- **Textareas**: 80px d'alçada mínima (mòbil: 88px)
- **Bordes**: 2px amb border-radius de 8px
- **Padding**: 0.75rem

### **Estats Visuals**
- **Normal**: Border gris clar (#e5e7eb)
- **Focus**: Border blau (#1e40af) amb shadow
- **Error**: Border vermell (#dc2626) amb shadow
- **Success**: Border verd (#16a34a) amb shadow
- **Disabled**: Opacitat 0.6, cursor not-allowed

### **Funcionalitats Comunes**
- ✅ ControlValueAccessor implementat
- ✅ Suport per traduccions
- ✅ Estats d'error, ajuda i èxit
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibilitat

## 🚀 Ús Ràpid

```typescript
import { InputTextComponent, InputTextareaComponent } from '@shared/components/inputs';

@Component({
  imports: [InputTextComponent, InputTextareaComponent]
})
export class MyComponent {
  formData = signal({
    name: '',
    description: ''
  });

  updateField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
```

```html
<!-- Input de text (una línia) -->
<pelu-input-text
  [config]="{ label: 'Nom', placeholder: 'Nom complet', showLabel: true }"
  [value]="formData().name"
  (valueChange)="updateField('name', $event)">
</pelu-input-text>

<!-- Input textarea (text llarg) -->
<pelu-input-textarea
  [config]="{ label: 'Descripció', placeholder: 'Descripció detallada...', rows: 4, showLabel: true }"
  [value]="formData().description"
  (valueChange)="updateField('description', $event)">
</pelu-input-textarea>
```

## 📱 Responsive Design

Tots els components s'adapten automàticament a diferents mides de pantalla:

- **Desktop**: Mides estàndard
- **Tablet**: Ajustaments moderats
- **Mòbil**: Mides més grans per facilitar l'ús tàctil

## 🎯 Component de Demostració

Pots veure tots els components en acció utilitzant el component de demostració:

```typescript
import { InputsDemoComponent } from '@shared/components/inputs';
```

Aquest component mostra exemples de tots els inputs amb les seves configuracions i estats. 
