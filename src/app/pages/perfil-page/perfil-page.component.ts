import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { signal } from '@angular/core';

@Component({
  selector: 'pelu-perfil-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl mb-4">El teu perfil</h2>
      <div *ngIf="user(); else loading">
        <p><strong>Email:</strong> {{ user()?.email }}</p>
        <p><strong>UID:</strong> {{ user()?.uid }}</p>
      </div>
      <ng-template #loading><p>Carregant...</p></ng-template>
    </div>
  `
})
export class PerfilPageComponent {
  private auth = inject(Auth);
  user = signal<any>(null);

  constructor() {
    onAuthStateChanged(this.auth, (u: any) => this.user.set(u));
  }
}
