import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { RoleBasedContentComponent } from '../../../shared/components/role-based-content/role-based-content.component';

@Component({
  selector: 'pelu-admin-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    RoleBasedContentComponent
  ],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrls: ['./admin-dashboard-page.component.scss']
})
export class AdminDashboardPageComponent {
  userService = inject(UserService);

  // Computed properties per a la UI
  readonly isAdmin = computed(() => this.userService.isAdmin());
  readonly canManageUsers = computed(() => this.userService.canManageUsers());
  readonly canViewAllAppointments = computed(() => this.userService.canViewAllAppointments());
}
