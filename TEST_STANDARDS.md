# Test Standards and Guidelines

## Overview

This document outlines the testing standards, patterns, and utilities for the Angular application. It provides reusable components and best practices for writing maintainable tests.

## Test Structure

### 1. Test Setup

All tests should use the standardized test setup utilities:

```typescript
import { setupComponentTest, testPatterns, domTestUtils, testDataFactories } from '../../../../testing/test-setup';

describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentName]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
  });

  // Tests...
});
```

### 2. Standard Test Patterns

Use the predefined test patterns for common scenarios:

```typescript
// Component creation
testPatterns.shouldCreate(component);

// Component rendering
testPatterns.shouldRender(fixture);

// Required properties
testPatterns.shouldHaveProperties(component, ['property1', 'property2']);

// Required methods
testPatterns.shouldHaveMethods(component, ['method1', 'method2']);

// Event emissions
testPatterns.shouldEmitEvent(component, 'eventName', () => {
  // Trigger event
}, expectedValue);

// Input changes
testPatterns.shouldHandleInputChange(component, 'inputName', newValue);

// User interactions
testPatterns.shouldRespondToUserInteraction(fixture, () => {
  // User action
}, () => {
  // Expected behavior
});

// Loading states
testPatterns.shouldShowLoadingState(component, 'loadingProperty', () => {
  // Trigger loading
});

// Error handling
testPatterns.shouldHandleErrors(component, () => {
  // Trigger error
}, () => {
  // Expected error behavior
});
```

## Mock Utilities

### 1. Firebase Mocks

Comprehensive mocks for Firebase services:

```typescript
import { 
  mockAuth, 
  mockAuthService, 
  mockUser,
  mockTranslateService,
  mockTranslationService,
  mockMessageService,
  mockConfirmationService
} from '../../../../testing/firebase-mocks';
```

### 2. DOM Utilities

Utilities for creating mock DOM events:

```typescript
import { domTestUtils } from '../../../../testing/test-setup';

// Create mock events
const clickEvent = domTestUtils.createEvent('click');
const backdropEvent = domTestUtils.createBackdropEvent();
const nonBackdropEvent = domTestUtils.createNonBackdropEvent();

// Create mock elements
const element = domTestUtils.createElement('div', 'test-class');
```

### 3. Signal Utilities

Utilities for testing Angular signals:

```typescript
import { signalTestUtils } from '../../../../testing/test-setup';

// Create test signals
const testSignal = signalTestUtils.createSignal(initialValue);
const testComputed = signalTestUtils.createComputed(() => computedValue);

// Mock signals
const mockSignal = signalTestUtils.mockSignal(value);
const mockComputed = signalTestUtils.mockComputed(value);
const mockOutput = signalTestUtils.mockOutput();
```

### 4. Test Data Factories

Reusable test data creation:

```typescript
import { testDataFactories } from '../../../../testing/test-setup';

// Create mock data
const appointment = testDataFactories.createMockAppointment({
  id: 'custom-id',
  nom: 'Custom Name'
});

const service = testDataFactories.createMockService({
  name: 'Custom Service',
  price: 50
});

const client = testDataFactories.createMockClient({
  email: 'custom@example.com'
});

const popupItem = testDataFactories.createMockPopupItem({
  title: 'Custom Popup'
});
```

## PrimeNG Testing

### 1. PrimeNG Modules

Import common PrimeNG modules for testing:

```typescript
import { commonPrimeNGModules } from '../../../../testing/firebase-mocks';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ComponentName, ...commonPrimeNGModules]
  }).compileComponents();
});
```

### 2. PrimeNG Services

Mock PrimeNG services:

```typescript
import { 
  mockMessageService, 
  mockConfirmationService 
} from '../../../../testing/firebase-mocks';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ComponentName],
    providers: [
      { provide: MessageService, useValue: mockMessageService },
      { provide: ConfirmationService, useValue: mockConfirmationService }
    ]
  }).compileComponents();
});
```

## Testing Patterns

### 1. Component Testing

#### Basic Component Test
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentName]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
```

#### Component with Signals
```typescript
describe('SignalComponent', () => {
  let component: SignalComponent;
  let fixture: ComponentFixture<SignalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SignalComponent);
    component = fixture.componentInstance;
  });

  it('should have input signals', () => {
    expect(component.inputSignal).toBeDefined();
    expect(typeof component.inputSignal).toBe('function');
  });

  it('should have output signals', () => {
    expect(component.outputSignal).toBeDefined();
    expect(typeof component.outputSignal.emit).toBe('function');
  });

  it('should have computed properties', () => {
    expect(component.computedProperty).toBeDefined();
    expect(typeof component.computedProperty).toBe('function');
  });
});
```

#### Component with PrimeNG
```typescript
describe('PrimeNGComponent', () => {
  let component: PrimeNGComponent;
  let fixture: ComponentFixture<PrimeNGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeNGComponent, ...commonPrimeNGModules],
      providers: [
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrimeNGComponent);
    component = fixture.componentInstance;
  });

  it('should show toast message', () => {
    component.showMessage('Test message');
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Test message'
    });
  });
});
```

### 2. Service Testing

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: jasmine.SpyObj<DependencyService>;

  beforeEach(() => {
    mockDependency = jasmine.createSpyObj('DependencyService', ['method']);
    
    TestBed.configureTestingModule({
      providers: [
        ServiceName,
        { provide: DependencyService, useValue: mockDependency }
      ]
    });
    
    service = TestBed.inject(ServiceName);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call dependency method', () => {
    service.doSomething();
    expect(mockDependency.method).toHaveBeenCalled();
  });
});
```

### 3. Guard Testing

```typescript
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow access when authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    expect(guard.canActivate()).toBe(true);
  });

  it('should redirect when not authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    guard.canActivate();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Keep tests focused and test one thing at a time
- Use `beforeEach` for common setup
- Use `afterEach` for cleanup

### 2. Mocking

- Mock external dependencies
- Use spy objects for method calls
- Reset mocks between tests
- Use realistic mock data

### 3. Assertions

- Use specific assertions
- Test both positive and negative cases
- Verify method calls with correct parameters
- Test error conditions

### 4. Async Testing

```typescript
it('should handle async operations', async () => {
  const result = await component.asyncMethod();
  expect(result).toBe(expectedValue);
});

it('should handle observables', (done) => {
  component.observableMethod().subscribe(result => {
    expect(result).toBe(expectedValue);
    done();
  });
});
```

### 5. DOM Testing

```typescript
it('should update DOM when data changes', () => {
  component.data = newData;
  fixture.detectChanges();
  
  const element = fixture.nativeElement.querySelector('.test-class');
  expect(element.textContent).toContain(expectedText);
});

it('should handle user interactions', () => {
  const button = fixture.nativeElement.querySelector('button');
  button.click();
  fixture.detectChanges();
  
  expect(component.method).toHaveBeenCalled();
});
```

## Common Test Scenarios

### 1. Input/Output Testing

```typescript
it('should emit event when input changes', () => {
  spyOn(component.outputEvent, 'emit');
  
  component.inputValue = 'new value';
  
  expect(component.outputEvent.emit).toHaveBeenCalledWith('new value');
});
```

### 2. Signal Testing

```typescript
it('should update computed when input changes', () => {
  component.inputSignal.set('new value');
  
  expect(component.computedSignal()).toBe('computed new value');
});
```

### 3. Error Handling

```typescript
it('should handle errors gracefully', () => {
  spyOn(console, 'error');
  spyOn(mockService, 'method').and.throwError('Test error');
  
  expect(() => component.methodThatMightFail()).not.toThrow();
  expect(component.errorState).toBe(true);
});
```

### 4. Loading States

```typescript
it('should show loading state during async operation', () => {
  component.startAsyncOperation();
  
  expect(component.isLoading()).toBe(true);
  
  // Simulate completion
  component.completeAsyncOperation();
  
  expect(component.isLoading()).toBe(false);
});
```

## Test Utilities Reference

### Available Utilities

- `setupComponentTest` - Standard component test setup
- `setupPrimeNGTest` - Component test setup with PrimeNG modules
- `testPatterns` - Common test patterns
- `domTestUtils` - DOM manipulation utilities
- `signalTestUtils` - Signal testing utilities
- `testDataFactories` - Test data creation utilities

### Mock Services

- `mockAuth` - Firebase Auth mock
- `mockAuthService` - AuthService mock
- `mockTranslateService` - TranslateService mock
- `mockTranslationService` - TranslationService mock
- `mockMessageService` - PrimeNG MessageService mock
- `mockConfirmationService` - PrimeNG ConfirmationService mock

### Test Data

- `mockAppointments` - Sample appointment data
- `mockServices` - Sample service data
- `mockClients` - Sample client data
- `mockUser` - Sample user data

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --include="**/component.spec.ts"
```

## Coverage Requirements

- Minimum 80% line coverage
- Minimum 70% branch coverage
- All public methods should be tested
- All user interactions should be tested
- Error conditions should be tested

## Continuous Integration

Tests are automatically run on:
- Pull request creation
- Code push to main branch
- Scheduled nightly builds

All tests must pass before code can be merged. 
