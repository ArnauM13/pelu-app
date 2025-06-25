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
});
