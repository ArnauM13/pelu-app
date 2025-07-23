# Migration Examples

This document shows how to migrate from existing button implementations to the new standardized `pelu-button` component.

## From PrimeNG p-button

### Before (Landing Page)
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

### After (Using pelu-button)
```html
<div class="hero-buttons">
  <pelu-button
    [label]="'LANDING.SERVICES' | translate"
    severity="secondary"
    [size]="'large'"
    class="btn-services"
    (clicked)="navigateToServices()">
  </pelu-button>
  <pelu-button
    [label]="'LANDING.BOOK_NOW' | translate"
    severity="primary"
    [size]="'large'"
    [raised]="true"
    class="btn-primary"
    (clicked)="navigateToBooking()">
  </pelu-button>
</div>
```

## From Custom Button Classes

### Before (Auth Popup)
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

### After (Using pelu-button)
```html
<pelu-button
  [label]="config().submitButtonText"
  type="submit"
  [disabled]="form()!.invalid"
  class="auth-button"
  (clicked)="onSubmit()">
</pelu-button>

<pelu-button
  [label]="config().googleButtonText"
  icon="pi pi-google"
  severity="secondary"
  class="google-auth-button"
  (clicked)="onGoogleAuth()">
</pelu-button>
```

## From Actions Buttons

### Before (Actions Buttons Component)
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

### After (Using pelu-button)
```html
<pelu-button
  [label]="action.label"
  [icon]="action.icon"
  [severity]="action.type"
  [disabled]="action.disabled"
  [size]="'small'"
  [pTooltip]="action.tooltip ? (action.tooltip | translate) : (action.label | translate)"
  pTooltipPosition="left"
  (clicked)="onActionClick(action, $event)">
</pelu-button>
```

## From Logger Demo

### Before
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

### After
```html
<pelu-button 
  label="Info Log" 
  severity="info" 
  [size]="'small'"
  (clicked)="showInfoLog()">
</pelu-button>
<pelu-button 
  label="Warning Log" 
  severity="warn" 
  [size]="'small'"
  (clicked)="showWarningLog()">
</pelu-button>
<pelu-button
  label="Debug Log"
  severity="secondary"
  [size]="'small'"
  (clicked)="showDebugLog()">
</pelu-button>
```

## Key Changes

### 1. Component Name
- **Before**: `<p-button>` or `<button pButton>`
- **After**: `<pelu-button>`

### 2. Event Handling
- **Before**: `(onClick)="handler()"`
- **After**: `(clicked)="handler()"`

### 3. Size Property
- **Before**: `size="small"`
- **After**: `[size]="'small'"`

### 4. Router Integration
- **Before**: `routerLink="/path"`
- **After**: Use `(clicked)` event and handle navigation in component

### 5. Custom Classes
- **Before**: `class="btn-primary"`
- **After**: `class="btn-primary"` (still supported)

## Benefits of Migration

1. **Consistent API**: All buttons follow the same pattern as other input components
2. **Type Safety**: Full TypeScript support with proper typing
3. **Maintainability**: Centralized button logic and styling
4. **Accessibility**: Built-in accessibility features
5. **Future-Proof**: Easy to update all buttons at once

## Migration Checklist

- [ ] Replace `<p-button>` with `<pelu-button>`
- [ ] Replace `<button pButton>` with `<pelu-button>`
- [ ] Update event handlers from `(onClick)` to `(clicked)`
- [ ] Update size property to use binding syntax
- [ ] Handle router navigation in component methods
- [ ] Test all button interactions
- [ ] Verify accessibility features
- [ ] Update any custom styling if needed 
