import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'pelu-user-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, CardComponent],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.scss'
})
export class UserPageComponent {
  private authService = inject(AuthService);

  // Internal state signals
  private readonly isLoadingSignal = signal<boolean>(true);

  // Public computed signals
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly user = computed(() => this.authService.user());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userDisplayName = computed(() => this.authService.userDisplayName());

  // Computed properties
  readonly userInfo = computed(() => {
    const user = this.user();
    if (!user) return null;

    return {
      displayName: user.displayName || user.email?.split('@')[0] || 'COMMON.USER',
      email: user.email || 'COMMON.NOT_AVAILABLE',
      uid: user.uid || 'COMMON.NOT_AVAILABLE',
      creationDate: user.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('ca-ES')
        : 'COMMON.NOT_AVAILABLE',
      lastSignIn: user.metadata?.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleDateString('ca-ES')
        : 'COMMON.NOT_AVAILABLE'
    };
  });

  readonly hasUserData = computed(() => !!this.userInfo());

  constructor() {
    // Set loading to false after initialization
    setTimeout(() => {
      this.isLoadingSignal.set(false);
    }, 100);
  }
}
