# Calendari Setmanal - Millores Implementades

## 🎯 Objectiu

Aquest component de calendari setmanal ha estat refactoritzat per aconseguir un funcionament similar a Google Calendar, amb franges de 30 minuts i càlculs correctes de posició i altura de les cites.

## ✅ Millores Implementades

### 1. Franges de 30 Minuts
- **Abans**: Franges d'una hora (08:00, 09:00, 10:00...)
- **Ara**: Franges de 30 minuts (08:00, 08:30, 09:00, 09:30...)
- **Implementació**: `timeSlots` computed que genera 24 franges de 30 minuts

### 2. Càlcul Correcte de Posició i Altura
- **Abans**: Càlculs incorrectes basats només en hores
- **Ara**: Càlculs precisos basats en minuts amb escala 1:1 (1 minut = 1 píxel)

#### Funcions Implementades:
```typescript
// Càlcul de posició vertical (top)
getAppointmentTopPx(appointment: AppointmentEvent): number {
  const startTime = new Date(appointment.start);
  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const businessStartMinutes = this.businessHours.start * 60;
  const relativeMinutes = startMinutes - businessStartMinutes;
  
  return relativeMinutes * this.PIXELS_PER_MINUTE;
}

// Càlcul d'altura basada en durada
getAppointmentHeightPx(appointment: AppointmentEvent): number {
  let duration: number;
  
  if (appointment.end) {
    // Calcular durada des de start i end
    const startTime = new Date(appointment.start);
    const endTime = new Date(appointment.end);
    duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  } else {
    // Usar propietat duration o per defecte 60 minuts
    duration = appointment.duration || 60;
  }
  
  return duration * this.PIXELS_PER_MINUTE;
}
```

### 3. Bloqueig de Franges amb Solapaments Parcials
- **Abans**: Només bloquejava si coincidia exactament l'hora
- **Ara**: Bloqueja qualsevol solapament, fins i tot parcial

#### Funció Implementada:
```typescript
isTimeSlotAvailable(date: Date, time: string, requestedDuration: number = 30): boolean {
  // ... validacions de pausa, data passada, etc.
  
  const dateStr = format(date, 'yyyy-MM-dd');
  const slotStart = new Date(`${dateStr}T${time}`);
  const slotEnd = addMinutes(slotStart, requestedDuration);

  // Comprovar si alguna cita solapa amb aquesta franja
  return !this.allEvents().some(event => {
    const appointmentStart = new Date(event.start);
    const appointmentEnd = event.end ? new Date(event.end) : addMinutes(appointmentStart, event.duration || 60);

    // Comprovar solapament: si el màxim dels temps d'inici és menor que el mínim dels temps de final
    return Math.max(slotStart.getTime(), appointmentStart.getTime()) < 
           Math.min(slotEnd.getTime(), appointmentEnd.getTime());
  });
}
```

### 4. Interface Millorada
```typescript
export interface AppointmentEvent {
  id?: string;
  title: string;
  start: string;
  end?: string; // Nou: temps de final explícit
  duration?: number; // en minuts, per defecte 60 si no s'especifica
  serviceName?: string;
  clientName?: string;
}
```

### 5. Constants Configurables
```typescript
readonly SLOT_DURATION_MINUTES = 30; // Franges de 30 minuts
readonly PIXELS_PER_MINUTE = 1; // 1 píxel per minut
readonly SLOT_HEIGHT_PX = this.SLOT_DURATION_MINUTES * this.PIXELS_PER_MINUTE; // 30px per franja
```

## 🎨 Visualització Millorada

### Estils CSS Actualitzats:
- **Grid Layout**: 24 franges de 30px d'altura cadascuna
- **Posicionament Absolut**: Les cites es posicionen amb `position: absolute`
- **Responsive**: Adaptació per mòbils amb franges de 25px
- **Efectes Visuals**: Hover effects, gradients, i animacions

### Característiques Visuals:
- ✅ Franges de 30 minuts ben definides
- ✅ Cites amb altura proporcional a la durada
- ✅ Pausa de dinar destacada (13:00 - 15:00)
- ✅ Franges passades amb opacitat reduïda
- ✅ Franges ocupades amb patró de ratlles
- ✅ Franges disponibles amb indicador "+"

## 🧪 Component de Demostració

S'ha creat un component de demostració (`CalendarDemoComponent`) que inclou:

- **Cites d'exemple**: 12 cites distribuïdes durant la setmana
- **Solapaments**: Cites que se solapen per provar la lògica
- **Controls**: Botons per afegir/netejar cites
- **Informació**: Detalls sobre les característiques implementades

### Ús del Component de Demostració:
```typescript
import { CalendarDemoComponent } from './calendar-demo.component';

// Al template:
<pelu-calendar-demo></pelu-calendar-demo>
```

## 📱 Responsive Design

El calendari s'adapta automàticament a diferents mides de pantalla:

- **Desktop**: Franges de 30px d'altura
- **Tablet**: Franges de 28px d'altura
- **Mobile**: Franges de 25px d'altura

## 🔧 Configuració

### Hores de Negoci:
```typescript
readonly businessHours = {
  start: 8,  // 08:00
  end: 20    // 20:00
};
```

### Pausa de Dinar:
```typescript
readonly lunchBreak = {
  start: 13, // 13:00
  end: 15    // 15:00
};
```

### Dies de la Setmana:
```typescript
// Filtra per mostrar només de dimarts a dissabte
return allDays.filter(day => {
  const dayOfWeek = day.getDay();
  return dayOfWeek >= 2 && dayOfWeek <= 6; // Tuesday to Saturday
});
```

## 🚀 Ús del Component

```typescript
import { CalendarComponent, AppointmentEvent } from './calendar.component';

@Component({
  template: `
    <pelu-calendar-component
      [events]="appointments"
      (dateSelected)="onDateSelected($event)">
    </pelu-calendar-component>
  `
})
export class MyComponent {
  appointments: AppointmentEvent[] = [
    {
      id: '1',
      title: 'Tall de cabell - Maria',
      start: '2024-01-15T09:00:00',
      end: '2024-01-15T10:30:00',
      duration: 90,
      serviceName: 'Tall de cabell',
      clientName: 'Maria'
    }
  ];

  onDateSelected(selection: {date: string, time: string}) {
    console.log('Data seleccionada:', selection);
  }
}
```

## 🎯 Resultat Final

El calendari ara ofereix:
- ✅ Visualització precisa de franges de 30 minuts
- ✅ Càlculs correctes de posició i altura de cites
- ✅ Bloqueig intel·ligent de franges amb solapaments
- ✅ Interfície similar a Google Calendar
- ✅ Responsive design per tots els dispositius
- ✅ Gestió correcta de pauses i dies passats

Aquest component està llest per a ús en producció i ofereix una experiència d'usuari professional i intuïtiva. 
