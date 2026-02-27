# PeluApp — Roadmap i Anàlisi de Funcionalitats

> Filosofia: app **simple, centralitzada, única font de veritat**, usable per clients IRL.
> Backend: Firebase (Firestore + Auth) ja desplegat i funcionant.

---

## Estat actual: ~70% completat

### Implementat i funcional ✅
- Autenticació Firebase (email/password + Google OAuth)
- Gestió de reserves CRUD completa amb temps real
- Calendari interactiu (setmanal + diari) amb drag & drop
- Gestió de serveis CRUD
- Pàgina d'ajustos d'administrador completa
- Sistema de rols: `admin` / `client`
- Internacionalització: ca, es, en, ar (amb suport RTL)
- Components UI compartits (inputs, buttons, toasts, loader...)
- Guards de rutes (auth, admin, public)
- Filtre de client al calendari (branca actual)

---

## Problemes crítics a resoldre

### 🔴 1. Reset de contrasenya — FALTA
Un client que oblida la contrasenya no pot recuperar-la.
Firebase Auth ja ho suporta amb un sol mètode. Molt petita d'implementar.

### 🔴 2. Emails de confirmació DESACTIVATS
Tot el sistema d'EmailJS ja existeix a `hybrid-email.service.ts` però
les crides estan comentades a `booking.service.ts:174-183`.
El client no rep confirmació quan fa una reserva.

### 🟠 3. Edició de perfil d'usuari
La pàgina `/perfil` és **només lectura**. L'usuari no pot canviar el seu nom
ni telèfon des de l'app.

### 🟠 4. Stats del dashboard a zero
`AppStateService` retorna hardcoded `0` per a: total serveis, serveis actius,
nombre d'usuaris. El dashboard de l'admin és inútil en producció.

### 🟠 5. Llistat de clients per admin — FALTA
L'admin no pot veure qui es registrat, ni editar/veure perfils de clients.
`user.service.ts` ja té `listAllUsers()` però no hi ha cap pàgina que el mostri.

### ✅ Ruta `/playground` protegida (Fase 0)
Ara requereix `adminGuard`. Els clients no hi poden accedir.

### 🟡 7. Chart.js instal·lat però no s'usa
Afegeix ~200KB al bundle. Cal usar-lo o eliminar-lo.

---

## Nova funcionalitat: Multi-treballador (simple)

### Concepte
Mantenir la filosofia senzilla: un treballador és un usuari amb rol `worker`.
Comparteix els mateixos horaris de negoci que l'admin configura.
No cal gestió d'horaris individuals per treballador.

### Model de dades

**Nou rol** (afegir a `RoleService`):
```
admin → gestió total
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
  - id: string
  - name: string
  - email: string
  - color: string      // Color identificador al calendari
  - isActive: boolean
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
        ├── calendar_improves  ← BRANCA ACTUAL → merge a dev aviat
        ├── fix/critical-ux          (password reset + emails)
        ├── feat/admin-clients       (llistat + edició de clients)
        ├── feat/profile-editing     (usuari edita el seu propi perfil)
        ├── feat/workers             (multi-treballador)
        └── fix/dashboard-cleanup   (stats reals + eliminar playground + Chart.js)
```

**Regla**: cada branca és **independent**, es crea des de `dev` i es fusiona a `dev`.
Quan `dev` és estable es fa merge a `master` per desplegar.

---

## Ordre d'execució recomanat

### Fase 0 — En curs (branca `calendar_improves`)
- [x] Millores del calendari i filtres de client per nom
- [x] Fix PrimeNG: afegir `darkModeSelector: false` a `app.config.ts` (sempre mode clar)
- [x] Neteja CSS: eliminar ~20 `background-color: white !important` de `styles-primeng.scss` que eren workarounds del mode fosc
- [x] Protegir `/playground` amb `adminGuard` (només admins)
- [ ] Merge a `dev`

### Fase 1 — Quick wins crítics (branca `fix/critical-ux`)
- [ ] Implementar reset de contrasenya (Firebase `sendPasswordResetEmail`)
- [ ] Reactivar emails de confirmació (`booking.service.ts`)
- [ ] Eliminar ruta `/playground` o protegir-la amb `adminGuard`

### Fase 2 — Gestió de clients per admin (branca `feat/admin-clients`)
- [ ] Nova pàgina `/admin/clients` amb llistat de tots els usuaris
- [ ] Veure perfil complet d'un client (reserves, dades)
- [ ] Editar nom i telèfon d'un client des de l'admin
- [ ] Botó de promotre/demote ja existent, integrar a la UI

### Fase 3 — Edició de perfil propi (branca `feat/profile-editing`)
- [ ] La pàgina `/perfil` permet editar nom i telèfon
- [ ] Persistència a Firestore (col·lecció `users/{uid}`)

### Fase 4 — Multi-treballador (branca `feat/workers`)
- [ ] Afegir rol `worker` a `RoleService` i guards
- [ ] Afegir `workerId` i `workerName` a `Booking` interface
- [ ] Crear `workers.service.ts` amb CRUD a Firestore
- [ ] Nova pàgina `/admin/workers` amb llistat + crear/editar/desactivar
- [ ] Adaptar booking form: selector de treballador preferit
- [ ] Adaptar calendari: selector de treballador per admin, filtre de color
- [ ] Guard per a treballadors: veu només les seves cites
- [ ] Adaptar `BookingService` per filtrar per `workerId` si rol és `worker`

### Fase 5 — Neteja i stats (branca `fix/dashboard-cleanup`)
- [ ] Connectar stats reals al dashboard (serveis actius, total clients)
- [ ] Eliminar Chart.js de `package.json` si no s'usa
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
