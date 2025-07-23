# 🏪 PeluApp - Sistema de Gestió de Reserves de Perruqueria

[![Angular](https://img.shields.io/badge/Angular-20.1.2-red.svg)](https://angular.io/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-20.0.0-blue.svg)](https://primeng.org/)
[![Firebase](https://img.shields.io/badge/Firebase-20.0.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Una aplicació web moderna per a la gestió de reserves de perruqueria desenvolupada amb Angular 20, PrimeNG i Firebase.

## 🚀 Característiques Principals

- ✅ **Sistema de Reserves**: Creació i gestió de cites amb calendari interactiu
- ✅ **Calendari Drag & Drop**: Visualització i reorganització de cites en temps real
- ✅ **Sistema de Permisos**: Control d'accés basat en rols (Admin/User/Guest)
- ✅ **Multiidioma**: Suport per català, castellà, anglès i àrab
- ✅ **Responsive Design**: Optimitzat per mòbil i desktop
- ✅ **Notificacions**: Sistema de toast integrat
- ✅ **Codi Net**: ESLint i Prettier configurats per mantenir estàndards
- ✅ **Testing**: Cobertura completa amb Jasmine i Karma

## 🛠️ Stack Tecnològic

- **Frontend**: Angular 20.1.2
- **UI Framework**: PrimeNG 20.0.0 + PrimeFlex 4.0.0
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **State Management**: Angular Signals
- **Styling**: SCSS + CSS Variables
- **Testing**: Jasmine + Karma
- **Code Quality**: ESLint + Prettier
- **Build Tool**: Angular CLI

## 📦 Instal·lació

### Prerequisits

- Node.js 18.x LTS
- npm o yarn
- Angular CLI 20.1.1+

### Pasos d'Instal·lació

```bash
# Clonar el repositori
git clone https://github.com/ArnauM13/pelu-app.git
cd pelu-app

# Instal·lar dependències
npm install

# Configurar Firebase (opcional)
npm run setup:firebase

# Iniciar servidor de desenvolupament
npm start
```

L'aplicació estarà disponible a `http://localhost:4200`

## 🎯 Comandaments Principals

```bash
# Desenvolupament
npm start              # Servidor de desenvolupament
npm run build          # Build de producció
npm run test           # Executar tests
npm run e2e            # Tests end-to-end

# Qualitat de Codi
npm run lint           # Comprovar errors de lint
npm run lint:fix       # Corregir errors automàticament
npm run format:fix     # Formatar codi amb Prettier
npm run lint:format    # Lint + Format combinat

# Desplegament
npm run build          # Build per producció
firebase deploy        # Desplegament a Firebase
```

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

### Patrons de Disseny

- **Feature-based Architecture**: Organització per funcionalitats
- **Shared Components**: Reutilització de components
- **Service Layer**: Lògica de negoci centralitzada
- **Reactive Programming**: RxJS per gestió d'estats
- **Dependency Injection**: Injecció de dependències d'Angular

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

## 📞 Suport

- **Issues**: [GitHub Issues](https://github.com/ArnauM13/pelu-app/issues)
- **Documentació**: [Documentació Completa](DOCUMENTATION.md)
- **Email**: suport@peluapp.com

## 📄 Llicència

Aquest projecte està sota llicència MIT. Vegeu el fitxer [LICENSE](LICENSE) per més detalls.

---

**Desenvolupat amb ❤️ per l'equip de PeluApp**
