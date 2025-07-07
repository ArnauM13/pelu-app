import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { mockAuth } from '../../testing/firebase-mocks';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof authGuard).toBe('function');
  });
});
