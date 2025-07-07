import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './ui/layout/header/header.component';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TranslateModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Core signals
  readonly title = signal('pelu-app');

  constructor(private authService: AuthService) {}

  // Computed signals - utilitzem AuthService
  readonly isLoading = computed(() => this.authService.isLoading());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly shouldShowHeader = computed(() => this.isAuthenticated() && !this.isLoading());
}
