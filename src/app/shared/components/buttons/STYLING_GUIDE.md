# Guia d'Estil - Components de Botó

Aquest document explica com el component de botó estandarditzat manté l'estil de l'aplicació.

## Estil de l'Aplicació

El component `pelu-button` utilitza l'estil personalitzat de l'aplicació definit a `styles-primeng.scss`, que inclou:

### Variables CSS Principals

```scss
// Colors principals
--primary-color: #3a5a8a;
--secondary-color: #f3f4f6;
--success-color: #10b981;
--warning-color: #f59e0b;
--error-color: #ef4444;

// Gradients
--gradient-primary: linear-gradient(135deg, #3a5a8a 0%, #1d4ed8 100%);
--gradient-secondary: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
--gradient-error: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

// Espaiat i tipografia
--border-radius: 8px;
--box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
--box-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
```

### Estils de Botó Aplicats

Els estils següents s'apliquen automàticament a tots els botons de PrimeNG:

```scss
.p-button {
  background: var(--gradient-primary) !important;
  color: white !important;
  border: 1px solid var(--primary-color) !important;
  border-radius: var(--border-radius) !important;
  padding: 0.75rem 1.5rem !important;
  font-size: 0.95rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: var(--box-shadow) !important;
  min-height: 44px !important;
}

.p-button:hover {
  background: linear-gradient(135deg, var(--primary-color-dark) 0%, var(--primary-color) 100%) !important;
  border-color: var(--primary-color-dark) !important;
  transform: translateY(-1px) !important;
  box-shadow: var(--box-shadow-hover) !important;
}
```

## Variants de Severitat

Cada severitat té el seu propi gradient i colors:

### Primary (per defecte)
- Gradient: `var(--gradient-primary)`
- Color: `white`
- Border: `var(--primary-color)`

### Secondary
- Gradient: `var(--gradient-secondary)`
- Color: `var(--text-color)`
- Border: `var(--border-color)`

### Success
- Gradient: `var(--gradient-success)`
- Color: `white`
- Border: `var(--success-color)`

### Danger
- Gradient: `var(--gradient-error)`
- Color: `white`
- Border: `var(--error-color)`

## Variants de Botó

### Filled (per defecte)
- Fons amb gradient
- Ombra i efectes de hover

### Outlined
- Fons transparent
- Border de 2px
- Hover amb gradient

### Text
- Fons transparent
- Sense border
- Hover amb color de fons lleuger

## Estils Responsius

```scss
@media (max-width: 768px) {
  .p-button {
    font-size: 1rem !important;
    min-height: 48px !important;
    padding: 0.875rem 1.25rem !important;
  }
}
```

## Estats del Botó

### Disabled
```scss
.p-button:disabled {
  background: var(--surface-color-secondary) !important;
  color: var(--text-color-muted) !important;
  border-color: var(--border-color) !important;
  cursor: not-allowed !important;
  opacity: 0.6 !important;
  transform: none !important;
  box-shadow: none !important;
}
```

### Focus
```scss
.p-button:focus {
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(58, 90, 138, 0.15) !important;
}
```

## Mides de Botó

### Small
```scss
.p-button.p-button-sm {
  padding: 0.5rem 1rem !important;
  font-size: 0.875rem !important;
  min-height: 36px !important;
}
```

### Large
```scss
.p-button.p-button-lg {
  padding: 1rem 2rem !important;
  font-size: 1.1rem !important;
  min-height: 52px !important;
}
```

## Com Aplicar Estils Personalitzats

### 1. Utilitzant Classes CSS

```html
<pelu-button
  label="Botó Personalitzat"
  class="my-custom-button"
  severity="primary">
</pelu-button>
```

```scss
.my-custom-button {
  .p-button {
    background: var(--gradient-success) !important;
    border-color: var(--success-color) !important;
  }
}
```

### 2. Utilitzant Estils Inline

```html
<pelu-button
  label="Botó amb Estil Inline"
  [style]="'background: linear-gradient(45deg, #ff6b6b, #4ecdc4);'">
</pelu-button>
```

### 3. Modificant Variables Globals

Per canviar l'estil de tots els botons, modifica les variables CSS a `styles-primeng.scss`:

```scss
:root {
  --primary-color: #your-color;
  --gradient-primary: linear-gradient(135deg, #your-color 0%, #your-dark-color 100%);
}
```

## Consistència amb Altres Components

El component de botó manté la mateixa filosofia d'estil que altres components de l'aplicació:

- **Inputs**: Mateixos colors, borders i efectes de focus
- **Dropdowns**: Mateixos gradients i transicions
- **Cards**: Mateixos shadows i border-radius
- **Datepickers**: Mateixos colors de fons i borders

## Avantatges de l'Estil Unificat

1. **Consistència Visual**: Tots els components tenen la mateixa aparença
2. **Mantenibilitat**: Canvis centrals a `styles-primeng.scss`
3. **Accessibilitat**: Focus states i contrast adequats
4. **Responsivitat**: Optimitzat per a dispositius mòbils
5. **Performance**: Estils optimitzats i eficients

## Troubleshooting

### El botó no té l'estil correcte
1. Verifica que `styles-primeng.scss` està importat a `styles.scss`
2. Comprova que les variables CSS estan definides
3. Assegura't que no hi ha conflictes amb altres estils

### Estils no s'apliquen en producció
1. Verifica que el build inclou `styles-primeng.scss`
2. Comprova que les variables CSS estan disponibles en producció
3. Assegura't que no hi ha purging de CSS no utilitzat 
