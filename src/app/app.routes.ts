import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { PerfilPageComponent } from './pages/perfil-page/perfil-page.component';
import { authGuard } from './auth/auth.guard';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { AppointmentsPageComponent } from './pages/appointments-page/appointments-page.component';
import { AppointmentDetailPageComponent } from './pages/appointment-detail-page/appointment-detail-page.component';
import { ServicesPageComponent } from './pages/services-page/services-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [authGuard],
    data: { viewTransitionName: 'landing' }
  },
  {
    path: 'login',
    component: LoginPageComponent,
    data: { viewTransitionName: 'login' }
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    data: { viewTransitionName: 'register' }
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
    data: { viewTransitionName: 'services' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
