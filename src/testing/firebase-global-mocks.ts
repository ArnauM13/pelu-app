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
  // Mock the Firebase functions at the module level
  const firestoreModule = require('@angular/fire/firestore');
  const coreModule = require('@angular/core');
  
  // Replace the functions with our mocks
  firestoreModule.collection = mockCollection;
  firestoreModule.doc = mockDoc;
  firestoreModule.addDoc = mockAddDoc;
  firestoreModule.getDoc = mockGetDoc;
  firestoreModule.updateDoc = mockUpdateDoc;
  firestoreModule.deleteDoc = mockDeleteDoc;
  firestoreModule.getDocs = mockGetDocs;
  firestoreModule.serverTimestamp = mockServerTimestamp;
  firestoreModule.query = mockQuery;
  firestoreModule.orderBy = mockOrderBy;
  firestoreModule.setDoc = mockSetDoc;
  
  // Replace Angular core functions
  coreModule.runInInjectionContext = mockRunInInjectionContext;
})();

export {};
