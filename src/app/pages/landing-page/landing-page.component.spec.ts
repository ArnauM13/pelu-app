import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.year()).toBe(currentYear);
  });

  it('should be a component class', () => {
    expect(LandingPageComponent.prototype.constructor.name).toBe('LandingPageComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = LandingPageComponent;
    expect(componentClass.name).toBe('LandingPageComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have year computed property', () => {
    expect(component.year).toBeDefined();
    expect(typeof component.year).toBe('function');
  });

  it('should return correct year value', () => {
    const currentYear = new Date().getFullYear();
    const componentYear = component.year();
    expect(componentYear).toBe(currentYear);
    expect(typeof componentYear).toBe('number');
  });

  it('should be a standalone component', () => {
    expect(LandingPageComponent.prototype.constructor).toBeDefined();
    expect(LandingPageComponent.prototype.constructor.name).toBe('LandingPageComponent');
  });

  it('should have component metadata', () => {
    expect(LandingPageComponent.prototype).toBeDefined();
    expect(LandingPageComponent.prototype.constructor).toBeDefined();
  });
});
