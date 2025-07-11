import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'pelu-logout-button',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.scss']
})
export class LogoutButtonComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Internal state signals
  private readonly isLoggingOutSignal = signal<boolean>(false);

  // Public computed signals
  readonly isLoggingOut = computed(() => this.isLoggingOutSignal());
  readonly buttonText = computed(() =>
    this.isLoggingOut() ? 'COMMON.LOADING' : 'COMMON.LOGOUT'
  );

  async logout() {
    if (this.isLoggingOut()) return;

    this.isLoggingOutSignal.set(true);

    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      // Handle logout error silently
    } finally {
      this.isLoggingOutSignal.set(false);
    }
  }
}
