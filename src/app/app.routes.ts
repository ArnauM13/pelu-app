import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginPageComponent } from './features/auth/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/register-page/register-page.component';
import { PerfilPageComponent } from './features/profile/perfil-page/perfil-page.component';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { BookingWrapperComponent } from './features/bookings/booking-wrapper/booking-wrapper.component';
import { AppointmentsPageComponent } from './features/appointments/appointments-page/appointments-page.component';
import { AppointmentDetailPageComponent } from './features/appointments/appointment-detail-page/appointment-detail-page.component';
import { ServicesPageComponent } from './features/services/services-page/services-page.component';
import { AdminDashboardPageComponent } from './features/admin/admin-dashboard-page/admin-dashboard-page.component';
import { AdminServicesPageComponent } from './features/admin/admin-services-page/admin-services-page.component';
import { AdminSettingsPageComponent } from './features/admin/admin-settings-page/admin-settings-page.component';
import { PlaygroundPageComponent } from './features/playground/playground-page/playground-page.component';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [publicGuard],
    data: { viewTransitionName: 'login' },
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [publicGuard],
    data: { viewTransitionName: 'register' },
  },

  // All authenticated routes - accessible to all roles
  {
    path: '',
    component: LandingComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'landing' },
  },
  {
    path: 'booking',
    component: BookingWrapperComponent,
    data: { viewTransitionName: 'booking' },
  },
  {
    path: 'appointments',
    component: AppointmentsPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'appointments' },
  },
  {
    path: 'appointments/:id',
    component: AppointmentDetailPageComponent,
    data: { viewTransitionName: 'appointment-detail' },
  },
  {
    path: 'perfil',
    component: PerfilPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'perfil' },
  },
  {
    path: 'services',
    component: ServicesPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'services' },
  },
  {
    path: 'playground',
    component: PlaygroundPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'playground' },
  },

  // Admin pages - accessible only to admins
  {
    path: 'admin',
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardPageComponent,
        canActivate: [adminGuard],
        data: { viewTransitionName: 'admin-dashboard' },
      },
      {
        path: 'services',
        component: AdminServicesPageComponent,
        canActivate: [adminGuard],
        data: { viewTransitionName: 'admin-services' },
      },
      {
        path: 'settings',
        component: AdminSettingsPageComponent,
        canActivate: [adminGuard],
        data: { viewTransitionName: 'admin-settings' },
      },
    ],
  },

  // Default redirect
  {
    path: '**',
    redirectTo: '',
  },
];
