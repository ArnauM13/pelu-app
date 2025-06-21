// Mocks comuns per a tests Angular amb Firebase
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../app/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

export const mockAuth: jasmine.SpyObj<Auth> = jasmine.createSpyObj('Auth', ['signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'signOut']);
export const mockAuthService: jasmine.SpyObj<AuthService> = jasmine.createSpyObj('AuthService', ['loginWithGoogle', 'user']);
export const mockRouter: jasmine.SpyObj<Router> = jasmine.createSpyObj('Router', ['navigate']);

// Mock complet d'ActivatedRoute amb totes les propietats necessàries
const mockUrl = of([]);
mockUrl.subscribe = jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: () => {} });

export const mockActivatedRoute: Partial<ActivatedRoute> = {
  url: mockUrl,
  params: of({}),
  queryParams: of({}),
  fragment: of(null),
  data: of({}),
  snapshot: {
    url: [],
    params: {},
    queryParams: {},
    fragment: null,
    data: {},
    paramMap: {
      get: jasmine.createSpy('get').and.returnValue(null),
      has: jasmine.createSpy('has').and.returnValue(false),
      getAll: jasmine.createSpy('getAll').and.returnValue([]),
      keys: []
    },
    queryParamMap: {
      get: jasmine.createSpy('get').and.returnValue(null),
      has: jasmine.createSpy('has').and.returnValue(false),
      getAll: jasmine.createSpy('getAll').and.returnValue([]),
      keys: []
    }
  } as any
};
