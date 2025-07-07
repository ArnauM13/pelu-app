import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthPopupComponent, AuthPopupConfig } from '../../../shared/components/auth-popup/auth-popup.component';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'pelu-login-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AuthPopupComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  // Internal state
  private readonly isLoading = signal(false);
  readonly errorMessage = signal<string>('');

  // Computed properties
  readonly loginConfig = computed((): AuthPopupConfig => ({
    mode: 'login',
    title: this.translation.get('AUTH.SIGN_IN'),
    subtitle: this.translation.get('AUTH.ACCESS_YOUR_ACCOUNT'),
    submitButtonText: this.translation.get('AUTH.SIGN_IN'),
    googleButtonText: this.translation.get('AUTH.SIGN_IN_WITH_GOOGLE'),
    linkText: this.translation.get('AUTH.DONT_HAVE_ACCOUNT'),
    linkRoute: '/register',
    linkLabel: this.translation.get('AUTH.REGISTER_HERE')
  }));

  readonly isSubmitting = computed(() => this.isLoading());
  readonly hasError = computed(() => this.errorMessage() !== '');

  constructor(
    private auth: Auth,
    private router: Router,
    private authService: AuthService,
    private translation: TranslationService
  ) {}

  async onLoginSubmit(formData: {email: string, password: string}) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await signInWithEmailAndPassword(this.auth, formData.email, formData.password);
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      this.errorMessage.set(this.translation.get('AUTH.LOGIN_ERROR') + ': ' + (err as any).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onGoogleAuth() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      this.errorMessage.set(this.translation.get('AUTH.GOOGLE_LOGIN_ERROR') + ': ' + (err as any).message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
