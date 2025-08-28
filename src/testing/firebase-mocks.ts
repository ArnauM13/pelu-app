import { of } from 'rxjs';
import { signal, computed } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../app/core/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from '../app/core/services/translation.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Mock user object
export const mockUser: Partial<User> = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2024-01-01T00:00:00.000Z',
    lastSignInTime: '2024-01-15T00:00:00.000Z',
  },
  phoneNumber: null,
  photoURL: null,
  providerData: [],
  providerId: 'password',
  refreshToken: 'mock-refresh-token',
  tenantId: null,
};

// Mock for Firebase functions that are imported directly
export const mockCollection = jasmine.createSpy('collection').and.callFake((firestore: any, path: string) => ({
  valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
  doc: jasmine.createSpy('doc').and.returnValue({
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
    set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
    update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
    delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
    get: jasmine.createSpy('get').and.returnValue(
      Promise.resolve({
        data: () => ({}),
        exists: true,
      })
    ),
  }),
  add: jasmine.createSpy('add').and.returnValue(Promise.resolve({ id: 'mock-id' })),
  where: jasmine.createSpy('where').and.returnValue({
    orderBy: jasmine.createSpy('orderBy').and.returnValue({
      limit: jasmine.createSpy('limit').and.returnValue({
        get: jasmine.createSpy('get').and.returnValue(
          Promise.resolve({
            docs: [],
            empty: true,
          })
        ),
      }),
    }),
  }),
  orderBy: jasmine.createSpy('orderBy').and.returnValue({
    limit: jasmine.createSpy('limit').and.returnValue({
      get: jasmine.createSpy('get').and.returnValue(
        Promise.resolve({
          docs: [],
          empty: true,
        })
      ),
    }),
  }),
  limit: jasmine.createSpy('limit').and.returnValue({
    get: jasmine.createSpy('get').and.returnValue(
      Promise.resolve({
        docs: [],
        empty: true,
      })
    ),
  }),
  get: jasmine.createSpy('get').and.returnValue(
    Promise.resolve({
      docs: [],
      empty: true,
    })
  ),
}));

export const mockDoc = jasmine.createSpy('doc').and.returnValue({
  valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
  set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
  update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
  delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
  get: jasmine.createSpy('get').and.returnValue(
    Promise.resolve({
      data: () => ({}),
      exists: true,
    })
  ),
});

export const mockAddDoc = jasmine.createSpy('addDoc').and.returnValue(Promise.resolve({ id: 'mock-id' }));

export const mockGetDoc = jasmine.createSpy('getDoc').and.returnValue(
  Promise.resolve({
    data: () => ({}),
    exists: true,
  })
);

export const mockUpdateDoc = jasmine.createSpy('updateDoc').and.returnValue(Promise.resolve());

export const mockDeleteDoc = jasmine.createSpy('deleteDoc').and.returnValue(Promise.resolve());

export const mockGetDocs = jasmine.createSpy('getDocs').and.returnValue(
  Promise.resolve({
    docs: [],
    empty: true,
  })
);

export const mockServerTimestamp = jasmine.createSpy('serverTimestamp').and.returnValue(new Date());

export const mockQuery = jasmine.createSpy('query').and.callFake((collectionRef: any, ...queryConstraints: any[]) => ({
  get: jasmine.createSpy('get').and.returnValue(
    Promise.resolve({
      docs: [],
      empty: true,
    })
  ),
}));

export const mockOrderBy = jasmine.createSpy('orderBy').and.returnValue('orderBy-constraint');

export const mockSetDoc = jasmine.createSpy('setDoc').and.returnValue(Promise.resolve());

// Mock for runInInjectionContext
export const mockRunInInjectionContext = jasmine.createSpy('runInInjectionContext').and.callFake((envInjector: any, fn: () => any) => {
  return fn();
});

// Mock for Firestore with proper collection() implementation
export const firestoreMock = {
  collection: mockCollection,
  doc: mockDoc,
};

// Mock for Firebase Auth
export const authMock = {
  currentUser: Promise.resolve({
    uid: 'mock-user-id',
    email: 'mock@example.com',
    displayName: 'Mock User',
  }),
  signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword').and.returnValue(
    Promise.resolve({
      user: { uid: 'mock-user-id', email: 'mock@example.com' },
    })
  ),
  signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve()),
  onAuthStateChanged: jasmine
    .createSpy('onAuthStateChanged')
    .and.callFake((callback: (user: User | null) => void) => {
      callback({ uid: 'mock-user-id', email: 'mock@example.com' } as User);
      return () => {}; // Return unsubscribe function
    }),
  createUserWithEmailAndPassword: jasmine
    .createSpy('createUserWithEmailAndPassword')
    .and.returnValue(
      Promise.resolve({
        user: { uid: 'mock-user-id', email: 'mock@example.com' },
      })
    ),
};

// Mock for Firebase Functions
export const functionsMock = {
  httpsCallable: jasmine
    .createSpy('httpsCallable')
    .and.returnValue(jasmine.createSpy('callable').and.returnValue(Promise.resolve({ data: {} }))),
};

// Mock for Firebase Storage
export const storageMock = {
  ref: jasmine.createSpy('ref').and.returnValue({
    put: jasmine.createSpy('put').and.returnValue(
      Promise.resolve({
        ref: {
          getDownloadURL: jasmine
            .createSpy('getDownloadURL')
            .and.returnValue(Promise.resolve('mock-url')),
        },
      })
    ),
    getDownloadURL: jasmine
      .createSpy('getDownloadURL')
      .and.returnValue(Promise.resolve('mock-url')),
  }),
};

// Mock for collection and collectionData functions (Firebase v9+ modular API)
export const collectionMock = jasmine.createSpy('collection').and.callFake((db: any, path: string) => ({
  valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
  doc: jasmine.createSpy('doc').and.returnValue({
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
    set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
    update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
    delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
  }),
}));

export const collectionDataMock = jasmine.createSpy('collectionData').and.returnValue(of([]));

// Mock for addDoc
export const addDocMock = jasmine
  .createSpy('addDoc')
  .and.returnValue(Promise.resolve({ id: 'mock-doc-id' }));

// Mock for updateDoc
export const updateDocMock = jasmine.createSpy('updateDoc').and.returnValue(Promise.resolve());

// Mock for deleteDoc
export const deleteDocMock = jasmine.createSpy('deleteDoc').and.returnValue(Promise.resolve());

// Mock for doc
export const docMock = jasmine.createSpy('doc').and.returnValue({
  valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
  set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
  update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
  delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
});

// Mock for query
export const queryMock = jasmine.createSpy('query').and.returnValue({
  get: jasmine.createSpy('get').and.returnValue(
    Promise.resolve({
      docs: [],
      empty: true,
    })
  ),
});

// Mock for where
export const whereMock = jasmine.createSpy('where').and.returnValue({
  orderBy: jasmine.createSpy('orderBy').and.returnValue({
    limit: jasmine.createSpy('limit').and.returnValue({
      get: jasmine.createSpy('get').and.returnValue(
        Promise.resolve({
          docs: [],
          empty: true,
        })
      ),
    }),
  }),
});

// Mock for orderBy
export const orderByMock = jasmine.createSpy('orderBy').and.returnValue({
  limit: jasmine.createSpy('limit').and.returnValue({
    get: jasmine.createSpy('get').and.returnValue(
      Promise.resolve({
        docs: [],
        empty: true,
      })
    ),
  }),
});

// Mock for limit
export const limitMock = jasmine.createSpy('limit').and.returnValue({
  get: jasmine.createSpy('get').and.returnValue(
    Promise.resolve({
      docs: [],
      empty: true,
    })
  ),
});

// Mock for getDocs
export const getDocsMock = jasmine.createSpy('getDocs').and.returnValue(
  Promise.resolve({
    docs: [],
    empty: true,
  })
);

// Mock for getDoc
export const getDocMock = jasmine.createSpy('getDoc').and.returnValue(
  Promise.resolve({
    data: () => ({}),
    exists: true,
  })
);

// Mock for setDoc
export const setDocMock = jasmine.createSpy('setDoc').and.returnValue(Promise.resolve());

// Mock for serverTimestamp
export const serverTimestampMock = jasmine.createSpy('serverTimestamp').and.returnValue(new Date());

// Mock AuthService with signals
export const mockAuthService = {
  registre: jasmine.createSpy('registre').and.returnValue(Promise.resolve({ user: mockUser })),
  login: jasmine.createSpy('login').and.returnValue(Promise.resolve({ user: mockUser })),
  loginWithGoogle: jasmine
    .createSpy('loginWithGoogle')
    .and.returnValue(Promise.resolve({ user: mockUser })),
  logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
  redirectToLogin: jasmine.createSpy('redirectToLogin'),
  redirectToHome: jasmine.createSpy('redirectToHome'),
  canActivate: jasmine.createSpy('canActivate').and.returnValue(true),
  canActivateAsync: jasmine.createSpy('canActivateAsync').and.returnValue(Promise.resolve(true)),
  saveCurrentUserLanguage: jasmine.createSpy('saveCurrentUserLanguage'),
  // Signal properties
  user: computed(() => mockUser),
  isLoading: computed(() => false),
  isAuthenticated: computed(() => true),
  isInitialized: computed(() => true),
  userDisplayName: computed(() => 'Test User'),
  error: computed(() => null),
};

// Mock PrimeNG services
export const mockMessageService = {
  add: jasmine.createSpy('add'),
  addAll: jasmine.createSpy('addAll'),
  clear: jasmine.createSpy('clear'),
  get: jasmine.createSpy('get'),
  remove: jasmine.createSpy('remove'),
  replace: jasmine.createSpy('replace'),
  update: jasmine.createSpy('update'),
  messages: of([]),
  onMessage: of(),
};

// Create a more comprehensive mock for ConfirmationService
export const mockConfirmationService = {
  onAccept: of({}),
  onReject: of({}),
  onClose: of({}),
  confirm: jasmine.createSpy('confirm'),
  close: jasmine.createSpy('close'),
  require: jasmine.createSpy('require'),
  // Add missing properties that p-confirmDialog expects
  accept: jasmine.createSpy('accept'),
  reject: jasmine.createSpy('reject'),
  clear: jasmine.createSpy('clear'),
  // Add the observable properties that p-confirmDialog subscribes to
  onAccept$: of({}),
  onReject$: of({}),
  onClose$: of({}),
};

// Mock Router
export const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
  navigateByUrl: jasmine.createSpy('navigateByUrl'),
  createUrlTree: jasmine.createSpy('createUrlTree'),
  serializeUrl: jasmine.createSpy('serializeUrl'),
  parseUrl: jasmine.createSpy('parseUrl'),
  isActive: jasmine.createSpy('isActive'),
  events: of(),
  url: '/',
  routerState: {
    snapshot: {
      url: '/',
      root: {
        children: [],
        data: {},
        fragment: null,
        outlet: 'primary',
        params: {},
        queryParams: {},
        url: [],
      },
    },
  },
};

// Mock ActivatedRoute
export const mockActivatedRoute = {
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
    url: [],
  },
};

// Mock Translation services
const mockTranslateStoreObj = {
  onLangChange: of({ lang: 'en', translations: {} }),
  onTranslationChange: of({ lang: 'en', translations: {} }),
  onDefaultLangChange: of({ lang: 'en', translations: {} }),
};

export const mockTranslateStore = {
  onLangChange: of({ lang: 'en', translations: {} }),
  onTranslationChange: of({ lang: 'en', translations: {} }),
  onDefaultLangChange: of({ lang: 'en', translations: {} }),
};

export const mockTranslateService = {
  get: jasmine.createSpy('get').and.returnValue(of('translated text')),
  instant: jasmine.createSpy('instant').and.returnValue('translated text'),
  setDefaultLang: jasmine.createSpy('setDefaultLang'),
  use: jasmine.createSpy('use'),
  addLangs: jasmine.createSpy('addLangs'),
  getLangs: jasmine.createSpy('getLangs').and.returnValue(['en', 'ca']),
  getBrowserLang: jasmine.createSpy('getBrowserLang').and.returnValue('en'),
  getBrowserCultureLang: jasmine.createSpy('getBrowserCultureLang').and.returnValue('en'),
  onLangChange: of({ lang: 'en', translations: {} }),
  onTranslationChange: of({ lang: 'en', translations: {} }),
  onDefaultLangChange: of({ lang: 'en', translations: {} }),
  store: mockTranslateStoreObj,
  currentLoader: jasmine.createSpy('currentLoader'),
  isolate: jasmine.createSpy('isolate'),
  getTranslation: jasmine.createSpy('getTranslation').and.returnValue(of({})),
  setTranslation: jasmine.createSpy('setTranslation'),
};

export const mockTranslationService = {
  getCurrentLang: jasmine.createSpy('getCurrentLang').and.returnValue('en'),
  setLanguage: jasmine.createSpy('setLanguage'),
  getAvailableLanguages: jasmine.createSpy('getAvailableLanguages').and.returnValue(['en', 'ca']),
  translate: jasmine.createSpy('translate').and.returnValue(of('translated text')),
  translateInstant: jasmine.createSpy('translateInstant').and.returnValue('translated text'),
  get: jasmine.createSpy('get').and.returnValue('translated text'),
  getCurrentLanguageInfo: jasmine.createSpy('getCurrentLanguageInfo').and.returnValue({ code: 'en', name: 'English' }),
  getBrowserLanguage: jasmine.createSpy('getBrowserLanguage').and.returnValue('en'),
  restoreUserLanguagePreference: jasmine.createSpy('restoreUserLanguagePreference'),
};

// Mock for logger service
export const mockLoggerService = {
  info: jasmine.createSpy('info'),
  warn: jasmine.createSpy('warn'),
  error: jasmine.createSpy('error'),
  debug: jasmine.createSpy('debug'),
  firebaseError: jasmine.createSpy('firebaseError'),
  firebaseInfo: jasmine.createSpy('firebaseInfo'),
  firebaseWarn: jasmine.createSpy('firebaseWarn'),
  firebaseDebug: jasmine.createSpy('firebaseDebug'),
};

// Mock for FirebaseServicesService
export const mockFirebaseServicesService = {
  loadServices: jasmine.createSpy('loadServices').and.returnValue(Promise.resolve([])),
  loadCustomCategories: jasmine.createSpy('loadCustomCategories').and.returnValue(Promise.resolve([])),
  getServices: jasmine.createSpy('getServices').and.returnValue([]),
  getCustomCategories: jasmine.createSpy('getCustomCategories').and.returnValue([]),
  addService: jasmine.createSpy('addService').and.returnValue(Promise.resolve()),
  updateService: jasmine.createSpy('updateService').and.returnValue(Promise.resolve()),
  deleteService: jasmine.createSpy('deleteService').and.returnValue(Promise.resolve()),
  addCustomCategory: jasmine.createSpy('addCustomCategory').and.returnValue(Promise.resolve()),
  updateCustomCategory: jasmine.createSpy('updateCustomCategory').and.returnValue(Promise.resolve()),
  deleteCustomCategory: jasmine.createSpy('deleteCustomCategory').and.returnValue(Promise.resolve()),
  // Signal properties
  services: computed(() => []),
  customCategories: computed(() => []),
  isLoading: computed(() => false),
  error: computed(() => null),
};

// Mock for RoleService
export const mockRoleService = {
  loadUserRole: jasmine.createSpy('loadUserRole').and.returnValue(Promise.resolve('user')),
  getUserRole: jasmine.createSpy('getUserRole').and.returnValue('user'),
  isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
  isUser: jasmine.createSpy('isUser').and.returnValue(true),
  // Signal properties
  userRole: computed(() => 'user'),
  isLoading: computed(() => false),
  error: computed(() => null),
};

// Mock for BookingService
export const mockBookingService = {
  createBooking: jasmine.createSpy('createBooking').and.returnValue(Promise.resolve({ id: 'mock-booking-id' })),
  updateBooking: jasmine.createSpy('updateBooking').and.returnValue(Promise.resolve()),
  deleteBooking: jasmine.createSpy('deleteBooking').and.returnValue(Promise.resolve()),
  getBookings: jasmine.createSpy('getBookings').and.returnValue(Promise.resolve([])),
  getBookingById: jasmine.createSpy('getBookingById').and.returnValue(Promise.resolve({})),
  // Signal properties
  bookings: computed(() => []),
  isLoading: computed(() => false),
  error: computed(() => null),
};

// Mock for Firebase functions used by FirebaseServicesService
export const mockFirebaseFunctions = {
  collection: jasmine.createSpy('collection').and.callFake((firestore: any, path: string) => ({
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
    doc: jasmine.createSpy('doc').and.returnValue({
      valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
      set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
      update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
      delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
    }),
  })),
  query: jasmine.createSpy('query').and.callFake((collectionRef: any, ...queryConstraints: any[]) => ({
    get: jasmine.createSpy('get').and.returnValue(
      Promise.resolve({
        docs: [],
        empty: true,
        forEach: (callback: any) => {},
      })
    ),
  })),
  orderBy: jasmine.createSpy('orderBy').and.callFake((field: string, direction?: string) => ({
    get: jasmine.createSpy('get').and.returnValue(
      Promise.resolve({
        docs: [],
        empty: true,
        forEach: (callback: any) => {},
      })
    ),
  })),
  getDocs: jasmine.createSpy('getDocs').and.returnValue(
    Promise.resolve({
      docs: [],
      empty: true,
      forEach: (callback: any) => {},
    })
  ),
  doc: jasmine.createSpy('doc').and.callFake((firestore: any, path: string, ...pathSegments: string[]) => ({
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
    set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
    update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
    delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
  })),
  setDoc: jasmine.createSpy('setDoc').and.returnValue(Promise.resolve()),
  serverTimestamp: jasmine.createSpy('serverTimestamp').and.returnValue(new Date()),
};

// Mock Firebase providers for tests
export const provideMockFirebase = () => [
  {
    provide: Firestore,
    useValue: firestoreMock,
  },
  {
    provide: Auth,
    useValue: authMock,
  },
  {
    provide: AuthService,
    useValue: mockAuthService,
  },
  {
    provide: TranslateService,
    useValue: mockTranslateService,
  },
  {
    provide: TranslateStore,
    useValue: mockTranslateStore,
  },
  {
    provide: TranslationService,
    useValue: mockTranslationService,
  },
  {
    provide: MessageService,
    useValue: mockMessageService,
  },
  {
    provide: ConfirmationService,
    useValue: mockConfirmationService,
  },
  {
    provide: Router,
    useValue: mockRouter,
  },
  {
    provide: ActivatedRoute,
    useValue: mockActivatedRoute,
  },
  // Add logger service mock
  {
    provide: 'LoggerService',
    useValue: mockLoggerService,
  },
  // Add Firebase services mocks
  {
    provide: 'FirebaseServicesService',
    useValue: mockFirebaseServicesService,
  },
  {
    provide: 'RoleService',
    useValue: mockRoleService,
  },
  {
    provide: 'BookingService',
    useValue: mockBookingService,
  },
  // Add Firebase functions mocks
  {
    provide: 'collection',
    useValue: mockFirebaseFunctions.collection,
  },
  {
    provide: 'query',
    useValue: mockFirebaseFunctions.query,
  },
  {
    provide: 'orderBy',
    useValue: mockFirebaseFunctions.orderBy,
  },
  {
    provide: 'getDocs',
    useValue: mockFirebaseFunctions.getDocs,
  },
  {
    provide: 'doc',
    useValue: mockFirebaseFunctions.doc,
  },
  {
    provide: 'setDoc',
    useValue: mockFirebaseFunctions.setDoc,
  },
  {
    provide: 'serverTimestamp',
    useValue: mockFirebaseFunctions.serverTimestamp,
  },
  {
    provide: 'runInInjectionContext',
    useValue: mockRunInInjectionContext,
  },
];

// Test utilities
export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const createTestSignal = <T>(initialValue: T) => {
  return signal(initialValue);
};

export const createTestComputed = <T>(fn: () => T) => {
  return computed(fn);
};

// Re-exports for backward compatibility
export const mockAuth = authMock;
export const mockFirestore = firestoreMock;
