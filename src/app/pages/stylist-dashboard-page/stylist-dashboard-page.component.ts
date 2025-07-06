import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../auth/role.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-stylist-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stylist-dashboard-page.component.html',
  styleUrls: ['./stylist-dashboard-page.component.scss']
})
export class StylistDashboardPageComponent {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  // Public signals
  readonly userRole = this.roleService.userRole;
  readonly userDisplayName = this.authService.userDisplayName;

  get stylistInfo() {
    return this.userRole()?.stylistInfo;
  }

  get businessName() {
    return this.stylistInfo?.businessName || 'Mi Negocio';
  }

  get phone() {
    return this.stylistInfo?.phone || 'No especificado';
  }

  get address() {
    return this.stylistInfo?.address || 'No especificado';
  }

  get specialties() {
    return this.stylistInfo?.specialties || [];
  }
}
