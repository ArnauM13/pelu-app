import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { InfoItemData } from '../../shared/components/info-item/info-item.component';
import { AvatarData } from '../../shared/components/avatar/avatar.component';
import { DetailViewComponent, DetailViewConfig, DetailAction } from '../../shared/components/detail-view/detail-view.component';


@Component({
  selector: 'pelu-perfil-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, DetailViewComponent],
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.scss']
})
export class PerfilPageComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Internal state
  private readonly userSignal = signal<any>(null);
  private readonly isLoadingSignal = signal(true);
  private readonly isEditingSignal = signal(false);

  // Public computed signals
  readonly user = computed(() => this.userSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());

  // Avatar data
  readonly avatarData = computed((): AvatarData => {
    const user = this.user();

    if (!user) return {};

    return {
      imageUrl: user.photoURL || undefined,
      name: user.displayName?.split(' ')[0] || undefined,
      surname: user.displayName?.split(' ').slice(1).join(' ') || undefined,
      email: user.email || undefined
    };
  });

  // Computed properties
  readonly displayName = computed(() => {
    const user = this.user();
    return user?.displayName || user?.email?.split('@')[0] || '';
  });

  readonly email = computed(() => this.user()?.email || '');

  readonly uid = computed(() => this.user()?.uid || '');

  readonly creationDate = computed(() => {
    const user = this.user();
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).toLocaleDateString('ca-ES');
    }
    return '';
  });

  readonly lastSignIn = computed(() => {
    const user = this.user();
    if (user?.metadata?.lastSignInTime) {
      return new Date(user.metadata.lastSignInTime).toLocaleDateString('ca-ES');
    }
    return '';
  });



  readonly infoItems = computed((): InfoItemData[] => [
    {
      icon: '👤',
      label: 'PROFILE.USERNAME',
      value: this.displayName()
    },
    {
      icon: '📧',
      label: 'PROFILE.EMAIL',
      value: this.email()
    },
    {
      icon: '🆔',
      label: 'PROFILE.USER_ID',
      value: this.uid()
    },
    {
      icon: '📅',
      label: 'PROFILE.CREATION_DATE',
      value: this.creationDate()
    },
    {
      icon: '🕒',
      label: 'PROFILE.LAST_ACCESS',
      value: this.lastSignIn()
    },
    {
      icon: '✅',
      label: 'PROFILE.ACCOUNT_STATUS',
      value: 'PROFILE.ACTIVE',
      status: 'active',
      statusText: 'PROFILE.ACTIVE'
    }
  ]);

  // Detail page configuration
  readonly detailConfig = computed((): DetailViewConfig => ({
    type: 'profile',
    loading: this.isLoading(),
    notFound: !this.isLoading() && !this.user(),
    user: this.user(),
    infoSections: [
      {
        title: 'PROFILE.PERSONAL_INFO',
        items: this.infoItems()
      }
    ],
    actions: this.getActions()
  }));

  private getActions(): DetailAction[] {
    return [
      {
        label: 'BOOKING.SELECT_SERVICE',
        icon: '📅',
        type: 'primary',
        onClick: () => this.router.navigate(['/booking']),
        routerLink: '/booking'
      },
      {
        label: 'NAVIGATION.HOME',
        icon: '🏠',
        type: 'secondary',
        onClick: () => this.router.navigate(['/']),
        routerLink: '/'
      },
      {
        label: 'COMMON.LOGOUT',
        icon: '🚪',
        type: 'danger',
        onClick: () => this.logout()
      }
    ];
  }

  constructor() {
    onAuthStateChanged(this.auth, (u: any) => {
      this.userSignal.set(u);
      this.isLoadingSignal.set(false);
    });
  }

  // Event handlers for detail page
  goBack() {
    this.router.navigate(['/']);
  }

  onEditProfile() {
    this.isEditingSignal.set(true);
  }

  onSaveProfile(data: any) {
    this.isEditingSignal.set(false);
    // Handle save logic here
  }

  onCancelEdit() {
    this.isEditingSignal.set(false);
  }

  onDeleteProfile() {
    // Handle delete logic here
  }

  onUpdateForm(data: any) {
    // Handle form update logic here
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}
