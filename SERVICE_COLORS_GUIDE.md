# Guia d'ús dels Colors de Serveis

Aquesta guia explica com utilitzar el sistema de colors unificat per als serveis de la peluqueria.

## Variables CSS Globals

Tots els colors dels serveis estan definits com a variables CSS globals a `src/styles.scss`:

### Colors Principals
```css
--service-haircut-color: #3B82F6;           /* Blau - Corte */
--service-styling-color: #8B5CF6;           /* Lila - Peinat */
--service-treatment-color: #10B981;         /* Verd - Tractament */
--service-coloring-color: #F59E0B;          /* Taronja - Coloració */
--service-special-color: #EF4444;           /* Vermell - Especial */
--service-kids-color: #EC4899;              /* Rosa - Infantil */
--service-default-color: #6B7280;           /* Gris - General */
```

### Colors de Fons
```css
--service-haircut-bg: #DBEAFE;              /* Blau clar - Corte */
--service-styling-bg: #EDE9FE;              /* Lila clar - Peinat */
--service-treatment-bg: #D1FAE5;            /* Verd clar - Tractament */
--service-coloring-bg: #FEF3C7;             /* Taronja clar - Coloració */
--service-special-bg: #FEE2E2;              /* Vermell clar - Especial */
--service-kids-bg: #FCE7F3;                 /* Rosa clar - Infantil */
--service-default-bg: #F3F4F6;              /* Gris clar - General */
```

### Colors de Text
```css
--service-haircut-text: #1E40AF;            /* Blau fosc - Corte */
--service-styling-text: #5B21B6;            /* Lila fosc - Peinat */
--service-treatment-text: #065F46;          /* Verd fosc - Tractament */
--service-coloring-text: #92400E;           /* Taronja fosc - Coloració */
--service-special-text: #991B1B;            /* Vermell fosc - Especial */
--service-kids-text: #9D174D;               /* Rosa fosc - Infantil */
--service-default-text: #374151;            /* Gris fosc - General */
```

## Classes CSS Utilitàries

### Classes Principals (Color + Fons + Borda)
```css
.service-color-haircut    /* Blau - Corte */
.service-color-styling    /* Lila - Peinat */
.service-color-treatment  /* Verd - Tractament */
.service-color-coloring   /* Taronja - Coloració */
.service-color-special    /* Vermell - Especial */
.service-color-kids       /* Rosa - Infantil */
.service-color-default    /* Gris - General */
```

### Classes per Text
```css
.service-text-haircut     /* Text blau fosc - Corte */
.service-text-styling     /* Text lila fosc - Peinat */
.service-text-treatment   /* Text verd fosc - Tractament */
.service-text-coloring    /* Text taronja fosc - Coloració */
.service-text-special     /* Text vermell fosc - Especial */
.service-text-kids        /* Text rosa fosc - Infantil */
.service-text-default     /* Text gris fosc - General */
```

### Classes per Fons
```css
.service-bg-haircut       /* Fons blau clar - Corte */
.service-bg-styling       /* Fons lila clar - Peinat */
.service-bg-treatment     /* Fons verd clar - Tractament */
.service-bg-coloring      /* Fons taronja clar - Coloració */
.service-bg-special       /* Fons vermell clar - Especial */
.service-bg-kids          /* Fons rosa clar - Infantil */
.service-bg-default       /* Fons gris clar - General */
```

## Ús en Components

### 1. Utilitzant Classes CSS Directament

```html
<!-- Badge complet amb color, fons i borda -->
<div class="service-badge service-color-haircut">
  ✂️ Corte masculí
</div>

<!-- Només text amb color -->
<div class="service-name service-text-haircut">
  Corte masculí
</div>

<!-- Només fons -->
<div class="service-card service-bg-haircut">
  Contingut del servei
</div>
```

### 2. Utilitzant el Servei TypeScript

```typescript
import { ServiceColorsService } from '@core/services/service-colors.service';

export class MyComponent {
  constructor(private serviceColorsService: ServiceColorsService) {}

  // Obtenir objecte amb tots els colors
  getServiceColors(serviceName: string) {
    return this.serviceColorsService.getServiceColor(serviceName);
  }

  // Obtenir classe CSS principal
  getServiceCssClass(serviceName: string) {
    return this.serviceColorsService.getServiceCssClass(serviceName);
  }

  // Obtenir classe CSS per text
  getServiceTextCssClass(serviceName: string) {
    return this.serviceColorsService.getServiceTextCssClass(serviceName);
  }

  // Obtenir classe CSS per fons
  getServiceBgCssClass(serviceName: string) {
    return this.serviceColorsService.getServiceBgCssClass(serviceName);
  }
}
```

```html
<!-- Utilitzant el servei -->
<div class="service-badge" [ngClass]="getServiceCssClass('Corte')">
  ✂️ Corte masculí
</div>

<div class="service-name" [ngClass]="getServiceTextCssClass('Corte')">
  Corte masculí
</div>
```

### 3. Utilitzant Variables CSS Directament

```scss
.my-service-component {
  // Utilitzar variables CSS directament
  background-color: var(--service-haircut-bg);
  color: var(--service-haircut-text);
  border: 2px solid var(--service-haircut-color);
}
```

## Exemples Pràctics

### Badge de Servei
```html
<div class="service-badge service-color-haircut">
  <span class="service-icon">✂️</span>
  <span class="service-name">Corte masculí</span>
</div>
```

### Card de Servei
```html
<div class="service-card service-bg-haircut">
  <h3 class="service-title service-text-haircut">Corte masculí</h3>
  <p class="service-description">Descripció del servei</p>
  <div class="service-price service-text-haircut">25€</div>
</div>
```

### Filtre de Servei
```html
<button class="filter-button service-color-haircut" 
        [class.active]="isActive">
  Corte
</button>
```

## Mapeig de Serveis

El servei automàticament mapeja els noms dels serveis als colors corresponents:

- **Corte** → `haircut` (Blau)
- **Peinat** → `styling` (Lila)
- **Tractament** → `treatment` (Verd)
- **Coloració** → `coloring` (Taronja)
- **Especial** → `special` (Vermell)
- **Infantil** → `kids` (Rosa)
- **Altres** → `default` (Gris)

## Avantatges del Sistema

1. **Consistència**: Tots els colors estan centralitzats
2. **Mantenibilitat**: Canvis fàcils a un sol lloc
3. **Flexibilitat**: Múltiples formes d'ús
4. **Performance**: Variables CSS són eficients
5. **Accessibilitat**: Colors contrastats adequadament
6. **Escalabilitat**: Fàcil afegir nous serveis

## Afegir Nous Serveis

Per afegir un nou servei:

1. Afegir les variables CSS a `styles.scss`
2. Afegir les classes utilitàries
3. Actualitzar el servei `ServiceColorsService`
4. Afegir el mapeig de noms si cal

```scss
/* 1. Afegir variables */
--service-new-color: #6366F1;           /* Indigo - Nou servei */
--service-new-bg: #E0E7FF;              /* Indigo clar */
--service-new-text: #3730A3;            /* Indigo fosc */

/* 2. Afegir classes */
.service-color-new {
  color: var(--service-new-color) !important;
  background-color: var(--service-new-bg) !important;
  border-color: var(--service-new-color) !important;
}

.service-text-new {
  color: var(--service-new-text) !important;
}

.service-bg-new {
  background-color: var(--service-new-bg) !important;
}
```

```typescript
// 3. Afegir al servei
{
  id: 'new',
  name: 'Nou Servei',
  color: 'var(--service-new-color)',
  backgroundColor: 'var(--service-new-bg)',
  borderColor: 'var(--service-new-color)',
  textColor: 'var(--service-new-text)'
}
``` 
