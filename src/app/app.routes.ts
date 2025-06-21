import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { authGuard } from './auth/auth.guard';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'register',
    component: RegisterPageComponent
  },
  {
    path: 'booking',
    component: BookingPageComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
