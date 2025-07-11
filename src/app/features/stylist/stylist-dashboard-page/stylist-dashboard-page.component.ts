import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/auth/auth.service';
import { StylistBusinessInfoComponent, BusinessInfo } from '../components/stylist-business-info/stylist-business-info.component';
import { StylistQuickActionsComponent, QuickAction } from '../components/stylist-quick-actions/stylist-quick-actions.component';
import { StylistRecentActivityComponent, ActivityItem } from '../components/stylist-recent-activity/stylist-recent-activity.component';

@Component({
  selector: 'app-stylist-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StylistBusinessInfoComponent,
    StylistQuickActionsComponent,
    StylistRecentActivityComponent
  ],
  templateUrl: './stylist-dashboard-page.component.html',
  styleUrls: ['./stylist-dashboard-page.component.scss']
})
export class StylistDashboardPageComponent {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  // Public signals
  readonly userRole = this.roleService.userRole;
  readonly userDisplayName = this.authService.userDisplayName;

  // Computed properties for components
  readonly businessInfo = computed((): BusinessInfo => ({
    businessName: this.stylistInfo?.businessName || 'Mi Negocio',
    phone: this.stylistInfo?.phone || 'No especificado',
    address: this.stylistInfo?.address || 'No especificado',
    specialties: this.stylistInfo?.specialties || []
  }));

  readonly quickActions = computed((): QuickAction[] => [
    {
      icon: '📅',
      title: 'STYLIST.MANAGE_APPOINTMENTS',
      description: 'STYLIST.MANAGE_APPOINTMENTS_DESC',
      route: '/stylist/appointments'
    },
    {
      icon: '⏰',
      title: 'STYLIST.SCHEDULE',
      description: 'STYLIST.SCHEDULE_DESC',
      route: '/stylist/schedule'
    },
    {
      icon: '✂️',
      title: 'STYLIST.SERVICES',
      description: 'STYLIST.SERVICES_DESC',
      route: '/stylist/services'
    },
    {
      icon: '👥',
      title: 'STYLIST.CLIENTS',
      description: 'STYLIST.CLIENTS_DESC',
      route: '/stylist/clients'
    },
    {
      icon: '⚙️',
      title: 'STYLIST.PROFILE',
      description: 'STYLIST.PROFILE_DESC',
      route: '/stylist/profile'
    },
    {
      icon: '📊',
      title: 'STYLIST.ANALYTICS',
      description: 'STYLIST.ANALYTICS_DESC',
      route: '/stylist/analytics'
    },
    {
      icon: '👥',
      title: 'STYLIST.USER_MANAGEMENT',
      description: 'STYLIST.USER_MANAGEMENT_DESC',
      route: '/admin/users'
    }
  ]);

  readonly recentActivities = computed((): ActivityItem[] => [
    {
      icon: '📅',
      message: 'STYLIST.ACTIVITY_NEW_APPOINTMENT',
      time: 'STYLIST.ACTIVITY_TIME_2_HOURS'
    },
    {
      icon: '✅',
      message: 'STYLIST.ACTIVITY_COMPLETED_APPOINTMENT',
      time: 'STYLIST.ACTIVITY_TIME_4_HOURS'
    },
    {
      icon: '💰',
      message: 'STYLIST.ACTIVITY_PAYMENT_RECEIVED',
      time: 'STYLIST.ACTIVITY_TIME_6_HOURS'
    }
  ]);

  get stylistInfo() {
    return this.userRole()?.stylistInfo;
  }
}
