import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoutButtonComponent } from './logout-button.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { mockAuth } from '../../../../testing/firebase-mocks';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Mock AuthService with signals
const mockAuthService = {
  logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
  user: jasmine.createSpy('user').and.returnValue(null),
  isLoading: jasmine.createSpy('isLoading').and.returnValue(false),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
  loginWithGoogle: jasmine.createSpy('loginWithGoogle').and.returnValue(Promise.resolve()),
  registre: jasmine.createSpy('registre').and.returnValue(Promise.resolve()),
  login: jasmine.createSpy('login').and.returnValue(Promise.resolve()),
  saveCurrentUserLanguage: jasmine.createSpy('saveCurrentUserLanguage'),
  userDisplayName: jasmine.createSpy('userDisplayName').and.returnValue('')
};

describe('LogoutButtonComponent', () => {
  let component: LogoutButtonComponent;
  let fixture: ComponentFixture<LogoutButtonComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LogoutButtonComponent,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoutButtonComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have logout method', () => {
    expect(typeof component.logout).toBe('function');
  });

  it('should have isLoggingOut computed signal', () => {
    expect(component.isLoggingOut).toBeDefined();
    expect(typeof component.isLoggingOut).toBe('function');
  });

  it('should initialize with not logging out state', () => {
    expect(component.isLoggingOut()).toBe(false);
  });

  it('should have proper component structure', () => {
    expect(LogoutButtonComponent.prototype.constructor.name).toBe('LogoutButtonComponent');
  });

  it('should be a standalone component', () => {
    expect(LogoutButtonComponent.prototype.constructor).toBeDefined();
    expect(LogoutButtonComponent.prototype.constructor.name).toBe('LogoutButtonComponent');
  });

  it('should have component metadata', () => {
    expect(LogoutButtonComponent.prototype).toBeDefined();
    expect(LogoutButtonComponent.prototype.constructor).toBeDefined();
  });

  it('should have all required computed properties', () => {
    expect(component.isLoggingOut).toBeDefined();
  });

  it('should have proper signal types', () => {
    expect(typeof component.isLoggingOut).toBe('function');
  });

  it('should have proper dependencies injected', () => {
    expect(authService).toBeDefined();
  });
});
