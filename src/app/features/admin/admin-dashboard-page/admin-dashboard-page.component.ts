import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'pelu-admin-dashboard-page',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrls: ['./admin-dashboard-page.component.scss'],
})
export class AdminDashboardPageComponent {
  userService = inject(UserService);

  // Computed properties per a la UI (unified from both services)
  readonly isAdmin = computed(() => this.userService.isAdmin());
  readonly canManageUsers = computed(() => this.userService.canManageUsers());
  readonly canViewAllAppointments = computed(() => this.userService.canViewAllAppointments());
}
