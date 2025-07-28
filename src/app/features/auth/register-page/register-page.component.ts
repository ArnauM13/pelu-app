import { Component, signal, computed, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../../../core/auth/auth.service';
import {
  AuthPopupComponent,
  AuthPopupConfig,
} from '../../../shared/components/auth-popup/auth-popup.component';
import { TranslationService } from '../../../core/services/translation.service';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'pelu-register-page',
  imports: [CommonModule, TranslateModule, AuthPopupComponent, LoadingStateComponent],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent implements OnDestroy {
  // Inject services
  #auth = inject(Auth);
  #router = inject(Router);
  #authService = inject(AuthService);
  #translation = inject(TranslationService);

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

  readonly loadingConfig = computed(() => ({
    message: this.#translation.get('AUTH.REGISTERING'),
    spinnerSize: 'medium' as const,
    showMessage: true,
    fullHeight: false,
    overlay: true,
  }));

  ngOnDestroy() {
    // Clean up any subscriptions or timers if needed
  }

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
    } catch (err: any) {
      let errorMessage = 'Error desconegut';

      if (err?.code) {
        switch (err.code) {
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
            errorMessage = err.message || 'Error al registrar-se';
        }
      } else {
        errorMessage = err?.message || 'Error al registrar-se';
      }

      this.errorMessage.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onGoogleAuth() {
    if (this.isLoading()) return; // Prevent multiple submissions

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.#authService.loginWithGoogle();
      await this.#router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err: any) {
      let errorMessage = 'Error desconegut';

      if (err?.code) {
        switch (err.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "S'ha tancat la finestra d'autenticació";
            break;
          case 'auth/popup-blocked':
            errorMessage = "La finestra d'autenticació ha estat bloquejada";
            break;
          default:
            errorMessage = err.message || 'Error al registrar-se amb Google';
        }
      } else {
        errorMessage = err?.message || 'Error al registrar-se amb Google';
      }

      this.errorMessage.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }
}
