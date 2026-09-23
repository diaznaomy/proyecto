import { HttpInterceptorFn } from '@angular/common/http';

const CLAVE_TOKEN = 'serena_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(CLAVE_TOKEN);

  if (!token) {
    return next(req);
  }

  const solicitudConToken = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(solicitudConToken);
};
