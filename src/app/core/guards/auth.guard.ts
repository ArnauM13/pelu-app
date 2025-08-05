import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { BookingService } from '../services/booking.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return new Promise<boolean>(resolve => {
    if (userService.isInitialized()) {
      const isAuth = userService.isAuthenticated();
      if (!isAuth) {
        router.navigate(['/login']);
        resolve(false);
      } else {
        resolve(true);
      }
    } else {
      // Wait for initialization with polling
      const checkInterval = setInterval(() => {
        if (userService.isInitialized()) {
          clearInterval(checkInterval);
          const isAuth = userService.isAuthenticated();
          if (!isAuth) {
            router.navigate(['/login']);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      }, 100);
    }
  });
};

export const publicGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return new Promise<boolean>(resolve => {
    if (userService.isInitialized()) {
      const isAuth = userService.isAuthenticated();
      if (isAuth) {
        // Redirect authenticated users to home
        router.navigate(['/']);
        resolve(false);
      } else {
        resolve(true);
      }
    } else {
      // Wait for initialization with polling
      const checkInterval = setInterval(() => {
        if (userService.isInitialized()) {
          clearInterval(checkInterval);
          const isAuth = userService.isAuthenticated();
          if (isAuth) {
            router.navigate(['/']);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      }, 100);
    }
  });
};

export const tokenGuard: CanActivateFn = async (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // Check if user is authenticated first
  if (userService.isInitialized()) {
    const isAuth = userService.isAuthenticated();
    if (isAuth) {
      // If authenticated, allow access
      return true;
    }
  }

  // Since we're using UUIDs now and removed the token system,
  // we'll redirect unauthenticated users to login
  router.navigate(['/login']);
  return false;
};
