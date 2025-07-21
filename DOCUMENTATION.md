# 📚 PeluApp - Documentació Unificada

## 📋 Taula de Continguts

### 🚀 [Inici Ràpid](#inici-ràpid)
- [Descripció General](#descripció-general)
- [Instal·lació i Configuració](#instal·lació-i-configuració)
- [Comandaments de Desenvolupament](#comandaments-de-desenvolupament)

### 🏗️ [Arquitectura](#arquitectura)
- [Estructura del Projecte](#estructura-del-projecte)
- [Stack Tecnològic](#stack-tecnològic)
- [Patrons de Disseny](#patrons-de-disseny)

### ⚡ [Funcionalitats Principals](#funcionalitats-principals)
- [Sistema de Reserves](#sistema-de-reserves)
- [Calendari Interactiu](#calendari-interactiu)
- [Sistema de Permisos](#sistema-de-permisos)
- [Multiidioma](#multiidioma)

### 🧩 [Components Compartits](#components-compartits)
- [Sistema d'Inputs Unificats](#sistema-dinputs-unificats)
- [Components UI](#components-ui)
- [Popups i Modals](#popups-i-modals)

### 🔧 [Desenvolupament](#desenvolupament)
- [Guies de Desenvolupament](#guies-de-desenvolupament)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

### 🚀 [Desplegament](#desplegament)
- [Configuració de Firebase](#configuració-de-firebase)
- [Desplegament a Producció](#desplegament-a-producció)

---

## 🚀 Inici Ràpid

### Descripció General

**PeluApp** és una aplicació web per a la gestió de reserves de perruqueria desenvolupada amb Angular 18. L'aplicació permet als usuaris veure horaris disponibles, fer reserves i als administradors gestionar cites i serveis.

### Característiques Principals
- ✅ **Sistema de Reserves**: Creació i gestió de cites
- ✅ **Calendari Interactiu**: Visualització en temps real amb drag & drop
- ✅ **Sistema de Permisos**: Rol-based access control
- ✅ **Multiidioma**: Suport per català, castellà, anglès i àrab
- ✅ **Responsive Design**: Optimitzat per mòbil i desktop
- ✅ **Notificacions**: Sistema de toast integrat
- ✅ **Loader Global**: Indicador de càrrega consistent

### Instal·lació i Configuració

#### Prerequisits
- Node.js 18.x LTS
- npm o yarn
- Angular CLI 18.2.0+

#### Instal·lació

```bash
# Clonar el repositori
git clone [repository-url]
cd pelu-app

# Instal·lar dependències
npm install

# Configurar Firebase (opcional)
npm run setup:firebase
```

### Comandaments de Desenvolupament

```bash
# Servidor de desenvolupament
npm start
# o
ng serve

# Build de producció
npm run build
# o
ng build

# Tests unitaris
npm test
# o
ng test

# Tests e2e
npm run e2e
# o
ng e2e

# Desplegament
firebase deploy
```

---

## 🏗️ Arquitectura

### Estructura del Projecte

```
src/
├── app/
│   ├── core/                 # Serveis i lògica de negoci
│   │   ├── auth/            # Autenticació
│   │   ├── guards/          # Guards de ruta
│   │   ├── services/        # Serveis compartits
│   │   └── interceptors/    # Interceptors HTTP
│   ├── features/            # Mòduls de funcionalitat
│   │   ├── admin/           # Funcionalitats d'admin
│   │   ├── appointments/    # Gestió de cites
│   │   ├── auth/            # Pàgines d'autenticació
│   │   ├── bookings/        # Sistema de reserves
│   │   ├── calendar/        # Component de calendari
│   │   ├── landing/         # Pàgina d'inici
│   │   ├── profile/         # Gestió de perfil
│   │   └── services/        # Gestió de serveis
│   ├── shared/              # Components compartits
│   │   ├── components/      # Components UI
│   │   ├── pipes/           # Pipes personalitzats
│   │   └── services/        # Serveis compartits
│   └── ui/                  # Layout i navegació
├── assets/                  # Recursos estàtics
│   ├── i18n/               # Traduccions
│   └── images/             # Imatges
└── environments/           # Configuracions d'entorn
```

### Stack Tecnològic

- **Frontend**: Angular 18
- **UI Framework**: PrimeNG + PrimeFlex
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **Estil**: SCSS + CSS Variables
- **Testing**: Jasmine + Karma
- **Build**: Angular CLI + Vite
- **Deployment**: Firebase Hosting

### Patrons de Disseny

- **Feature-based Architecture**: Organització per funcionalitats
- **Signal-based State Management**: Angular Signals per estat reactiu
- **Component Composition**: Components reutilitzables
- **Service Layer Pattern**: Lògica de negoci en serveis
- **Guard Pattern**: Protecció de rutes

---

## ⚡ Funcionalitats Principals

### Sistema de Reserves

El sistema de reserves permet als usuaris crear i gestionar cites de perruqueria.

#### Flux de Booking

**Flux Mòbil Optimitzat**:
```
1. Usuari selecciona data
   ↓
2. Usuari selecciona servei
   ↓
3. Usuari selecciona hora
   ↓
4. Es mostra directament el popup de confirmació
```

**Flux Desktop**:
```
1. Usuari selecciona data
   ↓
2. Usuari selecciona hora
   ↓
3. Es mostra popup de selecció de serveis
   ↓
4. Usuari selecciona servei al popup
   ↓
5. Es mostra popup de confirmació
```

#### Característiques del Sistema

- ✅ **Selecció de Data**: Calendari interactiu amb navegació per setmanes
- ✅ **Selecció de Servei**: Llista de serveis disponibles amb preus
- ✅ **Selecció d'Hora**: Horaris disponibles en temps real
- ✅ **Confirmació**: Popup de confirmació amb tots els detalls
- ✅ **Validacions**: Verificació de disponibilitat i dades requerides
- ✅ **Notificacions**: Feedback immediat per accions d'usuari

#### Sincronització de Serveis

El sistema manté sincronitzats els serveis entre totes les pàgines:

```typescript
// Event system per sincronització
window.dispatchEvent(new CustomEvent('serviceUpdated'));

// Listener en components
window.addEventListener('serviceUpdated', () => {
  this.loadServices();
});
```

**Cache Management**:
- Durada: 5 minuts
- Clau: `pelu-services-cache`
- Timestamp: `pelu-services-cache-timestamp`

### Calendari Interactiu

El calendari proporciona una visualització interactiva de les cites i horaris.

#### Característiques

- ✅ **Vista Setmanal**: Navegació per setmanes
- ✅ **Drag & Drop**: Reorganització de cites
- ✅ **Estats Visuals**: Diferents colors per tipus de cita
- ✅ **Responsive**: Adaptació a mòbil i desktop
- ✅ **Temps Real**: Actualització automàtica

#### Estats de Cita

- **🟢 Disponible**: Hora lliure
- **🔴 Ocupada**: Cita confirmada
- **🟡 Pendent**: Cita pendent de confirmació
- **⚫ Bloquejada**: Hora no disponible

### Sistema de Permisos

Sistema de control d'accés basat en rols.

#### Rols Disponibles

- **👤 Usuari**: Crear i veure les seves cites
- **👨‍💼 Admin**: Gestió completa de cites i serveis
- **🔒 Anònim**: Només veure horaris disponibles

#### Guards de Ruta

```typescript
// Auth Guard - Requereix autenticació
@Injectable()
export class AuthGuard {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}

// Admin Guard - Requereix rol d'admin
@Injectable()
export class AdminGuard {
  canActivate(): boolean {
    return this.authService.isAdmin();
  }
}
```

### Multiidioma

Sistema de traduccions amb suport per múltiples idiomes.

#### Idiomes Suportats

- 🇪🇸 **Català** (ca) - Idioma principal
- 🇪🇸 **Castellà** (es)
- 🇬🇧 **Anglès** (en)
- 🇸🇦 **Àrab** (ar)

#### Estructura de Traduccions

```
assets/i18n/
├── ca.json      # Català
├── es.json      # Castellà
├── en.json      # Anglès
└── ar.json      # Àrab
```

#### Ús en Components

```typescript
// Injecció del servei
private readonly translateService = inject(TranslateService);

// Canvi d'idioma
this.translateService.use('en');

// Traducció en template
{{ 'COMMON.ACTIONS.SAVE' | translate }}
```

---

## 🧩 Components Compartits

### Sistema d'Inputs Unificats

Sistema complet d'inputs amb mides i estils consistents.

#### Components Disponibles

##### 1. **Input Text** (`pelu-input-text`)
Per a entrades de text d'una sola línia.

```typescript
<pelu-input-text
  [config]="{
    type: 'text',
    label: 'Nom',
    placeholder: 'Introdueix el teu nom',
    required: true,
    showLabel: true
  }"
  [value]="formData.name"
  (valueChange)="onNameChange($event)">
</pelu-input-text>
```

**Mida unificada**: 44px d'alçada

##### 2. **Input Textarea** (`pelu-input-textarea`)
Per a entrades de text llarg amb múltiples línies.

```typescript
<pelu-input-textarea
  [config]="{
    label: 'Descripció',
    placeholder: 'Introdueix una descripció...',
    rows: 4,
    autoResize: true,
    showLabel: true
  }"
  [value]="formData.description"
  (valueChange)="onDescriptionChange($event)">
</pelu-input-textarea>
```

**Mida unificada**: 80px d'alçada mínima (mòbil: 88px)

##### 3. **Input Email** (`pelu-input-email`)
Per a entrades d'email amb validació.

##### 4. **Input Password** (`pelu-input-password`)
Per a contrasenyes amb opció de mostrar/amagar.

##### 5. **Input Number** (`pelu-input-number`)
Per a entrades numèriques.

##### 6. **Input Date** (`pelu-input-date`)
Per a selecció de dates.

##### 7. **Input Select** (`pelu-input-select`)
Per a selecció d'opcions amb suport per colors.

##### 8. **Input Checkbox** (`pelu-input-checkbox`)
Per a caselles de selecció.

#### Característiques Unificades

##### **Mides Consistents**
- **Inputs de text**: 44px d'alçada
- **Textareas**: 80px d'alçada mínima (mòbil: 88px)
- **Bordes**: 2px amb border-radius de 8px
- **Padding**: 0.75rem

##### **Estats Visuals**
- **Normal**: Border gris clar (#e5e7eb)
- **Focus**: Border blau (#1e40af) amb shadow
- **Error**: Border vermell (#dc2626) amb shadow
- **Success**: Border verd (#16a34a) amb shadow
- **Disabled**: Opacitat 0.6, cursor not-allowed

##### **Funcionalitats Comunes**
- ✅ ControlValueAccessor implementat
- ✅ Suport per traduccions
- ✅ Estats d'error, ajuda i èxit
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibilitat

#### Ús Ràpid

```typescript
import { InputTextComponent, InputTextareaComponent } from '@shared/components/inputs';

@Component({
  imports: [InputTextComponent, InputTextareaComponent]
})
export class MyComponent {
  formData = signal({
    name: '',
    description: ''
  });

  updateField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
```

```html
<!-- Input de text (una línia) -->
<pelu-input-text
  [config]="{ label: 'Nom', placeholder: 'Nom complet', showLabel: true }"
  [value]="formData().name"
  (valueChange)="updateField('name', $event)">
</pelu-input-text>

<!-- Input textarea (text llarg) -->
<pelu-input-textarea
  [config]="{ label: 'Descripció', placeholder: 'Descripció detallada...', rows: 4, showLabel: true }"
  [value]="formData().description"
  (valueChange)="updateField('description', $event)">
</pelu-input-textarea>
```

### Components UI

#### Card Component (`pelu-card`)
Component base per contenidors amb estil consistent.

```html
<pelu-card>
  <h2>Títol del Card</h2>
  <p>Contingut del card...</p>
</pelu-card>
```

#### Toast Component (`pelu-toast`)
Sistema de notificacions unificat.

```typescript
// Injecció del servei
private readonly toastService = inject(ToastService);

// Mostrar notificació
this.toastService.showSuccess('Operació completada amb èxit');
this.toastService.showError('Hi ha hagut un error');
this.toastService.showInfo('Informació important');
this.toastService.showWarning('Advertència');
```

#### Loader Component (`pelu-loader`)
Indicador de càrrega global.

```html
<pelu-loader [loading]="isLoading()" [message]="'Carregant...'">
  <!-- Contingut que es mostra quan no carrega -->
</pelu-loader>
```

#### Not Found State (`pelu-not-found-state`)
Component per mostrar estats de "no trobat".

```html
<pelu-not-found-state
  [title]="'No s\'han trobat resultats'"
  [message]="'Prova amb altres filtres'"
  [actionText]="'Tornar'"
  (actionClick)="goBack()">
</pelu-not-found-state>
```

### Popups i Modals

#### Booking Popup (`pelu-booking-popup`)
Popup de confirmació de reserves.

```html
<pelu-booking-popup
  [open]="showBookingPopup()"
  [bookingDetails]="bookingDetails()"
  (confirmed)="onBookingConfirmed($event)"
  (cancelled)="onBookingCancelled()">
</pelu-booking-popup>
```

#### Auth Popup (`pelu-auth-popup`)
Popup d'autenticació.

```html
<pelu-auth-popup
  [open]="showAuthPopup()"
  [mode]="'login'"
  (authenticated)="onAuthenticated($event)"
  (cancelled)="onAuthCancelled()">
</pelu-auth-popup>
```

#### Confirmation Popup (`pelu-confirmation-popup`)
Popup de confirmació genèric.

```html
<pelu-confirmation-popup
  [open]="showConfirmPopup()"
  [title]="'Confirmar acció'"
  [message]="'Estàs segur que vols continuar?'"
  [confirmText]="'Confirmar'"
  [cancelText]="'Cancel·lar'"
  (confirmed)="onConfirmed()"
  (cancelled)="onCancelled()">
</pelu-confirmation-popup>
```

---

## 🔧 Desenvolupament

### Guies de Desenvolupament

#### Creació de Components

1. **Estructura de Carpetes**:
```
feature-name/
├── component-name/
│   ├── component-name.component.html
│   ├── component-name.component.scss
│   ├── component-name.component.ts
│   └── component-name.component.spec.ts
```

2. **Template del Component**:
```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pelu-component-name',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss']
})
export class ComponentNameComponent {
  // Lògica del component
}
```

#### Gestió d'Estat amb Signals

```typescript
export class MyComponent {
  // Signals per estat reactiu
  private readonly dataSignal = signal<any[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Computed values
  readonly hasData = computed(() => this.dataSignal().length > 0);
  readonly isEmpty = computed(() => !this.loadingSignal() && this.dataSignal().length === 0);

  // Mètodes per actualitzar estat
  updateData(newData: any[]) {
    this.dataSignal.set(newData);
  }

  setLoading(loading: boolean) {
    this.loadingSignal.set(loading);
  }

  setError(error: string | null) {
    this.errorSignal.set(error);
  }
}
```

#### Serveis amb Dependency Injection

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MyService {
  private readonly http = inject(HttpClient);

  getData() {
    return this.http.get<any[]>('/api/data');
  }

  createData(data: any) {
    return this.http.post<any>('/api/data', data);
  }
}
```

### Testing

#### Tests Unitaris

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct title', () => {
    const titleElement = fixture.nativeElement.querySelector('h1');
    expect(titleElement.textContent).toContain('Expected Title');
  });
});
```

#### Tests d'Integració

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MyComponent } from './my.component';

describe('MyComponent Integration', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load data from service', async () => {
    // Test d'integració amb serveis
  });
});
```

### Troubleshooting

#### Problemes Comuns

##### 1. **Error de Compilació TypeScript**
```bash
# Verificar tipus
npm run type-check

# Limpiar cache
npm run clean
```

##### 2. **Error de Dependències**
```bash
# Eliminar node_modules i reinstal·lar
rm -rf node_modules package-lock.json
npm install
```

##### 3. **Error de Firebase**
```bash
# Verificar configuració
firebase projects:list

# Reinicialitzar Firebase
firebase init
```

##### 4. **Error de Build**
```bash
# Build amb més detalls
ng build --verbose

# Build de producció
ng build --configuration production
```

#### Debugging

##### 1. **Console Logging**
```typescript
// Logging amb nivells
console.log('Info:', data);
console.warn('Warning:', warning);
console.error('Error:', error);
```

##### 2. **Angular DevTools**
- Instal·lar Angular DevTools extension
- Inspeccionar components i serveis
- Debuggar signals i estat

##### 3. **Network Tab**
- Verificar crides HTTP
- Comprovar headers i responses
- Debuggar errors de xarxa

---

## 🚀 Desplegament

### Configuració de Firebase

#### 1. **Instal·lació de Firebase CLI**
```bash
npm install -g firebase-tools
```

#### 2. **Inicialització del Projecte**
```bash
firebase login
firebase init
```

#### 3. **Configuració de Firestore**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regles de seguretat
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

#### 4. **Configuració d'Hosting**
```json
// firebase.json
{
  "hosting": {
    "public": "dist/pelu-app/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Desplegament a Producció

#### 1. **Build de Producció**
```bash
# Build optimitzat
npm run build

# Verificar build
npm run build:analyze
```

#### 2. **Desplegament**
```bash
# Desplegament complet
firebase deploy

# Desplegament només hosting
firebase deploy --only hosting

# Desplegament només firestore
firebase deploy --only firestore
```

#### 3. **Verificació Post-Desplegament**
```bash
# Verificar URL de desplegament
firebase hosting:channel:list

# Verificar regles de Firestore
firebase firestore:rules:get
```

#### 4. **Monitoring**
```bash
# Veure logs
firebase functions:log

# Veure estadístiques
firebase hosting:channel:list
```

---

## 📚 Recursos Addicionals

### Documentació Externa
- [Angular Documentation](https://angular.dev/)
- [PrimeNG Documentation](https://primeng.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Comandaments Útils
```bash
# Generar component
ng generate component feature-name/component-name

# Generar servei
ng generate service core/services/service-name

# Generar pipe
ng generate pipe shared/pipes/pipe-name

# Linting
npm run lint

# Format code
npm run format

# Test coverage
npm run test:coverage
```

### Estructura de Fitxers de Documentació

```
📁 Documentació Unificada
├── 📄 README.md                    # Documentació principal
├── 📄 DOCUMENTATION.md             # Documentació completa (aquest fitxer)
├── 📁 src/app/
│   ├── 📁 core/services/
│   │   └── 📄 SERVICES_SYNC.md     # Sincronització de serveis
│   ├── 📁 features/
│   │   ├── 📁 appointments/
│   │   │   └── 📄 DIRECT_EDIT_MODE.md
│   │   └── 📁 bookings/
│   │       └── 📁 booking-mobile-page/
│   │           ├── 📄 BOOKINGS_SYNC.md
│   │           ├── 📄 MOBILE_BOOKING_FLOW.md
│   │           └── 📄 TIME_SLOTS_FILTERING.md
│   └── 📁 shared/components/
│       ├── 📁 inputs/
│       │   ├── 📄 README.md        # Documentació d'inputs
│       │   └── 📄 GLOBAL_STYLES.md
│       └── 📁 detail-view/
│           └── 📄 ACTIONS_VISIBILITY.md
```

---

## 🎯 Contribució

### Guies de Contribució
1. **Fork del repositori**
2. **Crear branch per feature**: `git checkout -b feature/nova-funcionalitat`
3. **Fer commits descriptius**: `git commit -m "feat: afegir nova funcionalitat"`
4. **Push al branch**: `git push origin feature/nova-funcionalitat`
5. **Crear Pull Request**

### Estàndards de Codi
- **TypeScript**: Configuració estricta
- **ESLint**: Regles de linting
- **Prettier**: Format de codi
- **Conventional Commits**: Format de commits

### Testing
- **Coverage mínim**: 80%
- **Tests unitaris**: Per a tots els components
- **Tests d'integració**: Per a fluxos crítics
- **Tests e2e**: Per a funcionalitats principals

---

## 📞 Suport

### Contacte
- **Email**: suport@peluapp.com
- **Issues**: [GitHub Issues](https://github.com/peluapp/issues)
- **Documentació**: [Documentació Completa](DOCUMENTATION.md)

### Recursos
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **API Reference**: [API.md](API.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

*Última actualització: Gener 2025* 
