import { Component } from '@angular/core';
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
  private authService = new AuthService();

  loginConfig: AuthPopupConfig = {
    mode: 'login',
    title: 'Inicia sessió',
    subtitle: 'Accedeix al teu compte',
    submitButtonText: 'Inicia sessió',
    googleButtonText: 'Inicia sessió amb Google',
    linkText: 'No tens compte?',
    linkRoute: '/register',
    linkLabel: 'Registra\'t aquí'
  };

  constructor(private auth: Auth, private router: Router) {}

  async onLoginSubmit(formData: {email: string, password: string}) {
    try {
      await signInWithEmailAndPassword(this.auth, formData.email, formData.password);
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      alert('Error al iniciar sessió: ' + (err as any).message);
    }
  }

  async onGoogleAuth() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      alert('Error al iniciar sessió amb Google: ' + (err as any).message);
    }
  }
}
