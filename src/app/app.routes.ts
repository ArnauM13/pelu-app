import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page/home-page.component';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { UserPageComponent } from './pages/user-page/user-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'booking',
    component: BookingPageComponent
  },
  {
    path: 'user',
    component: UserPageComponent
  }
];
