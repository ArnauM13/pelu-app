import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../../core/auth/auth.service';
import {
  AuthPopupComponent,
  AuthPopupConfig,
} from '../../../shared/components/auth-popup/auth-popup.component';
import { TranslationService } from '../../../core/services/translation.service';
import { LoaderService } from '../../../shared/services/loader.service';

// Define error interface for better type safety
interface AuthError {
  code?: string;
  message?: string;
}

@Component({
  selector: 'pelu-register-page',
  imports: [CommonModule, TranslateModule, AuthPopupComponent],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent {
  // Inject services
  #auth = inject(Auth);
  #router = inject(Router);
  #authService = inject(AuthService);
  #translation = inject(TranslationService);
  #loader = inject(LoaderService);

  // Internal state
  private readonly isLoading = signal(false);
  readonly errorMessage = signal<string>('');
  readonly passwordMismatch = signal<boolean>(false);

  // Computed properties
  readonly registerConfig = computed(
    (): AuthPopupConfig => ({
      mode: 'register',
      title: this.#translation.get('AUTH.SIGN_UP'),
      subtitle: this.#translation.get('AUTH.REGISTER_FOR_ACTIVITIES'),
      submitButtonText: this.#translation.get('AUTH.SIGN_UP'),
      googleButtonText: this.#translation.get('AUTH.SIGN_UP_WITH_GOOGLE'),
      linkText: this.#translation.get('AUTH.ALREADY_HAVE_ACCOUNT'),
      linkRoute: '/login',
      linkLabel: this.#translation.get('AUTH.SIGN_IN_HERE'),
    })
  );

  readonly isSubmitting = computed(() => this.isLoading());
  readonly hasError = computed(() => this.errorMessage() !== '');

  onPasswordMismatch(mismatch: boolean) {
    this.passwordMismatch.set(mismatch);

    if (mismatch) {
      console.log('Les contrasenyes no coincideixen - informació rebuda del component auth-popup');
      // Aquí pots afegir qualsevol lògica addicional quan les contrasenyes no coincideixen
    }
  }

  async onRegisterSubmit(formData: { email: string; password: string; repeatPassword?: string }) {
    if (this.isLoading()) return; // Prevent multiple submissions

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.#loader.show({ message: 'AUTH.REGISTERING' });

    try {
      // Validate password match
      if (formData.password !== formData.repeatPassword) {
        this.errorMessage.set(this.#translation.get('AUTH.PASSWORD_MISMATCH'));
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        this.errorMessage.set('La contrasenya ha de tenir almenys 6 caràcters');
        return;
      }

      await this.#authService.registre(formData.email, formData.password);
      await this.#router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err: unknown) {
      let errorMessage = 'Error desconegut';

      const authError = err as AuthError;
      if (authError?.code) {
        switch (authError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Aquest correu electrònic ja està registrat';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Format de correu electrònic invàlid';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contrasenya és massa feble';
            break;
          default:
            errorMessage = authError.message || 'Error al registrar-se';
        }
      } else {
        errorMessage = authError?.message || 'Error al registrar-se';
      }

      this.errorMessage.set(errorMessage);
    } finally {
      this.isLoading.set(false);
      this.#loader.hide();
    }
  }

  async onGoogleAuth() {
    if (this.isLoading()) return; // Prevent multiple submissions

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.#loader.show({ message: 'AUTH.REGISTERING_WITH_GOOGLE' });

    try {
      await this.#authService.loginWithGoogle();
      await this.#router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err: unknown) {
      let errorMessage = 'Error desconegut';

      const authError = err as AuthError;
      if (authError?.code) {
        switch (authError.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "S'ha tancat la finestra d'autenticació";
            break;
          case 'auth/popup-blocked':
            errorMessage = "La finestra d'autenticació ha estat bloquejada";
            break;
          default:
            errorMessage = authError.message || 'Error al registrar-se amb Google';
        }
      } else {
        errorMessage = authError?.message || 'Error al registrar-se amb Google';
      }

      this.errorMessage.set(errorMessage);
    } finally {
      this.isLoading.set(false);
      this.#loader.hide();
    }
  }
}
