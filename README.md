# 🎨 PeluApp

Aplicació web per a la gestió de reserves de perruqueria desenvolupada amb **Angular 18**.

## 🚀 Inici Ràpid

```bash
# Instal·lar dependències
npm install

# Servidor de desenvolupament
npm start

# Build de producció
npm run build
```

## 📚 Documentació Completa

Per a informació detallada sobre l'arquitectura, components, funcionalitats i guies d'ús, consulta la **[Documentació Unificada](DOCUMENTATION.md)**.

### 📋 Taula de Continguts de la Documentació:

#### 🚀 [Inici Ràpid](DOCUMENTATION.md#inici-ràpid)

- [Descripció General](DOCUMENTATION.md#descripció-general)
- [Instal·lació i Configuració](DOCUMENTATION.md#instal·lació-i-configuració)
- [Comandaments de Desenvolupament](DOCUMENTATION.md#comandaments-de-desenvolupament)

#### 🏗️ [Arquitectura](DOCUMENTATION.md#arquitectura)

- [Estructura del Projecte](DOCUMENTATION.md#estructura-del-projecte)
- [Stack Tecnològic](DOCUMENTATION.md#stack-tecnològic)
- [Patrons de Disseny](DOCUMENTATION.md#patrons-de-disseny)

#### ⚡ [Funcionalitats Principals](DOCUMENTATION.md#funcionalitats-principals)

- [Sistema de Reserves](DOCUMENTATION.md#sistema-de-reserves)
- [Calendari Interactiu](DOCUMENTATION.md#calendari-interactiu)
- [Sistema de Permisos](DOCUMENTATION.md#sistema-de-permisos)
- [Multiidioma](DOCUMENTATION.md#multiidioma)

#### 🧩 [Components Compartits](DOCUMENTATION.md#components-compartits)

- [Sistema d'Inputs Unificats](DOCUMENTATION.md#sistema-dinputs-unificats)
- [Components UI](DOCUMENTATION.md#components-ui)
- [Popups i Modals](DOCUMENTATION.md#popups-i-modals)

#### 🔧 [Desenvolupament](DOCUMENTATION.md#desenvolupament)

- [Guies de Desenvolupament](DOCUMENTATION.md#guies-de-desenvolupament)
- [Testing](DOCUMENTATION.md#testing)
- [Troubleshooting](DOCUMENTATION.md#troubleshooting)

#### 🚀 [Desplegament](DOCUMENTATION.md#desplegament)

- [Configuració de Firebase](DOCUMENTATION.md#configuració-de-firebase)
- [Desplegament a Producció](DOCUMENTATION.md#desplegament-a-producció)

## 🎯 Característiques Principals

- ✅ **Sistema de Reserves**: Creació i gestió de cites
- ✅ **Calendari Interactiu**: Visualització en temps real amb drag & drop
- ✅ **Sistema de Permisos**: Rol-based access control
- ✅ **Multiidioma**: Suport per català, castellà, anglès i àrab
- ✅ **Responsive Design**: Optimitzat per mòbil i desktop
- ✅ **Notificacions**: Sistema de toast integrat
- ✅ **Loader Global**: Indicador de càrrega consistent

## 🛠️ Comandaments Útils

```bash
# Desenvolupament
npm start              # Servidor de desenvolupament
npm run build          # Build de producció
npm test               # Tests unitaris
npm run e2e            # Tests e2e

# Desplegament
firebase deploy        # Desplegar a Firebase
```

## 📖 Documentació Específica per Àrees

### 🔧 [Sistema d'Inputs Unificats](src/app/shared/components/inputs/README.md)

Documentació completa del sistema d'inputs amb exemples d'ús i configuracions.

### 🔄 [Sincronització de Serveis](src/app/core/services/SERVICES_SYNC.md)

Guia sobre la sincronització automàtica de serveis entre components.

### 📱 [Flux de Booking Mòbil](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_FLOW.md)

Documentació del flux optimitzat de reserves per dispositius mòbils.

### 🎨 [Estils Globals](src/app/shared/components/inputs/STYLES_GLOBAL.md)

Guia d'estils globals i implementació de disseny system.

### 🔧 [Implementació de Components Genèrics](src/app/shared/components/inputs/GENERIC_COMPONENTS_IMPLEMENTATION.md)

Documentació sobre la implementació de components reutilitzables.

### 📋 [Gestor de Categories](src/app/shared/components/inputs/CATEGORIES_MANAGER_FEATURE.md)

Guia sobre la funcionalitat de gestió de categories de serveis.

### 🎯 [Funcionalitat de Servei Popular](src/app/shared/components/inputs/POPULAR_SERVICE_FEATURE.md)

Documentació sobre la funcionalitat de serveis populars.

### 🔧 [Correccions i Millores](src/app/shared/components/inputs/)

- [Correcció de Colors d'Input](src/app/shared/components/inputs/INPUT_COLORS_FIX.md)
- [Correcció de Text](src/app/shared/components/inputs/TEXT_COLOR_FIX.md)
- [Correcció de Checkbox](src/app/shared/components/inputs/input-select/CHECKBOX_FIX.md)
- [Correcció de Z-Index](src/app/shared/components/inputs/input-select/DROPDOWN_ZINDEX_FIX.md)

### 📱 [Funcionalitats Mòbils](src/app/features/bookings/booking-mobile-page/)

- [Sincronització de Bookings](src/app/features/bookings/booking-mobile-page/BOOKINGS_SYNC.md)
- [Alerta de Completament](src/app/features/bookings/booking-mobile-page/FULLY_BOOKED_ALERT.md)
- [Actualització de Colors](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_COLORS_UPDATE.md)
- [Selecció Ràpida de Data](src/app/features/bookings/booking-mobile-page/QUICK_DATE_SELECTION.md)
- [Filtrat d'Hores](src/app/features/bookings/booking-mobile-page/TIME_SLOTS_FILTERING.md)

### 👁️ [Visibilitat d'Accions](src/app/shared/components/detail-view/ACTIONS_VISIBILITY.md)

Documentació sobre la gestió de visibilitat d'accions en components.

### ✏️ [Mode d'Edició Directa](src/app/features/appointments/appointment-detail-page/DIRECT_EDIT_MODE.md)

Guia sobre el mode d'edició directa en detalls de cites.

## 📚 Més Informació

- **[Documentació Unificada](DOCUMENTATION.md)** - Guia completa del projecte
- **[Angular CLI](https://angular.dev/tools/cli)** - Documentació oficial d'Angular CLI
- **[PrimeNG](https://primeng.org/)** - Documentació de components UI
- **[Firebase](https://firebase.google.com/docs)** - Documentació de Firebase

## 🤝 Contribució

Si vols contribuir al projecte, consulta la secció de [Contribució](DOCUMENTATION.md#contribució) a la documentació unificada.

## 📞 Suport

Per a suport tècnic o preguntes:

- **Email**: arnaumm98@gmail.com
- **Issues**: [GitHub Issues](https://github.com/peluapp/issues)
- **Documentació**: [Documentació Completa](DOCUMENTATION.md)
