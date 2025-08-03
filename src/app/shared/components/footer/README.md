# Footer Component

Un component de footer genèric i reutilitzable per a tota l'aplicació web.

## Característiques

- **Flexible**: Configurable per a diferents usos
- **Responsive**: S'adapta a diferents mides de pantalla
- **Temàtic**: Suporta diferents variants i temes
- **Internacionalitzat**: Suporta múltiples idiomes
- **Accessible**: Dissenyat amb millors pràctiques d'accessibilitat

## Ús Bàsic

```typescript
import { FooterComponent, FooterConfig } from '../../../shared/components/footer/footer.component';

@Component({
  imports: [FooterComponent],
  // ...
})
export class MyComponent {
  readonly footerConfig = computed((): FooterConfig => ({
    showInfoNote: true,
    infoNoteText: 'Missatge personalitzat',
    infoNoteIcon: '📝',
    variant: 'default',
    theme: 'light',
  }));
}
```

```html
<pelu-footer [config]="footerConfig()"></pelu-footer>
```

## Configuració

### FooterConfig Interface

```typescript
interface FooterConfig {
  // Configuració general
  showInfoNote?: boolean;
  infoNoteText?: string;
  infoNoteIcon?: string;
  
  // Alertes
  alerts?: FooterAlert[];
  
  // Informació del negoci
  showBusinessHours?: boolean;
  businessHours?: {
    start: number;
    end: number;
  };
  lunchBreak?: {
    start: number;
    end: number;
  };
  
  // Condicions especials
  isWeekend?: boolean;
  showWeekendInfo?: boolean;
  
  // Contingut personalitzat
  customContent?: string;
  
  // Estil
  variant?: 'default' | 'compact' | 'minimal';
  theme?: 'light' | 'dark' | 'auto';
}
```

## Exemples d'Ús

### Footer amb Hores del Negoci

```typescript
readonly footerConfig = computed((): FooterConfig => ({
  showBusinessHours: true,
  businessHours: { start: 8, end: 20 },
  lunchBreak: { start: 13, end: 15 },
  isWeekend: false,
  variant: 'default',
}));
```

### Footer Compacte amb Alertes

```typescript
readonly footerConfig = computed((): FooterConfig => ({
  variant: 'compact',
  alerts: [
    {
      id: 'maintenance',
      type: 'warning',
      message: 'Manteniment programat per demà',
      icon: '⚠️',
      show: true,
    }
  ],
}));
```

### Footer Minimalista

```typescript
readonly footerConfig = computed((): FooterConfig => ({
  variant: 'minimal',
  customContent: '© 2024 PeluApp. Tots els drets reservats.',
  theme: 'dark',
}));
```

## Variants

- **default**: Estil complet amb padding i ombra
- **compact**: Versió més petita amb menys padding
- **minimal**: Versió mínima amb només el contingut essencial

## Temes

- **light**: Tema clar (per defecte)
- **dark**: Tema fosc
- **auto**: S'adapta automàticament al tema del sistema

## Alertes

Les alertes poden ser de tipus:
- `info`: Informació general
- `warning`: Advertències
- `success`: Missatges d'èxit
- `error`: Errors

## Traduccions

El component utilitza les següents claus de traducció:

- `FOOTER.INFO_NOTE`: Nota d'informació per defecte
- `FOOTER.WEEKEND_INFO`: Informació per caps de setmana
- `FOOTER.BUSINESS_HOURS_INFO`: Informació d'hores del negoci

## Integració amb BusinessSettingsService

El component està dissenyat per integrar-se amb el `BusinessSettingsService` per obtenir les hores del negoci dinàmicament:

```typescript
readonly footerConfig = computed((): FooterConfig => {
  const businessHours = this.businessSettingsService.getBusinessHours();
  const lunchBreak = this.businessSettingsService.getLunchBreakNumeric();
  
  return {
    showBusinessHours: true,
    businessHours: {
      start: businessHours.start,
      end: businessHours.end
    },
    lunchBreak: {
      start: lunchBreak.start,
      end: lunchBreak.end
    },
  };
});
```
