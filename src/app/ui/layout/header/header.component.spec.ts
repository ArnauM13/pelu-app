import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translation.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  mockAuth,
  mockTranslateService,
  mockTranslateStore,
  mockTranslationService,
  mockAuthService
} from '../../../testing/firebase-mocks';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TranslateStore, useValue: mockTranslateStore },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have logout method', () => {
    expect(typeof component.logout).toBe('function');
  });
});
