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
- [Pàgina d'Administració de Configuració](#pàgina-dadministració-de-configuració)

### 🧩 [Components Compartits](#components-compartits)

- [Sistema d'Inputs Unificats](#sistema-dinputs-unificats)
- [Components UI](#components-ui)
- [Popups i Modals](#popups-i-modals)

### 🔧 [Desenvolupament](#desenvolupament)

- [Guies de Desenvolupament](#guies-de-desenvolupament)
- [Lint i Format](#lint-i-format)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

### 🚀 [Desplegament](#desplegament)

- [Configuració de Firebase](#configuració-de-firebase)
- [Desplegament a Producció](#desplegament-a-producció)

---

## 🚀 Inici Ràpid

### Descripció General

**PeluApp** és una aplicació web moderna per a la gestió de reserves de perruqueria desenvolupada amb Angular 20. L'aplicació ofereix una solució completa per a la gestió de cites, amb una interfície intuïtiva i funcionalitats avançades per a usuaris i administradors.

### Característiques Principals

- ✅ **Sistema de Reserves**: Creació i gestió de cites amb validació en temps real
- ✅ **Calendari Interactiu**: Visualització en temps real amb drag & drop avançat
- ✅ **Sistema de Permisos**: Rol-based access control amb múltiples nivells
- ✅ **Multiidioma**: Suport complet per català, castellà, anglès i àrab amb RTL
- ✅ **Responsive Design**: Optimitzat per mòbil, tablet i desktop
- ✅ **Notificacions**: Sistema de toast unificat amb múltiples tipus
- ✅ **Codi Net**: ESLint i Prettier configurats per mantenir estàndards
- ✅ **Testing**: Cobertura completa amb Jasmine, Karma i Cypress
- ✅ **Performance**: Optimitzacions per càrrega ràpida i UX fluida
- ✅ **Configuració Avançada**: Pàgina d'administració amb layout de 3 columnes

### Instal·lació i Configuració

#### Prerequisits

- **Node.js**: 18.x LTS o superior
- **npm**: 9.x o yarn 1.22+
- **Angular CLI**: 20.1.1+
- **Git**: 2.30+

#### Instal·lació

```bash
# Clonar el repositori
git clone https://github.com/ArnauM13/pelu-app.git
cd pelu-app

# Instal·lar dependències
npm install

# Configurar Firebase (opcional)
npm run setup:firebase

# Verificar instal·lació
npm run lint:format
npm test
```

### Comandaments de Desenvolupament

```bash
# Desenvolupament
npm start              # Servidor de desenvolupament (http://localhost:4200)
npm run build          # Build de producció optimitzat
npm run watch          # Build en mode watch per desenvolupament

# Testing
npm test               # Tests unitaris amb Karma
npm run test:coverage  # Tests amb report de cobertura
npm run e2e            # Tests end-to-end amb Cypress
```

---

## 🏗️ Arquitectura

### Estructura del Projecte

```
pelu-app/
├── src/
│   ├── app/
│   │   ├── core/                 # Serveis i lògica de negoci
│   │   ├── features/             # Mòduls de funcionalitats
│   │   │   ├── admin/            # Funcionalitats d'administració
│   │   │   │   └── admin-settings-page/  # Pàgina de configuració
│   │   │   ├── bookings/         # Sistema de reserves
│   │   │   ├── calendar/         # Calendari interactiu
│   │   │   └── auth/             # Autenticació
│   │   ├── shared/               # Components compartits
│   │   │   ├── components/       # Components UI reutilitzables
│   │   │   └── services/         # Serveis compartits
│   │   └── ui/                   # Layout i navegació
│   ├── assets/                   # Recursos estàtics
│   │   └── i18n/                 # Traduccions
│   └── environments/             # Configuracions per entorns
├── public/                       # Arxius públics
└── scripts/                      # Scripts d'automatització
```

### Stack Tecnològic

- **Frontend**: Angular 20.1.1 amb TypeScript 5.4
- **UI Framework**: PrimeNG 18.0.0 amb tema Aura
- **Estil**: SCSS amb variables CSS personalitzades
- **Estat**: Angular Signals per gestió reactiva d'estat
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **Testing**: Jasmine, Karma, Cypress
- **Linting**: ESLint + Prettier
- **Build**: Angular CLI amb optimitzacions

### Patrons de Disseny

#### Arquitectura
- **Feature-based Architecture**: Organització per funcionalitats
- **Module Pattern**: Mòduls independents i reutilitzables
- **Lazy Loading**: Càrrega sota demanda per optimitzar performance

#### Components
- **Component Composition**: Composició de components petits
- **Smart/Dumb Components**: Separació de lògica i presentació
- **Standalone Components**: Components independents sense mòduls

#### Serveis
- **Service Layer Pattern**: Lògica de negoci centralitzada
- **Dependency Injection**: Injecció de dependències d'Angular
- **Singleton Pattern**: Serveis únics per aplicació

#### Estat
- **Signal-based State Management**: Estat reactiu amb Angular Signals
- **Reactive Programming**: Programació reactiva amb RxJS
- **Event-driven Architecture**: Comunicació basada en events

---

## ⚡ Funcionalitats Principals

### Sistema de Reserves

El sistema de reserves ofereix una experiència completa per a la gestió de cites de perruqueria.

#### Característiques Principals

- **Selecció de Data**: Calendari interactiu amb navegació per setmanes
- **Selecció de Servei**: Llista de serveis disponibles amb preus i durades
- **Selecció d'Hora**: Horaris disponibles en temps real amb validació
- **Confirmació**: Popup de confirmació amb tots els detalls
- **Validacions**: Verificació de disponibilitat i dades requerides
- **Notificacions**: Feedback immediat per accions d'usuari

#### Flux de Reserves

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

#### Components Principals

- `BookingPageComponent`: Pàgina principal de reserves
- `BookingMobilePageComponent`: Versió optimitzada per mòbil
- `CalendarComponent`: Calendari interactiu amb drag & drop
- `BookingPopupComponent`: Popup de confirmació de reserves

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

El calendari proporciona una visualització interactiva de les cites i horaris amb funcionalitats avançades.

#### Característiques

- **Vista Setmanal**: Navegació per setmanes amb controls intuitius
- **Drag & Drop**: Reorganització de cites amb feedback visual
- **Estats Visuals**: Diferents colors per tipus de cita
- **Responsive**: Adaptació perfecta a mòbil i desktop
- **Temps Real**: Actualització automàtica sense refrescar
- **Gestió de Pausa**: Indicadors de pausa per dinar

#### Estats de Cita

- **🟢 Disponible**: Hora lliure per reservar
- **🔴 Ocupada**: Cita confirmada
- **🟡 Pendent**: Cita pendent de confirmació
- **⚫ Bloquejada**: Hora no disponible
- **🟠 Pausa**: Pausa per dinar

#### Components del Calendari

- `CalendarComponent`: Component principal del calendari
- `CalendarHeaderComponent`: REMOVED - Capçalera amb controls de navegació
- `CalendarDayColumnComponent`: Columna per dia
- `CalendarTimeSlotComponent`: Slot d'hora individual
- `CalendarDragPreviewComponent`: Vista prèvia en drag & drop

### Sistema de Permisos

Sistema de control d'accés basat en rols amb múltiples nivells de seguretat.

#### Rols Disponibles

- **👤 Usuari**: Crear i veure les seves cites
- **👨‍💼 Admin**: Gestió completa de cites i serveis
- **🔒 Anònim**: Només veure horaris disponibles

#### Implementació

**Guards de Ruta**:
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

**Interceptors**:
```typescript
// Token interceptor per afegir tokens a peticions
@Injectable()
export class TokenInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(req);
  }
}
```

### Multiidioma

Sistema de traduccions complet amb suport per múltiples idiomes i característiques avançades.

#### Idiomes Suportats

- 🇪🇸 **Català** (ca) - Idioma principal
- 🇪🇸 **Castellà** (es)
- 🇬🇧 **Anglès** (en)
- 🇸🇦 **Àrab** (ar) - Amb suport RTL

#### Estructura de Traduccions

```
assets/i18n/
├── ca.json      # Català
├── es.json      # Castellà
├── en.json      # Anglès
└── ar.json      # Àrab
```

#### Característiques Avançades

- **Canvi Dinàmic**: Canvi d'idioma en temps real sense refrescar
- **Traducció Automàtica**: Dates i números traduïts automàticament
- **Suport RTL**: Layout automàtic per àrab
- **Fallback**: Idioma per defecte quan falta traducció
- **Pluralització**: Suport per múltiples formes gramaticals

#### Ús en Components

```typescript
// Injecció del servei
private readonly translateService = inject(TranslateService);

// Canvi d'idioma
this.translateService.use('en');

// Traducció en template
{{ 'COMMON.ACTIONS.SAVE' | translate }}

// Traducció amb paràmetres
{{ 'BOOKING.CONFIRMATION.MESSAGE' | translate:{name: userName} }}
```

### Pàgina d'Administració de Configuració

La pàgina d'administració de configuració ofereix una interfície completa per gestionar tots els paràmetres del sistema amb un disseny modern i responsive.

#### Característiques Principals

- **Layout de 3 Columnes**: Organització lògica dels paràmetres
- **Disseny Totalment Responsive**: Adaptació perfecta a tots els dispositius
- **Mode d'Edició Unificat**: Interfície única amb botó d'edició a la dreta
- **Inputs Específics**: Tipus d'input adequats per cada paràmetre
- **Estats de Càrrega**: Feedback visual durant les operacions
- **Validació en Temps Real**: Verificació immediata de dades

#### Layout i Organització

**Estructura de Columnes**:

1. **Columna 1: Informació del Negoci**
   - Nom del negoci
   - Hores d'obertura (inici i fi)
   - Pausa per dinar (inici i fi)

2. **Columna 2: Configuració de Cites**
   - Durada de cites
   - Màxim de cites per dia
   - Confirmació automàtica
   - Notificacions
   - Prevenció de cancel·lacions
   - Límit de temps per cancel·lar

3. **Columna 3: Sistema de Reserves i Configuració**
   - Dies d'antelació per reserves
   - Temps d'antelació per reserves
   - Idioma per defecte
   - Moneda

#### Responsive Design

**Breakpoints**:
- **1400px+**: 3 columnes, experiència desktop completa
- **1024px-1200px**: 3 columnes amb espaiat ajustat
- **768px-1024px**: 2 columnes (tercera columna ocupa 2)
- **480px-768px**: 1 columna, optimitzat per mòbil
- **360px-480px**: Layout compacte per mòbils petits
- **<360px**: Layout ultra-compacte per pantalles molt petites
- **Mode paisatge**: Ajustaments especials per pantalles baixes

#### Tipus d'Inputs Específics

```typescript
// Inputs de temps per hores d'obertura i pausa
<pelu-input-date
  [timeOnly]="true"
  [hourFormat]="'24'"
  [dateFormat]="'HH:mm'"
  [readonly]="!isEditMode()"
  [value]="getTimeValue(timeString)"
  (valueChange)="onTimeChange($event, 'fieldName')">
</pelu-input-date>

// Inputs numèrics per durades i límits
<pelu-input-number
  [min]="15"
  [max]="480"
  [step]="15"
  [suffix]="' min'"
  [readonly]="!isEditMode()"
  [value]="numericValue"
  (valueChange)="onValueChange($event)">
</pelu-input-number>

// Inputs de selecció per idioma i moneda
<pelu-input-select
  [options]="languageOptions"
  [showClear]="true"
  [disabled]="!isEditMode()"
  [value]="selectedValue"
  (valueChange)="onSelectionChange($event)">
</pelu-input-select>

// Checkboxes per opcions booleanes
<pelu-input-checkbox
  [disabled]="!isEditMode()"
  [value]="booleanValue"
  (valueChange)="onCheckboxChange($event)">
</pelu-input-checkbox>
```

#### Gestió d'Estats

```typescript
// Mode d'edició amb toggle
private readonly isEditModeSignal = signal(false);
readonly isEditMode = computed(() => this.isEditModeSignal());

toggleEditMode() {
  if (this.isEditMode()) {
    this.setViewMode();
  } else {
    this.setEditMode();
  }
}

// Gestió de temps
getTimeValue(timeString: string | null): Date | null {
  if (!timeString) return null;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

onTimeChange(date: Date | string | null, fieldName: string) {
  if (!date || !(date instanceof Date)) {
    this.settingsForm.get(fieldName)?.setValue('');
    return;
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  this.settingsForm.get(fieldName)?.setValue(timeString);
}
```

#### Estats de Càrrega

```typescript
// Botó de desar amb estat de càrrega
<pelu-button
  type="submit"
  [label]="'ADMIN.SETTINGS_PAGE.SAVE_SETTINGS' | translate"
  [loading]="saving()"
  [disabled]="saving()"
  icon="pi pi-save"
  severity="primary">
</pelu-button>

// Deshabilitació d'altres botons durant el desat
<pelu-button
  type="button"
  severity="secondary"
  [label]="'ADMIN.SETTINGS_PAGE.RESET_DEFAULTS' | translate"
  [disabled]="saving()"
  icon="pi pi-refresh"
  (clicked)="resetToDefaults()">
</pelu-button>
```

#### Característiques Avançades

- **Mides d'Input Consistents**: 2.75rem d'alçada amb escalat responsive
- **Scrollbar Personalitzat**: Estil consistent amb el tema
- **Tipografia Fluida**: Mides de font que s'adapten al viewport
- **Espaiat Responsive**: Gaps i padding que s'ajusten automàticament
- **Targets de Toc Optimitzats**: Mides adequades per dispositius tàctils
- **Box-sizing Predictible**: Layout consistent amb border-box

#### Components Principals

- `AdminSettingsPageComponent`: Component principal de la pàgina
- `SystemParametersService`: Servei centralitzat per gestionar els paràmetres del sistema
- `InputDateComponent`: Inputs de temps amb picker integrat
- `InputNumberComponent`: Inputs numèrics amb validació
- `InputSelectComponent`: Inputs de selecció amb opcions
- `InputCheckboxComponent`: Checkboxes per opcions booleanes

---

## 🧩 Components Compartits

### Sistema d'Inputs Unificats

Sistema complet d'inputs amb mides i estils consistents per tota l'aplicació.

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

Per a entrades d'email amb validació automàtica.

##### 4. **Input Password** (`pelu-input-password`)

Per a contrasenyes amb opció de mostrar/amagar.

##### 5. **Input Number** (`pelu-input-number`)

Per a entrades numèriques amb validació basat en PrimeNG InputNumber.

##### 6. **Input Date** (`pelu-input-date`)

Per a selecció de dates amb picker integrat. Suporta mode només temps per hores.

```typescript
// Mode només temps per hores d'obertura
<pelu-input-date
  [timeOnly]="true"
  [hourFormat]="'24'"
  [dateFormat]="'HH:mm'"
  [label]="'Hora d\'inici'"
  [placeholder]="'08:00'"
  [value]="timeValue"
  (valueChange)="onTimeChange($event)">
</pelu-input-date>
```

##### 7. **Input Select** (`pelu-input-select`)

Per a selecció d'opcions amb suport per colors i icones basat en PrimeNG Select.

##### 8. **Input Checkbox** (`pelu-input-checkbox`)

Per a caselles de selecció amb estats múltiples.

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
- ✅ Accessibilitat completa

#### Ús Ràpid

```typescript
import { InputTextComponent, InputTextareaComponent } from '@shared/components/inputs';

@Component({
  imports: [InputTextComponent, InputTextareaComponent],
})
export class MyComponent {
  formData = signal({
    name: '',
    description: '',
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
  styleUrls: ['./component-name.component.scss'],
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
  providedIn: 'root',
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

### Lint i Format

El projecte té configurat ESLint i Prettier per mantenir un codi net i consistent.

#### Scripts Disponibles

```bash
# Lint
npm run lint              # Comprova errors sense corregir
npm run lint:fix          # Corregeix errors automàticament

# Format
npm run format:check      # Comprova format sense modificar
npm run format:fix        # Formata automàticament
npm run format            # Alias per format:fix

# Combinat
npm run lint:format       # Executa lint:fix + format:fix
```

#### Ús Recomanat

```bash
# Abans de fer commit
npm run lint:format

# Per desenvolupament diari
npm run format:fix        # Format ràpid
```

#### Configuració

- **Prettier**: `.prettierrc` amb plugins per Tailwind CSS i Gherkin
- **ESLint**: `.eslintrc.json` integrat amb Prettier
- **Ignorats**: `.prettierignore` per fitxers que no cal formatar

#### Errors Comuns

**Automàtics**:
- Format de codi (espais, comes)
- Imports no utilitzats
- Variables no utilitzades

**Manual**:
- Tipus `any` explícits
- Problemes d'accessibilitat
- Selectors sense prefix "pelu"

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
      imports: [MyComponent],
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
      imports: [MyComponent, HttpClientTestingModule],
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

#### Tests E2E amb Cypress

```typescript
describe('Booking Flow', () => {
  it('should complete booking process', () => {
    cy.visit('/booking');
    cy.get('[data-testid="date-selector"]').click();
    cy.get('[data-testid="service-selector"]').click();
    cy.get('[data-testid="time-slot"]').first().click();
    cy.get('[data-testid="confirm-button"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
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
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### Variables d'Entorn

```typescript
// environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your-app-id'
  }
};
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

#### Configuració de CI/CD

El projecte inclou GitHub Actions per:
- Tests automàtics
- Build de producció
- Desplegament automàtic
- Anàlisi de codi

---

## 📚 Documentació Addicional

### Índex de Documentació

Vegeu [DOCS_INDEX.md](DOCS_INDEX.md) per una llista completa de tota la documentació disponible.

### Guies Específiques

- [Guia de Lint i Format](LINT_FORMAT_GUIDE.md)
- [Sistema d'Inputs](src/app/shared/components/inputs/README.md)
- [Sincronització de Serveis](src/app/core/services/SERVICES_SYNC.md)
- [Visibilitat d'Accions](src/app/shared/components/detail-view/ACTIONS_VISIBILITY.md)

### Contribució

Per contribuir al projecte:

1. Fork del repositori
2. Crear branca per feature
3. Desenvolupar canvis
4. Executar tests i lint
5. Crear Pull Request

### Suport

Per suport tècnic o preguntes:
- Crear issue al GitHub
- Consultar documentació específica
- Revisar troubleshooting

---

## 📄 Llicència

Aquest projecte està sota llicència MIT. Vegeu el fitxer LICENSE per més detalls.

---

_Última actualització: Juliol 2025_
