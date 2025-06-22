import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPageComponent } from './register-page.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';

describe('RegisterPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        {
          provide: Auth,
          useValue: {
            createUserWithEmailAndPassword: jasmine.createSpy('createUserWithEmailAndPassword').and.returnValue(Promise.resolve()),
            currentUser: null
          }
        },
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should be defined', () => {
    // Test that the component class can be imported and defined
    expect(RegisterPageComponent).toBeDefined();
  });
});
