# Refactoring del Calendari - Solució ExpressionChangedAfterItHasBeenCheckedError

## Problema Original

L'aplicació tenia dos errors principals:

1. **`ExpressionChangedAfterItHasBeenCheckedError`**: Es produïa cada cop que s'interaccionava amb el calendari. Aquest error es deu a que Angular detecta canvis en les expressions després que ha verificat el cicle de detecció de canvis.

2. **`NG0955: Duplicated keys error`**: Es produïa per claus duplicades en el tracking de col·leccions quan els appointments no tenien IDs únics.

## Causa del Problema

### Error ExpressionChangedAfterItHasBeenCheckedError
El problema estava en la línia 75 del template HTML (`calendar.component.html`) on es cridaven les funcions `getAppointmentTopPx(appt)` i `getAppointmentHeightPx(appt)` dins d'un bucle. Aquestes funcions es cridaven durant el cicle de detecció de canvis i podien retornar valors diferents entre cicles, violant el principi de que les expressions han de ser estables.

### Error NG0955: Duplicated Keys
El problema estava en el tracking de col·leccions quan els appointments no tenien IDs únics. En el template, es feia `track appt.id` però alguns appointments tenien `id` buit o `undefined`, generant claus duplicades.

## Solució Aplicada

### 1. Principis SOLID Aplicats

#### Single Responsibility Principle (SRP)
- **CalendarPositionService**: Gestiona només els càlculs de posició dels appointments
- **CalendarBusinessService**: Gestiona només la lògica de negocis (dies laborables, hores, etc.)
- **CalendarStateService**: Gestiona només l'estat del calendari
- **AppointmentSlotComponent**: Component optimitzat per renderitzar appointments

### 2. Solució per Claus Duplicades

#### Generació d'IDs Únics
- **UUID Generation**: Utilització de `uuidv4()` per generar IDs únics quan no existeixen
- **Tracking Robúst**: Combinació d'`id` i `start` per garantir claus úniques: `track appt.id + '-' + appt.start`
- **Fallback Keys**: Ús de combinació de `title` i `start` com a clau alternativa en serveis

#### Open/Closed Principle (OCP)
- Els serveis són extensibles sense modificar el codi existent
- Els components poden ser estesos amb noves funcionalitats

#### Dependency Inversion Principle (DIP)
- Els components depenen d'abstraccions (serveis) en lloc de concrecions
- Injecció de dependències utilitzant `inject()` d'Angular 18

### 2. Arquitectura de Serveis

#### CalendarPositionService
```typescript
@Injectable({
  providedIn: 'root'
})
export class CalendarPositionService {
  // Càlculs de posició estables
  calculateAppointmentTop(appointment: AppointmentEvent): number
  calculateAppointmentHeight(appointment: AppointmentEvent): number
  getAppointmentPosition(appointment: AppointmentEvent): AppointmentPosition
}
```

#### CalendarBusinessService
```typescript
@Injectable({
  providedIn: 'root'
})
export class CalendarBusinessService {
  // Lògica de negocis
  isBusinessDay(dayOfWeek: number): boolean
  isLunchBreak(time: string): boolean
  getBusinessDaysForWeek(viewDate: Date): Date[]
  generateTimeSlots(): string[]
}
```

#### CalendarStateService
```typescript
@Injectable({
  providedIn: 'root'
})
export class CalendarStateService {
  // Gestió d'estat amb signals
  readonly viewDate = computed(() => this.viewDateSignal());
  readonly selectedDay = computed(() => this.selectedDaySignal());
  // ... altres signals
}
```

### 3. Component Optimitzat

#### AppointmentSlotComponent
- Utilitza `ChangeDetectionStrategy.OnPush` per optimitzar la detecció de canvis
- Computed signals estables que no causen errors de detecció
- Separació clara de responsabilitats

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class AppointmentSlotComponent {
  readonly position = computed(() => {
    return this.positionService.getAppointmentPosition(this.data().appointment);
  });
}
```

### 4. Canvis en el Component Principal

#### CalendarComponent
- Eliminació de lògica de càlcul directa
- Delegació a serveis especialitzats
- Ús de `ChangeDetectionStrategy.OnPush`
- Signals estables per evitar errors de detecció

## Beneficis Obtinguts

### 1. Eliminació d'Errors
- L'error `ExpressionChangedAfterItHasBeenCheckedError` ha estat completament eliminat
- L'error `NG0955: Duplicated keys` ha estat solucionat amb IDs únics
- Les expressions ara són estables durant el cicle de detecció de canvis

### 2. Millora de Rendiment
- `ChangeDetectionStrategy.OnPush` redueix el nombre de cicles de detecció
- Computed signals optimitzats
- Menys càlculs innecessaris

### 3. Mantenibilitat
- Codi més modular i fàcil de mantenir
- Separació clara de responsabilitats
- Tests més fàcils de realitzar

### 4. Escalabilitat
- Fàcil afegir noves funcionalitats
- Serveis reutilitzables
- Arquitectura extensible

## Funcionalitats Mantingudes

✅ **100% de les funcionalitats actuals han estat preservades:**
- Posicionament exacte dels appointments
- Càlcul correcte de l'altura dels elements
- Interaccions amb el calendari
- Navegació entre setmanes
- Gestió d'appointments
- Pausa per dinar
- Dies laborables
- Validacions de disponibilitat

## Estructura de Fitxers

```
src/app/features/calendar/
├── calendar.component.ts          # Component principal refactoritzat
├── calendar.component.html        # Template actualitzat
├── calendar.component.scss        # Estils (sense canvis)
├── calendar-position.service.ts   # Servei de posicionament
├── calendar-business.service.ts   # Servei de lògica de negocis
├── calendar-state.service.ts      # Servei d'estat
├── appointment-slot.component.ts  # Component optimitzat
├── appointment-slot.component.scss # Estils del component
└── REFACTORING.md                 # Aquesta documentació
```

## Comprovació de la Solució

Per verificar que els errors han estat solucionats:

1. **Executar l'aplicació**: `npm start`
2. **Interaccionar amb el calendari**: Clicar en slots, navegar entre setmanes
3. **Verificar la consola**: No hi ha d'haver errors de:
   - `ExpressionChangedAfterItHasBeenCheckedError`
   - `NG0955: Duplicated keys`
4. **Comprovar funcionalitats**: Totes les funcionalitats han de funcionar correctament
5. **Verificar tracking**: Els appointments han de renderitzar-se correctament sense claus duplicades

## Conclusió

La refactorització ha solucionat completament els errors de detecció de canvis i claus duplicades aplicant els principis SOLID d'Angular 18. L'arquitectura ara és més robusta, mantenible i escalable, mantenint el 100% de les funcionalitats existents.

### Resum de Solucions Implementades

1. **ExpressionChangedAfterItHasBeenCheckedError**: Solucionat amb serveis especialitzats i computed signals estables
2. **NG0955: Duplicated keys**: Solucionat amb generació d'IDs únics i tracking robúst
3. **Rendiment**: Optimitzat amb `ChangeDetectionStrategy.OnPush`
4. **Mantenibilitat**: Millorada amb separació de responsabilitats

## Millores del Popup de Reserva

### Noves Funcionalitats
- **Selecció de Data i Hora**: El popup ara permet canviar fàcilment la data i l'hora seleccionades
- **Calendari Integrat**: Selector de data amb calendari visual i validació de dates mínimes
- **Dropdown d'Hores**: Selector d'hores amb opcions predefinides (excloent la pausa per dinar)
- **Estils Consistents**: Tots els inputs del popup tenen estils consistents amb la resta de l'aplicació

### Millores d'Experiència d'Usuari
- **Interfície Intuïtiva**: Selecció de data i hora més fàcil i visual
- **Validació en Temps Real**: Les dates no poden ser anteriors a avui
- **Responsive Design**: Layout adaptatiu per dispositius mòbils
- **Consistència Visual**: Colors i estils unificats amb el sistema de disseny

### Estils Aplicats
- **Colors Consistents**: Ús de les variables CSS globals (`--primary-color`, `--border-color`, etc.)
- **Borders i Focus**: Estils de focus i hover consistents amb altres inputs
- **Espaiat i Mides**: Mides estàndard (48px d'altura) per tots els inputs
- **Transicions**: Animacions suaus per millor feedback visual 
