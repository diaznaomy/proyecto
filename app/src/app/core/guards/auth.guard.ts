import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si la app acaba de iniciar y todavía no se restauró la sesión, se
  // solicita el perfil con el token almacenado antes de decidir. Si ya
  // estaba inicializada, inicializarSesion() resuelve al instante.
  return authService.inicializarSesion().pipe(
    map(() => {
      if (authService.autenticado()) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};
