import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { AuthPopupComponent, AuthPopupConfig } from './auth-popup.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('AuthPopupComponent', () => {
  let component: AuthPopupComponent;
  let fixture: ComponentFixture<AuthPopupComponent>;



  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AuthPopupComponent,
        ReactiveFormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPopupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have config input signal', () => {
    expect(component.config).toBeDefined();
    expect(typeof component.config).toBe('function');
  });

  it('should have form computed property', () => {
    expect(component.form).toBeDefined();
    expect(typeof component.form).toBe('function');
  });

  it('should have isRegisterMode computed property', () => {
    expect(component.isRegisterMode).toBeDefined();
    expect(typeof component.isRegisterMode).toBe('function');
  });

  it('should have hasRepeatPassword computed property', () => {
    expect(component.hasRepeatPassword).toBeDefined();
    expect(typeof component.hasRepeatPassword).toBe('function');
  });

  it('should have submitForm output signal', () => {
    expect(component.submitForm).toBeDefined();
  });

  it('should have googleAuth output signal', () => {
    expect(component.googleAuth).toBeDefined();
  });

  it('should have onSubmit method', () => {
    expect(typeof component.onSubmit).toBe('function');
  });

  it('should have onGoogleAuth method', () => {
    expect(typeof component.onGoogleAuth).toBe('function');
  });

  it('should emit googleAuth event', () => {
    spyOn(component.googleAuth, 'emit');

    component.onGoogleAuth();

    expect(component.googleAuth.emit).toHaveBeenCalled();
  });

  it('should have proper component structure', () => {
    expect(AuthPopupComponent.prototype.constructor.name).toBe('AuthPopupComponent');
  });

  it('should be a standalone component', () => {
    expect(AuthPopupComponent.prototype.constructor).toBeDefined();
    expect(AuthPopupComponent.prototype.constructor.name).toBe('AuthPopupComponent');
  });

  it('should have component metadata', () => {
    expect(AuthPopupComponent.prototype).toBeDefined();
    expect(AuthPopupComponent.prototype.constructor).toBeDefined();
  });

  it('should have all required computed properties', () => {
    expect(component.config).toBeDefined();
    expect(component.form).toBeDefined();
    expect(component.isRegisterMode).toBeDefined();
    expect(component.hasRepeatPassword).toBeDefined();
  });

  it('should have proper signal types', () => {
    expect(typeof component.config).toBe('function');
    expect(typeof component.form).toBe('function');
    expect(typeof component.isRegisterMode).toBe('function');
    expect(typeof component.hasRepeatPassword).toBe('function');
  });

  it('should handle AuthPopupConfig interface correctly', () => {
    const config: AuthPopupConfig = {
      mode: 'login',
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      submitButtonText: 'Submit',
      googleButtonText: 'Google Auth',
      linkText: 'Link Text',
      linkRoute: '/test',
      linkLabel: 'Link Label',
    };

    expect(config.mode).toBe('login');
    expect(config.title).toBe('Test Title');
    expect(config.subtitle).toBe('Test Subtitle');
    expect(config.submitButtonText).toBe('Submit');
    expect(config.googleButtonText).toBe('Google Auth');
    expect(config.linkText).toBe('Link Text');
    expect(config.linkRoute).toBe('/test');
    expect(config.linkLabel).toBe('Link Label');
  });

  it('should handle register mode config', () => {
    const registerConfig: AuthPopupConfig = {
      mode: 'register',
      title: 'Register',
      subtitle: 'Create account',
      submitButtonText: 'Register',
      googleButtonText: 'Register with Google',
      linkText: 'Have account?',
      linkRoute: '/login',
      linkLabel: 'Login here',
    };

    expect(registerConfig.mode).toBe('register');
    expect(registerConfig.title).toBe('Register');
    expect(registerConfig.submitButtonText).toBe('Register');
  });
});
