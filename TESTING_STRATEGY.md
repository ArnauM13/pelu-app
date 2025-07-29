# 📋 Estratègia de Testing - PeluApp

## 🎯 Visió General

Aquest document descriu l'estratègia de testing implementada a PeluApp, una aplicació Angular 20 per a la gestió de reserves de perruqueria. L'arquitectura de testing està dissenyada per garantir la qualitat del codi, facilitar el manteniment i assegurar la fiabilitat de l'aplicació.

## 🏗️ Arquitectura de Testing

### Stack Tecnològic

- **Framework de Testing**: Jasmine 5.8.0
- **Test Runner**: Karma 6.4.0
- **Coverage**: Karma Coverage 2.2.1
- **Browser Testing**: Chrome Headless
- **E2E Testing**: Cypress (referenciat en documentació)
- **Mocking**: Mocks personalitzats per Firebase i serveis externs

### Estructura de Testing

```
src/
├── testing/                          # Configuració central de testing
│   ├── test-setup.ts                # Configuració global de TestBed
│   ├── firebase-mocks.ts            # Mocks per serveis de Firebase
│   └── translation-mocks.ts         # Mocks per serveis de traducció
├── app/
│   ├── **/*.spec.ts                 # Tests unitaris per components
│   └── **/*.component.spec.ts       # Tests específics de components
└── tsconfig.spec.json               # Configuració TypeScript per tests
```

## 🔧 Configuració de Testing

### Configuració de Karma (angular.json)

```json
{
  "test": {
    "builder": "@angular/build:karma",
    "options": {
      "polyfills": ["zone.js", "zone.js/testing"],
      "tsConfig": "tsconfig.spec.json",
      "inlineStyleLanguage": "scss",
      "assets": ["src/assets"],
      "styles": ["node_modules/primeicons/primeicons.css", "src/styles.scss"]
    }
  }
}
```

### Configuració TypeScript per Tests (tsconfig.spec.json)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"]
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

## 🎭 Sistema de Mocks

### 1. Mocks de Firebase (`src/testing/firebase-mocks.ts`)

#### Propòsit
Simular tots els serveis de Firebase (Auth, Firestore, Functions, Storage) sense dependències externes.

#### Components Principals

```typescript
// Mock user object
export const mockUser: any = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  // ... altres propietats
};

// Mock Firestore
export const firestoreMock = {
  collection: jasmine.createSpy('collection').and.returnValue({
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
    doc: jasmine.createSpy('doc').and.returnValue({
      valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
      set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
      // ... altres mètodes
    }),
  }),
};

// Mock Auth
export const authMock = {
  currentUser: Promise.resolve({
    uid: 'mock-user-id',
    email: 'mock@example.com',
    displayName: 'Mock User',
  }),
  signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword'),
  // ... altres mètodes
};
```

#### Ús en Tests

```typescript
import { provideMockFirebase } from '../../testing/firebase-mocks';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MyComponent],
    providers: [
      ...provideMockFirebase(),
      // altres providers
    ],
  }).compileComponents();
});
```

### 2. Mocks de Traducció (`src/testing/translation-mocks.ts`)

#### Propòsit
Simular el sistema de traducció multiidioma sense dependències externes.

#### Components Principals

```typescript
// Mock TranslateService
export const mockTranslateService = {
  instant: jasmine.createSpy('instant').and.returnValue('Mocked Translation'),
  get: jasmine.createSpy('get').and.returnValue(of('Mocked Translation')),
  use: jasmine.createSpy('use').and.returnValue(of('Mocked Translation')),
  onLangChange: new EventEmitter(),
  // ... altres mètodes
};

// Mock TranslationService
export const mockTranslationService = {
  get: jasmine.createSpy('get').and.returnValue('Mocked Translation'),
  setLanguage: jasmine.createSpy('setLanguage'),
  getCurrentLanguageInfo: jasmine.createSpy('getCurrentLanguageInfo'),
  // ... altres mètodes
};
```

### 3. Configuració Global de Testing (`src/testing/test-setup.ts`)

#### Funcions Principals

```typescript
// Configuració estàndard de TestBed
export function configureTestBed(components: any[] = [], additionalProviders: any[] = []) {
  const allProviders = [
    ...provideMockFirebase(),
    { provide: ServiceColorsService, useClass: MockServiceColorsService },
    { provide: ServicesService, useClass: MockServicesService },
    { provide: RoleService, useClass: MockRoleService },
    { provide: UserService, useClass: MockUserService },
    { provide: CurrencyService, useClass: MockCurrencyService },
    { provide: ToastService, useValue: { showAppointmentCreated: () => {} } },
    ...additionalProviders,
  ];

  return TestBed.configureTestingModule({
    imports: components,
    providers: allProviders,
  });
}

// Configuració per tests individuals
export function configureTestModule(additionalProviders: any[] = []) {
  const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  const baseProviders = [
    ...provideMockFirebase(),
    { provide: MessageService, useValue: messageServiceSpy },
    { provide: Router, useValue: routerSpy },
    // ... altres providers base
  ];

  return {
    providers: [...baseProviders, ...additionalProviders],
    messageService: messageServiceSpy,
    router: routerSpy,
  };
}
```

## 🧪 Tipus de Tests

### 1. Tests Unitaris

#### Estructura Estàndard

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestBed } from '../../testing/test-setup';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await configureTestBed([MyComponent]).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.open).toBeDefined();
    expect(component.booking).toBeDefined();
  });

  it('should have required output signals', () => {
    expect(component.closed).toBeDefined();
    expect(component.deleted).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.currentBooking).toBeDefined();
    expect(component.isOpen).toBeDefined();
  });
});
```

#### Tests de Components amb Signals

```typescript
describe('Component with Signals', () => {
  it('should update signal values', () => {
    // Test de signals
    component.dataSignal.set([{ id: 1, name: 'Test' }]);
    expect(component.hasData()).toBe(true);
  });

  it('should compute derived values', () => {
    component.loadingSignal.set(true);
    expect(component.isLoading()).toBe(true);
  });
});
```

### 2. Tests d'Integració

#### Tests amb Serveis Reals

```typescript
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MyComponent Integration', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent, HttpClientTestingModule],
      providers: [
        // Providers específics per integració
      ],
    }).compileComponents();
  });

  it('should load data from service', async () => {
    // Test d'integració amb serveis
    const service = TestBed.inject(MyService);
    spyOn(service, 'getData').and.returnValue(of([{ id: 1 }]));
    
    component.loadData();
    await fixture.whenStable();
    
    expect(component.data().length).toBe(1);
  });
});
```

### 3. Tests de Serveis

#### Estructura per Serveis

```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';
import { provideMockFirebase } from '../../testing/firebase-mocks';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyService,
        ...provideMockFirebase(),
      ],
    });
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return data from Firebase', (done) => {
    service.getData().subscribe(data => {
      expect(data).toBeDefined();
      done();
    });
  });
});
```

## 🎯 Estratègies de Testing per Components Específics

### 1. Components amb PrimeNG

```typescript
describe('Component with PrimeNG', () => {
  beforeEach(async () => {
    await configureTestBed([MyComponent], [
      { provide: MessageService, useValue: mockMessageService },
      { provide: ConfirmationService, useValue: mockConfirmationService },
    ]).compileComponents();
  });

  it('should show PrimeNG message', () => {
    component.showMessage('success', 'Test message');
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Test message',
    });
  });
});
```

### 2. Components amb Routing

```typescript
describe('Component with Routing', () => {
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    activatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('test-id'),
        },
      },
    });

    await configureTestBed([MyComponent], [
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: activatedRoute },
    ]).compileComponents();
  });

  it('should navigate on action', () => {
    component.navigateToDetails();
    expect(router.navigate).toHaveBeenCalledWith(['/details', 'test-id']);
  });
});
```

### 3. Components amb Formularis Reactius

```typescript
import { ReactiveFormsModule } from '@angular/forms';

describe('Component with Reactive Forms', () => {
  beforeEach(async () => {
    await configureTestBed([MyComponent], [
      { provide: ReactiveFormsModule },
    ]).compileComponents();
  });

  it('should validate form', () => {
    const form = component.form;
    const emailControl = form.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });
});
```

## 📊 Cobertura de Testing

### Objectius de Cobertura

- **Cobertura Mínima**: 80%
- **Components Crítics**: 90%+
- **Serveis de Negoci**: 85%+
- **Guards i Interceptors**: 100%

### Comandaments de Cobertura

```bash
# Executar tests amb cobertura
npm run test:coverage

# Executar tests en mode watch
npm test

# Executar tests específics
ng test --include="**/my-component.spec.ts"
```

### Anàlisi de Cobertura

```bash
# Generar report detallat
ng test --code-coverage --watch=false

# Veure report en navegador
open coverage/index.html
```

## 🔄 Manteniment de Tests

### 1. Actualització de Mocks

#### Quan Actualitzar Mocks

- Quan s'afegeixen nous mètodes als serveis
- Quan canvia la interfície de Firebase
- Quan s'afegeixen noves dependències

#### Procés d'Actualització

```typescript
// 1. Identificar el servei que necessita mock
// 2. Afegir el mock a firebase-mocks.ts o translation-mocks.ts
// 3. Actualitzar configureTestBed si és necessari
// 4. Verificar que tots els tests passen

// Exemple d'actualització
export const mockNewService = {
  newMethod: jasmine.createSpy('newMethod').and.returnValue(of([])),
};
```

### 2. Refactoring de Tests

#### Millores Contínues

```typescript
// Abans: Test específic
it('should call service method', () => {
  component.loadData();
  expect(mockService.getData).toHaveBeenCalled();
});

// Després: Test més robust
it('should load and display data', async () => {
  const testData = [{ id: 1, name: 'Test' }];
  mockService.getData.and.returnValue(of(testData));
  
  component.loadData();
  await fixture.whenStable();
  
  expect(component.data()).toEqual(testData);
  expect(fixture.nativeElement.textContent).toContain('Test');
});
```

### 3. Organització de Tests

#### Estructura Recomanada

```typescript
describe('MyComponent', () => {
  // Setup
  beforeEach(async () => {
    // Configuració
  });

  // Tests de creació
  describe('Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  // Tests de inputs
  describe('Inputs', () => {
    it('should accept input signals', () => {
      // Tests d'inputs
    });
  });

  // Tests de outputs
  describe('Outputs', () => {
    it('should emit events', () => {
      // Tests d'outputs
    });
  });

  // Tests de lògica
  describe('Logic', () => {
    it('should compute values correctly', () => {
      // Tests de lògica
    });
  });

  // Tests d'integració
  describe('Integration', () => {
    it('should work with services', () => {
      // Tests d'integració
    });
  });
});
```

## 🚀 Automatització de Testing

### 1. CI/CD Pipeline

#### Configuració GitHub Actions

```yaml
# .github/workflows/ci-pipeline.yml
name: CI Pipeline

on:
  pull_request:
    branches: [dev, release]
  push:
    branches: [dev, release]

jobs:
  frontend:
    name: Build & Test Frontend
    runs-on: ubuntu-latest

    steps:
      - name: Check out repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Angular tests
        run: npm test -- --watch=false --browsers=ChromeHeadless --code-coverage

      - name: Build Angular app
        run: npm run build

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: frontend
          name: frontend-coverage
```

### 2. Pre-commit Hooks

#### Configuració Recomanada

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint:format && npm test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

## 🛠️ Eines i Utilitats

### 1. Comandaments Útils

```bash
# Tests bàsics
npm test

# Tests amb cobertura
npm run test:coverage

# Tests en mode watch
npm test -- --watch

# Tests específics
ng test --include="**/auth/**/*.spec.ts"

# Debug tests
ng test --browsers=Chrome --watch=false
```

### 2. Debugging de Tests

#### Configuració VS Code

```json
// .vscode/launch.json
{
  "name": "ng test",
  "type": "chrome",
  "request": "launch",
  "preLaunchTask": "npm: test",
  "url": "http://localhost:9876/debug.html"
}
```

### 3. Generació de Tests

#### Schematics Personalitzats

```bash
# Generar component amb test
ng generate component my-component --skip-tests=false

# Generar servei amb test
ng generate service my-service --skip-tests=false

# Generar pipe amb test
ng generate pipe my-pipe --skip-tests=false
```

## 📈 Mètriques i Qualitat

### 1. Mètriques de Qualitat

- **Cobertura de Línies**: 80% mínim
- **Cobertura de Branques**: 70% mínim
- **Cobertura de Funcions**: 85% mínim
- **Tests per Component**: 5+ tests
- **Temps d'Execució**: < 30 segons

### 2. Qualitat de Tests

#### Criteris d'Avaluació

- **Claredat**: Tests fàcils de comprendre
- **Aïllament**: Tests independents
- **Velocitat**: Tests ràpids
- **Mantenibilitat**: Tests fàcils de mantenir
- **Cobertura**: Tests complets

#### Anti-patterns a Evitar

```typescript
// ❌ Test massa específic
it('should have specific text', () => {
  expect(element.textContent).toBe('Exact text');
});

// ✅ Test més flexible
it('should display user name', () => {
  expect(element.textContent).toContain('John Doe');
});

// ❌ Test que depèn d'altres
it('should work after other test', () => {
  // Depèn d'estat anterior
});

// ✅ Test independent
it('should work in isolation', () => {
  // Setup complet
});
```

## 🔧 Troubleshooting

### 1. Problemes Comuns

#### Error de Compilació

```bash
# Limpiar cache
npm run clean
rm -rf node_modules
npm install

# Verificar tipus
npm run type-check
```

#### Tests que Fallen Intermitentment

```typescript
// Afegir async/await
it('should load data', async () => {
  component.loadData();
  await fixture.whenStable();
  expect(component.data()).toBeDefined();
});

// Usar fakeAsync per operacions asíncrones
it('should handle async operations', fakeAsync(() => {
  component.handleAsyncOperation();
  tick(1000);
  expect(component.result()).toBeDefined();
}));
```

#### Problemes amb Mocks

```typescript
// Reset mocks entre tests
beforeEach(() => {
  jasmine.getEnv().clearSpies();
});

// Verificar que els mocks s'han cridat
expect(mockService.method).toHaveBeenCalledWith(expectedArgs);
```

### 2. Debugging Avançat

#### Logs de Testing

```typescript
// Afegir logs per debugging
it('should work correctly', () => {
  console.log('Component state:', component);
  console.log('Fixture state:', fixture);
  // Test logic
});
```

#### Inspecció de DOM

```typescript
it('should render correctly', () => {
  const element = fixture.nativeElement;
  console.log('DOM:', element.innerHTML);
  // Test logic
});
```

## 📚 Recursos i Referències

### 1. Documentació Oficial

- [Angular Testing Guide](https://angular.dev/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)
- [Cypress Documentation](https://docs.cypress.io/)

### 2. Millors Pràctiques

- **AAA Pattern**: Arrange, Act, Assert
- **FIRST Principles**: Fast, Independent, Repeatable, Self-validating, Timely
- **Test Pyramid**: Unit tests > Integration tests > E2E tests

### 3. Eines Recomanades

- **Angular DevTools**: Per debugging de components
- **Jasmine HTML Reporter**: Per visualització de tests
- **Coverage Reports**: Per anàlisi de cobertura

## 🎯 Conclusió

L'estratègia de testing de PeluApp està dissenyada per:

1. **Garantir Qualitat**: Tests complets i robustos
2. **Facilitar Manteniment**: Estructura clara i organitzada
3. **Millorar Productivitat**: Eines i utilitats eficients
4. **Assegurar Fiabilitat**: Cobertura alta i tests fiables

Aquesta estratègia permet desenvolupar amb confiança i mantenir l'aplicació amb alt estàndard de qualitat.

---

**Última actualització**: Juliol 2025  
**Versió**: 1.0.0  
**Mantingut per**: Equip de PeluApp
