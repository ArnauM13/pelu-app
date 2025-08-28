import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { firestoreMock } from './firebase-mocks';

// This function should be called in the beforeEach of tests that need Firebase mocks
export function setupFirebaseMocks() {
  TestBed.overrideProvider(Firestore, { useValue: firestoreMock });
}

// Alternative: Create a module with Firebase mocks
export function createFirebaseTestingModule() {
  return TestBed.configureTestingModule({
    providers: [
      { provide: Firestore, useValue: firestoreMock }
    ]
  });
}
