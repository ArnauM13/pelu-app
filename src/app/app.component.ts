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

      // Només redirigir si no està autenticat i està a una ruta protegida
      if (!user && this.router.url === '/') {
        this.router.navigate(['/login']);
      }
    });
  }
}
