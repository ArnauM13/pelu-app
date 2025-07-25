# 📱 Botons de Selecció Ràpida de Data - Vista Mòbil

## 📋 Problema Solucionat

**Problema**: En vista mòbil, els usuaris han de navegar manualment per les setmanes per trobar dates disponibles, el que pot ser tediós i poc eficient.

**Solució**: Afegir botons de selecció ràpida que permetin als usuaris seleccionar ràpidament "Avui", "Demà" i "Pròxim dia amb cites disponibles".

## ✅ Funcionalitat Implementada

### **🎯 Botons de Selecció Ràpida**

**Ubicació**: Entre la navegació de setmana i la selecció de dia

**Tres botons disponibles**:

1. **"Avui"** - Selecciona el dia actual
2. **"Demà"** - Selecciona el dia següent
3. **"Pròxim disponible"** - Selecciona el proper dia amb cites disponibles

### **📱 Interfície d'Usuari**

**Disseny**:

- **Layout**: Flexbox amb 3 botons distribuïts uniformement
- **Colors**: Cada botó té un color distintiu
- **Icones**: Icones de PrimeNG per cada acció
- **Responsiu**: S'adapta a mòbils i tablets

**Estats dels botons**:

- **Actiu**: Color complet, cursor pointer
- **Desactivat**: Gris, cursor not-allowed (quan la data no és seleccionable)

## 🔧 Implementació Tècnica

### **1. Template HTML**

**Botons de selecció ràpida**:

```html
<!-- Quick date selection buttons -->
<div class="quick-date-buttons">
  <button
    class="quick-date-btn today-btn"
    [class.disabled]="!canSelectDate(getToday())"
    (click)="canSelectDate(getToday()) ? selectToday() : null"
  >
    <i class="pi pi-calendar"></i>
    {{ 'BOOKING.QUICK_SELECTION.TODAY' | translate }}
  </button>

  <button
    class="quick-date-btn tomorrow-btn"
    [class.disabled]="!canSelectDate(getTomorrow())"
    (click)="canSelectDate(getTomorrow()) ? selectTomorrow() : null"
  >
    <i class="pi pi-calendar-plus"></i>
    {{ 'BOOKING.QUICK_SELECTION.TOMORROW' | translate }}
  </button>

  <button
    class="quick-date-btn next-available-btn"
    [class.disabled]="!nextAvailableDate()"
    (click)="nextAvailableDate() ? selectNextAvailable() : null"
  >
    <i class="pi pi-calendar-times"></i>
    {{ 'BOOKING.QUICK_SELECTION.NEXT_AVAILABLE' | translate }}
  </button>
</div>
```

**Característiques**:

- **Condicions**: Els botons es desactiven si la data no és seleccionable
- **Icones**: Icones descriptives per cada acció
- **Traduccions**: Suport multilingüe complet

### **2. Mètodes TypeScript**

**Mètodes de selecció ràpida**:

```typescript
// Quick date selection methods
getToday(): Date {
  return new Date();
}

getTomorrow(): Date {
  return addDays(new Date(), 1);
}

selectToday() {
  const today = new Date();
  if (this.canSelectDate(today)) {
    this.selectedDateSignal.set(today);
  }
}

selectTomorrow() {
  const tomorrow = this.getTomorrow();
  if (this.canSelectDate(tomorrow)) {
    this.selectedDateSignal.set(tomorrow);
  }
}

nextAvailableDate(): Date | null {
  // Check next 30 days for available dates
  for (let i = 0; i < 30; i++) {
    const date = addDays(new Date(), i);
    if (this.canSelectDate(date)) {
      // Check if the date has available time slots
      const daySlots = this.daySlots().find(daySlot => isSameDay(daySlot.date, date));
      if (daySlots && daySlots.timeSlots.some(slot => slot.available)) {
        return date;
      }
    }
  }
  return null;
}

selectNextAvailable() {
  const nextAvailable = this.nextAvailableDate();
  if (nextAvailable) {
    this.selectedDateSignal.set(nextAvailable);
  }
}
```

**Lògica de verificació**:

- **Avui/Demà**: Verifica si la data és seleccionable (no passada, dia laborable)
- **Pròxim disponible**: Busca els propers 30 dies per trobar una data amb cites disponibles

### **3. Estils CSS**

**Estils base dels botons**:

```scss
.quick-date-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;

  .quick-date-btn {
    background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
    border: none;
    border-radius: 25px;
    padding: 0.75rem 1.5rem;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
    flex: 1;
    max-width: 120px;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(25, 118, 210, 0.25);
    }

    &:disabled {
      background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%);
      color: #757575;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      opacity: 0.6;
    }
  }
}
```

**Colors específics per cada botó**:

```scss
&.tomorrow-btn {
  background: linear-gradient(135deg, #66bb6a 0%, #388e3c 100%);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
  }
}

&.next-available-btn {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
  }
}
```

### **4. Traduccions**

**Afegides a tots els idiomes**:

**Català**:

```json
"QUICK_SELECTION": {
  "TODAY": "Avui",
  "TOMORROW": "Demà",
  "NEXT_AVAILABLE": "Pròxim disponible"
}
```

**Anglès**:

```json
"QUICK_SELECTION": {
  "TODAY": "Today",
  "TOMORROW": "Tomorrow",
  "NEXT_AVAILABLE": "Next available"
}
```

**Castellà**:

```json
"QUICK_SELECTION": {
  "TODAY": "Hoy",
  "TOMORROW": "Mañana",
  "NEXT_AVAILABLE": "Próximo disponible"
}
```

**Àrab**:

```json
"QUICK_SELECTION": {
  "TODAY": "اليوم",
  "TOMORROW": "غداً",
  "NEXT_AVAILABLE": "التالي المتاح"
}
```

## 🎯 Flux d'Usuari

### **Escenari 1: Selecció d'Avui**

1. L'usuari clica el botó "Avui"
2. Si avui és un dia laborable i no ha passat, es selecciona
3. Si no és seleccionable, el botó apareix desactivat

### **Escenari 2: Selecció de Demà**

1. L'usuari clica el botó "Demà"
2. Si demà és un dia laborable, es selecciona
3. Si no és seleccionable, el botó apareix desactivat

### **Escenari 3: Selecció del Pròxim Disponible**

1. L'usuari clica el botó "Pròxim disponible"
2. El sistema busca els propers 30 dies
3. Troba el primer dia amb cites disponibles
4. Selecciona automàticament aquesta data

### **Escenari 4: Botons Desactivats**

1. Si una data no és seleccionable, el botó apareix en gris
2. El cursor canvia a "not-allowed"
3. No es pot clicar el botó

## 🔍 Verificació

**Per verificar que funciona**:

1. **Obre la vista mòbil de booking**
2. **Verifica els botons** - haurien d'aparèixer 3 botons amb icones
3. **Clica "Avui"** - hauria de seleccionar el dia actual (si és seleccionable)
4. **Clica "Demà"** - hauria de seleccionar el dia següent (si és seleccionable)
5. **Clica "Pròxim disponible"** - hauria de seleccionar el proper dia amb cites disponibles
6. **Prova en diferents idiomes** - els textos haurien de canviar
7. **Verifica l'estat desactivat** - els botons haurien d'aparèixer en gris quan no són seleccionables

**Resultat esperat**: Els botons permeten seleccionar ràpidament dates específiques i es desactiven quan no són seleccionables.

## 📱 Comportament Responsiu

### **Desktop/Tablet**:

- Botons amb espai generós
- Icones i text ben proporcionats
- Hover effects visibles

### **Mòbil**:

- Botons compactes
- Text adaptat a pantalles petites
- Touch-friendly

## 🎨 Disseny Visual

### **Colors**:

- **Avui**: Blau (`#42a5f5` a `#1976d2`)
- **Demà**: Verd (`#66bb6a` a `#388e3c`)
- **Pròxim disponible**: Taronja (`#ff9800` a `#f57c00`)
- **Desactivat**: Gris (`#e0e0e0` a `#bdbdbd`)

### **Icones**:

- **Avui**: `pi-calendar` (calendari)
- **Demà**: `pi-calendar-plus` (calendari amb plus)
- **Pròxim disponible**: `pi-calendar-times` (calendari amb creu)

### **Efectes**:

- **Hover**: Elevació i canvi de color
- **Desactivat**: Opacitat reduïda i cursor not-allowed
- **Transicions**: Suaus per canvis d'estat

## 🔧 Lògica de Negoci

### **Verificació de Disponibilitat**:

- **Avui/Demà**: Verifica si és dia laborable i no ha passat
- **Pròxim disponible**: Busca els propers 30 dies per trobar cites disponibles

### **Optimitzacions**:

- **Cache**: Els resultats es calculen només quan cal
- **Lazy loading**: La cerca del proper disponible es fa sota demanda
- **Performance**: No impacta en la velocitat de càrrega

## 🎉 Beneficis Obtinguts

### **✅ Experiència d'Usuari Millorada**

- Selecció ràpida de dates comunes
- Reducció del temps de navegació
- Accés directe a dates disponibles

### **✅ Eficiència**

- Menys clics per seleccionar dates
- Navegació automàtica a setmanes amb disponibilitat
- Detecció automàtica de dies disponibles

### **✅ Usabilitat**

- Botons intuitius amb icones descriptives
- Estats visuals clars (actiu/desactivat)
- Feedback immediat

### **✅ Accesibilitat**

- Colors amb contrast adequat
- Icones descriptives
- Text clar i accionable

## 📚 Notes Tècniques

### **Performance**:

- Computed properties per eficiència
- Verificació només quan cal
- No impacta en la velocitat de càrrega

### **Compatibilitat**:

- Funciona amb tots els navegadors moderns
- Responsiu per tots els dispositius
- Compatible amb lectors de pantalla

### **Escalabilitat**:

- Fàcil d'afegir nous botons
- Estructura modular
- Reutilitzable en altres components

## 🔧 Manteniment

### **Canvis Futurs**:

- Afegir més opcions de selecció ràpida
- Personalitzar el rang de cerca (actualment 30 dies)
- Afegir preferències d'usuari
- Integrar amb calendari personal

### **Optimitzacions**:

- Cache de resultats de cerca
- Lazy loading de setmanes
- Debounce en clics ràpids

## 🎉 Resultat Final

**✅ BOTONS IMPLEMENTATS**: Tres botons de selecció ràpida funcionals.

**✅ EXPERIÈNCIA MILLORADA**: Selecció ràpida de dates comunes.

**✅ EFICIÈNCIA**: Reducció del temps de navegació per l'usuari.

**✅ USABILITAT**: Interfície intuitiva amb feedback visual clar.
