import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.checkSession();

  if (isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};