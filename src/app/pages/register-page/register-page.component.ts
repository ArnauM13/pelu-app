import { Component } from '@angular/core';
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
  private authService = new AuthService();

  registerConfig: AuthPopupConfig = {
    mode: 'register',
    title: 'Registra\'t',
    subtitle: 'Registra\'t per apuntar-te a noves activitats',
    submitButtonText: 'Registra\'t',
    googleButtonText: 'Registra\'t amb Google',
    linkText: 'Ja tens compte?',
    linkRoute: '/login',
    linkLabel: 'Inicia sessió aquí'
  };

  constructor(private auth: Auth, private router: Router) {}

  async onRegisterSubmit(formData: {email: string, password: string, repeatPassword?: string}) {
    try {
      await createUserWithEmailAndPassword(this.auth, formData.email, formData.password);
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      alert("Error al registrar: " + (err as any).message);
    }
  }

  async onGoogleAuth() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      alert('Error al registrar amb Google: ' + (err as any).message);
    }
  }
}
