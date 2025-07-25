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
export const mockUser: any = {
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

// Mock for Firestore
export const firestoreMock = {
  collection: jasmine.createSpy('collection').and.returnValue({
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
  }),
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
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((callback: any) => {
    callback({ uid: 'mock-user-id', email: 'mock@example.com' });
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

// Mock for serverTimestamp
export const serverTimestampMock = jasmine.createSpy('serverTimestamp').and.returnValue(new Date());

// Mock for collection and collectionData functions
export const collectionMock = jasmine.createSpy('collection').and.returnValue({
  valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
  doc: jasmine.createSpy('doc').and.returnValue({
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
    set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
    update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
    delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
  }),
});

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

// Mock AuthService with signals
export const mockAuthService: jasmine.SpyObj<AuthService> = jasmine.createSpyObj(
  'AuthService',
  [
    'registre',
    'login',
    'loginWithGoogle',
    'logout',
    'redirectToLogin',
    'redirectToHome',
    'canActivate',
    'canActivateAsync',
    'saveCurrentUserLanguage',
  ],
  {
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
    user: computed(() => mockUser),
    isLoading: computed(() => false),
    isInitialized: computed(() => true),
    isAuthenticated: computed(() => true),
    userDisplayName: computed(() => 'Test User'),
  }
);

// Mock PrimeNG services
export const mockMessageService: jasmine.SpyObj<MessageService> = jasmine.createSpyObj(
  'MessageService',
  ['add', 'addAll', 'clear', 'get', 'remove', 'replace', 'update'],
  {
    messages: of([]),
    onMessage: of(),
  }
);

export const mockConfirmationService: jasmine.SpyObj<ConfirmationService> = jasmine.createSpyObj(
  'ConfirmationService',
  ['confirm', 'close', 'require'],
  {
    onAccept: of(),
    onReject: of(),
    onClose: of(),
  }
);

// Mock Router
export const mockRouter: jasmine.SpyObj<Router> = jasmine.createSpyObj('Router', ['navigate']);

// Mock ActivatedRoute
export const mockActivatedRoute: jasmine.SpyObj<ActivatedRoute> = jasmine.createSpyObj(
  'ActivatedRoute',
  [],
  {
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
  }
);

// Mock Translation services
export const mockTranslateService: jasmine.SpyObj<TranslateService> = jasmine.createSpyObj(
  'TranslateService',
  [
    'get',
    'instant',
    'setDefaultLang',
    'use',
    'addLangs',
    'getLangs',
    'getBrowserLang',
    'getBrowserCultureLang',
    'onLangChange',
    'onTranslationChange',
    'onDefaultLangChange',
    'store',
    'currentLoader',
    'isolate',
    'getTranslation',
    'setTranslation',
    'addLangs',
    'getLangs',
    'getBrowserLang',
    'getBrowserCultureLang',
    'onLangChange',
    'onTranslationChange',
    'onDefaultLangChange',
    'store',
    'currentLoader',
    'isolate',
    'getTranslation',
    'setTranslation',
  ],
  {
    get: jasmine.createSpy('get').and.returnValue(of('translated text')),
    instant: jasmine.createSpy('instant').and.returnValue('translated text'),
    onLangChange: of({ lang: 'en', translations: {} }),
    onTranslationChange: of({ lang: 'en', translations: {} }),
    onDefaultLangChange: of({ lang: 'en', translations: {} }),
  }
);

export const mockTranslateStore: jasmine.SpyObj<TranslateStore> = jasmine.createSpyObj(
  'TranslateStore',
  ['onLangChange', 'onTranslationChange', 'onDefaultLangChange'],
  {
    onLangChange: of({ lang: 'en', translations: {} }),
    onTranslationChange: of({ lang: 'en', translations: {} }),
    onDefaultLangChange: of({ lang: 'en', translations: {} }),
  }
);

export const mockTranslationService: jasmine.SpyObj<TranslationService> = jasmine.createSpyObj(
  'TranslationService',
  ['getCurrentLang', 'setLanguage', 'getAvailableLanguages', 'translate', 'translateInstant'],
  {
    getCurrentLang: jasmine.createSpy('getCurrentLang').and.returnValue('en'),
    translate: jasmine.createSpy('translate').and.returnValue(of('translated text')),
    translateInstant: jasmine.createSpy('translateInstant').and.returnValue('translated text'),
  }
);

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
