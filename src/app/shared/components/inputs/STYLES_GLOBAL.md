# Estils Globals Unificats per Inputs

## 📋 Resum dels Estils Afegits

S'han afegit estils globals al fitxer `src/styles.scss` per unificar l'aparença de tots els inputs de l'aplicació.

## 🎨 Característiques Principals

### **Colors Unificats**
- **Fons**: `white` (fons blanc)
- **Text**: `#1f2937` (text negre/gris fosc)
- **Bordes**: `#e5e7eb` (gris clar)
- **Placeholders**: `#9ca3af` (gris mitjà)

### **Mides Unificades**
- **Inputs de text**: 44px d'alçada
- **Textareas**: 80px d'alçada mínima (mòbil: 88px)
- **Padding**: 0.75rem
- **Border-radius**: 8px

### **Estats Visuals**
- **Normal**: Border gris clar
- **Hover**: Border blau amb shadow
- **Focus**: Border blau amb shadow més intens
- **Disabled**: Fons gris clar, opacitat 0.6

## 🔧 Tipus d'Inputs Coberts

### **Inputs HTML Natius**
```css
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
input[type="tel"],
input[type="url"],
input[type="search"],
input[type="date"],
input[type="time"],
input[type="datetime-local"],
input[type="month"],
input[type="week"],
textarea,
select
```

### **Components PrimeNG**
```css
.p-inputtext,
.p-inputnumber-input,
.p-calendar-input,
.p-dropdown,
.p-select,
.p-multiselect,
.p-password-input,
.p-inputtextarea,
.p-inputtext-sm,
.p-inputtext-lg
```

## 🎯 Estils Específics

### **Textareas**
- Mida mínima: 80px (mòbil: 88px)
- Redimensionable verticalment
- Line-height: 1.5

### **Inputs de Números**
- Eliminació dels botons de spinner
- Aparència de text normal

### **Dropdowns i Selects**
- Fons blanc per panels
- Items amb hover gris clar
- Items seleccionats amb fons blau

### **Inputs de Contrasenya**
- Fons blanc
- Text negre

## 📱 Responsive Design

### **Mòbils (max-width: 768px)**
- Font-size: 1rem (prevé zoom a iOS)
- Mida mínima: 44px per inputs
- Mida mínima: 88px per textareas

## ⚡ Ús de !important

Tots els estils globals utilitzen `!important` per assegurar que s'apliquin sobre altres estils que puguin estar definits en components específics.

## 🎨 Exemple d'Ús

```html
<!-- Input HTML natiu -->
<input type="text" placeholder="Nom complet">

<!-- Component PrimeNG -->
<p-inputtext placeholder="Nom complet"></p-inputtext>

<!-- Component unificat -->
<pelu-input-text
  [config]="{ label: 'Nom', placeholder: 'Nom complet', showLabel: true }"
  [value]="formData.name"
  (valueChange)="updateField('name', $event)">
</pelu-input-text>
```

## 🔍 Verificació

Per verificar que els estils s'apliquen correctament:

1. **Fons blanc**: Tots els inputs han de tenir fons blanc
2. **Text negre**: El text ha de ser negre/gris fosc
3. **Bordes grisos**: Els bordes han de ser grisos en estat normal
4. **Hover blau**: Al passar el ratolí, els bordes han de tornar-se blaus
5. **Focus blau**: Al fer focus, els bordes han de ser blaus amb shadow

## 🚀 Beneficis

- ✅ **Consistència visual**: Tots els inputs tenen la mateixa aparença
- ✅ **Millor UX**: Colors clars i llegibles
- ✅ **Responsive**: S'adapta a diferents mides de pantalla
- ✅ **Accessibilitat**: Contrast adequat entre fons i text
- ✅ **Mantenibilitat**: Estils centrals fàcils de modificar 
