import { Component, signal, computed, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
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
export class HeaderComponent implements OnInit, OnDestroy {
  // Inject services
  #userService = inject(UserService);
  #router = inject(Router);

  // Internal state
  private readonly isLoggingOutSignal = signal(false);
  private readonly isScrolledSignal = signal(false);

  // Getter per accedir des del template
  get userServicePublic() {
    return this.#userService;
  }

  // Computed properties
  readonly isLoggingOut = computed(() => this.isLoggingOutSignal());
  readonly isScrolled = computed(() => this.isScrolledSignal());
  readonly isLoading = computed(() => this.#userService.isLoading());
  readonly isAdmin = computed(() => this.#userService.isAdmin());

  readonly customDropdownItems = computed((): ProfileDropdownItem[] => {
    return [
      {
        label: 'AUTH.SIGN_OUT',
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

  async onLogout() {
    try {
      this.isLoggingOutSignal.set(true);
      await this.#userService.logout();
    } catch {
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

  // ===== LIFECYCLE METHODS =====

  ngOnInit(): void {
    // Initialize scroll detection
    this.checkScrollPosition();
  }

  ngOnDestroy(): void {
    // Cleanup is handled by HostListener
  }

  // ===== SCROLL DETECTION =====

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  private checkScrollPosition(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const isScrolled = scrollTop > 50; // Activate floating after 50px scroll

    console.log('Scroll position:', scrollTop, 'Is scrolled:', isScrolled); // Debug log

    if (this.isScrolledSignal() !== isScrolled) {
      this.isScrolledSignal.set(isScrolled);
      console.log('Header state changed to:', isScrolled ? 'floating' : 'normal'); // Debug log
    }
  }
}
