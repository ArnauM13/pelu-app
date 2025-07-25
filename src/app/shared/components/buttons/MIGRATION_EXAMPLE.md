# Exemples de Migració

Aquest document mostra com migrar des d'implementacions de botons existents al nou component estandarditzat que utilitza directament `p-button` de PrimeNG.

## Des de PrimeNG p-button

### Abans (Pàgina d'inici)
```html
<div class="hero-buttons">
  <button
    pButton
    [label]="'LANDING.SERVICES' | translate"
    routerLink="/services"
    class="btn-services"
  ></button>
  <button
    pButton
    [label]="'LANDING.BOOK_NOW' | translate"
    routerLink="/booking"
    class="btn-primary"
  ></button>
</div>
```

### Després (Utilitzant p-button directe)
```html
<div class="hero-buttons">
  <p-button
    [label]="'LANDING.SERVICES' | translate"
    severity="secondary"
    size="large"
    class="btn-services"
    (onClick)="navigateToServices()">
  </p-button>
  <p-button
    [label]="'LANDING.BOOK_NOW' | translate"
    severity="primary"
    size="large"
    [raised]="true"
    class="btn-primary"
    (onClick)="navigateToBooking()">
  </p-button>
</div>
```

## Des de Classes de Botó Personalitzades

### Abans (Auth Popup)
```html
<button pButton type="submit" class="auth-button" [disabled]="form()!.invalid">
  {{ config().submitButtonText }}
</button>

<button
  pButton
  type="button"
  [label]="config().googleButtonText"
  icon="pi pi-google"
  class="google-auth-button"
  (click)="onGoogleAuth()">
  {{ config().googleButtonText }}
</button>
```

### Després (Utilitzant p-button directe)
```html
<p-button
  [label]="config().submitButtonText"
  type="submit"
  [disabled]="form()!.invalid"
  class="auth-button"
  (onClick)="onSubmit()">
</p-button>

<p-button
  [label]="config().googleButtonText"
  icon="pi pi-google"
  severity="secondary"
  class="google-auth-button"
  (onClick)="onGoogleAuth()">
</p-button>
```

## Des de Actions Buttons

### Abans (Actions Buttons Component)
```html
<button
  class="btn"
  [class]="action.type"
  [disabled]="action.disabled"
  [pTooltip]="action.tooltip ? (action.tooltip | translate) : (action.label | translate)"
  pTooltipPosition="left"
  (click)="onActionClick(action, $event)"
>
  {{ action.icon }}
</button>
```

### Després (Utilitzant p-button directe)
```html
<p-button
  [label]="action.label"
  [icon]="action.icon"
  [severity]="action.type"
  [disabled]="action.disabled"
  size="small"
  [pTooltip]="action.tooltip ? (action.tooltip | translate) : (action.label | translate)"
  pTooltipPosition="left"
  (onClick)="onActionClick(action, $event)">
</p-button>
```

## Des de Logger Demo

### Abans
```html
<p-button label="Info Log" severity="info" (onClick)="showInfoLog()" size="small">
</p-button>
<p-button label="Warning Log" severity="warn" (onClick)="showWarningLog()" size="small">
</p-button>
<p-button
  label="Debug Log"
  severity="secondary"
  (onClick)="showDebugLog()"
  size="small"
>
</p-button>
```

### Després (Ja utilitza p-button directe)
```html
<p-button 
  label="Info Log" 
  severity="info" 
  size="small"
  (onClick)="showInfoLog()">
</p-button>
<p-button 
  label="Warning Log" 
  severity="warn" 
  size="small"
  (onClick)="showWarningLog()">
</p-button>
<p-button
  label="Debug Log"
  severity="secondary"
  size="small"
  (onClick)="showDebugLog()">
</p-button>
```

## Canvis Principals

### 1. Nom del Component
- **Abans**: `<p-button>` o `<button pButton>`
- **Després**: `<p-button>` (directe)

### 2. Gestió d'Events
- **Abans**: `(onClick)="handler()"`
- **Després**: `(onClick)="handler()"` (mateix)

### 3. Propietat de Mida
- **Abans**: `size="small"`
- **Després**: `size="small"` (mateix)

### 4. Integració amb Router
- **Abans**: `routerLink="/path"`
- **Després**: Utilitza `(onClick)` event i gestiona la navegació al component

### 5. Classes Personalitzades
- **Abans**: `class="btn-primary"`
- **Després**: `class="btn-primary"` (encara suportat)

### 6. Etiquetes ARIA
- **Abans**: `[ariaLabel]="'Home'"`
- **Després**: `[attr.aria-label]="'Home'"`

## Guia de Migració Pas a Pas

### Pas 1: Identificar Botons Existents
```bash
# Buscar tots els usos de botons
grep -r "pButton\|pelu-button" src/
```

### Pas 2: Actualitzar Imports
```typescript
// Abans
import { ButtonComponent } from '@shared/components/buttons';

// Després
import { ButtonModule } from 'primeng/button';

@Component({
  imports: [
    // ... altres imports
    ButtonModule,
  ],
})
```

### Pas 3: Actualitzar Templates
```html
<!-- Abans -->
<pelu-button
  label="Desar"
  icon="pi pi-check"
  severity="success"
  (clicked)="onSave()">
</pelu-button>

<!-- Després -->
<p-button
  label="Desar"
  icon="pi pi-check"
  severity="success"
  (onClick)="onSave()">
</p-button>
```

### Pas 4: Actualitzar Estils
```scss
// Abans
.pelu-button {
  .p-button {
    // estils personalitzats
  }
}

// Després
.my-custom-button {
  .p-button {
    // estils personalitzats
  }
}
```

### Pas 5: Verificar Funcionalitat
- Testa tots els botons migrats
- Verifica que els events funcionin correctament
- Comprova que els estils s'apliquen adequadament
- Testa en dispositius mòbils

## Checklist de Migració

- [ ] Identificar tots els botons que necessiten migració
- [ ] Actualitzar imports als components
- [ ] Canviar `pelu-button` per `p-button`
- [ ] Canviar `(clicked)` per `(onClick)`
- [ ] Canviar `[ariaLabel]` per `[attr.aria-label]`
- [ ] Canviar `[size]="'small'"` per `size="small"`
- [ ] Actualitzar estils CSS si cal
- [ ] Testar funcionalitat
- [ ] Verificar accessibilitat
- [ ] Testar en dispositius mòbils

## Avantatges de la Migració

1. **Performance**: Menys capes d'abstracció
2. **Mantenibilitat**: Directament amb PrimeNG
3. **Consistència**: Mateix component que altres parts de l'app
4. **Actualitzacions**: Beneficis directes de les actualitzacions de PrimeNG
5. **Documentació**: Accés directe a la documentació oficial de PrimeNG

## Recursos

- [Documentació oficial de PrimeNG Button](https://primeng.org/button)
- [Guia d'estil de l'aplicació](STYLING_GUIDE.md)
- [Exemples de components](buttons-demo.component.html) 
