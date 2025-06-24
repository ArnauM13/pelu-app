import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../../auth/auth.service';
import { AuthPopupComponent, AuthPopupConfig } from '../../shared/components/auth-popup/auth-popup.component';

@Component({
  selector: 'pelu-login-page',
  standalone: true,
  imports: [
    CommonModule,
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
    title: 'Inicia sessió',
    subtitle: 'Accedeix al teu compte',
    submitButtonText: 'Inicia sessió',
    googleButtonText: 'Inicia sessió amb Google',
    linkText: 'No tens compte?',
    linkRoute: '/register',
    linkLabel: 'Registra\'t aquí'
  }));

  readonly isSubmitting = computed(() => this.isLoading());
  readonly hasError = computed(() => this.errorMessage() !== '');

  constructor(
    private auth: Auth,
    private router: Router,
    private authService: AuthService
  ) {}

  async onLoginSubmit(formData: {email: string, password: string}) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await signInWithEmailAndPassword(this.auth, formData.email, formData.password);
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      this.errorMessage.set('Error al iniciar sessió: ' + (err as any).message);
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
      this.errorMessage.set('Error al iniciar sessió amb Google: ' + (err as any).message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
