import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';

export const adminGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  return new Promise<boolean>(resolve => {
    if (userService.isInitialized()) {
      const isAuth = userService.isAuthenticated();
      const isAdmin = roleService.isAdmin();

      if (!isAuth) {
        router.navigate(['/login']);
        resolve(false);
      } else if (!isAdmin) {
        // Redirect non-admin users to home
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
          const isAdmin = roleService.isAdmin();

          if (!isAuth) {
            router.navigate(['/login']);
            resolve(false);
          } else if (!isAdmin) {
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

// Guard for specific admin permissions
export const adminPermissionGuard = (requiredPermission: string): CanActivateFn => {
  return () => {
    const userService = inject(UserService);
    const router = inject(Router);

    return new Promise<boolean>(resolve => {
      if (userService.isInitialized()) {
        const isAuth = userService.isAuthenticated();
        const hasPermission = userService.hasPermission(requiredPermission);

        if (!isAuth) {
          router.navigate(['/login']);
          resolve(false);
        } else if (!hasPermission) {
          // Redirect users without permission to home
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
            const hasPermission = userService.hasPermission(requiredPermission);

            if (!isAuth) {
              router.navigate(['/login']);
              resolve(false);
            } else if (!hasPermission) {
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
};
