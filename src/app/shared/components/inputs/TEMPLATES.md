# Plantilles per Input Select

El component `pelu-input-select` suporta plantilles personalitzables per estilitzar completament l'aparença dels elements del select.

## Plantilles Disponibles

### 1. **selectedItem** - Element Seleccionat
Personalitza com es mostra l'element seleccionat al camp del select.

```html
<ng-template #selectedItem let-selectedOption>
  <div class="flex items-center gap-2" *ngIf="selectedOption">
    <div class="w-4 h-4 rounded-full" [style.background-color]="selectedOption.color"></div>
    <span class="font-medium">{{ selectedOption.label }}</span>
    <span class="text-sm text-gray-500">({{ selectedOption.duration }}min)</span>
  </div>
</ng-template>
```

### 2. **item** - Opcions del Dropdown
Personalitza com es mostren les opcions dins del dropdown.

```html
<ng-template #item let-service>
  <div class="flex items-center justify-between w-full p-2">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full flex items-center justify-center" 
           [style.background-color]="service.color">
        <i [class]="service.icon" class="text-white"></i>
      </div>
      <div>
        <div class="font-medium">{{ service.label }}</div>
        <div class="text-sm text-gray-500">{{ service.description }}</div>
      </div>
    </div>
    <div class="text-right">
      <div class="font-bold text-lg text-green-600">{{ service.price }}€</div>
      <div class="text-sm text-gray-500">{{ service.duration }}min</div>
    </div>
  </div>
</ng-template>
```

### 3. **group** - Grups d'Opcions
Personalitza l'aparença dels grups d'opcions.

```html
<ng-template #group let-group>
  <div class="flex items-center gap-2 p-2 bg-gray-100 font-semibold">
    <i class="pi pi-folder text-blue-500"></i>
    <span>{{ group.label }}</span>
    <span class="text-sm text-gray-500">({{ group.items.length }} elements)</span>
  </div>
</ng-template>
```

### 4. **dropdownicon** - Icona del Dropdown
Personalitza la icona que apareix al costat del select.

```html
<ng-template #dropdownicon>
  <i class="pi pi-scissors text-blue-500"></i>
</ng-template>
```

### 5. **header** - Encapçalament del Dropdown
Afegeix un encapçalament al dropdown.

```html
<ng-template #header>
  <div class="p-3 bg-blue-50 border-b border-blue-200">
    <h4 class="font-semibold text-blue-800">Serveis Disponibles</h4>
    <p class="text-sm text-blue-600">Selecciona el servei que desitges</p>
  </div>
</ng-template>
```

### 6. **footer** - Peu del Dropdown
Afegeix un peu al dropdown amb accions addicionals.

```html
<ng-template #footer>
  <div class="p-3 bg-gray-50 border-t border-gray-200">
    <button class="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
      <i class="pi pi-plus mr-2"></i>Afegir Nou Servei
    </button>
  </div>
</ng-template>
```

### 7. **emptyMessage** - Missatge Buit
Personalitza el missatge quan no hi ha resultats.

```html
<ng-template #emptyMessage>
  <div class="p-4 text-center text-gray-500">
    <i class="pi pi-search text-2xl mb-2"></i>
    <p>No s'han trobat serveis</p>
    <p class="text-sm">Prova amb altres paraules clau</p>
  </div>
</ng-template>
```

## Exemple Complet

```html
<pelu-input-select
  [label]="'Servei Premium'"
  [placeholder]="'Selecciona un servei premium'"
  [options]="serviceOptions"
  [filter]="true"
  [showClear]="true"
  [value]="selectedService"
  (valueChange)="onServiceChange($event)"
>
  <!-- Element seleccionat -->
  <ng-template #selectedItem let-selectedOption>
    <div class="flex items-center gap-3" *ngIf="selectedOption">
      <div class="w-6 h-6 rounded-full flex items-center justify-center" 
           [style.background-color]="selectedOption.color">
        <i [class]="selectedOption.icon" class="text-white text-sm"></i>
      </div>
      <div>
        <div class="font-semibold">{{ selectedOption.label }}</div>
        <div class="text-xs text-gray-500">{{ selectedOption.category }}</div>
      </div>
      <div class="ml-auto">
        <span class="text-lg font-bold text-green-600">{{ selectedOption.price }}€</span>
      </div>
    </div>
  </ng-template>

  <!-- Opcions del dropdown -->
  <ng-template #item let-service>
    <div class="flex items-center justify-between w-full p-2">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full flex items-center justify-center" 
             [style.background-color]="service.color">
          <i [class]="service.icon" class="text-white"></i>
        </div>
        <div>
          <div class="font-medium">{{ service.label }}</div>
          <div class="text-sm text-gray-500">{{ service.description }}</div>
          <div class="text-xs text-blue-600">{{ service.category }}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="font-bold text-lg text-green-600">{{ service.price }}€</div>
        <div class="text-sm text-gray-500">{{ service.duration }}min</div>
        @if (service.popular) {
          <div class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
            Popular
          </div>
        }
      </div>
    </div>
  </ng-template>

  <!-- Encapçalament -->
  <ng-template #header>
    <div class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200">
      <h4 class="font-bold text-blue-900 mb-1">Serveis Premium</h4>
      <p class="text-sm text-blue-700">Descobreix els nostres serveis exclusius</p>
    </div>
  </ng-template>

  <!-- Peu -->
  <ng-template #footer>
    <div class="p-3 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <button class="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          <i class="pi pi-plus mr-2"></i>Nou Servei
        </button>
        <button class="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
          <i class="pi pi-calendar mr-2"></i>Reservar
        </button>
      </div>
    </div>
  </ng-template>

  <!-- Missatge buit -->
  <ng-template #emptyMessage>
    <div class="p-4 text-center text-gray-500">
      <i class="pi pi-search text-2xl mb-2"></i>
      <p>No s'han trobat serveis</p>
      <p class="text-sm">Prova amb altres paraules clau</p>
    </div>
  </ng-template>
</pelu-input-select>
```

## Dades d'Exemple

```typescript
serviceOptions = [
  { 
    value: 'premium_haircut', 
    label: 'Tall Premium', 
    color: '#4F46E5', 
    icon: 'pi pi-user', 
    category: 'Cabell', 
    description: 'Tall de cabell amb productes de luxe', 
    price: 45, 
    duration: 60, 
    popular: true 
  },
  { 
    value: 'premium_coloring', 
    label: 'Coloració Premium', 
    color: '#10B981', 
    icon: 'pi pi-palette', 
    category: 'Coloració', 
    description: 'Coloració amb productes exclusius', 
    price: 65, 
    duration: 90, 
    popular: false 
  },
  // ... més opcions
];
```

## Millors Pràctiques

1. **Consistència Visual**: Manteniu un estil consistent amb la resta de l'aplicació
2. **Accessibilitat**: Assegureu-vos que els elements siguin accessibles amb teclat
3. **Responsivitat**: Utilitzeu classes CSS que funcionin en diferents mides de pantalla
4. **Performance**: Eviteu càlculs complexos dins de les plantilles
5. **Reutilització**: Creeu plantilles reutilitzables per components similars

## Casos d'Ús Comuns

- **Selecció de serveis** amb preus, durades i descripcions
- **Selecció d'usuaris** amb avatars i informació de contacte
- **Selecció de productes** amb imatges, preus i disponibilitat
- **Selecció de categories** amb icones i descripcions
- **Selecció de fitxers** amb tipus, mida i data de modificació 
