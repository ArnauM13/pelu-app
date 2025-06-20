import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'pelu-logout-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `<button pButton label="Tancar sessió" (click)="logout()"></button>`
})
export class LogoutButtonComponent {
  constructor(private auth: Auth, private router: Router) {}

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}