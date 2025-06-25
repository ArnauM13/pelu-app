import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule,
    CardComponent
  ],
  templateUrl: './auth-popup.component.html',
  styleUrls: ['./auth-popup.component.scss']
})
export class AuthPopupComponent {
  // Input signals
  readonly config = input.required<AuthPopupConfig>();

  // Output signals
  readonly submitForm = output<{email: string, password: string, repeatPassword?: string}>();
  readonly googleAuth = output<void>();

  // Internal state
  private readonly formSignal = signal<FormGroup | null>(null);

  // Computed properties
  readonly form = computed(() => this.formSignal());
  readonly isRegisterMode = computed(() => this.config()?.mode === 'register');
  readonly hasRepeatPassword = computed(() => this.isRegisterMode());

  constructor(private fb: FormBuilder) {
    // Initialize form
    this.initializeForm();

    // Effect to update form when config changes
    effect(() => {
      const config = this.config();
      if (config) {
        this.updateFormForMode(config.mode);
      }
    });
  }

  private initializeForm() {
    const form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.formSignal.set(form);
  }

  private updateFormForMode(mode: 'login' | 'register') {
    const currentForm = this.formSignal();
    if (!currentForm) return;

    if (mode === 'register') {
      if (!currentForm.contains('repeatPassword')) {
        currentForm.addControl('repeatPassword', this.fb.control('', Validators.required));
      }
    } else {
      if (currentForm.contains('repeatPassword')) {
        currentForm.removeControl('repeatPassword');
      }
    }
  }

  onSubmit() {
    const form = this.form();
    if (form?.valid) {
      const formData = form.value;

      // Validate password match for register mode
      if (this.isRegisterMode() && formData.password !== formData.repeatPassword) {
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
