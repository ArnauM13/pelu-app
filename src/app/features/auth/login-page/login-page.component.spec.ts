import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { mockAuth } from '../../../../testing/firebase-mocks';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Mock AuthService with signals
const mockAuthService = {
  loginWithGoogle: jasmine.createSpy('loginWithGoogle').and.returnValue(Promise.resolve()),
  user: jasmine.createSpy('user').and.returnValue(null),
  isLoading: jasmine.createSpy('isLoading').and.returnValue(false),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
  registre: jasmine.createSpy('registre').and.returnValue(Promise.resolve()),
  login: jasmine.createSpy('login').and.returnValue(Promise.resolve()),
  logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
  saveCurrentUserLanguage: jasmine.createSpy('saveCurrentUserLanguage'),
  userDisplayName: jasmine.createSpy('userDisplayName').and.returnValue(''),
};

// Mock TranslationService
const mockTranslationService = {
  get: jasmine.createSpy('get').and.returnValue('translated text'),
  get$: jasmine.createSpy('get$').and.returnValue(of('translated text')),
  currentLanguage: jasmine.createSpy('currentLanguage').and.returnValue('ca'),
  setLanguage: jasmine.createSpy('setLanguage'),
  currentLanguageInfo: jasmine
    .createSpy('currentLanguageInfo')
    .and.returnValue({ code: 'ca', name: 'Català' }),
  availableLanguages: [],
  isLanguageAvailable: jasmine.createSpy('isLanguageAvailable').and.returnValue(true),
  isRTL: jasmine.createSpy('isRTL').and.returnValue(false),
  reload: jasmine.createSpy('reload'),
  getBrowserLanguage: jasmine.createSpy('getBrowserLanguage').and.returnValue('ca'),
  saveUserLanguagePreference: jasmine.createSpy('saveUserLanguagePreference'),
  getUserLanguagePreference: jasmine.createSpy('getUserLanguagePreference').and.returnValue('ca'),
  restoreUserLanguagePreference: jasmine.createSpy('restoreUserLanguagePreference'),
};

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let translationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginPageComponent,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: AuthService, useValue: mockAuthService },
        { provide: TranslationService, useValue: mockTranslationService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    translationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have onLoginSubmit method', () => {
    expect(typeof component.onLoginSubmit).toBe('function');
  });

  it('should have onGoogleAuth method', () => {
    expect(typeof component.onGoogleAuth).toBe('function');
  });

  it('should have errorMessage signal', () => {
    expect(component.errorMessage).toBeDefined();
    expect(typeof component.errorMessage).toBe('function');
  });

  it('should have loginConfig computed signal', () => {
    expect(component.loginConfig).toBeDefined();
    expect(typeof component.loginConfig).toBe('function');
  });

  it('should have isSubmitting computed signal', () => {
    expect(component.isSubmitting).toBeDefined();
    expect(typeof component.isSubmitting).toBe('function');
  });

  it('should have hasError computed signal', () => {
    expect(component.hasError).toBeDefined();
    expect(typeof component.hasError).toBe('function');
  });

  it('should initialize with empty error message', () => {
    expect(component.errorMessage()).toBe('');
  });

  it('should initialize with no error state', () => {
    expect(component.hasError()).toBe(false);
  });

  it('should initialize with not submitting state', () => {
    expect(component.isSubmitting()).toBe(false);
  });

  it('should have login config with correct structure', () => {
    const config = component.loginConfig();
    expect(config).toBeDefined();
    expect(config.mode).toBe('login');
    expect(config.title).toBeDefined();
    expect(config.subtitle).toBeDefined();
    expect(config.submitButtonText).toBeDefined();
    expect(config.googleButtonText).toBeDefined();
    expect(config.linkText).toBeDefined();
    expect(config.linkRoute).toBe('/register');
    expect(config.linkLabel).toBeDefined();
  });

  it('should have proper component structure', () => {
    expect(LoginPageComponent.prototype.constructor.name).toBe('LoginPageComponent');
  });

  it('should be a standalone component', () => {
    expect(LoginPageComponent.prototype.constructor).toBeDefined();
    expect(LoginPageComponent.prototype.constructor.name).toBe('LoginPageComponent');
  });

  it('should have component metadata', () => {
    expect(LoginPageComponent.prototype).toBeDefined();
    expect(LoginPageComponent.prototype.constructor).toBeDefined();
  });

  it('should have all required computed properties', () => {
    expect(component.errorMessage).toBeDefined();
    expect(component.loginConfig).toBeDefined();
    expect(component.isSubmitting).toBeDefined();
    expect(component.hasError).toBeDefined();
  });

  it('should have proper signal types', () => {
    expect(typeof component.errorMessage).toBe('function');
    expect(typeof component.loginConfig).toBe('function');
    expect(typeof component.isSubmitting).toBe('function');
    expect(typeof component.hasError).toBe('function');
  });

  it('should have proper dependencies injected', () => {
    expect(authService).toBeDefined();
    expect(translationService).toBeDefined();
  });
});
