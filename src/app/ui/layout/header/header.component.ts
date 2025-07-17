import { Component, signal, computed, effect, inject, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { AvatarComponent, AvatarData } from '../../../shared/components/avatar/avatar.component';
import { UserService } from '../../../core/services/user.service';

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
  private readonly isDropdownOpenSignal = signal(false);

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  // Getter per accedir des del template
  get userServicePublic() {
    return this.userService;
  }

  // Computed properties
  readonly isLoggingOut = computed(() => this.isLoggingOutSignal());
  readonly isLoading = computed(() => this.userService.isLoading());
  readonly hasAdminAccess = computed(() => this.userService.hasAdminAccess());
  readonly isDropdownOpen = computed(() => this.isDropdownOpenSignal());

  readonly avatarData = computed((): AvatarData => {
    const user = this.userService.currentUser();

    return {
      imageUrl: user?.photoURL || undefined,
      name: user?.displayName?.split(' ')[0] || undefined,
      surname: user?.displayName?.split(' ').slice(1).join(' ') || undefined,
      email: user?.email || undefined
    };
  });

  // Dropdown methods
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpenSignal.set(!this.isDropdownOpenSignal());
  }

  closeDropdown() {
    this.isDropdownOpenSignal.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.avatar-dropdown')) {
      this.closeDropdown();
    }
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
      this.isLoggingOutSignal.set(true);
      await this.userService.logout();
    } catch (error) {
      // Handle logout error silently
    } finally {
      this.isLoggingOutSignal.set(false);
    }
  }
}
