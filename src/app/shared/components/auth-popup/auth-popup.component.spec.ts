import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { AuthPopupComponent, AuthPopupConfig } from './auth-popup.component';

describe('AuthPopupComponent', () => {
  let component: AuthPopupComponent;
  let fixture: ComponentFixture<AuthPopupComponent>;

  const mockConfig: AuthPopupConfig = {
    mode: 'login',
    title: 'Inicia sessió',
    subtitle: 'Accedeix al teu compte',
    submitButtonText: 'Inicia sessió',
    googleButtonText: 'Inicia sessió amb Google',
    linkText: 'No tens compte?',
    linkRoute: '/register',
    linkLabel: 'Registra\'t aquí'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AuthPopupComponent,
        ReactiveFormsModule
      ],
      providers: [
        provideRouter([])
      ]
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

  it('should initialize with form', () => {
    expect(component.form()).toBeTruthy();
  });

  it('should have email and password fields in form', () => {
    const form = component.form();
    expect(form?.get('email')).toBeTruthy();
    expect(form?.get('password')).toBeTruthy();
    expect(form?.get('repeatPassword')).toBeFalsy();
  });

  it('should validate email field', () => {
    const form = component.form();
    const emailControl = form?.get('email');
    expect(emailControl?.valid).toBeFalsy();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const form = component.form();
    const passwordControl = form?.get('password');
    expect(passwordControl?.valid).toBeFalsy();

    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should not emit submitForm when form is invalid', () => {
    spyOn(component.submitForm, 'emit');

    component.onSubmit();

    expect(component.submitForm.emit).not.toHaveBeenCalled();
  });

  it('should emit googleAuth event', () => {
    spyOn(component.googleAuth, 'emit');

    component.onGoogleAuth();

    expect(component.googleAuth.emit).toHaveBeenCalled();
  });
});
