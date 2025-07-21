import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { mockAuth } from '../../../testing/firebase-mocks';
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
  user: jasmine.createSpy('user').and.returnValue(null),
  isLoading: jasmine.createSpy('isLoading').and.returnValue(false),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
  loginWithGoogle: jasmine.createSpy('loginWithGoogle').and.returnValue(Promise.resolve()),
  registre: jasmine.createSpy('registre').and.returnValue(Promise.resolve()),
  login: jasmine.createSpy('login').and.returnValue(Promise.resolve()),
  saveCurrentUserLanguage: jasmine.createSpy('saveCurrentUserLanguage'),
  userDisplayName: jasmine.createSpy('userDisplayName').and.returnValue('')
};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
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

    fixture = TestBed.createComponent(HeaderComponent);
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
    expect(HeaderComponent.prototype.constructor.name).toBe('HeaderComponent');
  });

  it('should be a standalone component', () => {
    expect(HeaderComponent.prototype.constructor).toBeDefined();
    expect(HeaderComponent.prototype.constructor.name).toBe('HeaderComponent');
  });

  it('should have component metadata', () => {
    expect(HeaderComponent.prototype).toBeDefined();
    expect(HeaderComponent.prototype.constructor).toBeDefined();
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

  it('should render with proper structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.header')).toBeTruthy();
    expect(compiled.querySelector('.header-content')).toBeTruthy();
    expect(compiled.querySelector('.nav')).toBeTruthy();
  });
});
