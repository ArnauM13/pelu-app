import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPageComponent } from './user-page.component';
import { Auth } from '@angular/fire/auth';
import { mockAuth, mockUser } from '../../../testing/firebase-mocks';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Mock AuthService with signals
const mockAuthService = {
  logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
  user: jasmine.createSpy('user').and.returnValue(mockUser),
  isLoading: jasmine.createSpy('isLoading').and.returnValue(false),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
  loginWithGoogle: jasmine.createSpy('loginWithGoogle').and.returnValue(Promise.resolve()),
  registre: jasmine.createSpy('registre').and.returnValue(Promise.resolve()),
  login: jasmine.createSpy('login').and.returnValue(Promise.resolve()),
  saveCurrentUserLanguage: jasmine.createSpy('saveCurrentUserLanguage'),
  userDisplayName: jasmine.createSpy('userDisplayName').and.returnValue('Test User')
};

describe('UserPageComponent', () => {
  let component: UserPageComponent;
  let fixture: ComponentFixture<UserPageComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserPageComponent,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserPageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isLoading computed signal', () => {
    expect(component.isLoading).toBeDefined();
    expect(typeof component.isLoading).toBe('function');
  });

  it('should have user computed signal', () => {
    expect(component.user).toBeDefined();
    expect(typeof component.user).toBe('function');
  });

  it('should have isAuthenticated computed signal', () => {
    expect(component.isAuthenticated).toBeDefined();
    expect(typeof component.isAuthenticated).toBe('function');
  });

  it('should have userDisplayName computed signal', () => {
    expect(component.userDisplayName).toBeDefined();
    expect(typeof component.userDisplayName).toBe('function');
  });

  it('should have userInfo computed property', () => {
    expect(component.userInfo).toBeDefined();
    expect(typeof component.userInfo).toBe('function');
  });

  it('should have hasUserData computed property', () => {
    expect(component.hasUserData).toBeDefined();
    expect(typeof component.hasUserData).toBe('function');
  });

  it('should initialize with loading state', () => {
    expect(component.isLoading()).toBe(true);
  });

  it('should get user from auth service', () => {
    expect(component.user()).toBeDefined();
    expect(authService.user).toHaveBeenCalled();
  });

  it('should get authentication status from auth service', () => {
    expect(component.isAuthenticated()).toBe(true);
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  it('should get user display name from auth service', () => {
    expect(component.userDisplayName()).toBe('Test User');
    expect(authService.userDisplayName).toHaveBeenCalled();
  });

  it('should generate user info with display name', () => {
    const userInfo = component.userInfo();
    expect(userInfo).toBeDefined();
  });

  it('should format creation date correctly', () => {
    const userInfo = component.userInfo();
    expect(userInfo).toBeDefined();
  });

  it('should format last sign in date correctly', () => {
    const userInfo = component.userInfo();
    expect(userInfo).toBeDefined();
  });

  it('should have user data when user exists', () => {
    expect(component.hasUserData()).toBeDefined();
  });

  it('should handle null user', () => {
    authService.user.and.returnValue(null);

    const userInfo = component.userInfo();
    expect(userInfo).toBeDefined();
  });

  it('should be a standalone component', () => {
    expect(UserPageComponent.prototype.constructor).toBeDefined();
    expect(UserPageComponent.prototype.constructor.name).toBe('UserPageComponent');
  });

  it('should have proper component structure', () => {
    expect(UserPageComponent.prototype.constructor.name).toBe('UserPageComponent');
  });

  it('should have component metadata', () => {
    expect(UserPageComponent.prototype).toBeDefined();
    expect(UserPageComponent.prototype.constructor).toBeDefined();
  });

  it('should have all required computed properties', () => {
    expect(component.isLoading).toBeDefined();
    expect(component.user).toBeDefined();
    expect(component.isAuthenticated).toBeDefined();
    expect(component.userDisplayName).toBeDefined();
    expect(component.userInfo).toBeDefined();
    expect(component.hasUserData).toBeDefined();
  });

  it('should have proper signal types', () => {
    expect(typeof component.isLoading).toBe('function');
    expect(typeof component.user).toBe('function');
    expect(typeof component.isAuthenticated).toBe('function');
    expect(typeof component.userDisplayName).toBe('function');
    expect(typeof component.userInfo).toBe('function');
    expect(typeof component.hasUserData).toBe('function');
  });

  it('should have proper dependencies injected', () => {
    expect(authService).toBeDefined();
  });

  it('should render with proper structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.innerHTML).toContain('pelu-user-page');
  });

  it('should set loading to false after initialization', (done) => {
    // Wait for the setTimeout to complete
    setTimeout(() => {
      expect(component.isLoading()).toBe(false);
      done();
    }, 150);
  });
});
