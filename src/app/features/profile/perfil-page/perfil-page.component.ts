import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { RoleService, UserRole } from '../../../core/services/role.service';
import { User } from '../../../core/interfaces/user.interface';
import { InfoItemData } from '../../../shared/components/info-item/info-item.component';
import { AvatarData } from '../../../shared/components/avatar/avatar.component';
import { DetailViewComponent, DetailViewConfig, DetailAction } from '../../../shared/components/detail-view/detail-view.component';

@Component({
  selector: 'pelu-perfil-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    DetailViewComponent,
  ],
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.scss'],
})
export class PerfilPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  // Internal state
  private readonly userRoleSignal = signal<UserRole | null>(null);
  private readonly isLoadingSignal = signal(true);

  // Public computed signals
  readonly userRole = computed(() => this.userRoleSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());

  // Avatar data from Firebase
  readonly avatarData = computed((): AvatarData => {
    const userRole = this.userRole();

    if (!userRole) return {};

    return {
      imageUrl: userRole.photoURL || undefined,
      name: userRole.displayName?.split(' ')[0] || undefined,
      surname: userRole.displayName?.split(' ').slice(1).join(' ') || undefined,
      email: userRole.email || undefined,
    };
  });

  // Computed properties from Firebase data
  readonly displayName = computed(() => {
    const userRole = this.userRole();
    return userRole?.displayName || userRole?.email?.split('@')[0] || '';
  });

  readonly email = computed(() => this.userRole()?.email || '');

  readonly uid = computed(() => this.userRole()?.uid || '');

  readonly userRoleText = computed(() => {
    const userRole = this.userRole();
    if (!userRole) return '';

    return userRole.role === 'admin' ? 'ADMIN.ADMIN_ROLE' : 'ADMIN.CLIENT_ROLE';
  });

  readonly language = computed(() => {
    const userRole = this.userRole();
    if (!userRole) return '';

    const languageMap: Record<string, string> = {
      'ca': 'Català',
      'es': 'Español',
      'en': 'English'
    };
    return languageMap[userRole.lang] || userRole.lang;
  });

  readonly theme = computed(() => {
    const userRole = this.userRole();
    if (!userRole) return '';

    const themeMap: Record<string, string> = {
      'light': 'COMMON.THEME.LIGHT',
      'dark': 'COMMON.THEME.DARK'
    };
    return themeMap[userRole.theme] || userRole.theme;
  });

  // Info items from Firebase data
  readonly infoItems = computed((): InfoItemData[] => {
    const baseItems: InfoItemData[] = [
      {
        icon: '👤',
        label: 'PROFILE.USERNAME',
        value: this.displayName(),
      },
      {
        icon: '📧',
        label: 'PROFILE.EMAIL',
        value: this.email(),
      },
      {
        icon: '🆔',
        label: 'PROFILE.USER_ID',
        value: this.uid(),
      },
      {
        icon: '👑',
        label: 'PROFILE.ROLE',
        value: this.userRoleText(),
      },
      {
        icon: '🌐',
        label: 'PROFILE.LANGUAGE',
        value: this.language(),
      },
      {
        icon: '🎨',
        label: 'PROFILE.THEME',
        value: this.theme(),
      },
    ];

    return baseItems;
  });

  // Detail page configuration (read-only)
  readonly detailConfig = computed(
    (): DetailViewConfig => ({
      type: 'profile',
      loading: this.isLoading(),
      notFound: !this.isLoading() && !this.userRole(),
      user: this.userRole() ? {
        id: this.userRole()!.uid,
        name: this.userRole()!.displayName || this.userRole()!.email,
        email: this.userRole()!.email,
        displayName: this.userRole()!.displayName,
        photoURL: this.userRole()!.photoURL,
        isActive: true,
        createdAt: undefined, // Not available in UserRole
      } as User & { displayName?: string; photoURL?: string } : undefined,
      infoSections: [
        {
          title: 'PROFILE.PERSONAL_INFO',
          items: this.infoItems(),
        },
      ],
      actions: this.getActions(),
    })
  );

  private getActions(): DetailAction[] {
    return [
      {
        label: 'BOOKING.SELECT_SERVICE',
        icon: '📅',
        type: 'primary',
        onClick: () => this.router.navigate(['/booking']),
        routerLink: '/booking',
      },
      {
        label: 'NAVIGATION.HOME',
        icon: '🏠',
        type: 'secondary',
        onClick: () => this.router.navigate(['/']),
        routerLink: '/',
      },
      {
        label: 'COMMON.ACTIONS.LOGOUT',
        icon: '🚪',
        type: 'danger',
        onClick: () => this.logout(),
      },
    ];
  }

  constructor() {
    // Use the role service to get user data from Firebase
    effect(
      () => {
        const userRole = this.roleService.userRole();
        const isLoading = this.roleService.isLoadingRole();
        this.userRoleSignal.set(userRole);
        this.isLoadingSignal.set(isLoading);
      }
    );
  }

  // Event handlers for detail page (read-only)
  goBack() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
  }
}
