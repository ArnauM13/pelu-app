# Loader Component

Un component de loader global que proporciona una experiència de càrrega consistent a tota l'aplicació.

## Característiques

- ✅ **Loader Global**: Ocupa sempre el 100% de la pantalla
- ✅ **Servei Centralitzat**: Com el toast, es gestiona des d'un servei
- ✅ **Configuració Flexible**: Missatges personalitzats, amb/sense spinner
- ✅ **Fons Consistent**: Mateix gradient que la resta de l'app
- ✅ **Responsive**: Funciona perfectament a mòbil i desktop
- ✅ **Z-index Alt**: Sempre apareix per sobre de tot

## Instal·lació

El component ja està integrat a l'app principal. Només cal injectar el `LoaderService` on es vulgui utilitzar.

## Ús Bàsic

### 1. Injectar el servei

```typescript
import { LoaderService } from '@shared/components/loader';

export class MyComponent {
  constructor(private loaderService: LoaderService) {}
}
```

### 2. Mostrar/Amagar el loader

```typescript
// Mostrar loader bàsic
this.loaderService.show();

// Amagar loader
this.loaderService.hide();

// Mostrar amb missatge personalitzat
this.loaderService.showWithMessage('Carregant dades...');
```

## Mètodes Disponibles

### `show(config?: LoaderConfig)`
Mostra el loader amb configuració opcional.

```typescript
this.loaderService.show({
  message: 'Processant dades...',
  showSpinner: true,
  overlay: true
});
```

### `hide()`
Amaga el loader.

### `showWithMessage(message: string)`
Mostra el loader amb un missatge personalitzat.

```typescript
this.loaderService.showWithMessage('Carregant cita...');
```

### `showInline(config?: LoaderConfig)`
Mostra el loader sense overlay (per càrregues en línia).

### `showMessageOnly(message: string)`
Mostra només el missatge sense spinner.

```typescript
this.loaderService.showMessageOnly('Operació completada');
```

## Configuració

### LoaderConfig Interface

```typescript
interface LoaderConfig {
  message?: string;        // Missatge a mostrar
  showSpinner?: boolean;   // Si mostrar el spinner (per defecte: true)
  overlay?: boolean;       // Si mostrar overlay (per defecte: true)
}
```

## Exemples d'Ús

### En un Servei

```typescript
export class AppointmentService {
  constructor(private loaderService: LoaderService) {}

  async loadAppointment(id: string): Promise<Appointment> {
    this.loaderService.showWithMessage('Carregant cita...');
    
    try {
      const appointment = await this.api.getAppointment(id);
      return appointment;
    } finally {
      this.loaderService.hide();
    }
  }
}
```

### En un Component

```typescript
export class AppointmentDetailComponent {
  constructor(private loaderService: LoaderService) {}

  async saveAppointment(): Promise<void> {
    this.loaderService.showWithMessage('Desant cita...');
    
    try {
      await this.appointmentService.save(this.appointment);
      this.toastService.showSuccess('Cita desada correctament');
    } finally {
      this.loaderService.hide();
    }
  }
}
```

### Càrrega Asíncrona

```typescript
async loadData(): Promise<void> {
  this.loaderService.showWithMessage('Carregant dades...');
  
  try {
    await this.dataService.load();
  } catch (error) {
    this.toastService.showError('Error carregant dades');
  } finally {
    this.loaderService.hide();
  }
}
```

## Integració amb Detail View

El `DetailViewComponent` ja està configurat per utilitzar el loader global:

```typescript
ngOnChanges(changes: SimpleChanges) {
  if (changes['config']) {
    if (this.config?.loading) {
      this.loaderService.show();
    } else {
      this.loaderService.hide();
    }
  }
}
```

## Estils

El loader utilitza:

- **Fons**: `linear-gradient(135deg, #f0f6ff 0%, #e3ecfa 100%)`
- **Textura**: Patró SVG de "grain" amb opacitat 0.2
- **Z-index**: `var(--z-overlay, 9999)`
- **Posició**: `position: fixed` amb `inset: 0`

## Responsive

- **Desktop**: Spinner de 50px, text de 18px
- **Mòbil**: Spinner de 40px, text de 16px

## Millores Futures

- [ ] Animacions d'entrada/sortida
- [ ] Múltiples loaders simultanis
- [ ] Progress bar per operacions llargues
- [ ] Temes personalitzables
- [ ] Integració amb HTTP interceptors

## Troubleshooting

### El loader no apareix
1. Verifica que el `LoaderComponent` està importat a `app.component.ts`
2. Comprova que el servei està injectat correctament
3. Verifica que no hi ha errors a la consola

### El loader no ocupa tota la pantalla
1. El component ja està configurat amb `position: fixed` i `inset: 0`
2. Si hi ha problemes, verifica que no hi ha CSS que sobreescrigui aquests estils

### El loader no s'amaga
1. Assegura't que sempre crides `hide()` en el bloc `finally`
2. Verifica que no hi ha múltiples crides a `show()` sense `hide()` 
