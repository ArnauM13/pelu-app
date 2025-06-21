import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { signal } from '@angular/core';
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
  user = signal<any>(null);
  isLoading = signal(true);

  constructor() {
    onAuthStateChanged(this.auth, (u: any) => {
      this.user.set(u);
      this.isLoading.set(false);
    });
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  getDisplayName(): string {
    const user = this.user();
    return user?.displayName || user?.email?.split('@')[0] || 'Usuari';
  }

  getEmail(): string {
    return this.user()?.email || 'No disponible';
  }

  getUid(): string {
    return this.user()?.uid || 'No disponible';
  }

  getCreationDate(): string {
    const user = this.user();
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).toLocaleDateString('ca-ES');
    }
    return 'No disponible';
  }

  getLastSignIn(): string {
    const user = this.user();
    if (user?.metadata?.lastSignInTime) {
      return new Date(user.metadata.lastSignInTime).toLocaleDateString('ca-ES');
    }
    return 'No disponible';
  }

  getInfoItems(): InfoItemData[] {
    return [
      {
        icon: '👤',
        label: 'Nom d\'usuari',
        value: this.getDisplayName()
      },
      {
        icon: '📧',
        label: 'Correu electrònic',
        value: this.getEmail()
      },
      {
        icon: '🆔',
        label: 'ID d\'usuari',
        value: this.getUid()
      },
      {
        icon: '📅',
        label: 'Data de creació',
        value: this.getCreationDate()
      },
      {
        icon: '🕒',
        label: 'Últim accés',
        value: this.getLastSignIn()
      },
      {
        icon: '✅',
        label: 'Estat del compte',
        value: 'Actiu',
        status: 'active',
        statusText: 'Actiu'
      }
    ];
  }
}
