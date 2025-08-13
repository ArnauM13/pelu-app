## Algorisme de càlcul de posicions dels appointments (top/height)

Aquest document descriu com es calculen les posicions verticals en píxels (top) i les alçades (height) dels appointments dins del calendari. El sistema és totalment reactiu: canvis en la configuració de graella (durada de slot, alçada del slot, horari laboral, pausa de dinar, durada base de cita) recalculen automàticament totes les posicions.

### Visió general del flux

- El component `CalendarComponent` agrega els events (bookings) i delega el càlcul de posicions al servei `CalendarCoreService`.
- `CalendarCoreService` manté la configuració de graella via senyals, fa conversions temps↔píxels i calcula `top` i `height` de cada cita.
- Els components visuals (p. ex. `AppointmentSlotComponent`) només llegeixen els resultats i pinten.

Fragments rellevants:

```ts
// src/app/features/calendar/core/calendar.component.ts
readonly appointmentPositions = computed(() => {
  const appointments = this.allEvents();
  return this.calendarCoreService.getAppointmentPositions(appointments);
});
```

---

### Configuració de graella i senyals reactius

La graella té aquests paràmetres clau:

- slotHeightPx: alçada d’un slot (p. ex. 30 px)
- slotDurationMinutes: minuts per slot (p. ex. 30 o 60)
- pixelsPerMinute: píxels per minut (derivat com `slotHeightPx / slotDurationMinutes`)
- businessStartHour / businessEndHour: horari laboral
- lunchBreakStart / lunchBreakEnd: pausa de dinar
- bookingDurationMinutes: durada base per a cites sense durada específica

```ts
// src/app/features/calendar/services/calendar-core.service.ts
private readonly slotHeightPxSignal = signal<number>(30);
private readonly pixelsPerMinuteSignal = signal<number>(1);
private readonly slotDurationMinutesSignal = signal<number>(30);
...
readonly gridConfiguration = computed(() => ({
  slotHeightPx: this.slotHeightPxSignal(),
  pixelsPerMinute: this.pixelsPerMinuteSignal(),
  slotDurationMinutes: this.slotDurationMinutesSignal(),
  businessStartHour: this.businessStartHourSignal(),
  businessEndHour: this.businessEndHourSignal(),
  lunchBreakStart: this.lunchBreakStartSignal(),
  lunchBreakEnd: this.lunchBreakEndSignal(),
  bookingDurationMinutes: this.bookingDurationMinutesSignal(),
}));

readonly reactiveSlotHeight = computed(() => this.gridConfiguration().slotHeightPx);
readonly reactivePixelsPerMinute = computed(() => this.gridConfiguration().pixelsPerMinute);
readonly reactiveSlotDuration = computed(() => this.gridConfiguration().slotDurationMinutes);
readonly reactiveBookingDuration = computed(() => this.gridConfiguration().bookingDurationMinutes);
```

Alineació amb paràmetres de sistema (deriva pixels/min i sincronitza durada de slot amb durada base de cita):

```ts
// src/app/features/calendar/services/calendar-core.service.ts
effect(() => {
  const bookingDuration = this.systemParametersService.getAppointmentDuration();
  const slotHeight = this.slotHeightPxSignal();
  const pixelsPerMinute = slotHeight / bookingDuration;

  this.slotDurationMinutesSignal.set(bookingDuration);
  this.bookingDurationMinutesSignal.set(bookingDuration);
  this.pixelsPerMinuteSignal.set(pixelsPerMinute);
});
```

Inicialització del component (fixa alçada d’slot):

```ts
// src/app/features/calendar/core/calendar.component.ts
this.calendarCoreService.updateGridConfiguration({
  slotHeightPx: 30,
});
```

---

### Conversions temps ↔ píxels

De temps (HH:mm) a posició vertical (píxels):

Fórmula: `top = ((minutsDesDeInici / slotDurationMinutes) * slotHeightPx)`

```ts
// src/app/features/calendar/services/calendar-core.service.ts
timeToCoordinate(time: string): number {
  const config = this.gridConfiguration();
  const slotHeight = this.reactiveSlotHeight();
  const [hours, minutes] = time.split(':').map(Number);

  const minutesSinceStart = (hours - config.businessStartHour) * 60 + minutes;
  const slotsSinceStart = minutesSinceStart / config.slotDurationMinutes;
  return slotsSinceStart * slotHeight;
}
```

De posició vertical (píxels) a temps (HH:mm), amb clamp dins jornada:

```ts
// src/app/features/calendar/services/calendar-core.service.ts
coordinateToTime(yPosition: number): string {
  const config = this.gridConfiguration();
  const slotHeight = this.reactiveSlotHeight();
  const minutesSinceStart = Math.floor((yPosition / slotHeight) * config.slotDurationMinutes);
  const totalMinutes = config.businessStartHour * 60 + minutesSinceStart;
  ... // clamp a businessStartHour..businessEndHour
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
```

Alineació d’hores a la quadrícula (arrodonir cap avall al múltiple de slot):

```ts
// src/app/features/calendar/services/calendar-core.service.ts
alignTimeToGrid(time: string): string {
  const slotDuration = this.reactiveSlotDuration();
  const [hours, minutes] = time.split(':').map(Number);
  const alignedMinutes = Math.floor(minutes / slotDuration) * slotDuration;
  ...
  return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
}
```

---

### Càlcul de posició d’una cita (AppointmentEvent)

Inputs:

- `start` (obligatori): ISO local `YYYY-MM-DDTHH:mm`
- `end` (opcional): si hi és, substitueix la durada
- `duration` (opcional): en minuts; si no hi és, s’usa `reactiveBookingDuration()`

Fórmules:

- `top`: es deriva de `start` amb `timeToCoordinate(startHH:mm)`
- `effectiveDuration`: si hi ha `end` → `end − start`; sinó `duration || reactiveBookingDuration()`
- `height`: `effectiveDuration × pixelsPerMinute`

```ts
// src/app/features/calendar/services/calendar-core.service.ts
calculateReactiveAppointmentPosition(appointment: AppointmentEvent): AppointmentPosition {
  if (!appointment.start) { return { top: 0, height: 0 }; }
  const startDate = new Date(appointment.start);
  const timeString = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
  const top = this.timeToCoordinate(timeString);

  let effectiveDuration = appointment.duration || this.reactiveBookingDuration();
  if (appointment.end) {
    const endDate = new Date(appointment.end);
    const diffMin = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
    if (diffMin > 0) { effectiveDuration = diffMin; }
  }

  const height = effectiveDuration * this.reactivePixelsPerMinuteFromSettings();
  return { top, height };
}
```

Càlcul directe per un temps i durada (útil per a previsualitzacions/indicadors):

```ts
// src/app/features/calendar/services/calendar-core.service.ts
calculateAppointmentPositionFromTime(startTime: string, durationMinutes: number) {
  const top = this.timeToCoordinate(startTime);
  const height = durationMinutes * this.reactivePixelsPerMinuteFromSettings();
  return { top, height };
}
```

Processament en lot:

```ts
// src/app/features/calendar/services/calendar-core.service.ts
getAppointmentPositions(appointments: AppointmentEvent[]): Map<string, AppointmentPosition> {
  const positions = new Map<string, AppointmentPosition>();
  appointments.forEach(appointment => {
    const key = appointment.id || `${appointment.title}-${appointment.start}`;
    positions.set(key, this.calculateReactiveAppointmentPosition(appointment));
  });
  return positions;
}
```

Consum al component visual del slot (cada targeta):

```ts
// src/app/features/calendar/slots/appointment-slot.component.ts
readonly position = computed(() => {
  if (!this.data()?.appointment) return { top: 0, height: 0 };
  return this.calendarCoreService.calculateReactiveAppointmentPosition(this.data()!.appointment!);
});
```

---

### Dies, time slots i estat clicable/disabled

Cada columna de dia conté `timeSlots` amb metadades: si és dinar, és passat, és disponible, etc. Això afecta si es pot clicar o reservar.

```ts
// src/app/features/calendar/core/calendar.component.ts
readonly dayColumnsData = computed(() => {
  return this.weekDays().map(day => {
    const timeSlots = this.timeSlots().map(time => ({
      date: day,
      time,
      isAvailable: this.isTimeSlotAvailable(day, time),
      isLunchBreak: this.isLunchBreak(time),
      isPastDate: this.isPastDate(day),
      isPastTime: this.isPastTimeSlot(day, time),
      isClickable: this.isTimeSlotAvailable(day, time),
      isDisabled: this.isPastDate(day) || this.isPastTimeSlot(day, time) || this.isLunchBreak(time),
      tooltip: this.getTimeSlotTooltip(day, time),
    }));
    return { date: day, timeSlots, ... } as any;
  });
});
```

La disponibilitat evita solapaments, forçant durades reals de cada cita existent:

```ts
// src/app/features/calendar/services/calendar-core.service.ts
isTimeSlotAvailable(date: Date, time: string, appointments: AppointmentEvent[], requestedDuration: number = this.reactiveBookingDuration()): boolean {
  const [hour, minute] = time.split(':').map(Number);
  const slotStart = new Date(date);
  slotStart.setHours(hour, minute, 0, 0);
  const slotEnd = addMinutes(slotStart, requestedDuration);
  if (!this.isTimeSlotBookable(time)) return false;
  return !appointments.some(appointment => {
    if (!appointment.start) return false;
    const appointmentStart = new Date(appointment.start);
    const appointmentEnd = appointment.end ? new Date(appointment.end) : addMinutes(appointmentStart, appointment.duration || this.reactiveBookingDuration());
    return appointmentStart < slotEnd && appointmentEnd > slotStart;
  });
}
```

---

### Drag & Drop: posició objectiu i validacions

Quan arrosseguem dins una columna de dia, es converteix la `clientY` a hora amb `coordinateToTime()` i s’alinea amb `alignTimeToGrid()`. Es valida que el drop:

- sigui dins horari laboral
- no acabi dins la pausa de dinar (fi exacta permesa a l’inici de dinar)
- no solapi cap altra cita (usant la durada real de cada servei)

```ts
// src/app/features/calendar/services/calendar-core.service.ts
updateTargetDateTime(position: { top: number; left: number }, dayColumn: Date): void {
  const timePosition = this.coordinateToTimePosition({ x: position.left, y: position.top }, dayColumn);
  this.targetDateSignal.set(dayColumn);
  this.targetTimeSignal.set(timePosition.time);
  if (this.draggedAppointment()) {
    const isValid = this.isValidDropPosition(this.draggedAppointment()!, dayColumn, timePosition.time);
    this.isValidDropSignal.set(isValid);
  }
}
```

Validacions completes:

```ts
// src/app/features/calendar/services/calendar-core.service.ts
private isValidDropPosition(appointment: AppointmentEvent, targetDate: Date, targetTime: string): boolean {
  if (!this.isTimeSlotBookable(targetTime)) return false;

  const appointmentDuration = appointment.duration || this.reactiveBookingDuration();
  const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
  const targetStartTime = new Date(targetDate);
  targetStartTime.setHours(targetHours, targetMinutes, 0, 0);
  const targetEndTime = addMinutes(targetStartTime, appointmentDuration);
  const endStr = `${targetEndTime.getHours().toString().padStart(2, '0')}:${targetEndTime.getMinutes().toString().padStart(2, '0')}`;

  if (!this.isWithinBusinessHours(endStr) && endStr !== `${this.gridConfiguration().businessEndHour.toString().padStart(2, '0')}:00`) return false;
  if (this.isLunchBreakTime(endStr) && endStr !== `${this.gridConfiguration().lunchBreakStart.toString().padStart(2, '0')}:00`) return false;

  const existingAppointments = this.bookingService.bookings();
  const isSlotOccupied = existingAppointments.some(existing => {
    if (!existing.data || !existing.hora || existing.id === appointment.id) return false;
    const existingStart = new Date(`${existing.data}T${existing.hora}`);
    let existingDuration = this.reactiveBookingDuration();
    if (existing.serviceId) {
      const servicesService = this.injector.get(ServicesService);
      const service = servicesService.getAllServices().find((s: any) => s.id === existing.serviceId);
      if (service) existingDuration = service.duration;
    }
    const existingEnd = addMinutes(existingStart, existingDuration);
    const targetEnd = addMinutes(targetStartTime, appointmentDuration);
    return existingStart < targetEnd && existingEnd > targetStartTime;
  });
  return !isSlotOccupied;
}
```

Indicador de drop (previsualització mentre arrosseguem):

```ts
// src/app/features/calendar/core/calendar.component.ts
const dropIndicator = this.calendarCoreService.isDragging() ? (() => {
  const position = this.calendarCoreService.calculateAppointmentPositionFromTime(
    this.calendarCoreService.targetTime()!,
    this.calendarCoreService.draggedAppointment()!.duration || this.calendarCoreService.reactiveBookingDuration()
  );
  return { top: position.top, height: position.height, isValid: this.calendarCoreService.isValidDrop() };
})() : null;
```

---

### Pausa de dinar

Es pinta com un bloc vertical calculant `top` i `height` igual que una cita, però amb la finestra de dinar.

```ts
// src/app/features/calendar/services/calendar-core.service.ts
getLunchBreakPosition(): { top: number; height: number } {
  const lunchBreak = this.systemParametersService.lunchBreak();
  const startTime = `${lunchBreak.start.toString().padStart(2, '0')}:00`;
  const top = this.timeToCoordinate(startTime);
  const height = (lunchBreak.end - lunchBreak.start) * 60 * this.reactivePixelsPerMinuteFromSettings();
  return { top, height };
}
```

Integració per dia:

```ts
// src/app/features/calendar/core/calendar.component.ts
calculateLunchBreakData(day: Date) {
  if (this.isPastDate(day) || !this.businessService.isBusinessDay(day)) return null;
  const position = this.calendarCoreService.getLunchBreakPosition();
  const timeRange = this.calendarCoreService.getLunchBreakTimeRange();
  return { top: position.top, height: position.height, timeRange };
}
```

---

### Reactivitat i actualitzacions

- Canviar `slotHeightPx`, `slotDurationMinutes` o la `bookingDurationMinutes` (o els paràmetres de sistema que les governen) recalcula automàticament `pixelsPerMinute` i, per tant, totes les alçades i posicions.
- Quan canvien hores laborals o la pausa de dinar, els efectes tornen a inicialitzar la graella i forcen un refresc segur del calendari.

```ts
// src/app/features/calendar/core/calendar.component.ts
effect(() => {
  const _businessHours = this.businessHours();
  const _lunchBreak = this.lunchBreak();
  const _businessDays = this.businessDays();
  this.initializeCoordinateService();
  this.isInitializedSignal.update(() => true);
});
```

---

### Resum operatiu

- top: mapatge HH:mm → minuts des de l’inici de jornada → fracció d’slot → píxels
- height: durada efectiva en minuts × píxels/minut
- píxels/minut: `slotHeightPx / slotDurationMinutes`
- Validació i DnD: mateix motor, comprovant horari, dinar i solapaments reals
- Canvis de paràmetres → effects → senyals → recalcul automàtic i immediat


