import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../../auth/auth.service';
import { AuthPopupComponent, AuthPopupConfig } from '../../shared/components/auth-popup/auth-popup.component';

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
    title: 'Registra\'t',
    subtitle: 'Registra\'t per apuntar-te a noves activitats',
    submitButtonText: 'Registra\'t',
    googleButtonText: 'Registra\'t amb Google',
    linkText: 'Ja tens compte?',
    linkRoute: '/login',
    linkLabel: 'Inicia sessió aquí'
  }));

  readonly isSubmitting = computed(() => this.isLoading());
  readonly hasError = computed(() => this.errorMessage() !== '');

  constructor(
    private auth: Auth,
    private router: Router,
    private authService: AuthService
  ) {}

  async onRegisterSubmit(formData: {email: string, password: string, repeatPassword?: string}) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await createUserWithEmailAndPassword(this.auth, formData.email, formData.password);
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      this.errorMessage.set("Error al registrar: " + (err as any).message);
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
      this.errorMessage.set('Error al registrar amb Google: ' + (err as any).message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
