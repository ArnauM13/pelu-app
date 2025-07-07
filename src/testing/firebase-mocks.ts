// Mocks comuns per a tests Angular amb Firebase
import { Auth, User } from '@angular/fire/auth';
import { AuthService } from '../app/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal, computed } from '@angular/core';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from '../app/core/translation.service';
import {
  mockTranslateService,
  mockTranslateStore,
  mockTranslationService,
  translationTestUtils
} from './translation-mocks';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { CarouselModule } from 'primeng/carousel';
import { TimelineModule } from 'primeng/timeline';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { KnobModule } from 'primeng/knob';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputOtpModule } from 'primeng/inputotp';
import { TerminalModule } from 'primeng/terminal';
import { BlockUIModule } from 'primeng/blockui';
import { InplaceModule } from 'primeng/inplace';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { RippleModule } from 'primeng/ripple';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { FocusTrapModule } from 'primeng/focustrap';
import { KeyFilterModule } from 'primeng/keyfilter';
import { DeferModule } from 'primeng/defer';
import { StyleClassModule } from 'primeng/styleclass';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MegaMenuModule } from 'primeng/megamenu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DockModule } from 'primeng/dock';
import { MenubarModule } from 'primeng/menubar';
import { Component, Input, EventEmitter, Output } from '@angular/core';

// Mock Toast component to prevent initialization issues in tests
@Component({
  selector: 'p-toast',
  template: '<div class="mock-toast"></div>',
  standalone: true
})
export class MockToastComponent {
  @Input() key: string = '';
  @Input() position: string = 'top-right';
  @Input() baseZIndex: number = 9999;
  @Output() onClick = new EventEmitter<any>();
}

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

// Re-export translation mocks
export { mockTranslateService, mockTranslateStore, mockTranslationService, translationTestUtils };

// Mock AuthService with signals
export const mockAuthService: jasmine.SpyObj<AuthService> = jasmine.createSpyObj('AuthService', [
  'registre',
  'login',
  'loginWithGoogle',
  'logout',
  'redirectToLogin',
  'redirectToHome',
  'canActivate',
  'canActivateAsync',
  'saveCurrentUserLanguage'
], {
  registre: jasmine.createSpy('registre').and.returnValue(Promise.resolve({ user: mockUser })),
  login: jasmine.createSpy('login').and.returnValue(Promise.resolve({ user: mockUser })),
  loginWithGoogle: jasmine.createSpy('loginWithGoogle').and.returnValue(Promise.resolve({ user: mockUser })),
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
  userDisplayName: computed(() => 'Test User')
});

// Mock PrimeNG services
export const mockMessageService: jasmine.SpyObj<MessageService> = jasmine.createSpyObj('MessageService', [
  'add',
  'addAll',
  'clear',
  'get',
  'remove',
  'replace',
  'update'
], {
  messages: of([]),
  onMessage: of(),
  // Add missing properties that Toast component expects
  messageObserver: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  messageObserver$: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onClear: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onClear$: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onAdd: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onAdd$: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onRemove: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onRemove$: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onReplace: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onReplace$: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onUpdate: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onUpdate$: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  // Ensure all observable properties have subscribe method
  messages$: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  },
  onMessage$: {
    subscribe: jasmine.createSpy('subscribe').and.returnValue({ unsubscribe: jasmine.createSpy('unsubscribe') })
  }
});

export const mockConfirmationService: jasmine.SpyObj<ConfirmationService> = jasmine.createSpyObj('ConfirmationService', [
  'confirm',
  'close',
  'require'
], {
  onAccept: of(),
  onReject: of(),
  onClose: of()
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

// Common test data
export const mockAppointments = [
  {
    id: '1',
    nom: 'Joan Garcia',
    data: '2024-01-15',
    hora: '10:00',
    servei: 'Tall de cabell',
    serviceName: 'Tall de cabell',
    duration: 30,
    clientId: 'client-1'
  },
  {
    id: '2',
    nom: 'Maria Lopez',
    data: '2024-01-15',
    hora: '11:00',
    servei: 'Coloració',
    serviceName: 'Coloració',
    duration: 60,
    clientId: 'client-2'
  },
  {
    id: '3',
    nom: 'Pere Rodriguez',
    data: '2024-01-16',
    hora: '09:00',
    servei: 'Perruqueria completa',
    serviceName: 'Perruqueria completa',
    duration: 90,
    clientId: 'client-3'
  }
];

export const mockServices = [
  {
    id: '1',
    name: 'Tall de cabell',
    duration: 30,
    price: 25,
    description: 'Tall de cabell bàsic'
  },
  {
    id: '2',
    name: 'Coloració',
    duration: 60,
    price: 45,
    description: 'Coloració completa'
  },
  {
    id: '3',
    name: 'Perruqueria completa',
    duration: 90,
    price: 65,
    description: 'Tall, rentat i estilitzat'
  }
];

export const mockClients = [
  {
    id: 'client-1',
    name: 'Joan Garcia',
    email: 'joan@example.com',
    phone: '123456789'
  },
  {
    id: 'client-2',
    name: 'Maria Lopez',
    email: 'maria@example.com',
    phone: '987654321'
  },
  {
    id: 'client-3',
    name: 'Pere Rodriguez',
    email: 'pere@example.com',
    phone: '555666777'
  }
];

// DOM utilities for testing
export const createMockEvent = (type: string = 'click', target?: any, currentTarget?: any): Event => {
  const event = new Event(type);
  if (target) {
    Object.defineProperty(event, 'target', { value: target });
  }
  if (currentTarget) {
    Object.defineProperty(event, 'currentTarget', { value: currentTarget });
  }
  return event;
};

export const createMockElement = (tagName: string = 'div', className?: string): HTMLElement => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  return element;
};

export const createMockBackdropEvent = (): Event => {
  const event = new Event('click');
  const backdrop = createMockElement('div', 'popup-stack-overlay');
  Object.defineProperty(event, 'target', { value: backdrop });
  Object.defineProperty(event, 'currentTarget', { value: backdrop });
  return event;
};

export const createMockNonBackdropEvent = (): Event => {
  const event = new Event('click');
  const backdrop = createMockElement('div', 'popup-stack-overlay');
  const content = createMockElement('div', 'popup-content');
  Object.defineProperty(event, 'target', { value: content });
  Object.defineProperty(event, 'currentTarget', { value: backdrop });
  return event;
};

// Mock Firebase providers for tests
export const provideMockFirebase = () => [
  {
    provide: Auth,
    useValue: mockAuth
  },
  {
    provide: TranslateService,
    useValue: mockTranslateService
  },
  {
    provide: TranslateStore,
    useValue: mockTranslateStore
  },
  {
    provide: TranslationService,
    useValue: mockTranslationService
  },
  {
    provide: AuthService,
    useValue: mockAuthService
  },
  {
    provide: MessageService,
    useValue: mockMessageService
  },
  {
    provide: ConfirmationService,
    useValue: mockConfirmationService
  }
];

// Common PrimeNG modules for testing
export const commonPrimeNGModules = [
  TooltipModule,
  ConfirmDialogModule,
  ButtonModule,
  CardModule,
  CalendarModule,
  InputTextModule,
  DropdownModule,
  CheckboxModule,
  RadioButtonModule,
  SliderModule,
  MultiSelectModule,
  TableModule,
  PaginatorModule,
  DialogModule,
  OverlayPanelModule,
  MenuModule,
  SidebarModule,
  TabViewModule,
  AccordionModule,
  PanelModule,
  FieldsetModule,
  DividerModule,
  ProgressBarModule,
  ProgressSpinnerModule,
  SkeletonModule,
  AvatarModule,
  AvatarGroupModule,
  BadgeModule,
  ChipModule,
  TagModule,
  RatingModule,
  ToggleButtonModule,
  SelectButtonModule,
  InputSwitchModule,
  InputNumberModule,
  InputMaskModule,
  PasswordModule,
  TextareaModule,
  AutoCompleteModule,
  FileUploadModule,
  GalleriaModule,
  ImageModule,
  CarouselModule,
  TimelineModule,
  OrderListModule,
  PickListModule,
  TreeModule,
  TreeTableModule,
  OrganizationChartModule,
  KnobModule,
  ColorPickerModule,
  InputOtpModule,
  TerminalModule,
  BlockUIModule,
  InplaceModule,
  ScrollTopModule,
  ScrollPanelModule,
  RippleModule,
  AnimateOnScrollModule,
  FocusTrapModule,
  KeyFilterModule,
  DeferModule,
  StyleClassModule,
  ContextMenuModule,
  MegaMenuModule,
  PanelMenuModule,
  StepsModule,
  TabMenuModule,
  TieredMenuModule,
  BreadcrumbModule,
  DockModule,
  MenubarModule
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

// Mock for testing signals
export const mockSignal = <T>(value: T) => {
  const signalFn = jasmine.createSpy('signal').and.returnValue(value);
  (signalFn as any).set = jasmine.createSpy('signal.set');
  (signalFn as any).update = jasmine.createSpy('signal.update');
  (signalFn as any).mutate = jasmine.createSpy('signal.mutate');
  return signalFn;
};

// Mock for testing computed signals
export const mockComputed = <T>(value: T) => {
  return jasmine.createSpy('computed').and.returnValue(value);
};

// Mock for testing output signals
export const mockOutput = <T>() => {
  const output = jasmine.createSpy('output');
  (output as any).emit = jasmine.createSpy('output.emit');
  return output;
};
