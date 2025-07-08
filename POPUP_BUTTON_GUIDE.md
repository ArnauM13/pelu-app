# Guia: Ocultar Botó "Veure Detall" del Popup

Aquesta guia explica com utilitzar la nova funcionalitat per ocultar el botó "Veure detall" del popup de cites quan ja estàs a la pàgina de detall.

## Canvis Realitzats

### 1. **Nou Input al Popup**
S'ha afegit un nou input `hideViewDetailButton` al component `AppointmentDetailPopupComponent`:

```typescript
// Input signals
readonly open = input<boolean>(false);
readonly appointment = input<Appointment | null>(null);
readonly hideViewDetailButton = input<boolean>(false); // NOU
```

### 2. **Lògica Condicional al Template**
El botó "Veure detall" ara es mostra condicionalment:

```html
<!-- Actions -->
@if (!hideViewDetailButton()) {
<div class="popup-actions">
  <button
    class="btn btn-primary"
    (click)="onViewFullDetail()"
    [title]="'APPOINTMENTS.VIEW_FULL_DETAIL' | translate">
    <i class="pi pi-external-link"></i>
    {{ 'APPOINTMENTS.VIEW_FULL_DETAIL' | translate }}
  </button>
</div>
}
```

### 3. **Implementació a la Pàgina de Detall**
A la pàgina de detall de cites, el popup s'oculta automàticament:

```html
<!-- Appointment Detail Popup (hidden from detail page) -->
<pelu-appointment-detail-popup
  [open]="false"
  [appointment]="null"
  [hideViewDetailButton]="true"
  (closed)="onPopupClosed()">
</pelu-appointment-detail-popup>
```

## Com Utilitzar

### Opció 1: Ocultar Completament (Recomanat per pàgines de detall)

```html
<pelu-appointment-detail-popup
  [open]="showPopup()"
  [appointment]="selectedAppointment()"
  [hideViewDetailButton]="true"
  (closed)="onPopupClosed()">
</pelu-appointment-detail-popup>
```

### Opció 2: Mostrar normalment (Comportament per defecte)

```html
<pelu-appointment-detail-popup
  [open]="showPopup()"
  [appointment]="selectedAppointment()"
  [hideViewDetailButton]="false"
  (closed)="onPopupClosed()">
</pelu-appointment-detail-popup>
```

### Opció 3: Control Dinàmic

```typescript
export class MyComponent {
  readonly isDetailPage = computed(() => {
    return this.router.url.includes('/appointments/');
  });

  readonly shouldHideButton = computed(() => {
    return this.isDetailPage();
  });
}
```

```html
<pelu-appointment-detail-popup
  [open]="showPopup()"
  [appointment]="selectedAppointment()"
  [hideViewDetailButton]="shouldHideButton()"
  (closed)="onPopupClosed()">
</pelu-appointment-detail-popup>
```

## Casos d'Ús

### 1. **Pàgina de Detall de Cites**
- Ocultar el botó per evitar navegació redundant
- L'usuari ja està veient tots els detalls

### 2. **Calendari**
- Mostrar el botó per permetre navegació a la pàgina completa
- L'usuari pot voler veure més detalls

### 3. **Llista de Cites**
- Mostrar el botó per accés ràpid al detall complet
- Útil per cites amb molta informació

### 4. **Dashboard**
- Mostrar el botó per navegació entre vistes
- Permet exploració completa

## Avantatges

1. **UX Millorada**: Evita confusió quan ja estàs a la pàgina de detall
2. **Navegació Intel·ligent**: Mostra el botó només quan té sentit
3. **Flexibilitat**: Permet control granular segons el context
4. **Consistència**: Manté la coherència visual de la interfície

## Exemple Pràctic

```typescript
// Component que gestiona el popup
export class CalendarComponent {
  readonly showPopup = signal(false);
  readonly selectedAppointment = signal<Appointment | null>(null);
  readonly isDetailPage = signal(false);

  openAppointmentPopup(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
    this.showPopup.set(true);
  }

  onPopupClosed() {
    this.showPopup.set(false);
    this.selectedAppointment.set(null);
  }
}
```

```html
<!-- Al calendari -->
<pelu-appointment-detail-popup
  [open]="showPopup()"
  [appointment]="selectedAppointment()"
  [hideViewDetailButton]="false"
  (closed)="onPopupClosed()">
</pelu-appointment-detail-popup>
```

```html
<!-- A la pàgina de detall -->
<pelu-appointment-detail-popup
  [open]="false"
  [appointment]="null"
  [hideViewDetailButton]="true"
  (closed)="onPopupClosed()">
</pelu-appointment-detail-popup>
```

## Notes Importants

- El valor per defecte de `hideViewDetailButton` és `false`
- El botó es mostra només si `hideViewDetailButton` és `false`
- Aquesta funcionalitat no afecta altres parts del popup
- És compatible amb tots els usos existents del popup 
