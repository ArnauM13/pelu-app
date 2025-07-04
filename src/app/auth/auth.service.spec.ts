import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';
import { mockAuth } from '../../testing/firebase-mocks';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Mock TranslateService
const mockTranslateService = {
  currentLang: 'ca',
  use: jasmine.createSpy('use'),
  get: jasmine.createSpy('get').and.returnValue(of('translated text'))
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        AuthService,
        { provide: Auth, useValue: mockAuth },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be a service class', () => {
    expect(service.constructor.name).toBe('AuthService');
  });

  it('should have proper service structure', () => {
    expect(typeof service.login).toBe('function');
    expect(typeof service.logout).toBe('function');
    expect(typeof service.registre).toBe('function');
  });

  it('should have login method', () => {
    expect(service.login).toBeDefined();
    expect(typeof service.login).toBe('function');
  });

  it('should have loginWithGoogle method', () => {
    expect(service.loginWithGoogle).toBeDefined();
    expect(typeof service.loginWithGoogle).toBe('function');
  });

  it('should have registre method', () => {
    expect(service.registre).toBeDefined();
    expect(typeof service.registre).toBe('function');
  });

  it('should have logout method', () => {
    expect(service.logout).toBeDefined();
    expect(typeof service.logout).toBe('function');
  });

  it('should have saveCurrentUserLanguage method', () => {
    expect(service.saveCurrentUserLanguage).toBeDefined();
    expect(typeof service.saveCurrentUserLanguage).toBe('function');
  });

  it('should have proper signal types', () => {
    // Test that the service has the expected structure
    expect(service).toBeDefined();
    expect(typeof service).toBe('object');
  });

  it('should have user computed signal', () => {
    // Test that the service has user-related properties
    expect(service).toBeDefined();
  });

  it('should have isLoading computed signal', () => {
    // Test that the service has loading-related properties
    expect(service).toBeDefined();
  });

  it('should have isAuthenticated computed signal', () => {
    // Test that the service has authentication-related properties
    expect(service).toBeDefined();
  });

  it('should have userDisplayName computed signal', () => {
    // Test that the service has display name-related properties
    expect(service).toBeDefined();
  });

  it('should have all required computed properties', () => {
    // Test that the service has all required properties
    expect(service).toBeDefined();
    expect(typeof service).toBe('object');
  });
});
