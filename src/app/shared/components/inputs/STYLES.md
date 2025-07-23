# 🎨 Estils del Sistema d'Inputs - PeluApp

## 📋 Visió General

Aquest document descriu els estils unificats del sistema d'inputs de PeluApp, incloent variables CSS, estats visuals, responsive design i millors pràctiques d'implementació.

## 🎨 Variables CSS Globals

### Variables Principals

```scss
:root {
  // Mides
  --input-height: 44px;
  --textarea-min-height: 80px;
  --textarea-mobile-min-height: 88px;
  --border-radius: 8px;
  --border-width: 2px;
  --padding: 0.75rem;
  --font-size: 1rem;
  --line-height: 1.5;

  // Colors
  --input-border-normal: #e5e7eb;
  --input-border-focus: #1e40af;
  --input-border-error: #dc2626;
  --input-border-success: #16a34a;
  --input-border-disabled: #d1d5db;
  
  --input-bg-normal: #ffffff;
  --input-bg-disabled: #f9fafb;
  --input-bg-hover: #f8fafc;
  
  --input-text-normal: #1f2937;
  --input-text-placeholder: #9ca3af;
  --input-text-disabled: #6b7280;
  
  --input-shadow-focus: 0 0 0 3px rgba(30, 64, 175, 0.1);
  --input-shadow-error: 0 0 0 3px rgba(220, 38, 38, 0.1);
  --input-shadow-success: 0 0 0 3px rgba(22, 163, 74, 0.1);

  // Transicions
  --input-transition: all 0.2s ease-in-out;
}
```

### Variables per Temes

```scss
// Tema clar (per defecte)
[data-theme="light"] {
  --input-bg-normal: #ffffff;
  --input-text-normal: #1f2937;
  --input-border-normal: #e5e7eb;
}

// Tema fosc
[data-theme="dark"] {
  --input-bg-normal: #1f2937;
  --input-text-normal: #f9fafb;
  --input-border-normal: #374151;
  --input-bg-disabled: #111827;
  --input-text-placeholder: #6b7280;
}
```

## 🎯 Estats dels Inputs

### Estat Normal

```scss
.input-normal {
  border: var(--border-width) solid var(--input-border-normal);
  background-color: var(--input-bg-normal);
  color: var(--input-text-normal);
  transition: var(--input-transition);
  
  &:hover {
    background-color: var(--input-bg-hover);
    border-color: darken(var(--input-border-normal), 10%);
  }
}
```

### Estat Focus

```scss
.input-focus {
  border: var(--border-width) solid var(--input-border-focus);
  box-shadow: var(--input-shadow-focus);
  outline: none;
  
  &:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--input-shadow-focus);
  }
}
```

### Estat Error

```scss
.input-error {
  border: var(--border-width) solid var(--input-border-error);
  box-shadow: var(--input-shadow-error);
  
  &:focus {
    border-color: var(--input-border-error);
    box-shadow: var(--input-shadow-error);
  }
}

.input-error-message {
  color: var(--input-border-error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

### Estat Success

```scss
.input-success {
  border: var(--border-width) solid var(--input-border-success);
  box-shadow: var(--input-shadow-success);
  
  &:focus {
    border-color: var(--input-border-success);
    box-shadow: var(--input-shadow-success);
  }
}

.input-success-message {
  color: var(--input-border-success);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

### Estat Disabled

```scss
.input-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--input-bg-disabled);
  color: var(--input-text-disabled);
  border-color: var(--input-border-disabled);
  
  &:hover {
    background-color: var(--input-bg-disabled);
    border-color: var(--input-border-disabled);
  }
}
```

## 📱 Responsive Design

### Breakpoints

```scss
// Mobile first approach
.input-base {
  width: 100%;
  height: var(--input-height);
  padding: var(--padding);
  border-radius: var(--border-radius);
  font-size: var(--font-size);
  line-height: var(--line-height);
}

// Tablet (768px+)
@media (min-width: 768px) {
  .input-base {
    font-size: 1rem;
  }
  
  .input-textarea {
    min-height: var(--textarea-min-height);
  }
}

// Desktop (1024px+)
@media (min-width: 1024px) {
  .input-base {
    font-size: 1rem;
  }
}

// Mobile specific adjustments
@media (max-width: 767px) {
  .input-base {
    font-size: 1rem; // Prevent zoom on iOS
    padding: 0.875rem;
  }
  
  .input-textarea {
    min-height: var(--textarea-mobile-min-height);
  }
  
  .input-label {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
}
```

### Touch Optimizations

```scss
// Optimitzacions per dispositius tàctils
@media (hover: none) and (pointer: coarse) {
  .input-base {
    min-height: 44px; // Minimum touch target
    padding: 0.875rem;
  }
  
  .input-checkbox,
  .input-radio {
    min-width: 44px;
    min-height: 44px;
  }
}
```

## 🎨 Components Específics

### Input Text

```scss
.pelu-input-text {
  @extend .input-base;
  
  &[type="email"] {
    // Estils específics per email
  }
  
  &[type="password"] {
    // Estils específics per password
    letter-spacing: 0.125em;
  }
  
  &[type="number"] {
    // Estils específics per números
    -moz-appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}
```

### Input Textarea

```scss
.pelu-input-textarea {
  @extend .input-base;
  min-height: var(--textarea-min-height);
  resize: vertical;
  font-family: inherit;
  
  &.auto-resize {
    resize: none;
    overflow: hidden;
  }
  
  @media (max-width: 767px) {
    min-height: var(--textarea-mobile-min-height);
  }
}
```

### Input Select

```scss
.pelu-input-select {
  @extend .input-base;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  
  &:focus {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231e40af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  }
}
```

### Input Checkbox

```scss
.pelu-input-checkbox {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--input-border-normal);
  border-radius: 0.25rem;
  background-color: var(--input-bg-normal);
  cursor: pointer;
  transition: var(--input-transition);
  
  &:checked {
    background-color: var(--input-border-focus);
    border-color: var(--input-border-focus);
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  }
  
  &:focus {
    outline: none;
    box-shadow: var(--input-shadow-focus);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

## ♿ Accessibilitat

### Focus Management

```scss
// Focus visible per navegació per teclat
.input-base:focus-visible {
  outline: 2px solid var(--input-border-focus);
  outline-offset: 2px;
}

// Amagar focus per ratolí però mantenir per teclat
.input-base:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Support

```scss
// Classes per screen readers
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Estats per screen readers
.input-base[aria-invalid="true"] {
  border-color: var(--input-border-error);
}

.input-base[aria-describedby] {
  // Estils per elements descrits
}
```

## 🎨 Utilitats CSS

### Classes d'Utilitat

```scss
// Utilitats per mides
.input-sm {
  height: 36px;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.input-lg {
  height: 52px;
  font-size: 1.125rem;
  padding: 1rem;
}

// Utilitats per estats
.input-loading {
  position: relative;
  color: transparent;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    margin: -0.5rem 0 0 -0.5rem;
    border: 2px solid var(--input-border-normal);
    border-top-color: var(--input-border-focus);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Mixins SCSS

```scss
// Mixin per estats d'input
@mixin input-state($state, $border-color, $shadow-color) {
  &.input-#{$state} {
    border-color: $border-color;
    
    &:focus {
      border-color: $border-color;
      box-shadow: 0 0 0 3px rgba($shadow-color, 0.1);
    }
  }
}

// Ús del mixin
.pelu-input-text {
  @include input-state('error', var(--input-border-error), #dc2626);
  @include input-state('success', var(--input-border-success), #16a34a);
}

// Mixin per responsive
@mixin input-responsive($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

// Ús del mixin
.pelu-input-text {
  @include input-responsive(768px) {
    font-size: 1rem;
  }
}
```

## 🚀 Optimitzacions de Performance

### CSS Optimitzat

```scss
// Utilitzar transform en lloc de top/left per animacions
.input-animation {
  transform: translateY(0);
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-1px);
  }
}

// Utilitzar will-change per animacions complexes
.input-complex-animation {
  will-change: transform, opacity;
}

// Optimitzar repaints
.input-optimized {
  transform: translateZ(0); // Force hardware acceleration
}
```

### Variables CSS Optimitzades

```scss
// Utilitzar variables CSS per canvis dinàmics
:root {
  --input-scale: 1;
  --input-opacity: 1;
}

.input-scalable {
  transform: scale(var(--input-scale));
  opacity: var(--input-opacity);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

// Canviar valors via JavaScript
// document.documentElement.style.setProperty('--input-scale', '1.05');
```

## 📚 Millors Pràctiques

### Organització de Fitxers

```
src/app/shared/components/inputs/
├── styles/
│   ├── _variables.scss      # Variables globals
│   ├── _mixins.scss         # Mixins reutilitzables
│   ├── _states.scss         # Estats dels inputs
│   ├── _responsive.scss     # Estils responsive
│   ├── _accessibility.scss  # Estils d'accessibilitat
│   └── _utilities.scss      # Classes d'utilitat
├── components/
│   ├── input-text/
│   ├── input-textarea/
│   └── ...
└── index.scss              # Fitxer principal
```

### Nomenclatura

```scss
// Utilitzar BEM per components
.pelu-input {
  &__label { }
  &__field { }
  &__message { }
  
  &--error { }
  &--success { }
  &--disabled { }
}

// Utilitzar kebab-case per classes
.input-field { }
.input-label { }
.input-message { }
```

### Especificitat

```scss
// Mantenir baixa especificitat
.input-base { } // Especificitat: 0,0,1,0

// Evitar especificitat alta
body .container .form .input-base { } // Especificitat: 0,0,4,0

// Utilitzar !important només quan sigui necessari
.input-critical {
  border-color: var(--input-border-error) !important;
}
```

---

**Última actualització: Juliol 2025** 
