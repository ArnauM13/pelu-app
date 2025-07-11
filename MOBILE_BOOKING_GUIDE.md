# Guia de la Versió Mobile de Reserves

## Descripció

S'ha creat una versió mobile de la pàgina de reserves que ofereix una experiència més senzilla i optimitzada per a dispositius mòbils. Aquesta versió elimina la complexitat del calendari i ofereix una interfície basada en inputs i selecció visual.

## Característiques Principals

### 🎯 Interfície Senzilla
- **Sense calendari complex**: Elimina la interfície de calendari per una experiència més directa
- **Selecció per dies**: Visualització clara dels dies de la setmana
- **Horaris visuals**: Mostra ràpidament quins horaris estan disponibles i quins no

### 📱 Disseny Responsive
- **Optimitzat per mobile**: Interfície adaptada específicament per a pantalles petites
- **Navegació intuïtiva**: Botons grans i fàcils de tocar
- **Visualització clara**: Colors distintius per a diferents estats (disponible, ocupat, pausa)

### ⚡ Flux de Reserva Ràpid
1. **Seleccionar servei**: Llista de serveis amb preus i durades
2. **Seleccionar dia**: Vista de setmana amb dies disponibles
3. **Seleccionar hora**: Grid d'horaris amb estat visual
4. **Confirmar reserva**: Popup de confirmació amb detalls

## Com Accedir

### Des de la Versió Desktop
1. Anar a la pàgina de reserves (`/booking`)
2. Clicar al botó "Versió Mobile" (amb icona de mòbil)
3. Seràs redirigit a `/booking-mobile`

### Des de la Versió Mobile
1. Anar a la pàgina de reserves mobile (`/booking-mobile`)
2. Clicar al botó "Versió Desktop" (amb icona d'ordinador)
3. Seràs redirigit a `/booking`

## Funcionalitats

### 📅 Navegació per Setmanes
- **Botons de navegació**: Anterior/Següent setmana
- **Botó "Avui"**: Retorna a la setmana actual
- **Visualització clara**: Mostra el rang de dates de la setmana

### 🎨 Estats Visuals
- **🟢 Disponible**: Horaris lliures per reservar
- **🔴 Ocupat**: Horaris ja reservats (mostra nom del client)
- **🟡 Pausa per dinar**: Horari de pausa (13:00-14:00)

### 📋 Selecció de Servei
- **Llista completa**: Tots els serveis disponibles
- **Informació detallada**: Preu, durada i icona
- **Selecció visual**: El servei seleccionat es destaca

### 🕐 Horaris Disponibles
- **Slots de 30 minuts**: De 08:00 a 20:00
- **Exclusió de pausa**: Automàticament exclou l'hora de dinar
- **Verificació en temps real**: Comprova conflictes amb reserves existents

## Configuració de Negoci

La versió mobile utilitza la mateixa configuració que la versió desktop:

```typescript
// Horaris de treball
businessHours = { start: '08:00', end: '20:00' }

// Pausa per dinar
lunchBreak = { start: '13:00', end: '14:00' }

// Dies laborables (1=Monday, 6=Saturday)
businessDays = [1, 2, 3, 4, 5, 6]

// Durada dels slots
slotDuration = 30 // minuts
```

## Traduccions

La versió mobile inclou traduccions en:
- **Català** (ca)
- **Anglès** (en)
- **Espanyol** (es)
- **Àrab** (ar)

### Noves claus de traducció afegides:
- `COMMON.BOOK_APPOINTMENT`: "Reservar Cita"
- `COMMON.WEEK_OF`: "Setmana del"
- `COMMON.SELECT_DAY`: "Selecciona un dia"
- `COMMON.AVAILABLE_TIMES`: "Horaris disponibles"
- `COMMON.AVAILABLE`: "Disponible"
- `COMMON.OCCUPIED`: "Ocupat"
- `COMMON.LUNCH_BREAK`: "Pausa per dinar"
- `COMMON.LEGEND`: "Llegenda"
- `COMMON.MOBILE_VERSION`: "Versió Mobile"
- `COMMON.DESKTOP_VERSION`: "Versió Desktop"

## Avantatges de la Versió Mobile

### ✅ Per a Usuaris
- **Més ràpid**: Menys passos per completar una reserva
- **Més clar**: Estat visual immediat dels horaris
- **Més fàcil**: Interfície optimitzada per a touch
- **Més accessible**: Textos més grans i botons més fàcils de tocar

### ✅ Per a Desenvolupadors
- **Codi separat**: Component independent i reutilitzable
- **Manteniment fàcil**: Lògica clara i ben organitzada
- **Escalable**: Fàcil d'afegir noves funcionalitats
- **Testejable**: Component aïllat per a testing

## Estructura de Fitxers

```
src/app/features/bookings/
├── booking-page/                    # Versió desktop original
│   ├── booking-page.component.ts
│   ├── booking-page.component.html
│   └── booking-page.component.scss
└── booking-mobile-page/             # Nova versió mobile
    ├── booking-mobile-page.component.ts
    ├── booking-mobile-page.component.html
    └── booking-mobile-page.component.scss
```

## Rutes

- **Desktop**: `/booking`
- **Mobile**: `/booking-mobile`

## Compatibilitat

- **Navegadors**: Chrome, Firefox, Safari, Edge
- **Dispositius**: Mòbils, tablets, desktop
- **Resolució mínima**: 320px d'amplada
- **Angular**: 17+
- **PrimeNG**: Última versió

## Futurs Millores

- [ ] Afegir notificacions push per a confirmacions
- [ ] Implementar cache offline per a horaris
- [ ] Afegir suport per a múltiples serveis en una sola reserva
- [ ] Integrar amb sistema de pagaments
- [ ] Afegir recordatoris automàtics
- [ ] Implementar sistema de valoracions post-servei 
