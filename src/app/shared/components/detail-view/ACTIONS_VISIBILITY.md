# Lògica de Visibilitat de la Targeta d'Accions

## 📋 Resum dels Canvis

S'ha millorat la lògica de visibilitat de la targeta d'accions al component `detail-view` perquè només es mostri quan hi ha accions disponibles.

## 🎯 Lògica Implementada

### **Condició Principal**

La targeta d'accions només es mostra si `hasAvailableActions` és `true`.

### **Càlcul de `hasAvailableActions`**

```typescript
get hasAvailableActions() {
  // No mostrar accions si estem en mode edició
  if (this.isEditing) return false;

  // Comprovar si hi ha accions generals disponibles (excloent el botó de tornar)
  const hasGeneralActions = this.filteredActions.length > 0;

  // Comprovar si hi ha accions específiques de cites disponibles
  const hasAppointmentActions = this.type === 'appointment' &&
                               this.appointment &&
                               (this.canEditAppointment() || this.canDeleteAppointment());

  // Mostrar la columna d'accions només si hi ha accions generals O accions específiques de cites
  return hasGeneralActions || hasAppointmentActions;
}

// Mètodes auxiliars per verificar tipus d'accions
get hasAppointmentActions(): boolean {
  return this.type === 'appointment' &&
         this.appointment &&
         (this.canEditAppointment() || this.canDeleteAppointment());
}

get hasGeneralActions(): boolean {
  return this.filteredActions.length > 0;
}
```

## 🔧 Tipus d'Accions Considerades

### **1. Accions Generals**

- Accions definides a l'array `actions` del config
- Exclou el botó "Tornar" (`COMMON.ACTIONS.BACK`)
- Es filtren amb `filteredActions`

### **2. Accions Específiques de Cites**

- **Editar cita**: Si `canEditAppointment()` és `true`
- **Eliminar cita**: Si `canDeleteAppointment()` és `true`

### **3. Condicions per Accions de Cites**

- Només per tipus `'appointment'`
- Només si hi ha una cita carregada
- Només per cites futures (no es poden editar/eliminar cites passades)

## 📱 Comportament per Escenaris

### **Escenari 1: Cita Futura**

- ✅ **Accions disponibles**: Editar, Eliminar
- ✅ **Targeta d'accions**: Es mostra
- ✅ **Contingut**: Secció d'accions específiques de cites

### **Escenari 2: Cita Passada**

- ❌ **Accions disponibles**: Cap
- ❌ **Targeta d'accions**: No es mostra
- ❌ **Contingut**: Només informació de la cita

### **Escenari 3: Perfil d'Usuari**

- ✅ **Accions disponibles**: Depèn del config
- ✅ **Targeta d'accions**: Es mostra si hi ha accions generals
- ✅ **Contingut**: Secció d'accions generals

### **Escenari 4: Mode Edició**

- ❌ **Accions disponibles**: Cap (estem editant)
- ❌ **Targeta d'accions**: No es mostra
- ❌ **Contingut**: Formulari d'edició

## 🎨 Estructura del Template

```html
<!-- Right Column - Actions -->
@if (hasAvailableActions) {
<div class="actions-column">
  <div class="actions-section">
    <h2>{{ 'COMMON.ACTIONS.ACTIONS' | translate }}</h2>

    <!-- Action Buttons Section (for appointments) -->
    @if (hasAppointmentActions) {
    <div class="appointment-actions-section">
      <!-- Accions específiques de cites -->
    </div>
    }

    <!-- General Actions Grid -->
    @if (hasGeneralActions) {
    <div class="actions-grid">
      <!-- Accions generals -->
    </div>
    }
  </div>
</div>
}
```

## 🎨 Estils i Espais

### **Espais Naturals**

- **Entre opcions d'accions**: `gap: 1rem`
- **Entre seccions d'accions**: `gap: 1.5rem`
- **Layout flex**: `display: flex; flex-direction: column`

### **Estructura Visual**

```
┌─ Actions Section ──────────────────┐
│                                    │
│  ┌─ Appointment Actions ─────────┐  │
│  │ • Edit Action                 │  │
│  │ • Delete Action               │  │
│  └───────────────────────────────┘  │
│                                    │
│  ┌─ General Actions ─────────────┐  │
│  │ • Action 1                    │  │
│  │ • Action 2                    │  │
│  └───────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

## 🔍 Verificació

### **Per verificar que funciona correctament:**

1. **Cita futura**: Ha de mostrar la targeta d'accions amb opcions d'editar i eliminar
2. **Cita passada**: No ha de mostrar la targeta d'accions
3. **Mode edició**: No ha de mostrar la targeta d'accions
4. **Perfil sense accions**: No ha de mostrar la targeta d'accions
5. **Perfil amb accions**: Ha de mostrar la targeta d'accions amb les accions disponibles

## 🚀 Beneficis

- ✅ **UX millorada**: No es mostra espai buit quan no hi ha accions
- ✅ **Lògica clara**: Condicions ben definides i comprensibles
- ✅ **Flexibilitat**: Suporta accions generals i específiques
- ✅ **Mantenibilitat**: Fàcil d'extendre per nous tipus d'accions
- ✅ **Rendiment**: No es renderitza la targeta quan no cal
- ✅ **Espais naturals**: Layout amb gaps adequats entre opcions
- ✅ **Visualització clara**: Separació visual entre tipus d'accions

## 📝 Notes Tècniques

- La lògica es calcula reactivament amb getters
- Es considera tant accions generals com específiques
- El mode edició sempre amaga la targeta d'accions
- Les accions de cites només apareixen per cites futures
- La targeta es mostra només si hi ha almenys una acció disponible
