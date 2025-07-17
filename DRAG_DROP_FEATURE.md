# Funcionalitat de Drag & Drop per Cites

## Descripció

S'ha implementat una nova funcionalitat que permet arrossegar i deixar anar les cites del calendari per canviar-ne la data i hora. La funcionalitat està integrada amb el sistema existent i manté la sincronització amb localStorage.

## Característiques

### ✅ Funcionalitats Implementades

1. **Drag & Drop Intuitiu**
   - Les cites es poden arrossegar directament des del calendari
   - **NOVA**: Suport per arrossegar cites entre dies diferents
   - Feedback visual durant l'operació de drag
   - Indicador visual per mostrar si la posició de destí és vàlida

2. **Validació Intel·ligent**
   - No es permet deixar anar cites en horaris ja ocupats
   - Validació en temps real durant el drag
   - Feedback visual diferent per posicions vàlides i invàlides
   - **NOVA**: Validació entre dies diferents

3. **Integració Completa**
   - Sincronització automàtica amb localStorage
   - Actualització immediata del calendari
   - Compatibilitat amb el sistema de colors de serveis existent
   - **NOVA**: Actualització de data i hora quan es mou entre dies

4. **Experiència d'Usuari**
   - Drag handle visible per indicar que es pot arrossegar
   - Animacions suaus durant el drag
   - Retorn a la posició original si el drop no és vàlid
   - **NOVA**: Preview global que segueix el cursor durant el drag

## Components Modificats

### 1. `CalendarDragDropService` (Actualitzat)
- Gestiona l'estat del drag & drop
- Valida les posicions de destí
- Actualitza les dades de les cites
- **NOVA**: Suport per tracking de data original i destí
- **NOVA**: Mètode per detectar canvis de dia

### 2. `AppointmentSlotComponent` (Actualitzat)
- **NOVA**: Implementació personalitzada de drag sense CDK
- Drag handle visual
- Gestió d'events de drag globals
- **NOVA**: Suport per cross-day dragging

### 3. `CalendarComponent` (Actualitzat)
- Integració amb el service de drag & drop
- Drop zones per cada columna de dia
- Feedback visual durant el drag
- **NOVA**: Preview global del drag
- **NOVA**: Mètodes per formatar durada i classes CSS

## Com Utilitzar

1. **Arrossegar una Cita**
   - Fes clic i manté premut sobre una cita al calendari
   - Arrossega la cita a la nova posició desitjada (mateix dia o dia diferent)
   - Observa el feedback visual (verd = vàlid, vermell = invàlid)
   - **NOVA**: El preview segueix el cursor per tota la pantalla

2. **Deixar Anar**
   - Si la posició és vàlida (fons verd), deixa anar per confirmar
   - Si la posició és invàlida (fons vermell), la cita tornarà a la posició original
   - **NOVA**: La cita es pot moure a qualsevol dia de la setmana

3. **Validació Automàtica**
   - El sistema verifica automàticament si hi ha conflictes
   - No es permeten solapaments amb altres cites
   - Es respecten els horaris de negoci i pausa per dinar
   - **NOVA**: Validació entre dies diferents

## Estructura Tècnica

### Signals i Reactivitat
```typescript
// Estat del drag & drop
readonly isDragging = computed(() => this.isDraggingSignal());
readonly isValidDrop = computed(() => this.isValidDropSignal());
readonly draggedAppointment = computed(() => this.draggedAppointmentSignal());
readonly originalDate = computed(() => this.originalDateSignal()); // NOVA
```

### Validació de Posicions
```typescript
private isValidDropPosition(appointment: AppointmentEvent, targetDate: Date, targetTime: string): boolean {
  // Verifica conflictes amb altres cites
  // Respecta horaris de negoci
  // Valida durada de la cita
  // NOVA: Funciona entre dies diferents
}
```

### Implementació de Drag Personalitzat
```typescript
// Al component
onMouseDown(event: MouseEvent) {
  // Inicia el drag amb data original
  this.dragDropService.startDrag(appointment, originalPosition, this.data()!.date);
  
  // Afegeix listeners globals per cross-day dragging
  document.addEventListener('mousemove', this.onGlobalMouseMove);
  document.addEventListener('mouseup', this.onGlobalMouseUp);
}
```

### Detecció de Clicks vs Drag
```typescript
// Thresholds configurables
private readonly CLICK_THRESHOLD = 300; // ms - temps màxim per considerar un click
private readonly DRAG_THRESHOLD = 8; // pixels - distància mínima per considerar un drag

// Lògica de detecció
onMouseDown(event: MouseEvent) {
  // Registra temps i posició inicial
  this.mouseDownTime = Date.now();
  this.mouseDownPosition = { x: event.clientX, y: event.clientY };
  
  // Timeout per detectar drag
  this.clickTimeout = window.setTimeout(() => {
    this.startDrag(event);
  }, this.CLICK_THRESHOLD);
}

onMouseMove(event: MouseEvent) {
  // Si el cursor es mou més del threshold, inicia el drag
  const deltaX = Math.abs(event.clientX - this.mouseDownPosition.x);
  const deltaY = Math.abs(event.clientY - this.mouseDownPosition.y);
  
  if (deltaX > this.DRAG_THRESHOLD || deltaY > this.DRAG_THRESHOLD) {
    this.startDrag(event);
  }
}

onMouseUp(event: MouseEvent) {
  // Si és un click ràpid, emet l'event de click
  const clickDuration = Date.now() - this.mouseDownTime;
  if (clickDuration < this.CLICK_THRESHOLD && !this.isDragging) {
    this.onAppointmentClick(event);
  }
}
```

## Estils CSS

### Classes de Feedback Visual
- `.drag-over`: Indica que s'està fent drag sobre la zona
- `.drop-valid`: Posició de destí vàlida (fons verd)
- `.drop-invalid`: Posició de destí invàlida (fons vermell)
- `.dragging`: Estat durant el drag (opacitat reduïda)
- **NOVA**: `.global-drag-preview`: Preview global del drag

### Animacions
- Transicions suaus per canvis d'estat
- Rotació lleugera del preview durant el drag
- Animacions de retorn a posició original
- **NOVA**: Preview que segueix el cursor

## Compatibilitat

- ✅ Angular 18
- ✅ Sistema de colors de serveis existent
- ✅ localStorage
- ✅ Responsive design
- ❌ CDK Drag & Drop (eliminat per suport cross-day)

## Limitacions Actuals

- ~~El drag només funciona dins del mateix dia~~ ✅ **RESOLT**: Ara funciona entre dies
- No suporta redimensionament de cites
- Requereix implementació personalitzada de drag

## Millores Implementades

### Cross-Day Dragging
- Les cites es poden moure entre dies diferents de la setmana
- El sistema actualitza automàticament la data i hora
- Validació entre dies diferents
- Preview global que segueix el cursor

### Experiència d'Usuari Millorada
- Feedback visual més clar durant el drag
- Preview que mostra la cita que s'està arrossegant
- Transicions més suaus
- Millor indicació de zones vàlides/invàlides

### Click vs Drag Detection
- **NOVA**: Detecció intel·ligent entre clicks i drag&drop
- Clicks ràpids obren el popup de detall de la cita
- Drag&drop requereix mantenir premut i moure el cursor
- Thresholds configurables per evitar drags accidentals
- Feedback visual diferent per clicks i drags

### Toast Notifications
- **NOVA**: Toast específic per operacions de drag&drop
- Missatge diferent de les edicions normals
- Informació detallada de la nova data i hora
- No confusió amb els toasts d'edició 
