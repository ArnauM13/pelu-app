# 📚 PeluApp - Documentació Completa

## 📋 Taula de Continguts

1. [Descripció General](#descripció-general)
2. [Instal·lació i Configuració](#instal·lació-i-configuració)
3. [Arquitectura del Projecte](#arquitectura-del-projecte)
4. [Stack Tecnològic](#stack-tecnològic)
5. [Funcionalitats Principals](#funcionalitats-principals)
6. [Components Compartits](#components-compartits)
7. [Sistema de Traduccions](#sistema-de-traduccions)
8. [Sistema de Permisos](#sistema-de-permisos)
9. [Calendari i Reserves](#calendari-i-reserves)
10. [Testing](#testing)
11. [Desplegament](#desplegament)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Descripció General

**PeluApp** és una aplicació web per a la gestió de reserves de perruqueria desenvolupada amb Angular 18. L'aplicació permet als usuaris veure horaris disponibles, fer reserves i als administradors gestionar cites i serveis.

### Característiques Principals
- ✅ **Sistema de Reserves**: Creació i gestió de cites
- ✅ **Calendari Interactiu**: Visualització en temps real
- ✅ **Sistema de Permisos**: Rol-based access control
- ✅ **Multiidioma**: Suport per català, castellà, anglès i àrab
- ✅ **Responsive Design**: Optimitzat per mòbil i desktop
- ✅ **Drag & Drop**: Reorganització de cites al calendari
- ✅ **Notificacions**: Sistema de toast integrat

---

## 🚀 Instal·lació i Configuració

### Prerequisits
- Node.js 18.x LTS
- npm o yarn
- Angular CLI 18.2.0+

### Instal·lació

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
```

---

## 🏗️ Arquitectura del Projecte

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
│   │   ├── components/      # Components reutilitzables
│   │   ├── directives/      # Directives personalitzades
│   │   ├── pipes/           # Pipes personalitzades
│   │   └── services/        # Serveis compartits
│   └── ui/                  # Components d'interfície
│       └── layout/          # Components de layout
├── assets/                  # Recursos estàtics
│   ├── i18n/               # Fitxers de traducció
│   ├── images/             # Imatges
│   └── themes/             # Temes CSS
└── environments/           # Configuracions per entorn
```

---

## 🛠️ Stack Tecnològic

### Frontend Stack

| Paquet                | Versió Recomanada | Notes                                    |
| --------------------- | ----------------- | ---------------------------------------- |
| `@angular/core`       | `^18.2.0`         | El nucli d'Angular 18 estable            |
| `@angular/cli`        | `^18.2.0`         | Per generar, servir i compilar           |
| `@angular/animations` | `^18.2.0`         | Necessari per components com `Dialog`    |
| `primeng`             | `18`              | Compatible amb Angular 18                |
| `primeicons`          | `^6.1.1`          | Icons per botons, menús, etc.            |
| `primeflex`           | `^3.3.1`          | Utilitats CSS per layout i estil ràpid   |
| `rxjs`                | `^7.8.1`          | Ja ve amb Angular, versió 7.x estable    |
| `typescript`          | `~5.4.5`          | Compatible amb Angular 18                |
| `@ngx-translate/core` | `^16.0.0`         | Sistema de traduccions                   |
| `date-fns`            | `^3.0.0`          | Manipulació de dates                     |
| `uuid`                | `^10.0.0`         | Generació d'IDs únics                    |

### Backend Stack

| Paquet        | Versió Recomanada    | Notes                                      |
| ------------- | -------------------- | ------------------------------------------ |
| `firebase`    | `^10.0.0`            | Backend as a Service                       |
| `firestore`   | `^4.0.0`             | Base de dades NoSQL                        |
| `firebase/auth` | `^1.0.0`           | Autenticació                               |
| `node`        | `18.x` LTS           | Estable, compatible amb la majoria de dep. |

### Testing Stack

| Eina       | Ús                                        |
| ---------- | ----------------------------------------- |
| `Jest`     | Testing d'unitat (millor que Karma)       |
| `Cypress`  | Testing e2e si vols testar fluxos sencers |
| `ESLint`   | Bona pràctica per mantenir el codi net    |
| `Prettier` | Formatador automàtic                      |

---

## ⚡ Funcionalitats Principals

### Sistema de Reserves
- **Creació de Reserves**: Interfície intuïtiva per crear noves cites
- **Gestió de Citas**: Edició, eliminació i reorganització
- **Validació**: Comprovació d'horaris disponibles
- **Notificacions**: Confirmacions per email

### Calendari Interactiu
- **Vista Setmanal**: Visualització per setmanes
- **Drag & Drop**: Reorganització de cites
- **Reserves Públiques**: Visualització diferent per reserves d'altres usuaris
- **Loader**: Indicador de càrrega fins que les dades estan disponibles

### Sistema de Permisos
- **Super Admin**: Accés complet a totes les reserves
- **Usuaris Autenticats**: Veuen només les seves reserves
- **Usuaris Convidats**: Veuen només reserves públiques

---

## 🧩 Components Compartits

### Profile Dropdown Component

Component reutilitzable que proporciona un menú d'usuari consistent a tota l'aplicació.

#### Característiques
- ✅ **User Avatar Display**: Mostra avatar d'usuari amb fallback a inicials
- ✅ **User Information**: Mostra nom i email d'usuari
- ✅ **Admin Access Control**: Mostra automàticament elements d'admin per usuaris admin
- ✅ **Customizable Items**: Suport per elements de menú personalitzats
- ✅ **Responsive Design**: Funciona a mòbil i desktop
- ✅ **Accessibility**: Etiquetes ARIA i navegació per teclat
- ✅ **Internationalization**: Suport per claus de traducció

#### Ús Bàsic

```typescript
import { ProfileDropdownComponent } from '@shared/components/profile-dropdown';

@Component({
  imports: [ProfileDropdownComponent],
  template: `
    <pelu-profile-dropdown></pelu-profile-dropdown>
  `
})
export class MyComponent {}
```

#### Amb Elements Personalitzats

```typescript
import { ProfileDropdownComponent, ProfileDropdownItem } from '@shared/components/profile-dropdown';

@Component({
  imports: [ProfileDropdownComponent],
  template: `
    <pelu-profile-dropdown 
      [customItems]="customItems()"
      (itemClicked)="onItemClicked($event)">
    </pelu-profile-dropdown>
  `
})
export class MyComponent {
  readonly customItems = computed((): ProfileDropdownItem[] => [
    {
      label: 'HELP.MENU',
      icon: 'pi pi-question-circle',
      onClick: () => this.showHelp()
    },
    {
      label: 'SETTINGS.MENU',
      icon: 'pi pi-cog',
      routerLink: '/settings'
    },
    { type: 'divider' },
    {
      label: 'CUSTOM.LOGOUT',
      icon: 'pi pi-sign-out',
      type: 'danger',
      onClick: () => this.customLogout()
    }
  ]);

  onItemClicked(item: ProfileDropdownItem) {
    console.log('Item clicked:', item);
  }
}
```

#### Propietats d'Entrada

| Propietat | Tipus | Per Defecte | Descripció |
|-----------|-------|-------------|------------|
| `customItems` | `ProfileDropdownItem[]` | `[]` | Elements de menú personalitzats |
| `showAdminItems` | `boolean` | `true` | Si mostrar elements de menú d'admin |

#### Events de Sortida

| Event | Tipus | Descripció |
|-------|-------|------------|
| `itemClicked` | `ProfileDropdownItem` | Emès quan es clica un element del menú |

#### Interfície ProfileDropdownItem

```typescript
interface ProfileDropdownItem {
  label?: string;           // Clau de traducció per l'etiqueta
  icon?: string;            // Classe CSS per la icona (e.g., 'pi pi-user')
  routerLink?: string;      // Enllaç del router per navegació
  onClick?: () => void;     // Funció manejadora del clic
  disabled?: boolean;       // Si l'element està deshabilitat
  type?: 'default' | 'danger' | 'divider'; // Tipus d'element
}
```

### Loader Component

Component de loader global que proporciona una experiència de càrrega consistent a tota l'aplicació.

#### Característiques
- ✅ **Loader Global**: Ocupa sempre el 100% de la pantalla
- ✅ **Servei Centralitzat**: Es gestiona des d'un servei
- ✅ **Configuració Flexible**: Missatges personalitzats, amb/sense spinner
- ✅ **Fons Consistent**: Mateix gradient que la resta de l'app
- ✅ **Responsive**: Funciona perfectament a mòbil i desktop
- ✅ **Z-index Alt**: Sempre apareix per sobre de tot

#### Ús Bàsic

```typescript
import { LoaderService } from '@shared/components/loader';

export class MyComponent {
  constructor(private loaderService: LoaderService) {}

  async loadData(): Promise<void> {
    this.loaderService.showWithMessage('Carregant dades...');
    
    try {
      await this.dataService.load();
    } finally {
      this.loaderService.hide();
    }
  }
}
```

#### Mètodes Disponibles

| Mètode | Descripció |
|--------|------------|
| `show(config?: LoaderConfig)` | Mostra el loader amb configuració opcional |
| `hide()` | Amaga el loader |
| `showWithMessage(message: string)` | Mostra el loader amb missatge personalitzat |
| `showInline(config?: LoaderConfig)` | Mostra el loader sense overlay |
| `showMessageOnly(message: string)` | Mostra només el missatge sense spinner |

#### Configuració

```typescript
interface LoaderConfig {
  message?: string;        // Missatge a mostrar
  showSpinner?: boolean;   // Si mostrar el spinner (per defecte: true)
  overlay?: boolean;       // Si mostrar overlay (per defecte: true)
}
```

---

## 🌐 Sistema de Traduccions

L'aplicació utilitza `@ngx-translate/core` per gestionar les traduccions.

### Idiomes Suportats
- **Català** (`ca`) - Idioma per defecte
- **Castellà** (`es`)
- **Anglès** (`en`)
- **Àrab** (`ar`)

### Estructura de Fitxers

```
src/assets/i18n/
├── ca.json          # Traduccions en català
├── es.json          # Traduccions en castellà
├── en.json          # Traduccions en anglès
└── ar.json          # Traduccions en àrab
```

### Ús en Components

```typescript
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  imports: [TranslateModule],
  template: `
    <h1>{{ 'COMMON.TITLE' | translate }}</h1>
    <p>{{ 'COMMON.DESCRIPTION' | translate: { name: userName } }}</p>
  `
})
export class MyComponent {
  constructor(private translateService: TranslateService) {}

  changeLanguage(lang: string) {
    this.translateService.use(lang);
  }
}
```

### Estructura de Claus

```json
{
  "COMMON": {
    "TITLE": "Títol",
    "DESCRIPTION": "Descripció",
    "ACTIONS": {
      "SAVE": "Desar",
      "CANCEL": "Cancel·lar"
    },
    "STATUS": {
      "LOADING": "Carregant...",
      "SUCCESS": "Èxit",
      "ERROR": "Error"
    }
  }
}
```

---

## 🔐 Sistema de Permisos

### Rols Disponibles

1. **Super Admin**: Accés complet a totes les funcionalitats
2. **Usuari Autenticat**: Accés a les seves pròpies reserves
3. **Usuari Convidat**: Accés limitat a reserves públiques

### Implementació

```typescript
import { RoleService } from '@core/services/role.service';

export class MyComponent {
  constructor(private roleService: RoleService) {}

  canEditBooking(): boolean {
    return this.roleService.isAdmin() || this.isOwnBooking();
  }

  canViewAllBookings(): boolean {
    return this.roleService.isAdmin();
  }
}
```

### Guards de Ruta

```typescript
import { AdminGuard } from '@core/guards/admin.guard';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'settings', component: AdminSettingsComponent }
    ]
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    component: ProfileComponent
  }
];
```

---

## 📅 Calendari i Reserves

### Característiques del Calendari

- **Vista Setmanal**: Visualització per setmanes amb horaris de treball
- **Drag & Drop**: Reorganització de cites amb feedback visual
- **Reserves Públiques**: Visualització diferent per reserves d'altres usuaris
- **Loader**: Indicador de càrrega fins que les dades estan disponibles

### Visualització de Reserves

#### Reserves Pròpies
- Colors segons el servei
- Mostra nom del client, servei i durada
- Permet drag & drop
- Permet veure detalls

#### Reserves Públiques
- Color vermell (#dc3545)
- Text "Reservada" (traduït)
- No mostra servei ni durada
- No permet drag & drop
- No permet veure detalls

### Implementació

```typescript
// En calendar.component.ts
readonly allEvents = computed((): AppointmentEvent[] => {
  const appointments = this.appointments() || [];
  const currentUser = this.authService.user();
  const isAdmin = this.roleService.isAdmin();
  
  return appointments.map(c => {
    const isOwnBooking = !!(currentUser?.uid && c.uid === currentUser.uid);
    const isPublicBooking = !isAdmin && !isOwnBooking && c.nom === 'Ocupat';

    return {
      id: c.id || uuidv4(),
      title: isPublicBooking ? this.translateService.instant('COMMON.STATUS.RESERVED') : (c.nom || 'Client'),
      start: startString,
      end: endString,
      duration: duration,
      serviceName: c.serviceName || c.servei || '',
      clientName: c.nom || 'Client',
      isPublicBooking: isPublicBooking,
      isOwnBooking: isOwnBooking,
      canDrag: isAdmin || isOwnBooking,
      canViewDetails: isAdmin || isOwnBooking
    };
  });
});
```

### Estils CSS

```scss
/* Public Booking Styles */
.appointment.public-booking {
  background-color: #dc3545 !important;
  border-color: #c82333 !important;
  color: white !important;
  cursor: default !important;
}

.appointment.public-booking:hover {
  background-color: #c82333 !important;
  border-color: #bd2130 !important;
  transform: none !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
}

.appointment.no-drag {
  cursor: default !important;
}

.appointment.no-drag .drag-handle {
  display: none !important;
}
```

---

## 🧪 Testing

### Testing d'Unitat

```bash
# Executar tests unitaris
npm test

# Executar tests amb cobertura
npm run test:coverage

# Executar tests en mode watch
npm run test:watch
```

### Testing e2e

```bash
# Executar tests e2e
npm run e2e

# Executar tests e2e en mode headless
npm run e2e:headless
```

### Estructura de Tests

```
src/
├── app/
│   └── **/*.spec.ts        # Tests unitaris
└── testing/
    ├── firebase-mocks.ts   # Mocks de Firebase
    └── translation-mocks.ts # Mocks de traduccions
```

### Exemple de Test

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MyComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## 🚀 Desplegament

### Firebase Hosting

```bash
# Build de producció
npm run build

# Desplegar a Firebase
firebase deploy

# Desplegar només hosting
firebase deploy --only hosting

# Desplegar només Firestore rules
firebase deploy --only firestore:rules
```

### Configuració de Firebase

```json
// firebase.json
{
  "hosting": {
    "public": "dist/pelu-app",
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
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### Variables d'Entorn

```typescript
// environments/environment.ts
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

---

## 🔧 Troubleshooting

### Problemes Comuns

#### El loader no apareix
1. Verifica que el `LoaderComponent` està importat a `app.component.ts`
2. Comprova que el servei està injectat correctament
3. Verifica que no hi ha errors a la consola

#### El loader no ocupa tota la pantalla
1. El component ja està configurat amb `position: fixed` i `inset: 0`
2. Si hi ha problemes, verifica que no hi ha CSS que sobreescrigui aquests estils

#### El loader no s'amaga
1. Assegura't que sempre crides `hide()` en el bloc `finally`
2. Verifica que no hi ha múltiples crides a `show()` sense `hide()`

#### Errors de Firebase
1. Verifica que les regles de Firestore són correctes
2. Comprova que l'usuari té els permisos adequats
3. Verifica la configuració de Firebase

#### Problemes de Traducció
1. Verifica que les claus existeixen als fitxers de traducció
2. Comprova que el servei de traducció està configurat correctament
3. Verifica que l'idioma està establert correctament

### Logs de Debug

```typescript
// Habilitar logs de debug
console.log('Debug info:', data);

// Logs específics per Firebase
console.log('Firebase user:', this.authService.user());
console.log('User role:', this.roleService.getUserRole());
```

---

## 📝 Notes de Desenvolupament

### Convencions de Codi

- **Components**: PascalCase (e.g., `MyComponent`)
- **Serveis**: PascalCase amb sufix Service (e.g., `BookingService`)
- **Interfícies**: PascalCase amb prefix I (e.g., `IBooking`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_BOOKINGS`)
- **Variables**: camelCase (e.g., `userName`)

### Estructura de Commits

```
feat: afegir nova funcionalitat
fix: corregir bug
docs: actualitzar documentació
style: canvis de format
refactor: refactoritzar codi
test: afegir o modificar tests
chore: tasques de manteniment
```

### Millores Futures

- [ ] Animacions d'entrada/sortida per loader
- [ ] Múltiples loaders simultanis
- [ ] Progress bar per operacions llargues
- [ ] Temes personalitzables
- [ ] Integració amb HTTP interceptors
- [ ] PWA (Progressive Web App)
- [ ] Notificacions push
- [ ] Exportació de dades
- [ ] Backup automàtic

---

## 📞 Suport

Per a suport tècnic o preguntes sobre el projecte:

1. **Issues**: Obre un issue al repositori
2. **Documentació**: Consulta aquesta documentació
3. **Comunitat**: Participa en les discussions del projecte

---

**Última actualització**: Desembre 2024  
**Versió**: 1.0.0  
**Autor**: Equip de Desenvolupament PeluApp 
