# 🎯 Sistema de Toasts Unificat

Sistema complet de toasts basat en PrimeNG amb personalització completa i gestió unificada.

## 📋 Taula de Continguts

- [Característiques](#característiques)
- [Instal·lació](#instal·lació)
- [Ús Bàsic](#ús-bàsic)
- [Configuració](#configuració)
- [Tipus de Toasts](#tipus-de-toasts)
- [Posicions](#posicions)
- [Accions Personalitzades](#accions-personalitzades)
- [Icones Personalitzades](#icones-personalitzades)
- [Classes CSS Personalitzades](#classes-css-personalitzades)
- [Animacions](#animacions)
- [Responsivitat](#responsivitat)
- [API Completa](#api-completa)
- [Exemples](#exemples)
- [Casos d'Ús](#casos-dús)

## ✨ Característiques

- **🎨 Disseny Unificat**: Estils consistents amb el tema de l'aplicació
- **🔧 Configuració Flexible**: Múltiples opcions de personalització
- **📱 Responsiu**: Adaptació automàtica a diferents mides de pantalla
- **🎭 Múltiples Tipus**: Success, Error, Info, Warning, Secondary, Contrast
- **📍 Posicions Múltiples**: 7 posicions diferents disponibles
- **⏱️ Duració Personalitzada**: Control total sobre la durada dels toasts
- **🎯 Accions Personalitzades**: Botons d'acció integrats
- **🎨 Icones Personalitzades**: Suport per a icones personalitzades
- **🎪 Múltiples Toasts**: Gestió de múltiples toasts simultàniament
- **🎬 Animacions Avançades**: Transicions i transformacions personalitzables

## 🚀 Instal·lació

El sistema de toasts ja està integrat a l'aplicació. Només cal importar els components necessaris:

```typescript
import { ToastComponent, ToastService } from '@shared/components/toast';
```

## 📖 Ús Bàsic

### 1. Component Toast

Afegeix el component toast al teu template:

```html
<pelu-toast />
```

### 2. Servei Toast

Injecta el servei al teu component:

```typescript
import { ToastService } from '@shared/services/toast.service';

export class MyComponent {
  private readonly toastService = inject(ToastService);

  showSuccessToast() {
    this.toastService.showSuccess('Operació completada', 'La teva acció s\'ha realitzat correctament');
  }
}
```

## ⚙️ Configuració

### Configuració Bàsica

```typescript
this.toastService.showToast({
  severity: 'success',
  summary: 'Títol del toast',
  detail: 'Descripció detallada',
  life: 4000, // durada en ms
  position: 'top-right',
  data: {
    customIcon: '🎉',
    customClass: 'my-custom-toast',
  }
});
```

### Configuració Avançada

```typescript
this.toastService.showToast({
  severity: 'info',
  summary: 'Configuració Avançada',
  detail: 'Toast amb configuració completa',
  life: 6000,
  sticky: false,
  closable: true,
  position: 'center',
  key: 'my-custom-key',
  data: {
    customIcon: '⚙️',
    customClass: 'premium-toast',
    action: () => console.log('Acció executada'),
    actionLabel: 'Executar',
  },
  showTransitionOptions: '500ms ease-out',
  hideTransitionOptions: '300ms ease-in',
  showTransformOptions: 'translateY(-50px)',
  hideTransformOptions: 'translateY(50px)',
  breakpoints: {
    '920px': { width: '100%', right: '0', left: '0' },
    '768px': { width: '95%', right: '2.5%', left: '2.5%' },
  },
  baseZIndex: 10000,
});
```

## 🎨 Tipus de Toasts

### Tipus Bàsics

```typescript
// Success
this.toastService.showSuccess('Èxit', 'Operació completada');

// Error
this.toastService.showError('Error', 'Ha ocorregut un problema');

// Info
this.toastService.showInfo('Informació', 'Missatge informatiu');

// Warning
this.toastService.showWarning('Advertència', 'Acció important');

// Secondary
this.toastService.showSecondary('Secundari', 'Missatge secundari');

// Contrast
this.toastService.showContrast('Contrast', 'Missatge que destaca');
```

### Tipus Específics

```typescript
// Casos d'ús comuns
this.toastService.showReservationCreated('appointment-id');
this.toastService.showAppointmentDeleted('Joan Pérez');
this.toastService.showValidationError('nom del client');
this.toastService.showNetworkError();
this.toastService.showLoginRequired();
```

## 📍 Posicions

Els toasts es poden mostrar en 7 posicions diferents:

```typescript
// Posicions disponibles
'top-left'      // Part superior esquerra
'top-center'    // Part superior central
'top-right'     // Part superior dreta (per defecte)
'bottom-left'   // Part inferior esquerra
'bottom-center' // Part inferior central
'bottom-right'  // Part inferior dreta
'center'        // Centre de la pantalla

// Exemple d'ús
this.toastService.showToastAtPosition(
  'info',
  'Top Left',
  'Aquest toast apareix a la part superior esquerra',
  'top-left'
);
```

## 🎯 Accions Personalitzades

### Toast amb Acció Simple

```typescript
this.toastService.showToastWithAction(
  'success',
  'Acció disponible',
  'Clica per executar una acció',
  () => {
    console.log('Acció executada!');
    alert('Acció personalitzada!');
  },
  'Executar Acció'
);
```

### Toast amb Múltiples Accions

```typescript
this.toastService.showToast({
  severity: 'info',
  summary: 'Múltiples accions',
  detail: 'Aquest toast té múltiples opcions',
  data: {
    customIcon: '⚙️',
    action: () => alert('Acció principal!'),
    actionLabel: 'Acció Principal',
  },
});
```

### Toast Sense Tancar

```typescript
this.toastService.showToast({
  severity: 'warn',
  summary: 'Toast sense tancar',
  detail: 'Aquest toast no es pot tancar manualment',
  closable: false,
  data: {
    customIcon: '🔒',
  },
});
```

## 🎨 Icones Personalitzades

### Icones per Defecte

Cada tipus de toast té la seva icona per defecte:
- ✅ Success
- ❌ Error
- ⚠️ Warning
- ℹ️ Info
- 🔄 Secondary
- 💡 Contrast

### Icones Personalitzades

```typescript
// Amb mètode específic
this.toastService.showToastWithCustomIcon(
  'success',
  'Celebració!',
  'Has completat una tasca important',
  '🎉'
);

// Amb configuració completa
this.toastService.showToast({
  severity: 'info',
  summary: 'Email enviat',
  detail: 'El teu missatge s\'ha enviat correctament',
  data: {
    customIcon: '📧',
  },
});
```

## 🎨 Classes CSS Personalitzades

### Classes Predefinides

```scss
// Estils disponibles al demo
.premium-toast {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border: 2px solid #fbbf24 !important;
}

.urgent-toast {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  animation: pulse 2s infinite !important;
}

.festive-toast {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border: 2px dashed #fbbf24 !important;
}
```

### Ús de Classes Personalitzades

```typescript
this.toastService.showToastWithCustomClass(
  'success',
  'Versió Premium',
  'Has activat les funcions premium',
  'premium-toast',
  { customIcon: '👑' }
);
```

## 🎬 Animacions

### Animacions Personalitzades

```typescript
this.toastService.showToast({
  severity: 'success',
  summary: 'Amb Animacions',
  detail: 'Aquest toast té animacions personalitzades',
  data: { customIcon: '🎬' },
  showTransitionOptions: '800ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  hideTransitionOptions: '400ms cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  showTransformOptions: 'scale(0.3) rotate(180deg)',
  hideTransformOptions: 'scale(0.3) rotate(-180deg)',
});
```

### Animacions Predefinides

```typescript
// Animació de desplaçament
showTransformOptions: 'translateX(100%)'
hideTransformOptions: 'translateX(100%)'

// Animació d'escala
showTransformOptions: 'scale(0.3)'
hideTransformOptions: 'scale(0.3)'

// Animació de rotació
showTransformOptions: 'rotate(180deg)'
hideTransformOptions: 'rotate(-180deg)'
```

## 📱 Responsivitat

### Breakpoints Personalitzats

```typescript
this.toastService.showToast({
  severity: 'info',
  summary: 'Responsiu',
  detail: 'Aquest toast s\'adapta a diferents mides',
  data: { customIcon: '📱' },
  breakpoints: {
    '920px': { width: '100%', right: '0', left: '0' },
    '768px': { width: '95%', right: '2.5%', left: '2.5%' },
    '480px': { width: '90%', right: '5%', left: '5%' },
  },
});
```

### Responsivitat Automàtica

El sistema inclou responsivitat automàtica per a mòbils:
- Amplada adaptativa
- Posicionament optimitzat
- Botons d'acció en columna
- Mides de text ajustades

## 🔧 API Completa

### ToastService

#### Mètodes Bàsics

```typescript
// Mètode principal
showToast(config: ToastConfig): void

// Mètodes ràpids
showSuccess(summary: string, detail?: string, data?: Partial<ToastData>): void
showError(summary: string, detail?: string, data?: Partial<ToastData>): void
showInfo(summary: string, detail?: string, data?: Partial<ToastData>): void
showWarning(summary: string, detail?: string, data?: Partial<ToastData>): void
showSecondary(summary: string, detail?: string, data?: Partial<ToastData>): void
showContrast(summary: string, detail?: string, data?: Partial<ToastData>): void
```

#### Mètodes Avançats

```typescript
// Toasts específics
showReservationCreated(appointmentId: string): void
showAppointmentDeleted(appointmentName: string): void
showAppointmentUpdated(appointmentName: string): void
showAppointmentCreated(appointmentName: string, appointmentId: string): void
showValidationError(field: string): void
showNetworkError(): void
showUnauthorizedError(): void
showLoginRequired(): void

// Toasts amb personalització
showToastWithAction(severity, summary, detail, action, actionLabel, data?): void
showStickyToast(config: Omit<ToastConfig, 'sticky'>): void
showToastWithCustomIcon(severity, summary, detail, customIcon, data?): void
showToastWithCustomClass(severity, summary, detail, customClass, data?): void
showToastAtPosition(severity, summary, detail, position, data?): void
showMultipleToasts(configs: ToastConfig[]): void
showToastWithDuration(severity, summary, detail, life, data?): void

// Gestió
clearToast(key?: string): void
clearAllToasts(): void
```

### ToastComponent

#### Inputs

```typescript
config: ToastConfig // Configuració del toast
```

#### Outputs

```typescript
onToastClose: EventEmitter<any> // Event quan es tanca el toast
```

#### Mètodes

```typescript
showToast(config: ToastConfig): void
clearToast(key?: string): void
clearAllToasts(): void
```

## 📝 Exemples

### Exemple 1: Toast Bàsic

```typescript
// Component
export class MyComponent {
  private readonly toastService = inject(ToastService);

  onSaveSuccess() {
    this.toastService.showSuccess(
      'Guardat correctament',
      'Les teves dades s\'han guardat amb èxit'
    );
  }
}
```

### Exemple 2: Toast amb Acció

```typescript
onDeleteConfirm() {
  this.toastService.showToastWithAction(
    'warn',
    'Element eliminat',
    'L\'element s\'ha eliminat correctament. Pots desfer l\'acció.',
    () => this.undoDelete(),
    'Desfer'
  );
}
```

### Exemple 3: Toast Sticky

```typescript
onUploadStart() {
  this.toastService.showStickyToast({
    severity: 'info',
    summary: 'Pujant fitxer...',
    detail: 'Si us plau, espera mentre es puja el fitxer.',
    data: { customIcon: '📤' },
  });
}

onUploadComplete() {
  this.toastService.clearToast();
  this.toastService.showSuccess('Fitxer pujat', 'El fitxer s\'ha pujat correctament');
}
```

### Exemple 4: Múltiples Toasts

```typescript
onBulkOperation() {
  const configs: ToastConfig[] = [
    {
      severity: 'success',
      summary: 'Operació 1 completada',
      data: { customIcon: '1️⃣' },
    },
    {
      severity: 'info',
      summary: 'Operació 2 en curs',
      data: { customIcon: '2️⃣' },
    },
    {
      severity: 'warn',
      summary: 'Operació 3 amb advertències',
      data: { customIcon: '3️⃣' },
    },
  ];

  this.toastService.showMultipleToasts(configs);
}
```

## 🎯 Casos d'Ús

### 1. Notificacions d'Èxit

```typescript
// Després d'una operació exitosa
this.toastService.showSuccess(
  'Reserva creada',
  'La teva cita s\'ha programat correctament'
);
```

### 2. Errors de Validació

```typescript
// Quan hi ha errors de formulari
this.toastService.showValidationError('email');
```

### 3. Accions que Requereixen Confirmació

```typescript
// Abans d'una acció destructiva
this.toastService.showToastWithAction(
  'warn',
  'Eliminar element',
  'Aquesta acció no es pot desfer. Estàs segur?',
  () => this.confirmDelete(),
  'Confirmar'
);
```

### 4. Estats de Càrrega

```typescript
// Durant operacions llargues
this.toastService.showStickyToast({
  severity: 'info',
  summary: 'Processant...',
  detail: 'Si us plau, espera mentre es processen les dades.',
  data: { customIcon: '⏳' },
});
```

### 5. Notificacions de Sistema

```typescript
// Errors de xarxa
this.toastService.showNetworkError();

// Problemes d'autenticació
this.toastService.showLoginRequired();

// Problemes de permisos
this.toastService.showUnauthorizedError();
```

## 🎨 Personalització d'Estils

### Variables CSS

```scss
:root {
  --toast-border-radius: 12px;
  --toast-padding: 16px;
  --toast-margin: 8px;
  --toast-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  --toast-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.16);
  --toast-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --toast-max-width: 400px;
  --toast-min-width: 320px;
}
```

### Classes CSS

```scss
// Estructura del toast
.toast-container
.toast-icon
.toast-content
.toast-text
.toast-title
.toast-detail
.toast-actions
.toast-action-btn
.toast-close-btn

// Variants per severitat
.toast-icon-success
.toast-icon-error
.toast-icon-warn
.toast-icon-info
.toast-icon-secondary
.toast-icon-contrast
```

## 🔍 Testing

### Test del Servei

```typescript
describe('ToastService', () => {
  let service: ToastService;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
    
    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    });

    service = TestBed.inject(ToastService);
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should show success toast', () => {
    service.showSuccess('Test', 'Detail');
    
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Test',
      detail: 'Detail',
      life: 4000,
      sticky: false,
      closable: true,
      key: 'pelu-toast',
      data: {},
    });
  });
});
```

### Test del Component

```typescript
describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add', 'clear']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## 📚 Recursos Addicionals

- [Documentació de PrimeNG Toast](https://primeng.org/toast)
- [Guia d'Estils de l'Aplicació](../STYLES.md)
- [Exemples d'Integració](../EXAMPLES.md)
- [Plantilles de Configuració](../TEMPLATES.md)

## 🤝 Contribució

Per contribuir al sistema de toasts:

1. Segueix les convencions d'estil establertes
2. Afegeix tests per a noves funcionalitats
3. Actualitza la documentació
4. Prova els canvis al playground

## 📄 Llicència

Aquest sistema de toasts forma part de l'aplicació principal i segueix les mateixes polítiques de llicència. 
