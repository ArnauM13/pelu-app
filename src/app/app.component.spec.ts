import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { mockAuth } from '../testing/firebase-mocks';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'pelu-app' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('pelu-app');
  });
});
