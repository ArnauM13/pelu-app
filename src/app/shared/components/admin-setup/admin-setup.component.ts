import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { Auth, User } from '@angular/fire/auth';

@Component({
  selector: 'pelu-admin-setup',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-setup.component.html',
  styleUrls: ['./admin-setup.component.scss']
})
export class AdminSetupComponent {
  // Inject services
  #userService = inject(UserService);
  #auth = inject(Auth);

  // Internal state
  private readonly isPromotingSignal = signal(false);
  private readonly setupMessageSignal = signal<string>('');
  private readonly setupStatusSignal = signal<'success' | 'error' | ''>('');

  // Computed properties
  readonly isPromoting = computed(() => this.isPromotingSignal());
  readonly setupMessage = computed(() => this.setupMessageSignal());
  readonly setupStatus = computed(() => this.setupStatusSignal());

  // Mostrar el component només en desenvolupament i si l'usuari està autenticat
  readonly showSetup = computed(() => {
    return this.#userService.isAuthenticated() &&
           (this.#userService.isAdmin() || this.#userService.isClient());
  });

  async promoteToAdmin() {
    const currentUser = this.#userService.currentUser();
    if (!currentUser) {
      this.showError('No hi ha usuari autenticat');
      return;
    }

    this.isPromotingSignal.set(true);
    this.clearMessage();

    try {
      await this.#userService.promoteToAdmin(currentUser.uid, {
        canManageUsers: true,
        canViewAllAppointments: true,
        permissions: ['manage_users', 'view_all_appointments']
      });

      this.showSuccess('Usuari promogut a administrador amb èxit');
    } catch (error) {
      console.error('Error promoting to admin:', error);
      this.showError('Error al promoure a administrador: ' + (error as Error).message);
    } finally {
      this.isPromotingSignal.set(false);
    }
  }

  async demoteToClient() {
    const currentUser = this.#userService.currentUser();
    if (!currentUser) {
      this.showError('No hi ha usuari autenticat');
      return;
    }

    this.isPromotingSignal.set(true);
    this.clearMessage();

    try {
      await this.#userService.demoteToClient(currentUser.uid);
      this.showSuccess('Usuari degradat a client amb èxit');
    } catch (error) {
      console.error('Error demoting to client:', error);
      this.showError('Error al degradar a client: ' + (error as Error).message);
    } finally {
      this.isPromotingSignal.set(false);
    }
  }

  private showSuccess(message: string) {
    this.setupMessageSignal.set(message);
    this.setupStatusSignal.set('success');
  }

  private showError(message: string) {
    this.setupMessageSignal.set(message);
    this.setupStatusSignal.set('error');
  }

  private clearMessage() {
    this.setupMessageSignal.set('');
    this.setupStatusSignal.set('');
  }
}
