import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';

describe('LoginPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        {
          provide: Auth,
          useValue: {
            signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword').and.returnValue(Promise.resolve()),
            currentUser: null
          }
        },
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should be defined', () => {
    // Test that the component class can be imported and defined
    expect(LoginPageComponent).toBeDefined();
  });
});
