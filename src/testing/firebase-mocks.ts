// Mocks comuns per a tests Angular amb Firebase
import { Auth, User } from '@angular/fire/auth';
import { AuthService } from '../app/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

// Mock user object with only essential properties
export const mockUser: any = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2024-01-01T00:00:00.000Z',
    lastSignInTime: '2024-01-15T00:00:00.000Z'
  },
  phoneNumber: null,
  photoURL: null,
  providerData: [],
  providerId: 'password',
  refreshToken: 'mock-refresh-token',
  tenantId: null
};

// Mock Auth service with ALL Firebase methods including onAuthStateChanged
export const mockAuth: jasmine.SpyObj<Auth> = jasmine.createSpyObj('Auth', [
  'signInWithEmailAndPassword',
  'createUserWithEmailAndPassword',
  'signOut',
  'signInWithPopup',
  'onAuthStateChanged'
], {
  currentUser: mockUser,
  signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve()),
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((callback: (user: User | null) => void) => {
    // Simulate authenticated user immediately
    callback(mockUser);
    return () => {}; // Return unsubscribe function
  })
});

// Mock Firebase Auth functions
export const mockSignInWithEmailAndPassword = jasmine.createSpy('signInWithEmailAndPassword').and.returnValue(Promise.resolve({ user: mockUser }));
export const mockCreateUserWithEmailAndPassword = jasmine.createSpy('createUserWithEmailAndPassword').and.returnValue(Promise.resolve({ user: mockUser }));
export const mockSignOut = jasmine.createSpy('signOut').and.returnValue(Promise.resolve());
export const mockSignInWithPopup = jasmine.createSpy('signInWithPopup').and.returnValue(Promise.resolve({ user: mockUser }));
export const mockOnAuthStateChanged = jasmine.createSpy('onAuthStateChanged').and.callFake((auth: any, callback: (user: User | null) => void) => {
  // Simulate authenticated user immediately
  callback(mockUser);
  return () => {}; // Return unsubscribe function
});

// Mock GoogleAuthProvider
export const mockGoogleAuthProvider = {
  setCustomParameters: jasmine.createSpy('setCustomParameters').and.returnValue({})
};

// Mock Firebase app configuration for tests
export const mockFirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id'
};

// Mock Firebase providers for tests
export const provideMockFirebase = () => [
  {
    provide: Auth,
    useValue: mockAuth
  }
];

// Mock Router
export const mockRouter: jasmine.SpyObj<Router> = jasmine.createSpyObj('Router', ['navigate']);

// Mock ActivatedRoute
export const mockActivatedRoute: jasmine.SpyObj<ActivatedRoute> = jasmine.createSpyObj('ActivatedRoute', [], {
  params: of({}),
  queryParams: of({}),
  fragment: of(null),
  data: of({}),
  url: of([]),
  snapshot: {
    params: {},
    queryParams: {},
    fragment: null,
    data: {},
    url: []
  }
});

// Mock AuthService
export const mockAuthService: jasmine.SpyObj<AuthService> = jasmine.createSpyObj('AuthService', [
  'signInWithEmailAndPassword',
  'createUserWithEmailAndPassword',
  'signInWithGoogle',
  'signOut',
  'getCurrentUser'
], {
  currentUser$: of(mockUser),
  isAuthenticated$: of(true),
  user: jasmine.createSpy('user').and.returnValue(mockUser)
});
