import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { mockAuth } from '../testing/firebase-mocks';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
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

  it('should have the correct title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title()).toEqual('pelu-app');
  });

  it('should have isLoading signal', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.isLoading).toBeDefined();
    expect(typeof app.isLoading).toBe('function');
  });

  it('should have isAuthenticated computed signal', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.isAuthenticated).toBeDefined();
    expect(typeof app.isAuthenticated).toBe('function');
  });

  it('should have shouldShowHeader computed signal', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.shouldShowHeader).toBeDefined();
    expect(typeof app.shouldShowHeader).toBe('function');
  });

  it('should initialize with loading state', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.isLoading()).toBe(true);
  });
});
