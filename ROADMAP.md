# PeluApp — Roadmap i Anàlisi de Funcionalitats

> Filosofia: app **simple, centralitzada, única font de veritat**, usable per clients IRL.
> Backend: Firebase (Firestore + Auth) ja desplegat i funcionant.

---

## Estat actual: ~75% completat

### Implementat i funcional ✅
- Autenticació Firebase (email/password + Google OAuth)
- Reset de contrasenya (flow inline al login)
- Emails de confirmació de reserva via EmailJS (actiu)
- Gestió de reserves CRUD completa amb temps real
- Calendari interactiu (setmanal + diari) amb drag & drop + filtre de client
- Gestió de serveis CRUD
- Pàgina d'ajustos d'administrador completa
- Sistema de rols: `admin` / `client`
- Internacionalització: ca, es, en, ar (amb suport RTL)
- PrimeNG sempre en mode clar (`darkModeSelector: false`)
- Ruta `/playground` protegida amb `adminGuard`

---

## Problemes pendents

### 🟠 A. Edició de perfil d'usuari
La pàgina `/perfil` és **només lectura**. L'usuari no pot canviar el seu nom ni telèfon.

### 🟠 B. Stats del dashboard a zero
`AppStateService` retorna hardcoded `0` per a: total serveis, serveis actius, nombre d'usuaris.

### 🟠 C. Llistat de clients per admin — FALTA
L'admin no pot veure qui s'ha registrat, ni editar/veure perfils de clients.
`user.service.ts` ja té `listAllUsers()` però no hi ha cap pàgina que el mostri.

### 🟡 D. Chart.js instal·lat però no s'usa
Afegeix ~200KB al bundle. Cal usar-lo o eliminar-lo.

### 🟡 E. Textos hardcodejats en català
Alguns labels de la pàgina de settings estan en català hardcoded, no traduïts.

---

## Nova funcionalitat: UX simplificada

### Problema
Les pàgines actuals estan **massa carregades** visualment: massa targetes, massa informació
de cop, massa espai ocupat. L'objectiu és una experiència molt neta per usuaris de tot
tipus, incloent gent gran o poc habituada a la tecnologia.

### Principis de disseny
- **Jerarquia clara**: màxim 1 acció principal per pantalla, la resta secundàries
- **Espai en blanc generós**: menys elements, més respir visual
- **Tipografia gran**: mides llegibles sense esforç
- **Accions òbvies**: botons grans, labels clars, zero ambigüitat
- **Mòbil primer**: disseny pensant primer en pantalla petita

### Pàgines prioritàries a simplificar
| Pàgina | Problema actual | Solució |
|--------|-----------------|---------|
| Landing | Massa seccions i text | Una sola CTA gran ("Reservar ara") + propera cita |
| Booking | Formulari complex | Wizard pas a pas (servei → data → hora → confirmar) |
| Appointments | Llista densa amb molts filtres | Vista neta amb filtres ocults per defecte |
| Perfil | Massa dades tècniques visibles | Només nom, email, i propera cita |

---

## Nova funcionalitat: Propera cita accessible des de qualsevol lloc

### Problema
La propera cita del client ara apareix com un component gran que ocupa molt espai a la
pàgina d'appointments. El client ha de navegar fins allà per veure-la.

### Solució: "Next appointment chip" global
Un element **discret i permanent** visible des de totes les pàgines que mostra
la propera cita del client sense interrumpre el flux de la pàgina.

**Comportament:**
- Apareix com un **chip/badge** a la barra de navegació o flotant a baix-dreta
- Mostra: data + hora + servei (3 dades, res més)
- Al fer clic, obre un **popup/drawer** lleuger amb els detalls complets
- Només visible si el client té una propera cita activa
- Els admins no el veuen (ells ja ho gestionen al calendari)

**Disseny del chip:**
```
[📅 Divendres 7 mar · 10:00 · Tall de cabell]  ×
```

**Disseny del popup (al fer clic):**
```
┌─────────────────────────────┐
│  La teva propera cita       │
│  ─────────────────────────  │
│  📅 Divendres, 7 de març    │
│  🕙 10:00h                  │
│  ✂️  Tall de cabell          │
│                             │
│  [Veure detalls]  [Cancel·lar] │
└─────────────────────────────┘
```

**Implementació:**
- Nou component `NextAppointmentChip` (standalone)
- S'injecta al layout principal (`app.component` o `ui-wrapper`)
- Usa `BookingService.bookings()` filtrant per propera cita de l'usuari
- El component `NextAppointmentComponent` actual pot simplificar-se o reutilitzar-se

---

## Nova funcionalitat: Multi-treballador (simple)

### Concepte
Mantenir la filosofia senzilla: un treballador és un usuari amb rol `worker`.
Comparteix els mateixos horaris de negoci que l'admin configura.
No cal gestió d'horaris individuals per treballador.

### Model de dades

**Nou rol** (afegir a `RoleService`):
```
admin  → gestió total
worker → veu el seu propi calendari, pot marcar cites com completades
client → veu les seves pròpies cites
```

**Canvi a `Booking` interface** — afegir camp opcional:
```typescript
workerId?: string;     // UID del treballador assignat
workerName?: string;   // Nom del treballador (desnormalitzat per velocitat)
```

**Nova col·lecció Firestore** `workers`:
```
workers/{uid}
  name: string
  email: string
  color: string      // hex color per al calendari
  isActive: boolean
  createdAt: timestamp
```

### Funcionalitats del mode multi-treballador

**Per al client (booking flow):**
- Selector "Treballador preferit" al formulari de reserva (opcional, "Qualsevol" per defecte)
- Si selecciona un treballador, la reserva queda assignada a ell
- Si tria "Qualsevol", l'admin/worker ho assigna manualment

**Per al treballador (`worker`):**
- Veu el seu calendari personal (només les seves cites)
- Pot marcar cites com a completades
- No pot crear ni eliminar cites

**Per a l'admin:**
- Gestió de treballadors: crear, activar/desactivar, editar nom i color
- Al calendari: selector de treballador per filtrar (similar al filtre de client actual)
- Pot reassignar una cita d'un treballador a un altre
- Visió global: veu tots els treballadors al calendari alhora (colors diferenciats)

### Pàgines noves necessàries
- `/admin/workers` — llistat de treballadors amb CRUD bàsic
- (El calendari s'adapta, no cal pàgina nova)

---

## Estructura de branques

```
master (producció)
  └── dev (integració)
        ├── ✅ calendar_improves   (mergeada)
        ├── ✅ fix/critical-ux     (mergeada)
        ├── feat/admin-clients     (llistat + edició de clients)
        ├── feat/profile-editing   (usuari edita el seu propi perfil)
        ├── feat/next-appt-chip    (chip propera cita global)
        ├── feat/ux-simplify       (simplificació visual de pàgines)
        ├── feat/workers           (multi-treballador)
        └── fix/dashboard-cleanup  (stats reals + eliminar Chart.js)
```

**Regla**: cada branca és **independent**, es crea des de `dev` i es fusiona a `dev`.
Quan `dev` és estable es fa merge a `master` per desplegar.

---

## Ordre d'execució recomanat

### ✅ Fase 0 — Completada (`calendar_improves`)
- [x] Millores del calendari i filtres de client per nom
- [x] Fix PrimeNG: sempre mode clar (`darkModeSelector: false`)
- [x] Neteja CSS: eliminats workarounds de mode fosc
- [x] Protegir `/playground` amb `adminGuard`

### ✅ Fase 1 — Completada (`fix/critical-ux`)
- [x] Reset de contrasenya (flow inline al login, Firebase Auth)
- [x] Emails de confirmació reactivats (EmailJS)

### Fase 2 — Gestió de clients per admin (`feat/admin-clients`)
- [ ] Nova pàgina `/admin/clients` amb llistat de tots els usuaris
- [ ] Veure perfil complet d'un client (reserves, dades)
- [ ] Editar nom i telèfon d'un client des de l'admin
- [ ] Integrar botons de promote/demote a la UI

### Fase 3 — Edició de perfil propi (`feat/profile-editing`)
- [ ] La pàgina `/perfil` permet editar nom i telèfon
- [ ] Persistència a Firestore (`users/{uid}`)

### Fase 4 — Propera cita accessible globalment (`feat/next-appt-chip`)
- [ ] Nou component `NextAppointmentChip` (chip discret a la navbar o flotant)
- [ ] Popup lleuger amb data, hora i servei al fer clic
- [ ] Visible des de totes les pàgines per a clients amb cites futures
- [ ] Simplificar o eliminar el `NextAppointmentComponent` actual gran

### Fase 5 — Simplificació UX (`feat/ux-simplify`)
- [ ] Landing: una sola CTA gran, menys text
- [ ] Booking: wizard pas a pas (servei → data → hora → confirmar)
- [ ] Appointments: filtres ocults per defecte, llista més neta
- [ ] Perfil: mostrar només la informació essencial
- [ ] Revisió general de padding, mides de text i densitat visual

### Fase 6 — Multi-treballador (`feat/workers`)
- [ ] Afegir rol `worker` a `RoleService` i guards
- [ ] Afegir `workerId` i `workerName` a `Booking` interface
- [ ] Crear `workers.service.ts` amb CRUD a Firestore
- [ ] Nova pàgina `/admin/workers` amb llistat + crear/editar/desactivar
- [ ] Adaptar booking form: selector de treballador preferit
- [ ] Adaptar calendari: selector de treballador per admin, filtre de color
- [ ] Guard per a treballadors: veu només les seves cites
- [ ] Adaptar `BookingService` per filtrar per `workerId` si rol és `worker`

### Fase 7 — Neteja i stats (`fix/dashboard-cleanup`)
- [ ] Connectar stats reals al dashboard (serveis actius, total clients)
- [ ] Eliminar Chart.js de `package.json`
- [ ] Corregir textos hardcodejats en català a la pàgina de settings

---

## Canvis al model de dades (Firestore)

### Afegir a col·lecció `bookings`
```
workerId?: string
workerName?: string
```
Retrocompatible — els documents existents sense aquest camp funcionen igual.

### Nova col·lecció `workers`
```
workers/{uid}
  name: string
  email: string
  color: string      // hex color per al calendari
  isActive: boolean
  createdAt: timestamp
```

### Actualitzar `users/{uid}` (rol)
```
role: 'admin' | 'client' | 'worker'   // afegir 'worker'
```

---

## Fitxers clau que s'hauran de modificar (multi-treballador)

| Fitxer | Canvi |
|--------|-------|
| `core/interfaces/booking.interface.ts` | Afegir `workerId?`, `workerName?` |
| `core/services/role.service.ts` | Afegir tipus `worker` |
| `core/guards/auth.guard.ts` | Afegir lògica de worker si cal |
| `core/services/booking.service.ts` | Filtrar per workerId si rol = worker |
| `features/bookings/booking-page/` | Afegir selector de treballador |
| `features/calendar/core/calendar.component.ts` | Filtre per treballador, colors |
| `app.routes.ts` | Nova ruta `/admin/workers` |
| `assets/i18n/*.json` | Afegir claus de traducció per workers |

---

*Última actualització: 2026-02-27*
