import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { LoginPageComponent } from './features/auth/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/register-page/register-page.component';
import { PerfilPageComponent } from './features/profile/perfil-page/perfil-page.component';
import { authGuard, publicGuard, stylistGuard } from './core/guards/auth.guard';
import { BookingWrapperComponent } from './features/bookings/booking-wrapper/booking-wrapper.component';
import { AppointmentsPageComponent } from './features/appointments/appointments-page/appointments-page.component';
import { AppointmentDetailPageComponent } from './features/appointments/appointment-detail-page/appointment-detail-page.component';
import { ServicesPageComponent } from './features/services/services-page/services-page.component';
import { StylistDashboardPageComponent } from './features/stylist/stylist-dashboard-page/stylist-dashboard-page.component';
import { StylistProfilePageComponent } from './features/stylist/stylist-profile-page/stylist-profile-page.component';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [publicGuard],
    data: { viewTransitionName: 'login' }
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [publicGuard],
    data: { viewTransitionName: 'register' }
  },

  // All authenticated routes - accessible to all roles
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'landing' }
  },
  {
    path: 'booking',
    component: BookingWrapperComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'booking' }
  },
  {
    path: 'appointments',
    component: AppointmentsPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'appointments' }
  },
  {
    path: 'appointments/:id',
    component: AppointmentDetailPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'appointment-detail' }
  },
  {
    path: 'perfil',
    component: PerfilPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'perfil' }
  },
  {
    path: 'services',
    component: ServicesPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'services' }
  },

  // Stylist pages - accessible only to stylists and admins
  {
    path: 'stylist',
    children: [
      {
        path: 'dashboard',
        component: StylistDashboardPageComponent,
        canActivate: [stylistGuard],
        data: { viewTransitionName: 'stylist-dashboard' }
      },
      {
        path: 'profile',
        component: StylistProfilePageComponent,
        canActivate: [stylistGuard],
        data: { viewTransitionName: 'stylist-profile' }
      },
      {
        path: 'appointments',
        component: AppointmentsPageComponent,
        canActivate: [stylistGuard],
        data: { viewTransitionName: 'stylist-appointments' }
      },
      {
        path: 'services',
        component: ServicesPageComponent,
        canActivate: [stylistGuard],
        data: { viewTransitionName: 'stylist-services' }
      }
    ]
  },

  // Default redirect
  {
    path: '**',
    redirectTo: ''
  }
];
