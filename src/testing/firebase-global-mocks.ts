// Global Firebase mocks to intercept direct imports
import {
  mockCollection,
  mockDoc,
  mockAddDoc,
  mockGetDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockGetDocs,
  mockServerTimestamp,
  mockQuery,
  mockOrderBy,
  mockSetDoc,
  mockRunInInjectionContext,
  firestoreMock,
  MockFirestore,
  mockLoggerService,
} from './firebase-mocks';
import { LoggerService } from '../app/shared/services/logger.service';

// Intercept Firebase Firestore functions globally
// This will be executed before any tests run
(function() {
  // Create a comprehensive mock setup
  const mockFirestoreFunctions = {
    collection: mockCollection,
    doc: mockDoc,
    addDoc: mockAddDoc,
    getDoc: mockGetDoc,
    updateDoc: mockUpdateDoc,
    deleteDoc: mockDeleteDoc,
    getDocs: mockGetDocs,
    serverTimestamp: mockServerTimestamp,
    query: mockQuery,
    orderBy: mockOrderBy,
    setDoc: mockSetDoc,
  };

  // Override the Firestore class globally
  if (typeof window !== 'undefined') {
    // Browser environment
    (window as any).__firebaseMocks = mockFirestoreFunctions;
    (window as any).Firestore = MockFirestore;
  } else if (typeof global !== 'undefined') {
    // Node.js environment
    (global as any).__firebaseMocks = mockFirestoreFunctions;
    (global as any).Firestore = MockFirestore;
  }

  // Override the module exports if possible
  try {
    // This will work in some build environments
    const firestoreModule = require('@angular/fire/firestore');
    Object.assign(firestoreModule, mockFirestoreFunctions);
    firestoreModule.Firestore = MockFirestore;

    // Override the Firestore token to return our mock
    if (firestoreModule.Firestore) {
      const originalFirestore = firestoreModule.Firestore;
      firestoreModule.Firestore = function() {
        return firestoreMock;
      };
      // Copy static properties if any
      Object.setPrototypeOf(firestoreModule.Firestore, originalFirestore);
    }
  } catch (e) {
    // Ignore if require fails - the mocks will be applied via dependency injection
  }

  try {
    const coreModule = require('@angular/core');
    coreModule.runInInjectionContext = mockRunInInjectionContext;
  } catch (e) {
    // Ignore if require fails
  }

  // Override Angular's TestBed to automatically provide Firebase mocks
  try {
    const testingModule = require('@angular/core/testing');
    const originalConfigureTestingModule = testingModule.TestBed.configureTestingModule;

    testingModule.TestBed.configureTestingModule = function(config: any) {
      // Add Firebase mocks to the providers if not already present
      if (config.providers) {
        // Check if Firestore is already provided
        const hasFirestore = config.providers.some((provider: any) =>
          provider.provide === 'Firestore' ||
          (typeof provider === 'function' && provider.name === 'Firestore')
        );

        if (!hasFirestore) {
          config.providers.push({ provide: 'Firestore', useValue: firestoreMock });
        }

        // Check if LoggerService is already provided
        const hasLogger = config.providers.some((provider: any) =>
          provider.provide === LoggerService ||
          (typeof provider === 'function' && provider.name === 'LoggerService')
        );

        if (!hasLogger) {
          config.providers.push({ provide: LoggerService, useValue: mockLoggerService });
        }
      } else {
        config.providers = [
          { provide: 'Firestore', useValue: firestoreMock },
          { provide: LoggerService, useValue: mockLoggerService }
        ];
      }

      return originalConfigureTestingModule.call(this, config);
    };
  } catch (e) {
    // Ignore if require fails
  }
})();

// Export a function to provide Firebase mocks for tests
export function provideFirebaseMocks() {
  return [
    {
      provide: 'Firestore',
      useValue: firestoreMock,
    },
    {
      provide: 'collection',
      useValue: mockCollection,
    },
    {
      provide: 'doc',
      useValue: mockDoc,
    },
    {
      provide: 'addDoc',
      useValue: mockAddDoc,
    },
    {
      provide: 'getDoc',
      useValue: mockGetDoc,
    },
    {
      provide: 'updateDoc',
      useValue: mockUpdateDoc,
    },
    {
      provide: 'deleteDoc',
      useValue: mockDeleteDoc,
    },
    {
      provide: 'getDocs',
      useValue: mockGetDocs,
    },
    {
      provide: 'serverTimestamp',
      useValue: mockServerTimestamp,
    },
    {
      provide: 'query',
      useValue: mockQuery,
    },
    {
      provide: 'orderBy',
      useValue: mockOrderBy,
    },
    {
      provide: 'setDoc',
      useValue: mockSetDoc,
    },
  ];
}
