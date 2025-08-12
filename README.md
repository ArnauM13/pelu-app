# 🏪 PeluApp - Sistema de Gestió de Reserves de Perruqueria

[![Angular](https://img.shields.io/badge/Angular-20.1.2-red.svg)](https://angular.io/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-20.0.0-blue.svg)](https://primeng.org/)
[![Firebase](https://img.shields.io/badge/Firebase-20.0.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Last Updated](https://img.shields.io/badge/Last%20Updated-Juliol%202025-brightgreen.svg)](DOCUMENTATION.md)

Una aplicació web moderna per a la gestió de reserves de perruqueria desenvolupada amb Angular 20, PrimeNG i Firebase. Ofereix una solució completa per a la gestió de cites amb una interfície intuïtiva i funcionalitats avançades.

## 🚀 Característiques Principals

- ✅ **Sistema de Reserves**: Creació i gestió de cites amb validació en temps real
- ✅ **Calendari Drag & Drop**: Visualització i reorganització de cites en temps real
- ✅ **Sistema de Permisos**: Control d'accés basat en rols (Admin/User/Guest)
- ✅ **Multiidioma**: Suport complet per català, castellà, anglès i àrab amb RTL
- ✅ **Responsive Design**: Optimitzat per mòbil, tablet i desktop
- ✅ **Notificacions**: Sistema de toast unificat amb múltiples tipus
- ✅ **Codi Net**: ESLint i Prettier configurats per mantenir estàndards
- ✅ **Testing**: Cobertura completa amb Jasmine, Karma i Cypress
- ✅ **Performance**: Optimitzacions per càrrega ràpida i UX fluida

## 🛠️ Stack Tecnològic

- **Frontend**: Angular 20.1.2
- **UI Framework**: PrimeNG 20.0.0 + PrimeFlex 4.0.0
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **State Management**: Angular Signals
- **Styling**: SCSS + CSS Variables
- **Testing**: Jasmine + Karma + Cypress
- **Code Quality**: ESLint + Prettier
- **Build Tool**: Angular CLI

## 📦 Instal·lació

### Prerequisits

- **Node.js**: 18.x LTS o superior
- **npm**: 9.x o yarn 1.22+
- **Angular CLI**: 20.1.1+
- **Git**: 2.30+

### Pasos d'Instal·lació

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

# Iniciar servidor de desenvolupament
npm start
```

L'aplicació estarà disponible a `http://localhost:4200`

## 🎯 Comandaments Principals

```bash
# Desenvolupament
npm start              # Servidor de desenvolupament (http://localhost:4200)
npm run build          # Build de producció optimitzat
npm run watch          # Build en mode watch per desenvolupament

# Testing
npm test               # Tests unitaris amb Karma
npm run test:coverage  # Tests amb report de cobertura
npm run e2e            # Tests end-to-end amb Cypress

# Qualitat de Codi
npm run lint           # Comprovar errors de lint
npm run lint:fix       # Corregir errors automàticament
npm run format:fix     # Formatar codi amb Prettier
npm run lint:format    # Lint + Format combinat

# Desplegament
npm run build:prod     # Build optimitzat per producció
firebase deploy        # Desplegament a Firebase
```

## 🏗️ Arquitectura

### Estructura del Projecte

```
pelu-app/
├── src/
│   ├── app/
│   │   ├── core/                     # Serveis i lògica de negoci
│   │   │   ├── auth/                 # Autenticació i autorització
│   │   │   ├── guards/               # Guards de ruta
│   │   │   ├── services/             # Serveis compartits
│   │   │   └── interceptors/         # Interceptors HTTP
│   │   ├── features/                 # Mòduls de funcionalitats
│   │   │   ├── admin/                # Funcionalitats d'administració
│   │   │   ├── appointments/         # Gestió de cites
│   │   │   ├── auth/                 # Pàgines d'autenticació
│   │   │   ├── bookings/             # Sistema de reserves
│   │   │   ├── calendar/             # Component de calendari
│   │   │   ├── landing/              # Pàgina d'inici
│   │   │   ├── profile/              # Gestió de perfil
│   │   │   └── services/             # Gestió de serveis
│   │   ├── shared/                   # Components compartits
│   │   │   ├── components/           # Components UI reutilitzables
│   │   │   ├── pipes/                # Pipes personalitzats
│   │   │   └── services/             # Serveis compartits
│   │   └── ui/                       # Components d'interfície
│   │       ├── layout/               # Layout principal
│   │       └── navigation/           # Navegació
│   ├── assets/
│   │   ├── i18n/                     # Fitxers de traducció
│   │   │   ├── ca.json               # Català
│   │   │   ├── es.json               # Castellà
│   │   │   ├── en.json               # Anglès
│   │   │   └── ar.json               # Àrab
│   │   └── images/                   # Imatges optimitzades
│   │       ├── optimized/            # Imatges comprimides
│   │       └── responsive/           # Imatges responsive
│   ├── environments/                 # Configuracions per entorns
│   │   ├── environment.ts            # Desenvolupament
│   │   └── environment.prod.ts       # Producció
│   └── testing/                      # Configuració de testing
├── .prettierrc                       # Configuració de Prettier
├── .eslintrc.json                   # Configuració d'ESLint
├── .prettierignore                   # Fitxers ignorats per Prettier
├── firebase.json                     # Configuració de Firebase
├── firestore.rules                   # Regles de seguretat
├── firestore.indexes.json           # Índexs de Firestore
└── LINT_FORMAT_GUIDE.md             # Guia de lint i format
```

### Patrons de Disseny

- **Feature-based Architecture**: Organització per funcionalitats
- **Shared Components**: Reutilització de components
- **Service Layer**: Lògica de negoci centralitzada
- **Reactive Programming**: RxJS per gestió d'estats
- **Dependency Injection**: Injecció de dependències d'Angular
- **Signal-based State Management**: Estat reactiu amb Angular Signals

## 🧩 Components Principals

### Sistema d'Inputs Unificats

Sistema complet d'inputs amb estils consistents:

- **8 tipus d'inputs**: text, textarea, email, password, number, date, select, checkbox
- **Mides unificades**: 44px per inputs, 80px per textareas
- **Estats visuals**: normal, focus, error, success, disabled
- **Validació integrada** i **accessibilitat completa**

### Components UI

- `CardComponent`: Contenidor amb estils consistents
- `LoaderComponent`: Indicador de càrrega
- `ToastComponent`: Notificacions temporals
- `PopupModalComponent`: Modals reutilitzables
- `AvatarComponent`: Avatars d'usuari
- `ServiceCardComponent`: Targetes de serveis

### Funcionalitats Avançades

- **Calendari Interactiu**: Drag & drop, estats visuals, gestió de pausa
- **Sistema de Permisos**: Rols múltiples amb guards i interceptors
- **Multiidioma**: 4 idiomes amb suport RTL i traducció dinàmica
- **Sincronització**: Events personalitzats i cache management

## 🔧 Desenvolupament

### Creació de Components

```bash
# Generar component amb Angular CLI
ng generate component shared/components/nou-component

# Generar component standalone
ng generate component shared/components/nou-component --standalone
```

### Lint i Format

El projecte té configurat ESLint i Prettier per mantenir un codi net i consistent.

```bash
# Abans de fer commit
npm run lint:format

# Per desenvolupament diari
npm run format:fix
```

### Testing

```bash
# Tests unitaris
npm test

# Tests amb coverage
npm run test:coverage

# Tests e2e
npm run e2e
```

### Gestió d'Estat amb Signals

```typescript
export class MyComponent {
  // Signals per estat reactiu
  private readonly dataSignal = signal<any[]>([]);
  private readonly loadingSignal = signal<boolean>(false);

  // Computed values
  readonly hasData = computed(() => this.dataSignal().length > 0);

  // Mètodes per actualitzar estat
  updateData(newData: any[]) {
    this.dataSignal.set(newData);
  }
}
```

## 🚀 Desplegament

### Configuració de Firebase

1. Crear projecte Firebase
2. Configurar Firestore Database
3. Configurar Authentication
4. Configurar Hosting

### Desplegament a Producció

```bash
# Build de producció
npm run build

# Desplegament a Firebase
firebase deploy
```

## 📚 Documentació

### Documentació Principal

- **[DOCUMENTATION.md](DOCUMENTATION.md)**: Documentació completa del projecte
- **[DOCS_INDEX.md](DOCS_INDEX.md)**: Índex de tota la documentació disponible
- **[LINT_FORMAT_GUIDE.md](LINT_FORMAT_GUIDE.md)**: Guia de lint i format

### Guies Específiques

- [Sistema d'Inputs](src/app/shared/components/inputs/README.md)
- [Sincronització de Serveis](src/app/core/services/SERVICES_SYNC.md)
- [Visibilitat d'Accions](src/app/shared/components/detail-view/ACTIONS_VISIBILITY.md)
- [Flux de Reserves Mòbils](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_FLOW.md)

### Recursos Externs

- [Documentació d'Angular](https://angular.dev/)
- [Documentació de PrimeNG](https://primeng.org/)
- [Documentació de Firebase](https://firebase.google.com/docs)
- [Documentació de TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contribució

1. Fork del repositori
2. Crear branca per feature (`git checkout -b feature/nova-funcionalitat`)
3. Desenvolupar canvis
4. Executar tests i lint (`npm run lint:format`)
5. Crear Pull Request

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

## 📞 Suport

- **Issues**: [GitHub Issues](https://github.com/ArnauM13/pelu-app/issues)
- **Documentació**: [Documentació Completa](DOCUMENTATION.md)
- **Email**: suport@peluapp.com

## 📄 Llicència

Aquest projecte està sota llicència MIT. Vegeu el fitxer [LICENSE](LICENSE) per més detalls.
