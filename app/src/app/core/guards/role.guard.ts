import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Guard parametrizable por rol. Restaura la sesión (igual que authGuard) y
 * además exige que el rol del usuario esté dentro de rolesPermitidos.
 * Si no hay sesión -> redirige a /login.
 * Si hay sesión pero el rol no está permitido -> redirige a home ('').
 */
export const roleGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.inicializarSesion().pipe(
      map(() => {
        if (!authService.autenticado()) {
          return router.createUrlTree(['/login']);
        }
        if (!authService.tieneRol(rolesPermitidos)) {
          return router.createUrlTree(['/']);
        }
        return true;
      })
    );
  };
};