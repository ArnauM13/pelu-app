# Pelu Button Component

Un component de botó estandarditzat que utilitza directament el component `p-button` de PrimeNG, proporcionant una API consistent i una experiència d'usuari uniforme a tota l'aplicació.

## Característiques

- ✅ **Totes les funcions de PrimeNG Button** suportades
- ✅ **API consistent** seguint el mateix patró que els components d'input
- ✅ **Estil de l'aplicació** mantingut a través de `styles-primeng.scss`
- ✅ **Suport TypeScript** amb tipat adequat
- ✅ **Accessibilitat** inclosa
- ✅ **Disseny responsiu** amb objectius tàctils adaptats a mòbils
- ✅ **Múltiples variants** (filled, outlined, text, link)
- ✅ **Múltiples severitats** (primary, secondary, success, info, warn, help, danger, contrast)
- ✅ **Múltiples mides** (small, large)
- ✅ **Suport d'icones** amb opcions de posicionament
- ✅ **Estats de càrrega** amb spinner
- ✅ **Integració de formularis** (submit, reset, button types)
- ✅ **Gradients personalitzats** i efectes hover que coincideixen amb el tema de l'app

## Instal·lació

El component està automàticament disponible quan s'importa des dels components compartits:

```typescript
import { ButtonComponent } from '@shared/components';
```

## Estil de l'Aplicació

El component de botó utilitza directament el component `p-button` de PrimeNG i hereta automàticament l'estil personalitzat de l'aplicació definit a `styles-primeng.scss`. Això assegura:

- **Aparició consistent** a tots els components
- **Gradients personalitzats** i esquemes de colors
- **Transicions suaus** i efectes hover
- **Estats de focus adequats** per a l'accessibilitat
- **Disseny responsiu** per a dispositius mòbils

L'estil inclou variables CSS personalitzades que coincideixen amb el sistema de disseny de l'aplicació:
- `--gradient-primary`, `--gradient-secondary`, `--gradient-success`, etc.
- `--primary-color`, `--secondary-color`, `--success-color`, etc.
- `--border-radius`, `--box-shadow`, `--box-shadow-hover`, etc.

## Ús Bàsic

```html
<!-- Botó bàsic -->
<p-button
  label="Clica'm"
  (onClick)="onButtonClick($event)">
</p-button>

<!-- Botó amb icona -->
<p-button
  label="Desar"
  icon="pi pi-check"
  severity="success"
  (onClick)="onSave()">
</p-button>

<!-- Botó deshabilitat -->
<p-button
  label="Deshabilitat"
  [disabled]="true">
</p-button>
```

## Referència de l'API

### Inputs

| Propietat | Tipus | Per defecte | Descripció |
|-----------|-------|-------------|------------|
| `label` | `string` | `''` | Text a mostrar al botó |
| `icon` | `string` | `''` | Classe d'icona (ex: 'pi pi-check') |
| `iconPos` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Posició de la icona relativa a l'etiqueta |
| `severity` | `'primary' \| 'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast'` | `'primary'` | Severitat visual del botó |
| `variant` | `'outlined' \| 'text'` | `'outlined'` | Variant visual del botó |
| `size` | `'small' \| 'large'` | `'small'` | Mida del botó |
| `disabled` | `boolean` | `false` | Si el botó està deshabilitat |
| `loading` | `boolean` | `false` | Si mostrar el spinner de càrrega |
| `raised` | `boolean` | `false` | Si mostrar ombra d'elevació |
| `rounded` | `boolean` | `false` | Si utilitzar cantonades arrodonides |
| `link` | `boolean` | `false` | Si renderitzar com a enllaç |
| `fluid` | `boolean` | `false` | Si abastir tota l'amplada |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipus de botó HTML |
| `class` | `string` | `''` | Classes CSS addicionals |
| `ariaLabel` | `string` | `''` | Etiqueta d'accessibilitat |

### Outputs

| Propietat | Tipus | Descripció |
|-----------|------|-------------|
| `clicked` | `Event` | Emès quan es fa clic al botó |

## Exemples

### Botons Bàsics

```html
<!-- Botó primari -->
<p-button label="Primari"></p-button>

<!-- Botó secundari -->
<p-button 
  label="Secundari" 
  severity="secondary">
</p-button>

<!-- Botó d'èxit -->
<p-button 
  label="Èxit" 
  severity="success">
</p-button>

<!-- Botó de perill -->
<p-button 
  label="Perill" 
  severity="danger">
</p-button>
```

### Variants de Botó

```html
<!-- Filled (per defecte) -->
<p-button label="Filled"></p-button>

<!-- Outlined -->
<p-button 
  label="Outlined" 
  variant="outlined">
</p-button>

<!-- Text -->
<p-button 
  label="Text" 
  variant="text">
</p-button>

<!-- Link -->
<p-button 
  label="Link" 
  [link]="true">
</p-button>
```

### Mides de Botó

```html
<!-- Petit -->
<p-button 
  label="Petit" 
  size="small">
</p-button>

<!-- Gran -->
<p-button 
  label="Gran" 
  size="large">
</p-button>
```

### Botons amb Icones

```html
<!-- Icona a l'esquerra (per defecte) -->
<p-button 
  label="Desar" 
  icon="pi pi-check">
</p-button>

<!-- Icona a la dreta -->
<p-button 
  label="Eliminar" 
  icon="pi pi-trash" 
  iconPos="right" 
  severity="danger">
</p-button>

<!-- Només icona -->
<p-button 
  icon="pi pi-home" 
  [attr.aria-label]="'Inici'">
</p-button>

<!-- Icona a dalt -->
<p-button 
  label="Actualitzar" 
  icon="pi pi-refresh" 
  iconPos="top">
</p-button>
```

### Estats del Botó

```html
<!-- Estat de càrrega -->
<p-button 
  label="Carregant..." 
  icon="pi pi-spinner" 
  [loading]="true">
</p-button>

<!-- Estat deshabilitat -->
<p-button 
  label="Deshabilitat" 
  [disabled]="true">
</p-button>

<!-- Elevat (amb ombra) -->
<p-button 
  label="Elevat" 
  [raised]="true">
</p-button>

<!-- Arrodonit -->
<p-button 
  label="Arrodonit" 
  [rounded]="true">
</p-button>
```

### Botons de Formulari

```html
<!-- Botó d'enviar -->
<p-button 
  label="Enviar" 
  type="submit" 
  icon="pi pi-send">
</p-button>

<!-- Botó de reiniciar -->
<p-button 
  label="Reiniciar" 
  type="reset" 
  severity="secondary" 
  icon="pi pi-times">
</p-button>
```

### Exemples Complexos

```html
<!-- Botó de crear cita -->
<p-button
  label="Crear Cita"
  icon="pi pi-calendar-plus"
  severity="success"
  [raised]="true"
  size="large"
  (onClick)="createAppointment()">
</p-button>

<!-- Botó de cancel·lar cita -->
<p-button
  label="Cancel·lar Cita"
  icon="pi pi-times"
  severity="danger"
  variant="outlined"
  (onClick)="cancelAppointment()">
</p-button>

<!-- Botó d'editar perfil -->
<p-button
  label="Editar Perfil"
  icon="pi pi-user-edit"
  severity="info"
  variant="text"
  (onClick)="editProfile()">
</p-button>
```

## Estil

El component utilitza directament el component `p-button` de PrimeNG i hereta automàticament l'estil personalitzat de l'aplicació definit a `styles-primeng.scss`, que manté la consistència amb el disseny general. L'estil inclou:

- **Gradients personalitzats** i esquemes de colors que coincideixen amb el tema de l'aplicació
- **Espaiat consistent** i tipografia
- **Efectes hover** amb transicions suaus
- **Estats de focus** amb indicadors d'accessibilitat adequats
- **Disseny responsiu** optimitzat per a dispositius mòbils

Els estils personalitzats es poden aplicar utilitzant:

1. **Classes CSS**: Utilitza la propietat `class` per afegir classes CSS personalitzades
2. **Estils globals**: Sobrescriu estils a `styles-primeng.scss` per a canvis aplicació-amplada

### Exemple d'Estil Personalitzat

```html
<p-button
  label="Botó Personalitzat"
  class="my-custom-button"
  severity="success"
  [raised]="true">
</p-button>
```

```scss
.my-custom-button {
  .p-button {
    // Sobrescriure propietats específiques mantenint el sistema de disseny de l'app
    background: var(--gradient-success) !important;
    border-color: var(--success-color) !important;
    box-shadow: var(--box-shadow-hover) !important;
  }
}
```

## Accessibilitat

El component manté totes les funcions d'accessibilitat de PrimeNG:

- **Navegació per teclat** completament suportada
- **Etiquetes ARIA** adequades
- **Estats de focus** visibles
- **Contrast de colors** adequat
- **Suport per a lectors de pantalla**

## Migració

Si tens botons existents que utilitzen el component wrapper anterior, pots migrar-los fàcilment:

### Abans (Component wrapper)
```html
<pelu-button
  label="Desar"
  icon="pi pi-check"
  severity="success"
  (clicked)="onSave()">
</pelu-button>
```

### Després (p-button directe)
```html
<p-button
  label="Desar"
  icon="pi pi-check"
  severity="success"
  (onClick)="onSave()">
</p-button>
```

### Canvis principals:
- `pelu-button` → `p-button`
- `(clicked)` → `(onClick)`
- `[ariaLabel]` → `[attr.aria-label]`
- `[size]="'small'"` → `size="small"`

## Referències

- [Documentació oficial de PrimeNG Button](https://primeng.org/button)
- [Guia d'estil de l'aplicació](STYLING_GUIDE.md)
- [Exemples de migració](MIGRATION_EXAMPLE.md) 
