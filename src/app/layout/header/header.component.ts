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
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
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
