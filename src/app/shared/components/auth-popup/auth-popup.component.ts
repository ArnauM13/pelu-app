import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../card/card.component';

export interface AuthPopupConfig {
  mode: 'login' | 'register';
  title: string;
  subtitle: string;
  submitButtonText: string;
  googleButtonText: string;
  linkText: string;
  linkRoute: string;
  linkLabel: string;
}

@Component({
  selector: 'pelu-auth-popup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    CardComponent
  ],
  templateUrl: './auth-popup.component.html',
  styleUrls: ['./auth-popup.component.scss']
})
export class AuthPopupComponent implements OnInit {
  @Input() config!: AuthPopupConfig;
  @Output() submitForm = new EventEmitter<{email: string, password: string, repeatPassword?: string}>();
  @Output() googleAuth = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Add repeatPassword field for register mode
    if (this.config.mode === 'register') {
      this.form.addControl('repeatPassword', this.fb.control('', Validators.required));
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;

      // Validate password match for register mode
      if (this.config.mode === 'register' && formData.password !== formData.repeatPassword) {
        alert("Les contrasenyes no coincideixen.");
        return;
      }

      this.submitForm.emit(formData);
    }
  }

  onGoogleAuth() {
    this.googleAuth.emit();
  }
}
