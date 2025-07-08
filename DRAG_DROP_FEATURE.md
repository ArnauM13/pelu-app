# Funcionalitat de Drag & Drop per Cites

## Descripció

S'ha implementat una nova funcionalitat que permet arrossegar i deixar anar les cites del calendari per canviar-ne la data i hora. La funcionalitat està integrada amb el sistema existent i manté la sincronització amb localStorage.

## Característiques

### ✅ Funcionalitats Implementades

1. **Drag & Drop Intuitiu**
   - Les cites es poden arrossegar directament des del calendari
   - Feedback visual durant l'operació de drag
   - Indicador visual per mostrar si la posició de destí és vàlida

2. **Validació Intel·ligent**
   - No es permet deixar anar cites en horaris ja ocupats
   - Validació en temps real durant el drag
   - Feedback visual diferent per posicions vàlides i invàlides

3. **Integració Completa**
   - Sincronització automàtica amb localStorage
   - Actualització immediata del calendari
   - Compatibilitat amb el sistema de colors de serveis existent

4. **Experiència d'Usuari**
   - Drag handle visible per indicar que es pot arrossegar
   - Animacions suaus durant el drag
   - Retorn a la posició original si el drop no és vàlid

## Components Modificats

### 1. `CalendarDragDropService` (Nou)
- Gestiona l'estat del drag & drop
- Valida les posicions de destí
- Actualitza les dades de les cites

### 2. `AppointmentSlotComponent` (Actualitzat)
- Afegit suport per CDK Drag & Drop
- Drag handle visual
- Gestió d'events de drag

### 3. `CalendarComponent` (Actualitzat)
- Integració amb el service de drag & drop
- Drop zones per cada columna de dia
- Feedback visual durant el drag

## Com Utilitzar

1. **Arrossegar una Cita**
   - Fes clic i manté premut sobre una cita al calendari
   - Arrossega la cita a la nova posició desitjada
   - Observa el feedback visual (verd = vàlid, vermell = invàlid)

2. **Deixar Anar**
   - Si la posició és vàlida (fons verd), deixa anar per confirmar
   - Si la posició és invàlida (fons vermell), la cita tornarà a la posició original

3. **Validació Automàtica**
   - El sistema verifica automàticament si hi ha conflictes
   - No es permeten solapaments amb altres cites
   - Es respecten els horaris de negoci i pausa per dinar

## Estructura Tècnica

### Signals i Reactivitat
```typescript
// Estat del drag & drop
readonly isDragging = computed(() => this.isDraggingSignal());
readonly isValidDrop = computed(() => this.isValidDropSignal());
readonly draggedAppointment = computed(() => this.draggedAppointmentSignal());
```

### Validació de Posicions
```typescript
private isValidDropPosition(appointment: AppointmentEvent, targetDate: Date, targetTime: string): boolean {
  // Verifica conflictes amb altres cites
  // Respecta horaris de negoci
  // Valida durada de la cita
}
```

### Integració amb CDK
```typescript
// Al template
<div cdkDrag [cdkDragData]="appointment" (cdkDragStarted)="onDragStarted($event)">
  <div cdkDragHandle class="drag-handle">
    <!-- Indicador visual -->
  </div>
</div>
```

## Estils CSS

### Classes de Feedback Visual
- `.drag-over`: Indica que s'està fent drag sobre la zona
- `.drop-valid`: Posició de destí vàlida (fons verd)
- `.drop-invalid`: Posició de destí invàlida (fons vermell)
- `.dragging`: Estat durant el drag (opacitat reduïda)

### Animacions
- Transicions suaus per canvis d'estat
- Rotació lleugera del preview durant el drag
- Animacions de retorn a posició original

## Compatibilitat

- ✅ Angular 18
- ✅ CDK Drag & Drop
- ✅ Sistema de colors de serveis existent
- ✅ localStorage
- ✅ Responsive design

## Limitacions Actuals

- El drag només funciona dins del mateix dia (no entre dies diferents)
- No suporta redimensionament de cites
- Requereix CDK Drag & Drop instal·lat

## Futurs Milloraments

- Suport per drag entre dies diferents
- Redimensionament de cites
- Undo/Redo per operacions de drag
- Feedback sonor per operacions exitoses/fallides 
