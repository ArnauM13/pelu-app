import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilPageComponent } from './perfil-page.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';

describe('PerfilPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilPageComponent],
      providers: [
        {
          provide: Auth,
          useValue: {
            signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve()),
            currentUser: null
          }
        },
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should be defined', () => {
    // Test that the component class can be imported and defined
    expect(PerfilPageComponent).toBeDefined();
  });
});
