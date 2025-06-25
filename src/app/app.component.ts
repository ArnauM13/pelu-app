import { Component, signal, computed, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './layout/header/header.component';

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
  readonly isLoading = signal(true);
  private readonly currentUser = signal<any>(null);

  // Computed signals
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly shouldShowHeader = computed(() => this.isAuthenticated() && !this.isLoading());

  constructor(private auth: Auth, private router: Router) {
    // Convert Firebase auth state to signal
    const authState$ = new Promise<any>((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        this.isLoading.set(false);
        resolve(user);
      });
    });

    // Initialize navigation effect
    this.#initNavigationEffect();
  }

  #initNavigationEffect() {
    effect(() => {
      const user = this.currentUser();
      const isLoading = this.isLoading();

      if (!isLoading && !user && this.router.url === '/') {
        this.router.navigate(['/login']);
      }
    }, { allowSignalWrites: true });
  }
}
