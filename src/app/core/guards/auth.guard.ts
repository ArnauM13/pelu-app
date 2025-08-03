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
  const bookingService = inject(BookingService);
  const router = inject(Router);

  // Check if user is authenticated first
  if (userService.isInitialized()) {
    const isAuth = userService.isAuthenticated();
    if (isAuth) {
      // If authenticated, allow access
      return true;
    }
  }

  // If not authenticated, check for token in query parameters
  const token = route.queryParams['token'];
  if (!token) {
    // No token provided, redirect to login
    router.navigate(['/login']);
    return false;
  }

  try {
    // Validate the token without requiring authentication
    const booking = await bookingService.validateToken(token);
    if (booking) {
      // Token is valid, allow access
      return true;
    } else {
      // Invalid token, redirect to login
      router.navigate(['/login']);
      return false;
    }
  } catch (error) {
    console.error('Error validating token:', error);
    // Error validating token, redirect to login
    router.navigate(['/login']);
    return false;
  }
};
