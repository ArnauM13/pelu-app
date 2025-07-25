# Exemple de Selecció de Serveis amb Plantilles

Aquest document mostra com crear una selecció de serveis rica i informativa utilitzant plantilles al component `pelu-input-select`.

## Exemple Complet de Selecció de Serveis

```html
<pelu-input-select
  [label]="'Selecciona un Servei'"
  [placeholder]="'Cerca i selecciona un servei...'"
  [options]="serviceOptions"
  [value]="selectedService"
  (valueChange)="onServiceChange($event)"
  [filter]="true"
  [showClear]="true"
  [filterPlaceholder]="'Cerca serveis...'"
>
  <!-- Template per l'element seleccionat -->
  <ng-template #selectedItem let-selectedOption>
    <div class="flex items-center gap-3" *ngIf="selectedOption">
      <!-- Icona del servei amb color de fons -->
      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-md" 
           [style.background-color]="selectedOption.color">
        <i [class]="selectedOption.icon" class="text-white"></i>
      </div>
      
      <!-- Informació del servei -->
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-gray-900 truncate">{{ selectedOption.label }}</div>
        <div class="text-sm text-gray-500">{{ selectedOption.category }}</div>
      </div>
      
      <!-- Preu i durada -->
      <div class="text-right">
        <div class="font-bold text-lg text-green-600">{{ selectedOption.price }}€</div>
        <div class="text-xs text-gray-500">{{ selectedOption.duration }}min</div>
      </div>
      
      <!-- Badge popular si és popular -->
      @if (selectedOption.popular) {
        <div class="ml-2">
          <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
            Popular
          </span>
        </div>
      }
    </div>
  </ng-template>

  <!-- Template per les opcions del dropdown -->
  <ng-template #item let-service>
    <div class="flex items-center justify-between w-full p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <!-- Secció esquerra: Icona i informació -->
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <!-- Icona del servei -->
        <div class="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md flex-shrink-0" 
             [style.background-color]="service.color">
          <i [class]="service.icon" class="text-white"></i>
        </div>
        
        <!-- Informació del servei -->
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-900 mb-1">{{ service.label }}</div>
          <div class="text-sm text-gray-600 mb-1">{{ service.description }}</div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
              {{ service.category }}
            </span>
            @if (service.available) {
              <span class="text-xs text-green-600 font-medium">
                <i class="pi pi-check-circle mr-1"></i>Disponible
              </span>
            } @else {
              <span class="text-xs text-red-600 font-medium">
                <i class="pi pi-times-circle mr-1"></i>No disponible
              </span>
            }
          </div>
        </div>
      </div>
      
      <!-- Secció dreta: Preu, durada i badges -->
      <div class="text-right ml-4">
        <!-- Preu -->
        <div class="font-bold text-xl text-green-600 mb-1">{{ service.price }}€</div>
        
        <!-- Durada -->
        <div class="text-sm text-gray-500 mb-2">{{ service.duration }} minuts</div>
        
        <!-- Badges -->
        <div class="flex flex-col gap-1">
          @if (service.popular) {
            <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
              <i class="pi pi-star mr-1"></i>Popular
            </span>
          }
          @if (service.new) {
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              <i class="pi pi-plus mr-1"></i>Nou
            </span>
          }
          @if (service.discount) {
            <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
              <i class="pi pi-percentage mr-1"></i>-{{ service.discount }}%
            </span>
          }
        </div>
      </div>
    </div>
  </ng-template>

  <!-- Template per l'encapçalament -->
  <ng-template #header>
    <div class="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-blue-200">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-bold text-gray-900 text-lg">Serveis Disponibles</h4>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">{{ serviceOptions.length }} serveis</span>
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
      <p class="text-sm text-gray-700 mb-3">Selecciona el servei que millor s'adapti a les teves necessitats</p>
      
      <!-- Estadístiques ràpides -->
      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-1">
          <i class="pi pi-star text-yellow-500"></i>
          <span class="text-gray-600">{{ popularServicesCount }} populars</span>
        </div>
        <div class="flex items-center gap-1">
          <i class="pi pi-clock text-blue-500"></i>
          <span class="text-gray-600">Durada mitjana: {{ averageDuration }}min</span>
        </div>
        <div class="flex items-center gap-1">
          <i class="pi pi-euro text-green-500"></i>
          <span class="text-gray-600">Preu mitjà: {{ averagePrice }}€</span>
        </div>
      </div>
    </div>
  </ng-template>

  <!-- Template per el peu -->
  <ng-template #footer>
    <div class="p-3 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <!-- Informació addicional -->
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <div class="flex items-center gap-1">
            <i class="pi pi-info-circle"></i>
            <span>Preus amb IVA inclòs</span>
          </div>
          <div class="flex items-center gap-1">
            <i class="pi pi-clock"></i>
            <span>Reserves amb 24h d'antelació</span>
          </div>
        </div>
        
        <!-- Accions -->
        <div class="flex items-center gap-2">
          <button type="button" 
                  class="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors">
            <i class="pi pi-eye mr-1"></i>
            Veure tots
          </button>
          <button type="button" 
                  class="text-xs text-green-600 hover:text-green-800 font-medium px-3 py-1 rounded hover:bg-green-50 transition-colors">
            <i class="pi pi-calendar mr-1"></i>
            Reservar ara
          </button>
        </div>
      </div>
    </div>
  </ng-template>

  <!-- Template per missatge buit -->
  <ng-template #emptyMessage>
    <div class="p-8 text-center text-gray-500">
      <!-- Icona il·lustrativa -->
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <i class="pi pi-search text-3xl text-gray-400"></i>
      </div>
      
      <!-- Missatge principal -->
      <h4 class="font-semibold text-gray-700 mb-2">No s'han trobat serveis</h4>
      <p class="text-sm text-gray-500 mb-4">Prova amb altres paraules clau o filtra per categoria</p>
      
      <!-- Suggeriments -->
      <div class="text-xs text-gray-400 space-y-1">
        <p>Suggeriments: "tall", "coloració", "tractament", "barba"</p>
        <p>O contacta amb nosaltres per serveis personalitzats</p>
      </div>
      
      <!-- Botó d'ajuda -->
      <button type="button" 
              class="mt-4 text-xs text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded border border-blue-200 hover:bg-blue-50 transition-colors">
        <i class="pi pi-question-circle mr-1"></i>
        Necessites ajuda?
      </button>
    </div>
  </ng-template>
</pelu-input-select>
```

## Dades d'Exemple per a Serveis

```typescript
// Definició de les opcions de serveis
serviceOptions = [
  {
    value: 'haircut_premium',
    label: 'Tall de Cabell Premium',
    description: 'Tall de cabell professional amb productes de luxe',
    category: 'Cabell',
    icon: 'pi pi-user',
    color: '#3b82f6',
    price: 35,
    duration: 45,
    popular: true,
    new: false,
    discount: 0,
    available: true
  },
  {
    value: 'coloring_full',
    label: 'Coloració Completa',
    description: 'Coloració professional amb productes de qualitat',
    category: 'Coloració',
    icon: 'pi pi-palette',
    color: '#ef4444',
    price: 65,
    duration: 90,
    popular: true,
    new: false,
    discount: 10,
    available: true
  },
  {
    value: 'beard_trim',
    label: 'Arreglat de Barba',
    description: 'Modelat i arreglat professional de barba',
    category: 'Barba',
    icon: 'pi pi-user',
    color: '#8b5cf6',
    price: 20,
    duration: 30,
    popular: false,
    new: false,
    discount: 0,
    available: true
  },
  {
    value: 'treatment_hair',
    label: 'Tractament Capil·lar',
    description: 'Tractament regenerador per a cabell danyat',
    category: 'Tractament',
    icon: 'pi pi-heart',
    color: '#10b981',
    price: 45,
    duration: 60,
    popular: false,
    new: true,
    discount: 0,
    available: true
  },
  {
    value: 'styling_wedding',
    label: 'Estilitzat de Boda',
    description: 'Estilització especial per a esdeveniments',
    category: 'Estil',
    icon: 'pi pi-star',
    color: '#f59e0b',
    price: 80,
    duration: 120,
    popular: true,
    new: false,
    discount: 15,
    available: false
  },
  {
    value: 'kids_haircut',
    label: 'Tall Infantil',
    description: 'Tall de cabell especial per a nens',
    category: 'Infantil',
    icon: 'pi pi-user',
    color: '#06b6d4',
    price: 25,
    duration: 30,
    popular: false,
    new: false,
    discount: 0,
    available: true
  }
];

// Computed properties per a estadístiques
readonly popularServicesCount = computed(() => 
  this.serviceOptions.filter(service => service.popular).length
);

readonly averageDuration = computed(() => {
  const total = this.serviceOptions.reduce((sum, service) => sum + service.duration, 0);
  return Math.round(total / this.serviceOptions.length);
});

readonly averagePrice = computed(() => {
  const total = this.serviceOptions.reduce((sum, service) => sum + service.price, 0);
  return Math.round(total / this.serviceOptions.length);
});
```

## Característiques de la Plantilla

### 🎨 **Disseny Visual**
- **Colors dinàmics**: Cada servei té el seu propi color identificatiu
- **Icones descriptives**: Icones que representen el tipus de servei
- **Badges informatius**: Popular, nou, descompte, disponibilitat
- **Layout responsive**: Adaptable a diferents mides de pantalla

### 📊 **Informació Detallada**
- **Preu i durada**: Informació clau per a la presa de decisions
- **Categoria**: Classificació del servei
- **Descripció**: Detalls del que inclou el servei
- **Estadístiques**: Informació agregada en l'encapçalament

### 🔍 **Funcionalitats Avançades**
- **Cerca integrada**: Filtre en temps real
- **Estats visuals**: Disponibilitat, popularitat, novetats
- **Accions ràpides**: Botons per a reserves i més informació
- **Missatges contextuals**: Ajuda quan no hi ha resultats

### 🎯 **Experiència d'Usuari**
- **Selecció clara**: L'element seleccionat mostra tota la informació important
- **Comparació fàcil**: Layout que permet comparar serveis ràpidament
- **Navegació intuïtiva**: Encapçalament i peu informatius
- **Feedback visual**: Hover effects i transicions suaus

## Casos d'Ús

Aquesta plantilla és ideal per a:
- **Perruqueries i salons de bellesa**
- **Centres de serveis professionals**
- **Aplicacions de reserves**
- **Catàlegs de productes/serveis**
- **Dashboards d'administració**

## Personalització

La plantilla es pot adaptar fàcilment:
- **Colors**: Canvia els colors per adaptar-los a la marca
- **Informació**: Afegeix o elimina camps segons necessitats
- **Layout**: Modifica l'estructura per a diferents casos d'ús
- **Funcionalitats**: Afegeix més accions o informació 
