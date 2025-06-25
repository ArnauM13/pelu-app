import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../../auth/auth.service';
import { AuthPopupComponent, AuthPopupConfig } from '../../shared/components/auth-popup/auth-popup.component';
import { TranslationService } from '../../core/translation.service';

@Component({
  selector: 'pelu-register-page',
  standalone: true,
  imports: [
    CommonModule,
    AuthPopupComponent
  ],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
  // Internal state
  private readonly isLoading = signal(false);
  readonly errorMessage = signal<string>('');

  // Computed properties
  readonly registerConfig = computed((): AuthPopupConfig => ({
    mode: 'register',
    title: this.translation.get('AUTH.SIGN_UP'),
    subtitle: this.translation.get('AUTH.REGISTER_FOR_ACTIVITIES'),
    submitButtonText: this.translation.get('AUTH.SIGN_UP'),
    googleButtonText: this.translation.get('AUTH.SIGN_UP_WITH_GOOGLE'),
    linkText: this.translation.get('AUTH.ALREADY_HAVE_ACCOUNT'),
    linkRoute: '/login',
    linkLabel: this.translation.get('AUTH.SIGN_IN_HERE')
  }));

  readonly isSubmitting = computed(() => this.isLoading());
  readonly hasError = computed(() => this.errorMessage() !== '');

  constructor(
    private auth: Auth,
    private router: Router,
    private authService: AuthService,
    private translation: TranslationService
  ) {}

  async onRegisterSubmit(formData: {email: string, password: string, repeatPassword?: string}) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await createUserWithEmailAndPassword(this.auth, formData.email, formData.password);
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      this.errorMessage.set(this.translation.get('AUTH.REGISTER_ERROR') + ": " + (err as any).message);
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
      this.errorMessage.set(this.translation.get('AUTH.GOOGLE_REGISTER_ERROR') + ': ' + (err as any).message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
