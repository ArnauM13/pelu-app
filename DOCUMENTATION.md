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
- [Lint i Format](#lint-i-format)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

### 🚀 [Desplegament](#desplegament)

- [Configuració de Firebase](#configuració-de-firebase)
- [Desplegament a Producció](#desplegament-a-producció)

---

## 🚀 Inici Ràpid

### Descripció General

**PeluApp** és una aplicació web per a la gestió de reserves de perruqueria desenvolupada amb Angular 20. L'aplicació permet als usuaris veure horaris disponibles, fer reserves i als administradors gestionar cites i serveis.

### Característiques Principals

- ✅ **Sistema de Reserves**: Creació i gestió de cites
- ✅ **Calendari Interactiu**: Visualització en temps real amb drag & drop
- ✅ **Sistema de Permisos**: Rol-based access control
- ✅ **Multiidioma**: Suport per català, castellà, anglès i àrab
- ✅ **Responsive Design**: Optimitzat per mòbil i desktop
- ✅ **Notificacions**: Sistema de toast integrat
- ✅ **Loader Global**: Indicador de càrrega consistent
- ✅ **Codi Net**: ESLint i Prettier configurats per mantenir estàndards

### Instal·lació i Configuració

#### Prerequisits

- Node.js 18.x LTS
- npm o yarn
- Angular CLI 20.1.1+

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

# Lint i format
npm run lint:format
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
│   │   ├── shared/               # Components compartits
│   │   └── ui/                   # Components d'interfície
│   ├── assets/
│   │   ├── i18n/                 # Fitxers de traducció
│   │   └── images/               # Imatges optimitzades
│   └── environments/             # Configuracions per entorns
├── .prettierrc                   # Configuració de Prettier
├── .eslintrc.json               # Configuració d'ESLint
└── LINT_FORMAT_GUIDE.md         # Guia de lint i format
```

### Stack Tecnològic

- **Frontend**: Angular 20.1.2
- **UI Framework**: PrimeNG 20.0.0
- **Styling**: SCSS + PrimeFlex 4.0.0
- **Backend**: Firebase (Firestore, Auth)
- **State Management**: Angular Signals
- **Testing**: Jasmine + Karma
- **Code Quality**: ESLint + Prettier
- **Build Tool**: Angular CLI

### Patrons de Disseny

- **Feature-based Architecture**: Organització per funcionalitats
- **Shared Components**: Reutilització de components
- **Service Layer**: Lògica de negoci centralitzada
- **Reactive Programming**: RxJS per gestió d'estats
- **Dependency Injection**: Injecció de dependències d'Angular

---

## ⚡ Funcionalitats Principals

### Sistema de Reserves

El sistema de reserves permet als usuaris:
- Veure horaris disponibles en temps real
- Seleccionar serveis i horaris
- Confirmar reserves amb notificacions
- Cancel·lar o modificar cites existents

**Components principals**:
- `BookingPageComponent`: Pàgina principal de reserves
- `BookingMobilePageComponent`: Versió optimitzada per mòbil
- `CalendarComponent`: Calendari interactiu amb drag & drop

### Calendari Interactiu

Calendari amb funcionalitats avançades:
- Visualització per dies i hores
- Drag & drop per moure cites
- Indicadors visuals d'estat
- Gestió de pausa per dinar

**Característiques**:
- Responsive design
- Gestió d'estats en temps real
- Integració amb sistema de permisos
- Notificacions automàtiques

### Sistema de Permisos

Sistema de control d'accés basat en rols:
- **Admin**: Accés complet a totes les funcionalitats
- **User**: Accés limitat a reserves i perfil
- **Guest**: Només visualització

**Implementació**:
- Guards d'Angular per protecció de rutes
- Interceptors per validació de tokens
- Serveis de rol per lògica de permisos

### Multiidioma

Suport per 4 idiomes amb traducció dinàmica:
- Català (ca)
- Castellà (es)
- Anglès (en)
- Àrab (ar)

**Característiques**:
- Canvi d'idioma en temps real
- Traducció automàtica de dates i números
- Suport RTL per àrab
- Fallback a idioma per defecte

---

## 🧩 Components Compartits

### Sistema d'Inputs Unificats

Sistema complet d'inputs amb estils consistents:

**Tipus disponibles**:
- `InputTextComponent`: Text simple
- `InputTextareaComponent`: Text multilínia
- `InputEmailComponent`: Email amb validació
- `InputPasswordComponent`: Contrasenya amb toggle
- `InputNumberComponent`: Números amb validació
- `InputDateComponent`: Dates amb picker
- `InputSelectComponent`: Dropdown amb opcions
- `InputCheckboxComponent`: Checkbox amb estats

**Característiques**:
- Mides unificades (44px inputs, 80px textareas)
- Estats visuals (normal, focus, error, success, disabled)
- Validació integrada
- Responsive design
- Accessibilitat completa

### Components UI

**Components principals**:
- `CardComponent`: Contenidor amb estils consistents
- `LoaderComponent`: Indicador de càrrega
- `ToastComponent`: Notificacions temporals
- `PopupModalComponent`: Modals reutilitzables
- `AvatarComponent`: Avatars d'usuari
- `ServiceCardComponent`: Targetes de serveis

### Popups i Modals

Sistema de popups per diferents funcionalitats:
- `BookingPopupComponent`: Creació de reserves
- `AppointmentDetailPopupComponent`: Detalls de cites
- `AuthPopupComponent`: Autenticació
- `ConfirmationPopupComponent`: Confirmacions
- `AlertPopupComponent`: Alertes

---

## 🔧 Desenvolupament

### Guies de Desenvolupament

#### Creació de Components

```bash
# Generar component amb Angular CLI
ng generate component shared/components/nou-component

# Generar component standalone
ng generate component shared/components/nou-component --standalone
```

#### Estructura de Components

```typescript
@Component({
  selector: 'pelu-nou-component',
  standalone: true,
  imports: [CommonModule, ...],
  templateUrl: './nou-component.component.html',
  styleUrls: ['./nou-component.component.scss']
})
export class NouComponentComponent {
  // Lògica del component
}
```

#### Serveis

```typescript
@Injectable({
  providedIn: 'root'
})
export class NouService {
  // Lògica del servei
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

```bash
# Executar tests
npm test

# Tests amb coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

#### Tests E2E

```bash
# Executar tests e2e
npm run e2e

# Tests e2e en mode watch
npm run e2e:watch
```

#### Estructura de Tests

```typescript
describe('NouComponent', () => {
  let component: NouComponent;
  let fixture: ComponentFixture<NouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NouComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Troubleshooting

#### Problemes Comuns

**Error de dependències**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error de build**:
```bash
npm run lint:fix
npm run build
```

**Error de servei**:
```bash
ng serve --port 4201
```

**Problemes de format**:
```bash
npm run format:fix
```

---

## 🚀 Desplegament

### Configuració de Firebase

1. **Crear projecte Firebase**
2. **Configurar Firestore Database**
3. **Configurar Authentication**
4. **Configurar Hosting**

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

#### Build de Producció

```bash
# Build optimitzat
npm run build

# Build amb anàlisi
npm run build:analyze
```

#### Desplegament a Firebase

```bash
# Desplegament
firebase deploy

# Desplegament només hosting
firebase deploy --only hosting

# Desplegament només functions
firebase deploy --only functions
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
