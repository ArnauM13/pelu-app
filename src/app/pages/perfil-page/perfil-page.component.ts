import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { InfoItemComponent, InfoItemData } from '../../shared/components/info-item/info-item.component';

@Component({
  selector: 'pelu-perfil-page',
  standalone: true,
  imports: [CommonModule, RouterModule, InfoItemComponent],
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
    return user?.displayName || user?.email?.split('@')[0] || 'Usuari';
  });

  readonly email = computed(() => this.user()?.email || 'No disponible');

  readonly uid = computed(() => this.user()?.uid || 'No disponible');

  readonly creationDate = computed(() => {
    const user = this.user();
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).toLocaleDateString('ca-ES');
    }
    return 'No disponible';
  });

  readonly lastSignIn = computed(() => {
    const user = this.user();
    if (user?.metadata?.lastSignInTime) {
      return new Date(user.metadata.lastSignInTime).toLocaleDateString('ca-ES');
    }
    return 'No disponible';
  });

  readonly infoItems = computed((): InfoItemData[] => [
    {
      icon: '👤',
      label: 'Nom d\'usuari',
      value: this.displayName()
    },
    {
      icon: '📧',
      label: 'Correu electrònic',
      value: this.email()
    },
    {
      icon: '🆔',
      label: 'ID d\'usuari',
      value: this.uid()
    },
    {
      icon: '📅',
      label: 'Data de creació',
      value: this.creationDate()
    },
    {
      icon: '🕒',
      label: 'Últim accés',
      value: this.lastSignIn()
    },
    {
      icon: '✅',
      label: 'Estat del compte',
      value: 'Actiu',
      status: 'active',
      statusText: 'Actiu'
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
