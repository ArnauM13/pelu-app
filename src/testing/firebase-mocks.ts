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

// Mock Auth service
export const mockAuth: jasmine.SpyObj<Auth> = jasmine.createSpyObj('Auth', [
  'signInWithEmailAndPassword',
  'createUserWithEmailAndPassword',
  'signOut',
  'signInWithPopup',
  'onAuthStateChanged'
], {
  currentUser: mockUser,
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((callback: (user: User | null) => void) => {
    // Simulate authenticated user
    callback(mockUser);
    return () => {}; // Return unsubscribe function
  })
});

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
