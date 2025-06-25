import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'pelu-logout-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `<button pButton label="Tancar sessió" (click)="logout()"></button>`
})
export class LogoutButtonComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
