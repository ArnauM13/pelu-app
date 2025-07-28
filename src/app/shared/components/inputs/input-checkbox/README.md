# Input Checkbox Component

Un component de checkbox configurable construït amb PrimeNG's `p-checkbox` que funciona perfectament amb Angular Reactive Forms.

## Què és ControlValueAccessor?

El `ControlValueAccessor` és una interfície d'Angular que permet que els components personalitzats funcionin amb Angular Forms. És el que fa que el nostre checkbox pugui ser utilitzat amb `formControlName` i altres directives de formulari.

## Característiques

- Usa PrimeNG's `p-checkbox` amb estils predefinits
- Mida configurable (small, large)
- Variant configurable (outlined, filled)
- Estat deshabilitat configurable
- Text configurable (apareix a la dreta del checkbox)
- Suport per a text d'ajuda, error i èxit
- Integració completa amb Angular Reactive Forms

## Ús amb Reactive Forms

### Configuració Bàsica

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputCheckboxComponent, InputCheckboxConfig } from '@shared/components/inputs';

export class MyComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      terms: [false, Validators.requiredTrue],
      newsletter: [false],
      notifications: [true]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <!-- Checkbox bàsic -->
  <pelu-input-checkbox 
    formControlName="terms"
    checkboxValue="Accept terms and conditions">
  </pelu-input-checkbox>

  <!-- Amb mida -->
  <pelu-input-checkbox 
    formControlName="newsletter"
    checkboxValue="Subscribe to newsletter"
    size="large">
  </pelu-input-checkbox>

  <!-- Amb variant -->
  <pelu-input-checkbox 
    formControlName="notifications"
    checkboxValue="Receive notifications"
    variant="filled">
  </pelu-input-checkbox>

  <button type="submit">Submit</button>
</form>
```

### Amb Validació i Text d'Error

```typescript
export class MyComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      terms: [false, [Validators.requiredTrue]],
      newsletter: [false]
    });
  }

  // Config per a text d'error
  termsConfig: InputCheckboxConfig = {
    errorText: 'You must accept the terms to continue',
    showErrorText: true
  };

  newsletterConfig: InputCheckboxConfig = {
    helpText: 'Receive updates about new features',
    showHelpText: true
  };
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <pelu-input-checkbox 
    [config]="termsConfig"
    formControlName="terms"
    checkboxValue="I accept the terms and conditions">
  </pelu-input-checkbox>

  <pelu-input-checkbox 
    [config]="newsletterConfig"
    formControlName="newsletter"
    checkboxValue="Subscribe to newsletter">
  </pelu-input-checkbox>

  <button type="submit" [disabled]="!form.valid">Submit</button>
</form>
```

### Amb Estat Deshabilitat

```typescript
export class MyComponent {
  form: FormGroup;
  isFormDisabled = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      terms: [false, Validators.requiredTrue],
      newsletter: [false]
    });
  }

  toggleForm() {
    this.isFormDisabled = !this.isFormDisabled;
    if (this.isFormDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <pelu-input-checkbox 
    formControlName="terms"
    checkboxValue="Accept terms"
    [disabled]="isFormDisabled">
  </pelu-input-checkbox>

  <button type="button" (click)="toggleForm()">
    {{ isFormDisabled ? 'Enable' : 'Disable' }} Form
  </button>
</form>
```

## Propietats d'Entrada

### Propietats Específiques del Checkbox

| Propietat | Tipus | Per Defecte | Descripció |
|-----------|-------|-------------|------------|
| `checkboxValue` | `string` | `''` | Text que apareix a la dreta del checkbox |
| `size` | `'small' \| 'large'` | - | Mida del checkbox (normal és per defecte) |
| `variant` | `'outlined' \| 'filled'` | `'outlined'` | Variant d'estil visual |
| `disabled` | `boolean` | `false` | Si el checkbox està deshabilitat |

### Objecte de Configuració (InputCheckboxConfig)

| Propietat | Tipus | Per Defecte | Descripció |
|-----------|-------|-------------|------------|
| `helpText` | `string` | - | Text d'ajuda que apareix sota el checkbox |
| `errorText` | `string` | - | Text d'error que apareix sota el checkbox |
| `successText` | `string` | - | Text d'èxit que apareix sota el checkbox |
| `showHelpText` | `boolean` | `true` | Si mostrar el text d'ajuda |
| `showErrorText` | `boolean` | `true` | Si mostrar el text d'error |
| `showSuccessText` | `boolean` | `true` | Si mostrar el text d'èxit |

## Events

- `valueChange`: Emès quan canvia el valor del checkbox
- `focusEvent`: Emès quan el checkbox rep focus
- `blurEvent`: Emès quan el checkbox perd focus

## Avantatges del ControlValueAccessor

1. **Integració Perfecta**: Funciona amb `formControlName`, `ngModel`, etc.
2. **Validació Automàtica**: Els errors de validació es mostren automàticament
3. **Estat del Formulari**: El component respon a `form.enable()`, `form.disable()`, etc.
4. **Accessibilitat**: Funciona amb lectors de pantalla i navegació per teclat
5. **Consistència**: Comportament consistent amb altres inputs d'Angular

## Estil

El component usa els estils predefinits de PrimeNG i pot ser personalitzat amb CSS custom properties. Les classes CSS específiques són:

- `.checkbox-wrapper`: Contenidor del checkbox i label
- `.checkbox-label`: Estil del text al costat del checkbox
- `.input-help`: Estil del text d'ajuda
- `.input-error`: Estil del text d'error
- `.input-success`: Estil del text d'èxit 
