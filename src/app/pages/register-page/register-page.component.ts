import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'pelu-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
  form: any;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repeatPassword: ['', Validators.required]
    });
  }

  async register() {
    const { email, password, repeatPassword } = this.form.value;

    if (password !== repeatPassword) {
      alert("Les contrasenyes no coincideixen.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(this.auth, email!, password!);
      this.router.navigate(['/']); // Redirigir a la pàgina principal
    } catch (err) {
      alert("Error al registrar: " + (err as any).message);
    }
  }
}
