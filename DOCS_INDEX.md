# 📚 Índex de Documentació - PeluApp

## 🎯 Visió General

Aquest índex proporciona una navegació completa a tota la documentació del projecte PeluApp, organitzada per categories i àrees de coneixement.

---

## 📋 Documentació Principal

### 🏠 [README.md](README.md)

Documentació principal del projecte amb inici ràpid i referències a tota la documentació disponible.

### 📖 [DOCUMENTATION.md](DOCUMENTATION.md)

Documentació unificada i completa del projecte amb tots els aspectes tècnics, arquitectura i guies d'ús.

### 🔧 [Guia de Lint i Format](LINT_FORMAT_GUIDE.md)

- **Descripció**: Guia completa per utilitzar ESLint i Prettier
- **Contingut**:
  - Scripts disponibles per lint i format
  - Configuració de Prettier amb plugins
  - Integració amb ESLint
  - Errors comuns i solucions
  - Configuració d'IDEs
- **Ús**: Per desenvolupadors que volen mantenir codi net i consistent

---

## 🏗️ Arquitectura i Core

### 🔧 [Sincronització de Serveis](src/app/core/services/SERVICES_SYNC.md)

- **Descripció**: Guia sobre la sincronització automàtica de serveis entre components
- **Contingut**:
  - Problema solucionat amb serveis estàtics vs dinàmics
  - Implementació d'events personalitzats
  - Gestió de cache amb Firebase
  - Migració de components
- **Ús**: Per desenvolupadors que treballen amb serveis i sincronització de dades

---

## 🧩 Components Compartits

### 🔧 [Sistema d'Inputs Unificats](src/app/shared/components/inputs/README.md)

- **Descripció**: Documentació completa del sistema d'inputs amb mides i estils consistents
- **Contingut**:
  - 8 tipus d'inputs disponibles (text, textarea, email, password, number, date, select, checkbox)
  - Mides unificades (44px per inputs, 80px per textareas)
  - Estats visuals (normal, focus, error, success, disabled)
  - Exemples d'ús i configuracions
  - Responsive design i accessibilitat
- **Ús**: Per desenvolupadors que creen formularis i components d'entrada de dades

### 🎨 [Estils Globals](src/app/shared/components/inputs/STYLES_GLOBAL.md)

- **Descripció**: Guia d'estils globals i implementació de disseny system
- **Contingut**: Variables CSS, temes, i estils compartits

### 🔧 [Implementació de Components Genèrics](src/app/shared/components/inputs/GENERIC_COMPONENTS_IMPLEMENTATION.md)

- **Descripció**: Documentació sobre la implementació de components reutilitzables
- **Contingut**: Patrons de disseny per components genèrics

### 📋 [Gestor de Categories](src/app/shared/components/inputs/CATEGORIES_MANAGER_FEATURE.md)

- **Descripció**: Guia sobre la funcionalitat de gestió de categories de serveis
- **Contingut**: Implementació del sistema de categories

### 🎯 [Funcionalitat de Servei Popular](src/app/shared/components/inputs/POPULAR_SERVICE_FEATURE.md)

- **Descripció**: Documentació sobre la funcionalitat de serveis populars
- **Contingut**: Lògica de serveis destacats

### 👁️ [Visibilitat d'Accions](src/app/shared/components/detail-view/ACTIONS_VISIBILITY.md)

- **Descripció**: Documentació sobre la gestió de visibilitat d'accions en components
- **Contingut**: Control d'accions segons permisos i context

---

## 🔧 Correccions i Millores

### 🎨 [Correcció de Colors d'Input](src/app/shared/components/inputs/INPUT_COLORS_FIX.md)

- **Descripció**: Correcció de problemes amb colors en inputs
- **Contingut**: Solució a problemes de contrast i visibilitat

### 📝 [Correcció de Text](src/app/shared/components/inputs/TEXT_COLOR_FIX.md)

- **Descripció**: Correcció de problemes amb colors de text
- **Contingut**: Millores en llegibilitat

### ☑️ [Correcció de Checkbox](src/app/shared/components/inputs/input-select/CHECKBOX_FIX.md)

- **Descripció**: Correcció de problemes amb components checkbox
- **Contingut**: Solució a problemes d'interacció

### 📍 [Correcció de Z-Index](src/app/shared/components/inputs/input-select/DROPDOWN_ZINDEX_FIX.md)

- **Descripció**: Correcció de problemes de superposició en dropdowns
- **Contingut**: Gestió correcta de capes CSS

### 🎨 [Actualització d'Estils d'Admin](src/app/shared/components/inputs/ADMIN_STYLING_UPDATE.md)

- **Descripció**: Actualització d'estils per pàgines d'administració
- **Contingut**: Millores en la interfície d'admin

### 📝 [Actualització de Text de Botons](src/app/shared/components/inputs/BUTTON_TEXT_UPDATES.md)

- **Descripció**: Actualització de textos en botons i elements d'UI
- **Contingut**: Millores en la UX

### 🎨 [Implementació d'Estils Globals](src/app/shared/components/inputs/GLOBAL_STYLES_IMPLEMENTATION.md)

- **Descripció**: Implementació completa d'estils globals
- **Contingut**: Sistema de disseny unificat

### 🎨 [Funcionalitat d'Icones en Inputs](src/app/shared/components/inputs/ICON_INPUT_FEATURE.md)

- **Descripció**: Implementació d'icones en components d'input
- **Contingut**: Millores visuals i UX

### 📊 [Correcció de Gap en Grid de Serveis](src/app/shared/components/inputs/SERVICES_GRID_GAP_FIX.md)

- **Descripció**: Correcció d'espaiat en grid de serveis
- **Contingut**: Millores en layout

---

## 📱 Funcionalitats Mòbils

### 📱 [Flux de Reserves Mòbils](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_FLOW.md)

- **Descripció**: Documentació del flux optimitzat per mòbil
- **Contingut**:
  - Flux simplificat per dispositius mòbils
  - Optimitzacions d'UX
  - Gestió d'estats
- **Ús**: Per desenvolupadors que treballen en la versió mòbil

### 🎨 [Actualització de Colors Mòbils](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_COLORS_UPDATE.md)

- **Descripció**: Actualització del sistema de colors per mòbil
- **Contingut**: Millores en la paleta de colors

### ⚡ [Selecció Ràpida de Dates](src/app/features/bookings/booking-mobile-page/QUICK_DATE_SELECTION.md)

- **Descripció**: Implementació de selecció ràpida de dates
- **Contingut**: Optimització per selecció d'horaris

### 🔍 [Filtrat d'Horaris](src/app/features/bookings/booking-mobile-page/TIME_SLOTS_FILTERING.md)

- **Descripció**: Sistema de filtrat d'horaris disponibles
- **Contingut**: Lògica de filtrat i optimització

### ⚠️ [Alerta de Completament](src/app/features/bookings/booking-mobile-page/FULLY_BOOKED_ALERT.md)

- **Descripció**: Sistema d'alertes per dies completament reservats
- **Contingut**: Gestió d'estats de disponibilitat

### 🔄 [Sincronització de Reserves](src/app/features/bookings/booking-mobile-page/BOOKINGS_SYNC.md)

- **Descripció**: Sistema de sincronització de reserves en temps real
- **Contingut**: Gestió d'estats i actualitzacions

---

## 📅 Gestió de Cites

### ✏️ [Mode d'Edició Directa](src/app/features/appointments/appointment-detail-page/DIRECT_EDIT_MODE.md)

- **Descripció**: Implementació del mode d'edició directa de cites
- **Contingut**:
  - Edició inline de cites
  - Validació en temps real
  - Gestió d'estats
- **Ús**: Per desenvolupadors que treballen en la gestió de cites

---

## 🎨 Estils i UI

### 🎨 [Estils Globals](src/app/shared/components/inputs/GLOBAL_INPUT_STYLES.md)

- **Descripció**: Documentació dels estils globals d'inputs
- **Contingut**: Variables CSS, temes, i estils compartits

### 🎨 [Actualització de Format de Pàgina d'Admin](src/app/shared/components/inputs/ADMIN_PAGE_FORMAT_UPDATE.md)

- **Descripció**: Actualització del format de pàgines d'administració
- **Contingut**: Millores en layout i estructura

---

## 🔧 Configuració i Desplegament

### 🔧 [Configuració de Firebase](firebase.json)

- **Descripció**: Configuració de Firebase per l'aplicació
- **Contingut**: Regles de Firestore, configuració d'hosting

### 🔧 [Regles de Firestore](firestore.rules)

- **Descripció**: Regles de seguretat per Firestore
- **Contingut**: Permisos i validacions de seguretat

### 🔧 [Índexs de Firestore](firestore.indexes.json)

- **Descripció**: Índexs per optimitzar consultes de Firestore
- **Contingut**: Configuració d'índexs compostos

---

## 📊 Testing i Qualitat

### 🧪 [Configuració de Tests](src/testing/test-setup.ts)

- **Descripció**: Configuració global per tests
- **Contingut**: Mocks, providers, i configuració de testing

### 🔥 [Mocks de Firebase](src/testing/firebase-mocks.ts)

- **Descripció**: Mocks per testing amb Firebase
- **Contingut**: Simulació de serveis de Firebase

### 🌐 [Mocks de Traducció](src/testing/translation-mocks.ts)

- **Descripció**: Mocks per testing de traduccions
- **Contingut**: Simulació del servei de traducció

---

## 🚀 Scripts i Automatització

### 🔧 [Optimització d'Assets](scripts/optimize-assets.js)

- **Descripció**: Script per optimitzar imatges i assets
- **Contingut**: Compressió i conversió d'imatges

### 🔧 [Configuració d'Angular](angular.json)

- **Descripció**: Configuració principal d'Angular CLI
- **Contingut**: Builds, serveis, i configuració de projecte

---

## 📚 Recursos Addicionals

### 📖 [Documentació de PrimeNG](https://primeng.org/)

- **Descripció**: Documentació oficial de PrimeNG
- **Ús**: Per components UI i estils

### 📖 [Documentació d'Angular](https://angular.dev/)

- **Descripció**: Documentació oficial d'Angular
- **Ús**: Per conceptes bàsics i avançats d'Angular

### 📖 [Documentació de Firebase](https://firebase.google.com/docs)

- **Descripció**: Documentació oficial de Firebase
- **Ús**: Per configuració i ús de serveis de Firebase

---

## 🎯 Comandaments Útils

### 🔧 Desenvolupament

```bash
# Servidor de desenvolupament
npm start

# Build de producció
npm run build

# Tests
npm test

# Lint i format
npm run lint:format
```

### 🔧 Generació de Components

```bash
# Generar component
ng generate component feature-name/component-name

# Generar servei
ng generate service core/services/service-name

# Generar pipe
ng generate pipe shared/pipes/pipe-name
```

### 🔧 Desplegament

```bash
# Desplegament a Firebase
firebase deploy

# Desplegament només hosting
firebase deploy --only hosting
```

---

## 📞 Suport i Contacte

### 🐛 [GitHub Issues](https://github.com/ArnauM13/pelu-app/issues)

- **Descripció**: Sistema d'issues per bugs i millores
- **Ús**: Per reportar problemes o proposar millores

### 📖 [Documentació Principal](DOCUMENTATION.md)

- **Descripció**: Documentació completa del projecte
- **Ús**: Per informació detallada sobre l'arquitectura i desenvolupament

---

## 📄 Llicència

Aquest projecte està sota llicència MIT. Vegeu el fitxer LICENSE per més detalls.

---

_Última actualització: Gener 2025_
