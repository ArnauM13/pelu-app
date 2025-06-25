import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';
import { mockAuth } from '../../testing/firebase-mocks';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: mockAuth }
      ]
    });
  });

  it('should be defined', () => {
    expect(AuthService).toBeDefined();
  });

  it('should have loginWithGoogle method', () => {
    expect(AuthService.prototype.loginWithGoogle).toBeDefined();
  });

  it('should have registre method', () => {
    expect(AuthService.prototype.registre).toBeDefined();
  });

  it('should have login method', () => {
    expect(AuthService.prototype.login).toBeDefined();
  });

  it('should have logout method', () => {
    expect(AuthService.prototype.logout).toBeDefined();
  });

  it('should be injectable service', () => {
    expect(AuthService.prototype.constructor.name).toBe('AuthService');
  });

  it('should have correct method signatures', () => {
    const registreMethod = AuthService.prototype.registre;
    const loginMethod = AuthService.prototype.login;
    const loginWithGoogleMethod = AuthService.prototype.loginWithGoogle;
    const logoutMethod = AuthService.prototype.logout;

    expect(typeof registreMethod).toBe('function');
    expect(typeof loginMethod).toBe('function');
    expect(typeof loginWithGoogleMethod).toBe('function');
    expect(typeof logoutMethod).toBe('function');
  });

  it('should have proper class structure', () => {
    const serviceClass = AuthService;
    expect(serviceClass.name).toBe('AuthService');
    expect(typeof serviceClass).toBe('function');
  });

  it('should be a service class', () => {
    // Check if it's a proper service class
    expect(AuthService.prototype.constructor).toBeDefined();
    expect(AuthService.prototype.constructor.name).toBe('AuthService');
  });
});
