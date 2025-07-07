import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { RoleService } from './role.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    if (authService.isInitialized()) {
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        router.navigate(['/login']);
        resolve(false);
      } else {
        resolve(true);
      }
    } else {
      // Wait for initialization with polling
      const checkInterval = setInterval(() => {
        if (authService.isInitialized()) {
          clearInterval(checkInterval);
          const isAuth = authService.isAuthenticated();
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
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    if (authService.isInitialized()) {
      const isAuth = authService.isAuthenticated();
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
        if (authService.isInitialized()) {
          clearInterval(checkInterval);
          const isAuth = authService.isAuthenticated();
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

// Guard for stylist-only routes
export const stylistGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    if (authService.isInitialized() && !roleService.isLoadingRole()) {
      const isAuth = authService.isAuthenticated();
      const hasStylistAccess = roleService.hasStylistAccess();

      if (!isAuth) {
        router.navigate(['/login']);
        resolve(false);
      } else if (!hasStylistAccess) {
        // Redirect non-stylist users to home
        router.navigate(['/']);
        resolve(false);
      } else {
        resolve(true);
      }
    } else {
      // Wait for both auth and role initialization with polling
      const checkInterval = setInterval(() => {
        if (authService.isInitialized() && !roleService.isLoadingRole()) {
          clearInterval(checkInterval);
          const isAuth = authService.isAuthenticated();
          const hasStylistAccess = roleService.hasStylistAccess();

          if (!isAuth) {
            router.navigate(['/login']);
            resolve(false);
          } else if (!hasStylistAccess) {
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
