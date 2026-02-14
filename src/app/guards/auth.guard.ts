import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.initSession();

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/auth'], { replaceUrl: true });
  return false;
};
