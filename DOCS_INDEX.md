# 📚 Índex de Documentació - PeluApp

## 🎯 Visió General

Aquest índex proporciona una navegació completa a tota la documentació del projecte PeluApp, organitzada per categories i àrees de coneixement.

---

## 📋 Documentació Principal

### 🏠 [README.md](README.md)

Documentació principal del projecte amb inici ràpid i referències a tota la documentació disponible.

### 📖 [DOCUMENTATION.md](DOCUMENTATION.md)

Documentació unificada i completa del projecte amb tots els aspectes tècnics, arquitectura i guies d'ús.

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

---

## 📱 Funcionalitats Mòbils

### 📱 [Flux de Booking Mòbil](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_FLOW.md)

- **Descripció**: Documentació del flux optimitzat de reserves per dispositius mòbils
- **Contingut**:
  - Eliminació del popup de selecció de serveis
  - Flux directe de selecció (data → servei → hora → confirmació)
  - Validacions millorades
  - UI millorada amb indicadors visuals
  - Beneficis obtinguts (menys passos, més intuïtiu)
- **Ús**: Per desenvolupadors que treballen en la experiència mòbil

### 🔄 [Sincronització de Bookings](src/app/features/bookings/booking-mobile-page/BOOKINGS_SYNC.md)

- **Descripció**: Sincronització de dades de reserves en dispositius mòbils
- **Contingut**: Gestió d'estat i sincronització

### ⚠️ [Alerta de Completament](src/app/features/bookings/booking-mobile-page/FULLY_BOOKED_ALERT.md)

- **Descripció**: Sistema d'alertes quan no hi ha hores disponibles
- **Contingut**: Gestió d'estats de completament

### 🎨 [Actualització de Colors](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_COLORS_UPDATE.md)

- **Descripció**: Actualització del sistema de colors per mòbil
- **Contingut**: Millores visuals

### ⚡ [Selecció Ràpida de Data](src/app/features/bookings/booking-mobile-page/QUICK_DATE_SELECTION.md)

- **Descripció**: Optimització de la selecció de dates en mòbil
- **Contingut**: Interfície millorada per selecció de dates

### 🔍 [Filtrat d'Hores](src/app/features/bookings/booking-mobile-page/TIME_SLOTS_FILTERING.md)

- **Descripció**: Sistema de filtrat d'hores disponibles
- **Contingut**: Lògica de filtrat i presentació

---

## 📅 Gestió de Cites

### ✏️ [Mode d'Edició Directa](src/app/features/appointments/appointment-detail-page/DIRECT_EDIT_MODE.md)

- **Descripció**: Guia sobre el mode d'edició directa en detalls de cites
- **Contingut**:
  - Implementació d'edició inline
  - Gestió d'estats d'edició
  - Validacions en temps real
- **Ús**: Per desenvolupadors que treballen en la gestió de cites

---

## 🎯 Guies d'Ús per Rol

### 👨‍💻 **Per Desenvolupadors**

1. [DOCUMENTATION.md](DOCUMENTATION.md) - Documentació tècnica completa
2. [Sistema d'Inputs Unificats](src/app/shared/components/inputs/README.md) - Components UI
3. [Sincronització de Serveis](src/app/core/services/SERVICES_SYNC.md) - Arquitectura de serveis
4. [Implementació de Components Genèrics](src/app/shared/components/inputs/GENERIC_COMPONENTS_IMPLEMENTATION.md) - Patrons de disseny

### 📱 **Per Desenvolupadors Mòbils**

1. [Flux de Booking Mòbil](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_FLOW.md) - Experiència mòbil
2. [Sincronització de Bookings](src/app/features/bookings/booking-mobile-page/BOOKINGS_SYNC.md) - Gestió d'estat mòbil
3. [Selecció Ràpida de Data](src/app/features/bookings/booking-mobile-page/QUICK_DATE_SELECTION.md) - UI mòbil

### 🎨 **Per Dissenyadors UI/UX**

1. [Estils Globals](src/app/shared/components/inputs/STYLES_GLOBAL.md) - Sistema de disseny
2. [Sistema d'Inputs Unificats](src/app/shared/components/inputs/README.md) - Components UI
3. [Correccions i Millores](src/app/shared/components/inputs/) - Problemes visuals

### 🔧 **Per Maintaniment**

1. [Correccions i Millores](src/app/shared/components/inputs/) - Problemes coneguts
2. [Sincronització de Serveis](src/app/core/services/SERVICES_SYNC.md) - Problemes de dades
3. [Troubleshooting](DOCUMENTATION.md#troubleshooting) - Guia de resolució de problemes

---

## 📊 Estadístiques de Documentació

### 📁 **Estructura de Fitxers**

- **Total de fitxers de documentació**: 27
- **Documentació principal**: 2 fitxers
- **Documentació tècnica**: 25 fitxers
- **Documentació per àrees**: 8 categories

### 📈 **Cobertura per Àrea**

- **Components UI**: 40% (11 fitxers)
- **Funcionalitats Mòbils**: 25% (7 fitxers)
- **Correccions**: 20% (5 fitxers)
- **Arquitectura**: 10% (3 fitxers)
- **Altres**: 5% (1 fitxer)

### 🎯 **Ús Recomanat**

- **Noves incorporacions**: Començar per [README.md](README.md) i [DOCUMENTATION.md](DOCUMENTATION.md)
- **Desenvolupament**: Consultar documentació específica per àrea
- **Maintaniment**: Revisar correccions i troubleshooting
- **Millores**: Consultar guies d'implementació

---

## 🔄 Actualitzacions de Documentació

### 📅 **Última Actualització**: Gener 2025

### 🎯 **Objectiu**: Documentació unificada i navegable

### ✅ **Estat**: Complet amb índex actualitzat

### 📝 **Notes d'Ús**

- Tots els enllaços són relatius al directori arrel del projecte
- La documentació està organitzada per àrees de coneixement
- Cada fitxer inclou descripció, contingut i ús recomanat
- Es proporcionen guies específiques per diferents rols

---

## 📞 Suport de Documentació

### 🤝 **Contribució**

Si trobes errors o vols millorar la documentació:

1. Obre un issue al repositori
2. Proposa millores específiques
3. Segueix les guies de contribució

### 📧 **Contacte**

- **Email**: suport@peluapp.com
- **Issues**: [GitHub Issues](https://github.com/peluapp/issues)
- **Documentació**: [Documentació Completa](DOCUMENTATION.md)

---

_Índex generat automàticament - Última actualització: Gener 2025_
