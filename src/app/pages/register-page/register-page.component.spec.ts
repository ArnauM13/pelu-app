import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPageComponent } from './register-page.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { mockAuth } from '../../../testing/firebase-mocks';

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['loginWithGoogle']);

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have onRegisterSubmit method', () => {
    expect(typeof component.onRegisterSubmit).toBe('function');
  });

  it('should have onGoogleAuth method', () => {
    expect(typeof component.onGoogleAuth).toBe('function');
  });
});
