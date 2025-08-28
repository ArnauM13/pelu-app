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
} from './firebase-mocks';

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

  // Mock the Firestore class
  class MockFirestore {
    constructor() {
      return {
        collection: mockCollection,
        doc: mockDoc,
      };
    }
  }

  // Apply mocks to the global scope
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
  } catch (e) {
    // Ignore if require fails - the mocks will be applied via dependency injection
  }

  try {
    const coreModule = require('@angular/core');
    coreModule.runInInjectionContext = mockRunInInjectionContext;
  } catch (e) {
    // Ignore if require fails
  }
})();

export {};
