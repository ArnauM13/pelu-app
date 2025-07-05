import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.canActivateAsync();
};

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.canActivateAsync().then(isAuthenticated => {
    if (isAuthenticated) {
      authService.redirectToHome();
      return false;
    }
    return true;
  });
};
