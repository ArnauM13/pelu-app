# Guia d'ús del sistema de Toasts

El sistema de toasts està disponible globalment a tota l'aplicació i és molt senzill d'usar.

## Instal·lació

El component Toast ja està inclòs globalment a `app.component.html`, per tant no cal fer res més.

## Ús bàsic

### 1. Importar el ToastService

```typescript
import { ToastService } from '../../shared/services/toast.service';

export class MyComponent {
  constructor(private toastService: ToastService) {}
}
```

### 2. Usar els mètodes disponibles

#### Mètodes ràpids per tipus de toast:

```typescript
// Toast d'èxit
this.toastService.showSuccess('Operació completada');

// Toast d'error
this.toastService.showError('Ha ocorregut un error');

// Toast d'informació
this.toastService.showInfo('Informació important');

// Toast d'advertència
this.toastService.showWarning('Advertència');
```

#### Mètodes específics per casos d'ús comuns:

```typescript
// Reserva creada (amb botó "Veure detall")
this.toastService.showReservationCreated(appointmentId);

// Cita eliminada
this.toastService.showAppointmentDeleted('Nom del client');

// Cita actualitzada
this.toastService.showAppointmentUpdated('Nom del client');

// Cita creada (amb botó "Veure detall")
this.toastService.showAppointmentCreated('Nom del client', appointmentId);

// Errors de validació
this.toastService.showValidationError('camp obligatori');

// Errors de xarxa
this.toastService.showNetworkError();

// Errors d'autorització
this.toastService.showUnauthorizedError();

// Sessió requerida
this.toastService.showLoginRequired();
```

#### Mètodes genèrics:

```typescript
// Mètodes genèrics amb emojis
this.toastService.showGenericSuccess('Operació completada amb èxit');
this.toastService.showGenericError('Ha ocorregut un error');
this.toastService.showGenericInfo('Informació important');
this.toastService.showGenericWarning('Advertència');
```

### 3. Mètode avançat amb accions personalitzades

```typescript
// Toast amb acció personalitzada
this.toastService.showToastWithAction(
  'success',
  'Operació completada',
  'La teva acció s\'ha realitzat correctament',
  () => {
    // Acció personalitzada
    this.router.navigate(['/dashboard']);
  },
  'Anar al dashboard'
);
```

## Exemples d'ús en components

### Exemple 1: Crear una reserva

```typescript
onBookingConfirmed(details: BookingDetails) {
  const user = this.authService.user();
  if (!user) {
    this.toastService.showLoginRequired();
    return;
  }

  // Crear la cita...
  const appointment = { /* ... */ };
  
  // Mostrar toast d'èxit
  this.toastService.showAppointmentCreated(details.clientName, appointment.id);
}
```

### Exemple 2: Eliminar una cita

```typescript
deleteAppointment(appointment: any) {
  // Eliminar la cita...
  this.appointments = this.appointments.filter(a => a.id !== appointment.id);
  
  // Mostrar toast de confirmació
  this.toastService.showAppointmentDeleted(appointment.nom);
}
```

### Exemple 3: Validació de formulari

```typescript
onSubmit() {
  if (!this.form.valid) {
    this.toastService.showValidationError('camps obligatoris');
    return;
  }
  
  // Processar formulari...
  this.toastService.showGenericSuccess('Formulari enviat correctament');
}
```

### Exemple 4: Gestió d'errors

```typescript
async saveData() {
  try {
    await this.apiService.save(data);
    this.toastService.showGenericSuccess('Dades desades correctament');
  } catch (error) {
    if (error.status === 401) {
      this.toastService.showUnauthorizedError();
    } else if (error.status === 0) {
      this.toastService.showNetworkError();
    } else {
      this.toastService.showGenericError('Error inesperat');
    }
  }
}
```

## Característiques del sistema

- ✅ **Global**: Disponible a tota l'aplicació
- ✅ **Consistent**: Disseny uniforme a tots els toasts
- ✅ **Responsiu**: S'adapta a mòbils i desktops
- ✅ **Accessible**: Suport per navegació per teclat
- ✅ **Traduït**: Suport per múltiples idiomes
- ✅ **Personalitzable**: Accions personalitzades disponibles
- ✅ **Navegació**: Botó "Veure detall" per cites
- ✅ **Auto-tancament**: Els toasts es tanquen automàticament després de 4 segons

## Posició i estil

Els toasts apareixen a la **esquina superior dreta** de la pantalla amb un disseny modern i minimalista:

- Fons blanc amb ombra suau
- Bordes arrodonits
- Icones i colors segons el tipus (èxit, error, info, advertència)
- Botó de tancament manual
- Responsiu per a mòbils

## Mètodes de gestió

```typescript
// Netejar toasts específics
this.toastService.clearToast();

// Netejar tots els toasts
this.toastService.clearAllToasts();
```

## Tipus de severitat disponibles

- `'success'` - Operacions exitoses (verd)
- `'error'` - Errors i problemes (vermell)
- `'info'` - Informació general (blau)
- `'warn'` - Advertències (groc)

## Notes importants

1. **No cal importar el component**: Ja està disponible globalment
2. **Injecció automàtica**: El ToastService està configurat com a singleton
3. **Traduccions**: Els textos es poden passar com a claus de traducció
4. **Navegació**: Els toasts de cites inclouen navegació automàtica
5. **Accions**: Es poden afegir accions personalitzades als toasts 
