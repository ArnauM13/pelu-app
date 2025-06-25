import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilPageComponent } from './perfil-page.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { mockAuth } from '../../../testing/firebase-mocks';

describe('PerfilPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilPageComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should be defined', () => {
    expect(PerfilPageComponent).toBeDefined();
  });

  it('should have logout method', () => {
    expect(PerfilPageComponent.prototype.logout).toBeDefined();
  });
});
