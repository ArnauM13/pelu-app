# 🚀 Signals - Millors Pràctiques per a Angular

Aquest document recull les millors pràctiques per utilitzar signals de manera eficient i mantenible en aplicacions Angular.

## 📋 Taula de Continguts

1. [Conceptes Bàsics](#conceptes-bàsics)
2. [Patrons de Disseny](#patrons-de-disseny)
3. [Optimització de Rendiment](#optimització-de-rendiment)
4. [Gestió d'Estat](#gestió-destat)
5. [Testing amb Signals](#testing-amb-signals)
6. [Exemples Pràctics](#exemples-pràctics)
7. [Troubleshooting](#troubleshooting)

## 🎯 Conceptes Bàsics

### Què són els Signals?

Els signals són una nova manera de gestionar l'estat reactiu en Angular. Són similars als observables de RxJS però més simples i eficients.

```typescript
import { signal, computed, effect } from '@angular/core';

// Signal bàsic
const count = signal(0);

// Computed signal
const doubleCount = computed(() => count() * 2);

// Effect per side effects
effect(() => {
  console.log('Count changed:', count());
});
```

### Tipus de Signals

1. **Writable Signals**: Poden ser modificats directament
2. **Computed Signals**: Derivats d'altres signals
3. **Readonly Signals**: Només lectura

```typescript
// Writable
const user = signal<User | null>(null);

// Computed
const isAuthenticated = computed(() => !!user());

// Readonly
const readonlyUser = user.asReadonly();
```

## 🏗️ Patrons de Disseny

### 1. Patró de Servei Centralitzat

```typescript
@Injectable({ providedIn: 'root' })
export class AppStateService {
  // Internal state signals
  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Public computed signals
  readonly user = computed(() => this.userSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());

  // Methods to update state
  setUser(user: User | null) {
    this.userSignal.set(user);
  }

  setLoading(loading: boolean) {
    this.loadingSignal.set(loading);
  }

  setError(error: string | null) {
    this.errorSignal.set(error);
  }
}
```

### 2. Patró de Component amb Signals

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngIf="isLoading()">Loading...</div>
    <div *ngIf="error()">Error: {{ error() }}</div>
    <div *ngFor="let user of filteredUsers()">
      {{ user.name }}
    </div>
  `
})
export class UserListComponent {
  private readonly appState = inject(AppStateService);
  private readonly searchSignal = signal('');

  // Public computed signals
  readonly isLoading = computed(() => this.appState.isLoading());
  readonly error = computed(() => this.appState.error());
  readonly users = computed(() => this.appState.users());
  readonly search = computed(() => this.searchSignal());

  // Derived computed signals
  readonly filteredUsers = computed(() => {
    const users = this.users();
    const search = this.search();
    
    if (!search) return users;
    
    return users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Action methods
  updateSearch(value: string) {
    this.searchSignal.set(value);
  }
}
```

### 3. Patró de Formulari Reactiu

```typescript
@Component({
  selector: 'app-user-form',
  template: `
    <form (ngSubmit)="onSubmit()">
      <input 
        [ngModel]="formData().name"
        (ngModelChange)="updateName($event)"
        placeholder="Nom"
      />
      <input 
        [ngModel]="formData().email"
        (ngModelChange)="updateEmail($event)"
        placeholder="Email"
      />
      <button type="submit" [disabled]="!isValid()">
        Guardar
      </button>
    </form>
  `
})
export class UserFormComponent {
  private readonly formDataSignal = signal({
    name: '',
    email: '',
  });

  readonly formData = computed(() => this.formDataSignal());
  readonly isValid = computed(() => {
    const data = this.formData();
    return data.name.length > 0 && data.email.includes('@');
  });

  updateName(name: string) {
    this.formDataSignal.update(data => ({ ...data, name }));
  }

  updateEmail(email: string) {
    this.formDataSignal.update(data => ({ ...data, email }));
  }

  onSubmit() {
    if (this.isValid()) {
      // Submit form data
    }
  }
}
```

## ⚡ Optimització de Rendiment

### 1. Memoització Intel·ligent

```typescript
// ❌ Mal - Recalcula cada vegada
const expensiveComputation = computed(() => {
  return heavyCalculation(data());
});

// ✅ Bé - Memoització amb dependències específiques
const expensiveComputation = computed(() => {
  const currentData = data();
  const cacheKey = JSON.stringify(currentData);
  
  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey);
  }
  
  const result = heavyCalculation(currentData);
  this.cache.set(cacheKey, result);
  return result;
});
```

### 2. Evitar Recomputacions Innecessàries

```typescript
// ❌ Mal - Computed que sempre es recalcula
const userDisplayName = computed(() => {
  const user = this.user();
  return user ? `${user.firstName} ${user.lastName}` : '';
});

// ✅ Bé - Computed que només es recalcula quan canvia l'usuari
const userDisplayName = computed(() => {
  const user = this.user();
  if (!user) return '';
  
  // Només recalcula si han canviat les dades de l'usuari
  return `${user.firstName} ${user.lastName}`;
});
```

### 3. Batch Updates

```typescript
// ❌ Mal - Múltiples actualitzacions
updateUser(user: User) {
  this.userSignal.set(user);
  this.isLoadingSignal.set(false);
  this.errorSignal.set(null);
}

// ✅ Bé - Batch update
updateUser(user: User) {
  // Actualitza múltiples signals de cop
  this.stateSignal.update(state => ({
    ...state,
    user,
    isLoading: false,
    error: null,
  }));
}
```

## 🗂️ Gestió d'Estat

### 1. Estructura d'Estat Jeràrquica

```typescript
interface AppState {
  // Authentication
  auth: {
    user: User | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // UI State
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    currentRoute: string;
  };
  
  // Data State
  data: {
    users: User[];
    posts: Post[];
    isLoading: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly stateSignal = signal<AppState>({
    auth: { user: null, isLoading: false, error: null },
    ui: { theme: 'light', sidebarOpen: false, currentRoute: '' },
    data: { users: [], posts: [], isLoading: false },
  });

  // Computed signals per cada secció
  readonly auth = computed(() => this.stateSignal().auth);
  readonly ui = computed(() => this.stateSignal().ui);
  readonly data = computed(() => this.stateSignal().data);

  // Convenience signals
  readonly user = computed(() => this.auth().user);
  readonly isLoading = computed(() => this.auth().isLoading || this.data().isLoading);
  readonly theme = computed(() => this.ui().theme);
}
```

### 2. Gestió d'Errors amb Signals

```typescript
interface ErrorState {
  message: string;
  code?: string;
  timestamp: Date;
  isVisible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly errorsSignal = signal<ErrorState[]>([]);

  readonly errors = computed(() => this.errorsSignal());
  readonly hasErrors = computed(() => this.errors().length > 0);
  readonly visibleErrors = computed(() => 
    this.errors().filter(error => error.isVisible)
  );

  addError(message: string, code?: string) {
    const error: ErrorState = {
      message,
      code,
      timestamp: new Date(),
      isVisible: true,
    };

    this.errorsSignal.update(errors => [...errors, error]);
  }

  clearError(index: number) {
    this.errorsSignal.update(errors => 
      errors.filter((_, i) => i !== index)
    );
  }

  clearAllErrors() {
    this.errorsSignal.set([]);
  }
}
```

### 3. Cache amb Signals

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly cacheSignal = signal<Map<string, CacheEntry<any>>>(new Map());

  readonly cache = computed(() => this.cacheSignal());

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cacheSignal.update(cache => {
      const newCache = new Map(cache);
      newCache.set(key, entry);
      return newCache;
    });
  }

  get<T>(key: string): T | null {
    const cache = this.cache();
    const entry = cache.get(key) as CacheEntry<T>;

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string) {
    this.cacheSignal.update(cache => {
      const newCache = new Map(cache);
      newCache.delete(key);
      return newCache;
    });
  }

  clear() {
    this.cacheSignal.set(new Map());
  }
}
```

## 🧪 Testing amb Signals

### 1. Testing de Components amb Signals

```typescript
describe('UserListComponent', () => {
  let component: UserListComponent;
  let appStateService: jasmine.SpyObj<AppStateService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AppStateService', [], {
      users: signal([
        { id: '1', name: 'Joan' },
        { id: '2', name: 'Maria' },
      ]),
      isLoading: signal(false),
      error: signal(null),
    });

    TestBed.configureTestingModule({
      declarations: [UserListComponent],
      providers: [
        { provide: AppStateService, useValue: spy }
      ]
    });

    component = TestBed.createComponent(UserListComponent).componentInstance;
    appStateService = TestBed.inject(AppStateService) as jasmine.SpyObj<AppStateService>;
  });

  it('should filter users based on search', () => {
    // Arrange
    component.updateSearch('joan');

    // Act
    const filteredUsers = component.filteredUsers();

    // Assert
    expect(filteredUsers.length).toBe(1);
    expect(filteredUsers[0].name).toBe('Joan');
  });
});
```

### 2. Testing de Serveis amb Signals

```typescript
describe('AppStateService', () => {
  let service: AppStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppStateService]
    });
    service = TestBed.inject(AppStateService);
  });

  it('should update user state', () => {
    // Arrange
    const user = { id: '1', name: 'Joan' };

    // Act
    service.setUser(user);

    // Assert
    expect(service.user()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should handle loading state', () => {
    // Act
    service.setLoading(true);

    // Assert
    expect(service.isLoading()).toBe(true);

    // Act
    service.setLoading(false);

    // Assert
    expect(service.isLoading()).toBe(false);
  });
});
```

## 📝 Exemples Pràctics

### 1. Paginació amb Signals

```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

@Component({
  selector: 'app-paginated-list',
  template: `
    <div *ngFor="let item of paginatedItems()">
      {{ item.name }}
    </div>
    
    <div class="pagination">
      <button 
        [disabled]="currentPage() === 1"
        (click)="previousPage()"
      >
        Anterior
      </button>
      
      <span>{{ currentPage() }} de {{ totalPages() }}</span>
      
      <button 
        [disabled]="currentPage() === totalPages()"
        (click)="nextPage()"
      >
        Següent
      </button>
    </div>
  `
})
export class PaginatedListComponent {
  private readonly itemsSignal = signal<any[]>([]);
  private readonly paginationSignal = signal<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  });

  readonly items = computed(() => this.itemsSignal());
  readonly pagination = computed(() => this.paginationSignal());
  
  readonly currentPage = computed(() => this.pagination().currentPage);
  readonly pageSize = computed(() => this.pagination().pageSize);
  readonly totalItems = computed(() => this.pagination().totalItems);
  readonly totalPages = computed(() => 
    Math.ceil(this.totalItems() / this.pageSize())
  );

  readonly paginatedItems = computed(() => {
    const items = this.items();
    const { currentPage, pageSize } = this.pagination();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return items.slice(startIndex, endIndex);
  });

  previousPage() {
    if (this.currentPage() > 1) {
      this.paginationSignal.update(p => ({ ...p, currentPage: p.currentPage - 1 }));
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.paginationSignal.update(p => ({ ...p, currentPage: p.currentPage + 1 }));
    }
  }

  setPage(page: number) {
    this.paginationSignal.update(p => ({ ...p, currentPage: page }));
  }
}
```

### 2. Drag and Drop amb Signals

```typescript
interface DragState {
  isDragging: boolean;
  draggedItem: any | null;
  dropTarget: any | null;
}

@Component({
  selector: 'app-draggable-list',
  template: `
    <div 
      *ngFor="let item of items()"
      class="draggable-item"
      [class.dragging]="isDraggingItem(item)"
      [class.drop-target]="isDropTarget(item)"
      (mousedown)="startDrag(item, $event)"
      (mouseover)="setDropTarget(item)"
      (mouseup)="dropItem()"
    >
      {{ item.name }}
    </div>
  `
})
export class DraggableListComponent {
  private readonly itemsSignal = signal<any[]>([]);
  private readonly dragStateSignal = signal<DragState>({
    isDragging: false,
    draggedItem: null,
    dropTarget: null,
  });

  readonly items = computed(() => this.itemsSignal());
  readonly dragState = computed(() => this.dragStateSignal());

  readonly isDragging = computed(() => this.dragState().isDragging);
  readonly draggedItem = computed(() => this.dragState().draggedItem);
  readonly dropTarget = computed(() => this.dragState().dropTarget);

  isDraggingItem(item: any): boolean {
    return this.isDragging() && this.draggedItem()?.id === item.id;
  }

  isDropTarget(item: any): boolean {
    return this.isDragging() && this.dropTarget()?.id === item.id;
  }

  startDrag(item: any, event: MouseEvent) {
    this.dragStateSignal.set({
      isDragging: true,
      draggedItem: item,
      dropTarget: null,
    });
  }

  setDropTarget(item: any) {
    if (this.isDragging()) {
      this.dragStateSignal.update(state => ({
        ...state,
        dropTarget: item,
      }));
    }
  }

  dropItem() {
    const { draggedItem, dropTarget } = this.dragState();
    
    if (draggedItem && dropTarget) {
      // Reorder items
      this.reorderItems(draggedItem, dropTarget);
    }

    this.dragStateSignal.set({
      isDragging: false,
      draggedItem: null,
      dropTarget: null,
    });
  }

  private reorderItems(dragged: any, target: any) {
    this.itemsSignal.update(items => {
      const newItems = [...items];
      const draggedIndex = newItems.findIndex(item => item.id === dragged.id);
      const targetIndex = newItems.findIndex(item => item.id === target.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, removed);
      }
      
      return newItems;
    });
  }
}
```

## 🔧 Troubleshooting

### Problemes Comuns

#### 1. Signals que no es recalculen

```typescript
// ❌ Mal - Signal no reactiu
const user = signal({ name: 'Joan', age: 30 });
user().age = 31; // No dispara recomputació

// ✅ Bé - Actualització correcta
user.update(u => ({ ...u, age: 31 }));
```

#### 2. Computed signals que es recalculen massa

```typescript
// ❌ Mal - Recalculació innecessària
const expensiveValue = computed(() => {
  return heavyCalculation(data()); // Es recalcula cada vegada
});

// ✅ Bé - Memoització
const expensiveValue = computed(() => {
  const currentData = data();
  return this.memoizedCalculation(currentData);
});
```

#### 3. Effects que causen loops infinits

```typescript
// ❌ Mal - Loop infinit
effect(() => {
  const count = this.count();
  this.count.set(count + 1); // Causa loop infinit
});

// ✅ Bé - Condició de sortida
effect(() => {
  const count = this.count();
  if (count < 10) {
    this.count.set(count + 1);
  }
});
```

### Debugging Signals

```typescript
// Afegir logging per debug
effect(() => {
  console.log('Signal changed:', {
    user: this.user(),
    isLoading: this.isLoading(),
    timestamp: new Date().toISOString(),
  });
});

// Verificar dependències
const debugSignal = computed(() => {
  console.log('Computing debug signal');
  return this.user()?.name || 'No user';
});
```

## 📚 Recursos Addicionals

- [Documentació oficial d'Angular Signals](https://angular.io/guide/signals)
- [Angular Signals RFC](https://github.com/angular/angular/discussions/49090)
- [RxJS vs Signals](https://angular.io/guide/signals#signals-vs-rxjs)
- [Performance Tips](https://angular.io/guide/signals#performance-considerations)

## 🎉 Conclusió

Els signals són una eina poderosa per a la gestió d'estat reactiu en Angular. Seguint aquestes millors pràctiques, pots crear aplicacions més eficients, mantenibles i escalables.

Recorda:
- ✅ Usa signals per a l'estat local i global
- ✅ Aprofa la memoització automàtica
- ✅ Manté els signals simples i composables
- ✅ Testeja els signals adequadament
- ✅ Monitoritza el rendiment
- ✅ Documenta els patrons complexos

Amb aquests patrons i pràctiques, estaràs preparat per a construir aplicacions Angular modernes i eficients amb signals! 🚀 
