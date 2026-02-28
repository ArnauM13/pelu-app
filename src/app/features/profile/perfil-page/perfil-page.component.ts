import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { RoleService, UserRole } from '../../../core/services/role.service';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { ToastService } from '../../../shared/services/toast.service';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'pelu-perfil-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ButtonComponent,
    InputTextComponent,
  ],
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.scss'],
})
export class PerfilPageComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);
  private readonly loaderService = inject(LoaderService);

  readonly userRole = signal<UserRole | null>(null);
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);

  readonly editName = signal('');
  readonly editPhone = signal('');

  readonly initials = computed(() => {
    const u = this.userRole();
    if (!u) return '?';
    const name = u.displayName || u.email;
    return name.slice(0, 2).toUpperCase();
  });

  constructor() {
    effect(() => {
      const role = this.roleService.userRole();
      this.userRole.set(role);
    });
  }

  startEdit() {
    const u = this.userRole();
    if (!u) return;
    this.editName.set(u.displayName || '');
    this.editPhone.set(u.phone || '');
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  async saveEdit() {
    const u = this.userRole();
    if (!u) return;
    this.isSaving.set(true);
    try {
      const updates: Partial<UserRole> = {
        displayName: this.editName().trim() || undefined,
        phone: this.editPhone().trim() || undefined,
      };
      await this.userService.updateUserRole(u.uid, updates);
      this.isEditing.set(false);
      this.toastService.showSuccess('COMMON.STATUS.STATUS_SUCCESS', 'PROFILE.SAVE_SUCCESS');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'PROFILE.SAVE_ERROR');
    } finally {
      this.isSaving.set(false);
    }
  }

  logout() {
    this.authService.logout();
  }
}
