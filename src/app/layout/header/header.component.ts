import { Component, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'pelu-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo-section" routerLink="/">
          <img src="/assets/images/cabj.png" alt="Logo Perruqueria" class="logo">
        </div>
        <nav class="nav">
          <a routerLink="/" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            {{ 'NAVIGATION.HOME' | translate }}
          </a>
          <a routerLink="/booking" class="nav-link" routerLinkActive="active">
            {{ 'NAVIGATION.BOOKING' | translate }}
          </a>
          <a routerLink="/appointments" class="nav-link" routerLinkActive="active">
            {{ 'NAVIGATION.APPOINTMENTS' | translate }}
          </a>
          <a routerLink="/perfil" class="nav-link" routerLinkActive="active">
            {{ 'NAVIGATION.PROFILE' | translate }}
          </a>
        </nav>
        <div class="header-actions">
          <pelu-language-selector class="language-selector" />
          <button (click)="logout()" class="logout-btn" [disabled]="isLoggingOut()">
            {{ isLoggingOut() ? ('COMMON.LOADING' | translate) : ('COMMON.LOGOUT' | translate) }}
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      padding: 0 2rem;
      background-color: var(--surface-color);
      color: var(--text-color);
      box-shadow: 0 2px 4px rgba(15, 44, 89, 0.05);
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 70px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      height: 100%;
    }

    .logo-section {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .logo {
      width: 45px;
      height: 45px;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .nav {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-grow: 1;
      justify-content: center;
    }

    .nav-link {
      color: var(--text-color);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
      position: relative;
    }

    .nav-link:hover {
      background-color: var(--surface-color-hover);
      color: var(--primary-color-dark);
    }

    .nav-link.active {
      background-color: var(--secondary-color);
      color: var(--primary-color-dark);
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .language-selector {
      margin-right: 0.5rem;
    }

    .logout-btn {
      background: transparent;
      color: var(--text-color);
      border: 1px solid var(--border-color);
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
    }

    .logout-btn:hover:not(:disabled) {
      background-color: var(--error-color);
      color: var(--text-color-white);
      border-color: var(--error-color);
    }

    .logout-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .header {
        padding: 0 1rem;
      }

      .nav {
        justify-content: flex-start;
        margin-left: 1rem;
      }

      .brand-name {
        display: none;
      }

      .header-actions {
        gap: 0.5rem;
      }

      .logout-btn {
        padding: 0.5rem 0.8rem;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .nav-link {
        padding: 0.5rem;
      }

      .language-selector {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  // Internal state
  private readonly isLoggingOutSignal = signal(false);

  // Computed properties
  readonly isLoggingOut = computed(() => this.isLoggingOutSignal());

  constructor(private auth: Auth, private router: Router) {}

  async logout() {
    if (this.isLoggingOut()) return;

    this.isLoggingOutSignal.set(true);

    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al tancar sessió:', error);
    } finally {
      this.isLoggingOutSignal.set(false);
    }
  }
}
