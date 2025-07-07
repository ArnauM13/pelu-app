import { Component, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { AvatarComponent, AvatarData } from '../../../shared/components/avatar/avatar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'pelu-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSelectorComponent, AvatarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Internal state
  private readonly isLoggingOutSignal = signal(false);

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  // Getter per accedir des del template
  get authServicePublic() {
    return this.authService;
  }

  // Computed properties
  readonly isLoggingOut = computed(() => this.isLoggingOutSignal());
  readonly isLoading = computed(() => this.authService.isLoading());
  readonly hasStylistAccess = computed(() => this.roleService.hasStylistAccess());

  readonly avatarData = computed((): AvatarData => {
    const user = this.authService.user();

    return {
      imageUrl: user?.photoURL || undefined,
      name: user?.displayName?.split(' ')[0] || undefined,
      surname: user?.displayName?.split(' ').slice(1).join(' ') || undefined,
      email: user?.email || undefined
    };
  });

  navigateToProfile(event: Event) {
    event.stopPropagation(); // Evita que es propagui al logo-section
    this.router.navigate(['/perfil']);
  }

  navigateToHome(event: Event) {
    event.stopPropagation();
    // Only navigate if we're not already on the home page
    if (this.router.url !== '/') {
      this.router.navigate(['/']);
    }
  }

  async onLogout() {
    try {
      await this.authService.logout();
    } catch (error) {
      // Handle logout error silently
    }
  }
}
