import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from './core/services/translation.service';
import { AuthService } from './core/auth/auth.service';
import {
  mockAuth,
  mockTranslateService,
  mockTranslateStore,
  mockTranslationService,
  mockAuthService
} from '../testing/firebase-mocks';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TranslateStore, useValue: mockTranslateStore },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: AuthService, useValue: mockAuthService },
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
    expect(app.title()).toEqual('pelu-app');
  });
});
