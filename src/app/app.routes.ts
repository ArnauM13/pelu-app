import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { PerfilPageComponent } from './pages/perfil-page/perfil-page.component';
import { authGuard, publicGuard, stylistGuard } from './auth/auth.guard';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { AppointmentsPageComponent } from './pages/appointments-page/appointments-page.component';
import { AppointmentDetailPageComponent } from './pages/appointment-detail-page/appointment-detail-page.component';
import { ServicesPageComponent } from './pages/services-page/services-page.component';
import { StylistDashboardPageComponent } from './pages/stylist-dashboard-page/stylist-dashboard-page.component';
import { StylistProfilePageComponent } from './pages/stylist-profile-page/stylist-profile-page.component';

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
    component: BookingPageComponent,
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
