import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pelu-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-content">
        <h1>Perruqueria XYZ</h1>
        <nav class="nav">
          <a routerLink="/" class="nav-link">Inici</a>
          <a routerLink="/reserves" class="nav-link">Reserves</a>
          <button (click)="logout()" class="logout-btn">Tancar Sessió</button>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      padding: 1rem;
      background-color: #6200ea;
      color: white;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .nav {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      background-color: #ff4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .logout-btn:hover {
      background-color: #cc0000;
    }
  `]
})
export class HeaderComponent {
  constructor(private auth: Auth, private router: Router) {}

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al tancar sessió:', error);
    }
  }
}
