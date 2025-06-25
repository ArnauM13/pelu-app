import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { mockAuth } from '../../../testing/firebase-mocks';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['loginWithGoogle']);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
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
});
