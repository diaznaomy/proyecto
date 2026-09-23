import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { demoInterceptor } from './core/interceptors/demo.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([demoInterceptor, authInterceptor, httpErrorInterceptor])),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      // Espera a que la sesión se restaure (o se confirme que no existe)
      // antes de que Angular termine de arrancar la aplicación.
      return firstValueFrom(authService.inicializarSesion());
    }),
  ],
};