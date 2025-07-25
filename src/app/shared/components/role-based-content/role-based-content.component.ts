import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'pelu-role-based-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-based-content.component.html',
  styleUrls: ['./role-based-content.component.scss'],
})
export class RoleBasedContentComponent {
  private userService = inject(UserService);

  @Input() roles: ('client' | 'admin')[] = [];
  @Input() permissions: string[] = [];
  @Input() requireAllPermissions = false;

  readonly shouldShowContent = computed(() => {
    const currentRole = this.userService.currentRole();

    // Si no hi ha usuari autenticat, no mostrar contingut
    if (!currentRole) {
      return false;
    }

    // Verificar rols
    if (this.roles.length > 0) {
      if (!this.roles.includes(currentRole.role)) {
        return false;
      }
    }

    // Verificar permisos (només per admins)
    if (this.permissions.length > 0 && currentRole.role === 'admin') {
      if (this.requireAllPermissions) {
        // Requereix tots els permisos
        return this.permissions.every(permission => this.userService.hasPermission(permission));
      } else {
        // Requereix almenys un permís
        return this.permissions.some(permission => this.userService.hasPermission(permission));
      }
    }

    return true;
  });
}
