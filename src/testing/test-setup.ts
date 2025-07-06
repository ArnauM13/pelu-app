import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from '../app/core/translation.service';
import { AuthService } from '../app/auth/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import {
  mockAuth,
  mockAuthService,
  mockRouter,
  mockActivatedRoute,
  mockMessageService,
  mockConfirmationService,
  provideMockFirebase,
  commonPrimeNGModules,
  waitForAsync,
  createTestSignal,
  createTestComputed,
  mockSignal,
  mockComputed,
  mockOutput,
  createMockEvent,
  createMockElement,
  createMockBackdropEvent,
  createMockNonBackdropEvent
} from './firebase-mocks';
import {
  mockTranslateService,
  mockTranslateStore,
  mockTranslationService,
  translationTestUtils
} from './translation-mocks';

/**
 * Provides all necessary mocks and providers for Angular component tests
 */
export const provideTestSetup = () => [
  { provide: Auth, useValue: mockAuth },
  { provide: TranslateService, useValue: mockTranslateService },
  { provide: TranslateStore, useValue: mockTranslateStore },
  { provide: TranslationService, useValue: mockTranslationService },
  { provide: AuthService, useValue: mockAuthService },
  { provide: Router, useValue: mockRouter },
  { provide: ActivatedRoute, useValue: mockActivatedRoute },
  { provide: MessageService, useValue: mockMessageService },
  { provide: ConfirmationService, useValue: mockConfirmationService },
  provideRouter([])
];

/**
 * Configures TestBed with common test setup
 */
export const configureTestBed = (imports: any[] = [], additionalProviders: any[] = []) => {
  return TestBed.configureTestingModule({
    imports,
    providers: [
      ...provideTestSetup(),
      ...additionalProviders
    ]
  });
};

/**
 * Creates a test component with proper setup
 */
export const createTestComponent = <T>(component: any, additionalProviders: any[] = []) => {
  configureTestBed([component], additionalProviders).compileComponents();
  return TestBed.createComponent<T>(component);
};

/**
 * Standard test setup for components with signals
 */
export const setupComponentTest = <T>(
  component: any,
  additionalImports: any[] = [],
  additionalProviders: any[] = []
) => {
  let fixture: ComponentFixture<T> | undefined;
  let componentInstance: T | undefined;

  beforeEach(async () => {
    await configureTestBed([component, ...additionalImports], additionalProviders).compileComponents();
    fixture = TestBed.createComponent<T>(component);
    componentInstance = fixture.componentInstance;
  });

  return { fixture: fixture!, componentInstance: componentInstance! };
};

/**
 * Standard test setup for components with PrimeNG
 */
export const setupPrimeNGTest = <T>(
  component: any,
  additionalImports: any[] = [],
  additionalProviders: any[] = []
) => {
  return setupComponentTest<T>(component, [...commonPrimeNGModules, ...additionalImports], additionalProviders);
};

/**
 * Test utilities for signal-based components
 */
export const signalTestUtils = {
  createSignal: createTestSignal,
  createComputed: createTestComputed,
  mockSignal,
  mockComputed,
  mockOutput,
  waitForAsync
};

/**
 * DOM test utilities
 */
export const domTestUtils = {
  createEvent: createMockEvent,
  createElement: createMockElement,
  createBackdropEvent: createMockBackdropEvent,
  createNonBackdropEvent: createMockNonBackdropEvent
};

/**
 * Standard test patterns for components
 */
export const testPatterns = {
  /**
   * Test that component creates successfully
   */
  shouldCreate: <T>(componentInstance: T) => {
    it('should create', () => {
      expect(componentInstance).toBeTruthy();
    });
  },

  /**
   * Test that component renders without errors
   */
  shouldRender: (fixture: ComponentFixture<any>) => {
    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  },

  /**
   * Test that component has required properties
   */
  shouldHaveProperties: <T>(componentInstance: T, properties: (keyof T)[]) => {
    properties.forEach(prop => {
      it(`should have ${String(prop)} property`, () => {
        expect(componentInstance[prop]).toBeDefined();
      });
    });
  },

  /**
   * Test that component has required methods
   */
  shouldHaveMethods: <T>(componentInstance: T, methods: (keyof T)[]) => {
    methods.forEach(method => {
      it(`should have ${String(method)} method`, () => {
        expect(typeof componentInstance[method]).toBe('function');
      });
    });
  },

  /**
   * Test that component emits events correctly
   */
  shouldEmitEvent: <T>(componentInstance: T, eventName: keyof T, triggerFn: () => void, expectedValue?: any) => {
    it(`should emit ${String(eventName)} event`, () => {
      const eventSpy = jasmine.createSpy('eventSpy');
      if (componentInstance[eventName] && typeof componentInstance[eventName] === 'object' && 'emit' in (componentInstance[eventName] as any)) {
        (componentInstance[eventName] as any).emit.subscribe(eventSpy);
      }

      triggerFn();

      if (expectedValue !== undefined) {
        expect(eventSpy).toHaveBeenCalledWith(expectedValue);
      } else {
        expect(eventSpy).toHaveBeenCalled();
      }
    });
  },

  /**
   * Test that component handles input changes
   */
  shouldHandleInputChange: <T>(componentInstance: T, inputName: keyof T, newValue: any, expectedBehavior?: () => void) => {
    it(`should handle ${String(inputName)} input change`, () => {
      const originalValue = componentInstance[inputName];
      componentInstance[inputName] = newValue;

      if (expectedBehavior) {
        expectedBehavior();
      } else {
        expect(componentInstance[inputName]).toBe(newValue);
      }
    });
  },

  /**
   * Test that component responds to user interactions
   */
  shouldRespondToUserInteraction: <T>(
    fixture: ComponentFixture<T>,
    interaction: () => void,
    expectedBehavior: () => void
  ) => {
    it('should respond to user interaction', () => {
      interaction();
      fixture.detectChanges();
      expectedBehavior();
    });
  },

  /**
   * Test that component shows loading state
   */
  shouldShowLoadingState: <T>(componentInstance: T, loadingProperty: keyof T, triggerFn: () => void) => {
    it('should show loading state', () => {
      triggerFn();
      expect(componentInstance[loadingProperty] as any).toBe(true);
    });
  },

  /**
   * Test that component handles errors gracefully
   */
  shouldHandleErrors: <T>(componentInstance: T, errorTrigger: () => void, expectedBehavior: () => void) => {
    it('should handle errors gracefully', () => {
      spyOn(console, 'error'); // Suppress console errors in tests
      errorTrigger();
      expectedBehavior();
    });
  }
};

/**
 * Common test data factories
 */
export const testDataFactories = {
  /**
   * Create mock appointment data
   */
  createMockAppointment: (overrides: any = {}) => ({
    id: 'test-id',
    nom: 'Test Client',
    data: '2024-01-15',
    hora: '10:00',
    servei: 'Test Service',
    serviceName: 'Test Service',
    duration: 30,
    clientId: 'client-1',
    ...overrides
  }),

  /**
   * Create mock service data
   */
  createMockService: (overrides: any = {}) => ({
    id: 'service-1',
    name: 'Test Service',
    duration: 30,
    price: 25,
    description: 'Test service description',
    ...overrides
  }),

  /**
   * Create mock client data
   */
  createMockClient: (overrides: any = {}) => ({
    id: 'client-1',
    name: 'Test Client',
    email: 'test@example.com',
    phone: '123456789',
    ...overrides
  }),

  /**
   * Create mock popup item
   */
  createMockPopupItem: (overrides: any = {}) => ({
    id: 'popup-1',
    title: 'Test Popup',
    size: 'medium' as const,
    content: class MockComponent {},
    data: { testData: 'value' },
    ...overrides
  })
};

/**
 * Test environment setup
 */
export const setupTestEnvironment = () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jasmine.getEnv().addReporter({
      specStarted: () => {
        // Reset spy calls
        Object.values(mockAuth).forEach(spy => {
          if (spy && typeof spy === 'object' && 'calls' in spy) {
            (spy as any).calls.reset();
          }
        });
        Object.values(mockTranslateService).forEach(spy => {
          if (spy && typeof spy === 'object' && 'calls' in spy) {
            (spy as any).calls.reset();
          }
        });
        Object.values(mockAuthService).forEach(spy => {
          if (spy && typeof spy === 'object' && 'calls' in spy) {
            (spy as any).calls.reset();
          }
        });
        Object.values(mockMessageService).forEach(spy => {
          if (spy && typeof spy === 'object' && 'calls' in spy) {
            (spy as any).calls.reset();
          }
        });
        Object.values(mockConfirmationService).forEach(spy => {
          if (spy && typeof spy === 'object' && 'calls' in spy) {
            (spy as any).calls.reset();
          }
        });
      }
    });
  });
};

/**
 * Configuració de test específica per a components amb traducció
 */
export const configureTestBedWithTranslation = (imports: any[] = [], additionalProviders: any[] = []) => {
  return TestBed.configureTestingModule({
    imports,
    providers: [
      ...provideTestSetup(),
      {
        provide: TranslateService,
        useValue: translationTestUtils.createRealisticTranslateService()
      },
      {
        provide: TranslationService,
        useValue: translationTestUtils.createRealisticTranslationService()
      },
      ...additionalProviders
    ]
  });
};

/**
 * Crea un component de test amb configuració de traducció
 */
export const createTestComponentWithTranslation = <T>(
  component: any,
  additionalImports: any[] = [],
  additionalProviders: any[] = []
) => {
  configureTestBedWithTranslation([component, ...additionalImports], additionalProviders).compileComponents();
  return TestBed.createComponent<T>(component);
};

/**
 * Configuració de test per a components que NO necessiten renderitzat
 */
export const configureTestBedNoRender = (imports: any[] = [], additionalProviders: any[] = []) => {
  return TestBed.configureTestingModule({
    imports,
    providers: [
      ...provideTestSetup(),
      ...additionalProviders
    ]
  });
};

/**
 * Crea un component de test sense renderitzat (per evitar errors de pipes)
 */
export const createTestComponentNoRender = <T>(
  component: any,
  additionalImports: any[] = [],
  additionalProviders: any[] = []
) => {
  configureTestBedNoRender([component, ...additionalImports], additionalProviders).compileComponents();
  return TestBed.createComponent<T>(component);
};

// Export all utilities for easy access
export {
  provideMockFirebase,
  commonPrimeNGModules,
  waitForAsync,
  createTestSignal,
  createTestComputed,
  mockSignal,
  mockComputed,
  mockOutput,
  createMockEvent,
  createMockElement,
  createMockBackdropEvent,
  createMockNonBackdropEvent
};
