import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { AuthPopupComponent, AuthPopupConfig } from './auth-popup.component';

describe('AuthPopupComponent', () => {
  let component: AuthPopupComponent;
  let fixture: ComponentFixture<AuthPopupComponent>;

  const mockLoginConfig: AuthPopupConfig = {
    mode: 'login',
    title: 'Inicia sessió',
    subtitle: 'Accedeix al teu compte',
    submitButtonText: 'Inicia sessió',
    googleButtonText: 'Inicia sessió amb Google',
    linkText: 'No tens compte?',
    linkRoute: '/register',
    linkLabel: 'Registra\'t aquí'
  };

  const mockRegisterConfig: AuthPopupConfig = {
    mode: 'register',
    title: 'Registra\'t',
    subtitle: 'Registra\'t per apuntar-te a noves activitats',
    submitButtonText: 'Registra\'t',
    googleButtonText: 'Registra\'t amb Google',
    linkText: 'Ja tens compte?',
    linkRoute: '/login',
    linkLabel: 'Inicia sessió aquí'
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

  it('should initialize with login config', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    expect(component.config.mode).toBe('login');
    expect(component.config.title).toBe('Inicia sessió');
  });

  it('should initialize with register config', () => {
    component.config = mockRegisterConfig;
    fixture.detectChanges();

    expect(component.config.mode).toBe('register');
    expect(component.config.title).toBe('Registra\'t');
  });

  it('should have email and password fields in form', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
    expect(component.form.get('repeatPassword')).toBeFalsy();
  });

  it('should add repeatPassword field for register mode', () => {
    component.config = mockRegisterConfig;
    fixture.detectChanges();

    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
    expect(component.form.get('repeatPassword')).toBeTruthy();
  });

  it('should validate email field', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    const emailControl = component.form.get('email');
    expect(emailControl?.valid).toBeFalsy();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    const passwordControl = component.form.get('password');
    expect(passwordControl?.valid).toBeFalsy();

    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should emit submitForm event with form data for login', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    spyOn(component.submitForm, 'emit');

    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should emit submitForm event with form data for register', () => {
    component.config = mockRegisterConfig;
    fixture.detectChanges();

    spyOn(component.submitForm, 'emit');

    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123'
    });

    component.onSubmit();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123'
    });
  });

  it('should not emit submitForm when passwords do not match in register mode', () => {
    component.config = mockRegisterConfig;
    fixture.detectChanges();

    spyOn(component.submitForm, 'emit');
    spyOn(window, 'alert');

    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'differentpassword'
    });

    component.onSubmit();

    expect(component.submitForm.emit).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Les contrasenyes no coincideixen.');
  });

  it('should not emit submitForm when form is invalid', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    spyOn(component.submitForm, 'emit');

    component.onSubmit();

    expect(component.submitForm.emit).not.toHaveBeenCalled();
  });

  it('should emit googleAuth event', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    spyOn(component.googleAuth, 'emit');

    component.onGoogleAuth();

    expect(component.googleAuth.emit).toHaveBeenCalled();
  });

  it('should render correct title and subtitle', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Inicia sessió');
    expect(compiled.querySelector('p')?.textContent).toContain('Accedeix al teu compte');
  });

  it('should render repeat password field only in register mode', () => {
    component.config = mockRegisterConfig;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const repeatPasswordInput = compiled.querySelector('input[formControlName="repeatPassword"]');
    expect(repeatPasswordInput).toBeTruthy();
  });

  it('should not render repeat password field in login mode', () => {
    component.config = mockLoginConfig;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const repeatPasswordInput = compiled.querySelector('input[formControlName="repeatPassword"]');
    expect(repeatPasswordInput).toBeFalsy();
  });
});
