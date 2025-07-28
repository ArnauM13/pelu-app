import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextComponent } from "../inputs/input-text/input-text.component";
import { InputPasswordComponent } from "../inputs/input-password/input-password.component";
import { ButtonComponent } from "../buttons/button.component";

export interface AuthPopupConfig {
  mode: 'login' | 'register';
  title: string;
  subtitle: string;
  submitButtonText: string;
  googleButtonText: string;
  linkText: string;
  linkRoute: string;
  linkLabel: string;
}

@Component({
  selector: 'pelu-auth-popup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    TranslateModule,
    InputTextComponent,
    InputPasswordComponent,
    ButtonComponent
],
  templateUrl: './auth-popup.component.html',
  styleUrls: ['./auth-popup.component.scss'],
})
export class AuthPopupComponent implements OnDestroy {
  // Injections
  private readonly fb = inject(FormBuilder);

  // Input signals
  readonly config = input.required<AuthPopupConfig>();

  // Output signals
  readonly submitForm = output<{ email: string; password: string; repeatPassword?: string }>();
  readonly googleAuth = output<void>();
  readonly passwordMismatch = output<boolean>();

  // Internal state signals
  private readonly formSignal = signal<FormGroup | null>(null);
  private readonly passwordValueSignal = signal<string>('');
  private readonly repeatPasswordValueSignal = signal<string>('');

  // Computed properties
  readonly form = computed(() => this.formSignal());
  readonly isRegisterMode = computed(() => this.config()?.mode === 'register');
  readonly hasRepeatPassword = computed(() => this.isRegisterMode());

  readonly isFirstPasswordValid = computed(() => {
    const password = this.passwordValueSignal();
    return password && password.length >= 6;
  });

  readonly passwordsMatch = computed(() => {
    if (!this.isRegisterMode()) return true;

    const password = this.passwordValueSignal();
    const repeatPassword = this.repeatPasswordValueSignal();

    const match = password && repeatPassword && password === repeatPassword;

    // Emit password mismatch status to parent
    this.passwordMismatch.emit(!match);

    return match;
  });

  readonly isRepeatPasswordEnabled = computed(() => this.isFirstPasswordValid());

  // Input configurations
  readonly emailConfig = {
    label: 'AUTH.EMAIL',
    placeholder: 'AUTH.EMAIL',
    required: true,
    icon: 'pi pi-envelope',
    iconPosition: 'left' as const,
    autocomplete: 'email',
  };

  readonly passwordConfig = {
    label: 'AUTH.PASSWORD',
    placeholder: 'AUTH.PASSWORD',
    required: true,
    icon: 'pi pi-lock',
    iconPosition: 'left' as const,
    minlength: 6,
    autocomplete: 'current-password',
    showToggle: true,
  };

  readonly repeatPasswordConfig = {
    label: 'AUTH.REPEAT_PASSWORD',
    placeholder: 'AUTH.PASSWORD',
    required: true,
    icon: 'pi pi-lock',
    iconPosition: 'left' as const,
    minlength: 6,
    autocomplete: 'new-password',
    showToggle: true,
  };

  constructor() {
    this.#initConfigEffect();
    this.#initPasswordValidationEffect();
  }

  ngOnDestroy() {
    // Clean up form to prevent memory leaks
    const form = this.formSignal();
    if (form) {
      form.reset();
    }
  }

  #initConfigEffect() {
    effect(
      () => {
        const config = this.config();
        if (config) {
          this.initializeFormForMode(config.mode);
        }
      }
    );
  }

  #initPasswordValidationEffect() {
    effect(
      () => {
        const form = this.form();
        // const isFirstValid = this.isFirstPasswordValid();
        const isEnabled = this.isRepeatPasswordEnabled();

        if (form && this.isRegisterMode()) {
          const repeatPasswordControl = form.get('repeatPassword');
          if (repeatPasswordControl) {
            if (isEnabled) {
              repeatPasswordControl.enable();
            } else {
              repeatPasswordControl.disable();
              repeatPasswordControl.setValue('');
              this.repeatPasswordValueSignal.set('');
            }
          }
        }
      }
    );
  }

  private initializeFormForMode(mode: 'login' | 'register') {
    if (mode === 'register') {
      const form = this.fb.group(
        {
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          repeatPassword: [
            { value: '', disabled: true },
            [Validators.required, Validators.minLength(6)],
          ],
        },
        { validators: this.passwordMatchValidator }
      );

      this.formSignal.set(form);
    } else {
      const form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
      this.formSignal.set(form);
    }
  }

  onPasswordChange(value: string) {
    this.passwordValueSignal.set(value);
  }

  onRepeatPasswordChange(value: string) {
    this.repeatPasswordValueSignal.set(value);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const repeatPassword = control.get('repeatPassword');

    if (!password || !repeatPassword) {
      return null;
    }

    if (password.value !== repeatPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit() {
    const form = this.form();
    if (form?.valid) {
      const formData = form.value;

      // Additional validation for register mode
      if (this.isRegisterMode()) {
        if (formData.password !== formData.repeatPassword) {
          console.error('Password mismatch');
          return;
        }

        if (formData.password.length < 6) {
          console.error('Password too short');
          return;
        }
      }

      this.submitForm.emit(formData);
    }
  }

  onGoogleAuth() {
    this.googleAuth.emit();
  }
}
