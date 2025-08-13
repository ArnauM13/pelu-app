import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './ui/layout/header/header.component';
import { AuthService } from './core/auth/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { injectSpeedInsights } from '@vercel/speed-insights';

@Component({
  selector: 'pelu-app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    TranslateModule,
    HeaderComponent,
    ToastComponent,
    LoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // Core signals
  readonly title = signal('pelu-app');

  private readonly authService = inject(AuthService);

  // Computed signals - utilitzem AuthService
  readonly isLoading = computed(() => this.authService.isLoading());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly shouldShowHeader = computed(() => this.isAuthenticated() && !this.isLoading());

  ngOnInit() {
    injectSpeedInsights();
  }
}
