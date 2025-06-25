import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { TranslateModule } from '@ngx-translate/core';
import { InfoItemComponent, InfoItemData } from '../../shared/components/info-item/info-item.component';

@Component({
  selector: 'pelu-perfil-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, InfoItemComponent],
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.scss']
})
export class PerfilPageComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  // Internal state
  private readonly userSignal = signal<any>(null);
  private readonly isLoadingSignal = signal(true);

  // Public computed signals
  readonly user = computed(() => this.userSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());

  // Computed properties
  readonly displayName = computed(() => {
    const user = this.user();
    return user?.displayName || user?.email?.split('@')[0] || 'COMMON.USER';
  });

  readonly email = computed(() => this.user()?.email || 'COMMON.NOT_AVAILABLE');

  readonly uid = computed(() => this.user()?.uid || 'COMMON.NOT_AVAILABLE');

  readonly creationDate = computed(() => {
    const user = this.user();
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).toLocaleDateString('ca-ES');
    }
    return 'COMMON.NOT_AVAILABLE';
  });

  readonly lastSignIn = computed(() => {
    const user = this.user();
    if (user?.metadata?.lastSignInTime) {
      return new Date(user.metadata.lastSignInTime).toLocaleDateString('ca-ES');
    }
    return 'COMMON.NOT_AVAILABLE';
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

  constructor() {
    onAuthStateChanged(this.auth, (u: any) => {
      this.userSignal.set(u);
      this.isLoadingSignal.set(false);
    });
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}
