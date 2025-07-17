import { Component, signal, computed, inject, HostListener, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AvatarComponent, AvatarData } from '../avatar/avatar.component';
import { UserService } from '../../../core/services/user.service';

export interface ProfileDropdownItem {
  label?: string;
  icon?: string;
  routerLink?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'default' | 'danger' | 'divider';
}

@Component({
  selector: 'pelu-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AvatarComponent],
    template: `
    <div class="profile-dropdown" (click)="toggleDropdown($event)">
      <pelu-avatar [data]="avatarData()" size="medium"></pelu-avatar>
      <i class="pi pi-chevron-down dropdown-arrow" [class.rotated]="isDropdownOpen()"></i>

      <!-- Dropdown Menu -->
      <div class="dropdown-menu" [class.show]="isDropdownOpen()">
        <div class="dropdown-header" (click)="closeDropdown()">
          <div class="user-info">
            <span class="user-name">{{ currentUser()?.displayName || 'Usuari' }}</span>
            <span class="user-email">{{ currentUser()?.email }}</span>
          </div>
        </div>

        <div class="dropdown-items">
          @for (item of dropdownItems(); track item.label || item.type) {
            @if (item.type === 'divider') {
              <div class="dropdown-divider" (click)="closeDropdown()"></div>
            } @else {
              @if (item.routerLink) {
                <a [routerLink]="item.routerLink"
                   class="dropdown-item"
                   [class.danger]="item.type === 'danger'"
                   [class.disabled]="item.disabled"
                   (click)="onItemClick(item)">
                  <i [class]="item.icon || ''"></i>
                  <span>{{ (item.label || '') | translate }}</span>
                </a>
              } @else {
                <button class="dropdown-item"
                        [class.danger]="item.type === 'danger'"
                        [class.disabled]="item.disabled"
                        [disabled]="item.disabled"
                        (click)="onItemClick(item)">
                  <i [class]="item.icon || ''"></i>
                  <span>{{ (item.label || '') | translate }}</span>
                </button>
              }
            }
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile-dropdown.component.scss']
})
export class ProfileDropdownComponent {
  // Input signals
  readonly customItems = input<ProfileDropdownItem[]>([]);
  readonly showAdminItems = input<boolean>(true);

  // Output signals
  readonly itemClicked = output<ProfileDropdownItem>();

  // Inject services
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // Internal state
  private readonly isDropdownOpenSignal = signal(false);

  // Public computed signals
  readonly isDropdownOpen = computed(() => this.isDropdownOpenSignal());
  readonly currentUser = computed(() => this.userService.currentUser());

  readonly avatarData = computed((): AvatarData => {
    const user = this.userService.currentUser();

    return {
      imageUrl: user?.photoURL || undefined,
      name: user?.displayName?.split(' ')[0] || undefined,
      surname: user?.displayName?.split(' ').slice(1).join(' ') || undefined,
      email: user?.email || undefined
    };
  });

  readonly dropdownItems = computed((): ProfileDropdownItem[] => {
    const items: ProfileDropdownItem[] = [
      {
        label: 'NAVIGATION.PROFILE',
        icon: 'pi pi-user',
        routerLink: '/perfil'
      }
    ];

    // Add admin items if user has admin access and showAdminItems is true
    if (this.showAdminItems() && this.userService.hasAdminAccess()) {
      items.push(
        {
          label: 'NAVIGATION.ADMIN_DASHBOARD',
          icon: 'pi pi-chart-bar',
          routerLink: '/admin/dashboard'
        },
        {
          label: 'NAVIGATION.ADMIN_SETTINGS',
          icon: 'pi pi-cog',
          routerLink: '/admin/settings'
        }
      );
    }

    // Add custom items
    items.push(...this.customItems());

    return items;
  });

  // Dropdown methods
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpenSignal.set(!this.isDropdownOpenSignal());
  }

  closeDropdown() {
    this.isDropdownOpenSignal.set(false);
  }

  onItemClick(item: ProfileDropdownItem) {
    if (item.disabled) return;

    this.closeDropdown();

    if (item.onClick) {
      item.onClick();
    }

    this.itemClicked.emit(item);
  }

  // Remove the onLogout method since it's now handled by custom items

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.closeDropdown();
    }
  }
}
