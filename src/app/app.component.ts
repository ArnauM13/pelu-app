import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'pelu-app';
  isAuthenticated = false;
  isLoading = true;

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user: any) => {
      this.isAuthenticated = !!user;
      this.isLoading = false;

      // Si no està autenticat i no està a login/register, redirigir a login
      if (!user && !['/login', '/register'].includes(this.router.url)) {
        this.router.navigate(['/login']);
      }
    });
  }
}
