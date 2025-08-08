import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import {
  ProfileDropdownComponent,
  ProfileDropdownItem,
} from '../../../shared/components/profile-dropdown/profile-dropdown.component';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'pelu-header',
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ButtonModule,
    LanguageSelectorComponent,
    ProfileDropdownComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  // Inject services
  #userService = inject(UserService);
  #router = inject(Router);

  // Internal state
  private readonly isLoggingOutSignal = signal(false);

  // Getter per accedir des del template
  get userServicePublic() {
    return this.#userService;
  }

  // Computed properties
  readonly isLoggingOut = computed(() => this.isLoggingOutSignal());
  readonly isLoading = computed(() => this.#userService.isLoading());
  readonly isAdmin = computed(() => this.#userService.isAdmin());

  readonly customDropdownItems = computed((): ProfileDropdownItem[] => {
    return [
      {
        label: 'COMMON.ACTIONS.LOGOUT',
        emoji: '🚪',
        type: 'danger',
        onClick: () => this.onLogout(),
        disabled: this.isLoggingOut(),
      },
    ];
  });

  navigateToHome(event: Event) {
    event.stopPropagation();
    // Only navigate if we're not already on the home page
    if (this.#router.url !== '/') {
      this.#router.navigate(['/']);
    }
  }

  navigateToPlayground() {
    this.#router.navigate(['/playground']);
  }

  async onLogout() {
    try {
      this.isLoggingOutSignal.set(true);
      await this.#userService.logout();
    } catch (_error) {
      // Handle logout error silently
    } finally {
      this.isLoggingOutSignal.set(false);
    }
  }

  onDropdownItemClicked(item: ProfileDropdownItem) {
    // Handle custom dropdown item clicks if needed
    if (item.onClick) {
      item.onClick();
    }
  }
}
