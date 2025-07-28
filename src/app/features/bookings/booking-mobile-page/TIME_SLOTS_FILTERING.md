# 📱 Filtrage de Franjes Temporals - Vista Mòbil

## 📋 Problema Solucionat

**Problema**: En vista mòbil apareixien hores passades i hores marcades com a no habilitades (com la pausa per dinar), el que confonia els usuaris i mostrava opcions no disponibles.

**Solució**: Implementar un sistema de filtrage que oculti completament les hores passades i les hores marcades com a no habilitades per l'administrador.

## ✅ Funcionalitat Implementada

### **🎯 Filtrage de Franjes Temporals**

**Hores que es filtren**:

1. **Hores passades**: Només per al dia actual
2. **Hores no habilitades**: Pausa per dinar i altres hores marcades per l'admin
3. **Dies no laborables**: Capús i diumenge

**Hores que es mostren**:

- Hores futures disponibles
- Hores ocupades (per mostrar informació)
- Hores habilitades per l'administrador

### **📱 Comportament de la Vista Mòbil**

**Per al dia actual**:

- No es mostren hores passades
- No es mostren hores de pausa per dinar
- Només es mostren hores futures i habilitades

**Per a dies futurs**:

- No es mostren hores de pausa per dinar
- Es mostren totes les hores habilitades
- Es mostren hores ocupades amb informació

## 🔧 Implementació Tècnica

### **1. Mètode de Generació de Franjes**

**Mètode `generateTimeSlots()` actualitzat**:

```typescript
private generateTimeSlots(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayOfWeek = date.getDay();

  // Check if it's a business day
  if (!this.businessDays.includes(dayOfWeek)) {
    return slots;
  }

  const startHour = parseInt(this.businessHours.start.split(':')[0]);
  const endHour = parseInt(this.businessHours.end.split(':')[0]);
  const now = new Date();
  const isToday = isSameDay(date, now);

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += this.slotDuration) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);

      // Skip disabled time slots (lunch break, etc.)
      if (!this.isTimeSlotEnabled(hour, minute)) {
        continue;
      }

      // Skip past hours (only for today)
      if (isToday && slotDate <= now) {
        continue;
      }

      // Check if slot is available (not booked)
      const isAvailable = !this.isSlotBooked(slotDate);

      // Get booking details if slot is occupied
      const booking = this.getBookingForSlot(date, timeString);

      slots.push({
        time: timeString,
        available: isAvailable,
        isSelected: false,
        clientName: booking?.nom || booking?.clientName,
        serviceName: booking?.serviceName || booking?.servei,
        serviceIcon: this.getServiceIcon(booking?.serviceId),
        bookingId: booking?.id,
        notes: booking?.notes
      });
    }
  }

  return slots;
}
```

**Característiques clau**:

- **Verificació de dia laborable**: Només genera franjes per dies laborables
- **Filtrage d'hores passades**: Només per al dia actual
- **Filtrage d'hores no habilitades**: Usa el mètode `isTimeSlotEnabled()`
- **Generació condicional**: Només afegeix franjes que compleixen tots els criteris

### **2. Mètode de Verificació d'Hores Habilitades**

**Mètode `isTimeSlotEnabled()`**:

```typescript
private isTimeSlotEnabled(hour: number, minute: number): boolean {
  // Check lunch break
  const lunchStart = parseInt(this.lunchBreak.start.split(':')[0]);
  const lunchEnd = parseInt(this.lunchBreak.end.split(':')[0]);

  if (hour >= lunchStart && hour < lunchEnd) {
    return false;
  }

  // Add more disabled time slots here if needed
  // Example: if (hour === 12 && minute === 0) return false; // Disable 12:00

  return true;
}
```

**Característiques**:

- **Pausa per dinar**: Configurable via `lunchBreak`
- **Extensible**: Fàcil d'afegir més hores no habilitades
- **Centralitzat**: Un sol lloc per gestionar hores no habilitades

### **3. Mètode de Consulta d'Hores Habilitades**

**Mètode `getEnabledTimeSlots()`**:

```typescript
getEnabledTimeSlots(date: Date): string[] {
  const slots: string[] = [];
  const dayOfWeek = date.getDay();

  // Check if it's a business day
  if (!this.businessDays.includes(dayOfWeek)) {
    return slots;
  }

  const startHour = parseInt(this.businessHours.start.split(':')[0]);
  const endHour = parseInt(this.businessHours.end.split(':')[0]);

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += this.slotDuration) {
      if (this.isTimeSlotEnabled(hour, minute)) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
  }

  return slots;
}
```

**Ús**:

- **Documentació**: Per mostrar hores disponibles
- **Testing**: Per verificar que el filtrage funciona
- **Debugging**: Per diagnosticar problemes

## 🎯 Configuració Actual

### **Hores de Treball**:

```typescript
readonly businessHours = { start: '08:00', end: '20:00' };
```

### **Pausa per Dinar**:

```typescript
readonly lunchBreak = { start: '13:00', end: '14:00' };
```

### **Dies Laborables**:

```typescript
readonly businessDays = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
```

### **Durada de Franjes**:

```typescript
readonly slotDuration = 30; // 30 minutes
```

## 🔍 Exemples de Franjes Generades

### **Dia Actual (Avui) - 15:30**:

**Hores que NO es mostren**:

- 08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30 (passades)
- 13:00, 13:30 (pausa per dinar)

**Hores que SÍ es mostren**:

- 14:00, 14:30, 15:00 (futures, després de la pausa)
- 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30 (futures)

### **Dia Futur**:

**Hores que NO es mostren**:

- 13:00, 13:30 (pausa per dinar)

**Hores que SÍ es mostren**:

- 08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30
- 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30

### **Capús o Diumenge**:

- No es mostren hores (dies no laborables)

## 🔧 Personalització

### **Afegir Noves Hores No Habilitades**:

**Exemple: Deshabilitar 12:00**:

```typescript
private isTimeSlotEnabled(hour: number, minute: number): boolean {
  // Check lunch break
  const lunchStart = parseInt(this.lunchBreak.start.split(':')[0]);
  const lunchEnd = parseInt(this.lunchBreak.end.split(':')[0]);

  if (hour >= lunchStart && hour < lunchEnd) {
    return false;
  }

  // Disable 12:00
  if (hour === 12 && minute === 0) {
    return false;
  }

  return true;
}
```

**Exemple: Deshabilitar múltiples hores**:

```typescript
private isTimeSlotEnabled(hour: number, minute: number): boolean {
  // Check lunch break
  const lunchStart = parseInt(this.lunchBreak.start.split(':')[0]);
  const lunchEnd = parseInt(this.lunchBreak.end.split(':')[0]);

  if (hour >= lunchStart && hour < lunchEnd) {
    return false;
  }

  // Disable specific hours
  const disabledHours = [
    { hour: 12, minute: 0 },  // 12:00
    { hour: 12, minute: 30 }, // 12:30
    { hour: 18, minute: 0 },  // 18:00
  ];

  if (disabledHours.some(slot => slot.hour === hour && slot.minute === minute)) {
    return false;
  }

  return true;
}
```

### **Canviar Hores de Treball**:

**Exemple: Hores de matí**:

```typescript
readonly businessHours = { start: '09:00', end: '17:00' };
```

**Exemple: Hores de tarda**:

```typescript
readonly businessHours = { start: '14:00', end: '22:00' };
```

### **Canviar Pausa per Dinar**:

**Exemple: Pausa més llarga**:

```typescript
readonly lunchBreak = { start: '12:30', end: '14:30' };
```

**Exemple: Sense pausa**:

```typescript
readonly lunchBreak = { start: '13:00', end: '13:00' };
```

## 🔍 Verificació

**Per verificar que funciona**:

1. **Obre la vista mòbil de booking**
2. **Selecciona avui** - verifica que no apareguin hores passades
3. **Verifica la pausa per dinar** - no haurien d'aparèixer hores entre 13:00 i 14:00
4. **Selecciona un dia futur** - verifica que no apareguin hores de pausa per dinar
5. **Selecciona capús o diumenge** - no haurien d'aparèixer hores
6. **Verifica hores ocupades** - haurien d'aparèixer amb informació

**Resultat esperat**: Només es mostren hores futures i habilitades, ocultant hores passades i no habilitades.

## 📱 Comportament Responsiu

### **Desktop/Tablet**:

- Filtrage idèntic al mòbil
- Més espai per mostrar informació
- Hover effects en franjes disponibles

### **Mòbil**:

- Filtrage optimitzat per pantalles petites
- Franjes compactes
- Touch-friendly

## 🎨 Impacte Visual

### **Abans**:

- Hores passades visibles (grises)
- Pausa per dinar visible (grisa)
- Confusió per l'usuari

### **Després**:

- Hores passades ocultes
- Pausa per dinar oculta
- Interfície més neta i clara

## 🔧 Manteniment

### **Canvis Futurs**:

- Configuració dinàmica d'hores no habilitades
- Integració amb configuració d'admin
- Hores especials per dies específics
- Múltiples pauses al dia

### **Optimitzacions**:

- Cache de franjes generades
- Lazy loading de franjes
- Debounce en canvis de data

## 🎉 Beneficis Obtinguts

### **✅ Experiència d'Usuari Millorada**

- Interfície més neta i clara
- Reducció de confusió
- Mostra només opcions disponibles

### **✅ Eficiència**

- Menys opcions per revisar
- Navegació més ràpida
- Focus en hores disponibles

### **✅ Usabilitat**

- Interfície intuitiva
- Informació clara
- Accions possibles

### **✅ Mantenibilitat**

- Codi centralitzat
- Fàcil de modificar
- Extensible

## 📚 Notes Tècniques

### **Performance**:

- Filtrage eficient amb `continue`
- No genera franjes innecessàries
- No impacta en la velocitat de càrrega

### **Compatibilitat**:

- Funciona amb tots els navegadors moderns
- Responsiu per tots els dispositius
- Compatible amb lectors de pantalla

### **Escalabilitat**:

- Fàcil d'afegir noves regles de filtrage
- Estructura modular
- Reutilitzable en altres components

## 🎉 Resultat Final

**✅ FILTRAGE IMPLEMENTAT**: Hores passades i no habilitades ocultes.

**✅ EXPERIÈNCIA MILLORADA**: Interfície més neta i clara.

**✅ USABILITAT**: Mostra només opcions disponibles.

**✅ MANTENIBILITAT**: Codi centralitzat i extensible.
