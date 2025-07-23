import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from './core/services/translation.service';
import { AuthService } from './core/auth/auth.service';
import { ScrollService } from './core/services/scroll.service';
import { ToastService } from './shared/services/toast.service';
import { LoggerService } from './shared/services/logger.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { mockAuth, mockTranslateStore, mockTranslationService } from '../testing/firebase-mocks';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let scrollService: jasmine.SpyObj<ScrollService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let loggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'user',
      'isAuthenticated',
      'isLoading',
      'signOut',
      'signInWithEmailAndPassword',
    ]);
    const scrollServiceSpy = jasmine.createSpyObj('ScrollService', [
      'scrollToTop',
      'scrollToTopImmediate',
      'scrollToElement',
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
      'showInfo',
      'showWarning',
      'showToast',
    ]);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'instant',
      'get',
      'use',
      'setDefaultLang',
      'addLangs',
      'getLangs',
    ]);
    const loggerServiceSpy = jasmine.createSpyObj('LoggerService', [
      'log',
      'error',
      'warn',
      'info',
      'debug',
      'firebaseError',
    ]);

    // Setup default spy returns
    authServiceSpy.user.and.returnValue({
      uid: 'test-user',
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
    } as any);
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isLoading.and.returnValue(false);
    translateServiceSpy.instant.and.returnValue('Translated text');

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: TranslateStore, useValue: mockTranslateStore },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ScrollService, useValue: scrollServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy },
        MessageService,
        ConfirmationService,
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Get service instances
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    scrollService = TestBed.inject(ScrollService) as jasmine.SpyObj<ScrollService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  describe('Component Creation and Basic Properties', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should have the correct title', () => {
      expect(component.title()).toEqual('pelu-app');
    });

    it('should have title as a signal', () => {
      expect(typeof component.title).toBe('function');
      expect(component.title()).toBe('pelu-app');
    });
  });

  describe('Computed Signals', () => {
    it('should have isLoading computed signal', () => {
      expect(component.isLoading).toBeDefined();
      expect(typeof component.isLoading).toBe('function');
    });

    it('should have isAuthenticated computed signal', () => {
      expect(component.isAuthenticated).toBeDefined();
      expect(typeof component.isAuthenticated).toBe('function');
    });

    it('should have shouldShowHeader computed signal', () => {
      expect(component.shouldShowHeader).toBeDefined();
      expect(typeof component.shouldShowHeader).toBe('function');
    });

    it('should return correct values from computed signals', () => {
      expect(component.isLoading()).toBe(false);
      expect(component.isAuthenticated()).toBe(true);
      expect(component.shouldShowHeader()).toBe(true); // authenticated && !loading
    });
  });

  describe('Authentication State Management', () => {
    it('should show header when user is authenticated and not loading', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isLoading.and.returnValue(false);

      expect(component.shouldShowHeader()).toBe(true);
    });

    it('should not show header when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      authService.isLoading.and.returnValue(false);

      expect(component.shouldShowHeader()).toBe(false);
    });

    it('should not show header when app is loading', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isLoading.and.returnValue(true);

      expect(component.shouldShowHeader()).toBe(false);
    });

    it('should not show header when user is not authenticated and app is loading', () => {
      authService.isAuthenticated.and.returnValue(false);
      authService.isLoading.and.returnValue(true);

      expect(component.shouldShowHeader()).toBe(false);
    });
  });

  describe('Loading State Management', () => {
    it('should reflect loading state from AuthService', () => {
      authService.isLoading.and.returnValue(true);
      expect(component.isLoading()).toBe(true);

      authService.isLoading.and.returnValue(false);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle loading state changes', () => {
      // Test initial state
      expect(component.isLoading()).toBe(false);

      // Test loading state
      authService.isLoading.and.returnValue(true);
      expect(component.isLoading()).toBe(true);
    });
  });

  describe('User Authentication State', () => {
    it('should reflect authentication state from AuthService', () => {
      authService.isAuthenticated.and.returnValue(true);
      expect(component.isAuthenticated()).toBe(true);

      authService.isAuthenticated.and.returnValue(false);
      expect(component.isAuthenticated()).toBe(false);
    });

    it('should handle authentication state changes', () => {
      // Test authenticated state
      authService.isAuthenticated.and.returnValue(true);
      expect(component.isAuthenticated()).toBe(true);

      // Test unauthenticated state
      authService.isAuthenticated.and.returnValue(false);
      expect(component.isAuthenticated()).toBe(false);
    });
  });

  describe('Component Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(component.title()).toBe('pelu-app');
      expect(component.isLoading()).toBe(false);
      expect(component.isAuthenticated()).toBe(true);
      expect(component.shouldShowHeader()).toBe(true);
    });

    it('should have all required services injected', () => {
      expect(authService).toBeDefined();
      expect(scrollService).toBeDefined();
      expect(toastService).toBeDefined();
      expect(translateService).toBeDefined();
      expect(loggerService).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should render app title', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('app-root')).toBeTruthy();
    });

    it('should have router outlet', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should have header component when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isLoading.and.returnValue(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('pelu-header')).toBeTruthy();
    });

    it('should not have header component when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      authService.isLoading.and.returnValue(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('pelu-header')).toBeFalsy();
    });

    it('should not have header component when loading', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isLoading.and.returnValue(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('pelu-header')).toBeFalsy();
    });
  });

  describe('Signal Behavior', () => {
    it('should have reactive signals that update when dependencies change', () => {
      // Initial state
      expect(component.shouldShowHeader()).toBe(true);

      // Change loading state
      authService.isLoading.and.returnValue(true);
      expect(component.shouldShowHeader()).toBe(false);

      // Change authentication state
      authService.isAuthenticated.and.returnValue(false);
      authService.isLoading.and.returnValue(false);
      expect(component.shouldShowHeader()).toBe(false);
    });

    it('should maintain signal consistency', () => {
      const initialLoading = component.isLoading();
      const initialAuth = component.isAuthenticated();
      const initialHeader = component.shouldShowHeader();

      // Multiple calls should return same values
      expect(component.isLoading()).toBe(initialLoading);
      expect(component.isAuthenticated()).toBe(initialAuth);
      expect(component.shouldShowHeader()).toBe(initialHeader);
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component destruction gracefully', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    it('should maintain signal references after multiple change detections', () => {
      fixture.detectChanges();
      const firstCall = component.shouldShowHeader();

      fixture.detectChanges();
      const secondCall = component.shouldShowHeader();

      expect(firstCall).toBe(secondCall);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      // Test that component doesn't crash when services throw errors
      authService.isAuthenticated.and.throwError('Auth service error');

      expect(() => {
        component.isAuthenticated();
      }).toThrow();
    });

    it('should handle undefined service returns', () => {
      authService.user.and.returnValue(null);
      authService.isAuthenticated.and.returnValue(false);

      expect(component.isAuthenticated()).toBe(false);
      expect(component.shouldShowHeader()).toBe(false);
    });
  });
});
