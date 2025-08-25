import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { TranslateModule } from '@ngx-translate/core';
import {
  AuthPopupComponent,
  AuthPopupConfig,
} from '../../../shared/components/auth-popup/auth-popup.component';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'pelu-login-page',
  imports: [CommonModule, TranslateModule, AuthPopupComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnDestroy {
  // Inject services
  #auth = inject(Auth);
  #router = inject(Router);
  #authService = inject(AuthService);
  #translation = inject(TranslationService);
  #loader = inject(LoaderService);

  // Internal state
  private readonly isLoadingSignal = signal(true);
  private readonly authUnsubscribe = signal<(() => void) | null>(null);

  // Public computed signals
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly errorMessage = signal<string>('');

  // Additional computed properties for template
  readonly isSubmitting = computed(() => this.isLoading());
  readonly hasError = computed(() => this.errorMessage() !== '');

  // Computed properties
  readonly loginConfig = computed(
    (): AuthPopupConfig => ({
      mode: 'login',
      title: this.#translation.get('AUTH.SIGN_IN'),
      subtitle: this.#translation.get('AUTH.ACCESS_YOUR_ACCOUNT'),
      submitButtonText: this.#translation.get('AUTH.SIGN_IN'),
      googleButtonText: this.#translation.get('AUTH.SIGN_IN_WITH_GOOGLE'),
      linkText: this.#translation.get('AUTH.DONT_HAVE_ACCOUNT'),
      linkRoute: '/register',
      linkLabel: this.#translation.get('AUTH.REGISTER_HERE'),
    })
  );

  constructor() {
    this.authUnsubscribe.set(
      onAuthStateChanged(this.#auth, user => {
        if (user) {
          this.#router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.authUnsubscribe()) {
      this.authUnsubscribe();
    }
  }

  async onLoginSubmit(formData: { email: string; password: string }) {
    this.isLoadingSignal.set(true);
    this.errorMessage.set('');
    this.#loader.show({ message: 'AUTH.SIGNING_IN' });

    try {
      await this.#authService.login(formData.email, formData.password);
      this.#router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      this.errorMessage.set(
        this.#translation.get('AUTH.LOGIN_ERROR') + ': ' + (err as Error).message
      );
    } finally {
      this.isLoadingSignal.set(false);
      this.#loader.hide();
    }
  }

  async onGoogleAuth() {
    this.isLoadingSignal.set(true);
    this.errorMessage.set('');
    this.#loader.show({ message: 'AUTH.SIGNING_IN_WITH_GOOGLE' });

    try {
      await this.#authService.loginWithGoogle();
      this.#router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      this.errorMessage.set(
        this.#translation.get('AUTH.GOOGLE_LOGIN_ERROR') + ': ' + (err as Error).message
      );
    } finally {
      this.isLoadingSignal.set(false);
      this.#loader.hide();
    }
  }
}
