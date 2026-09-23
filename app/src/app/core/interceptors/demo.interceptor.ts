import {
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';

const demoUser = {
  id: 1,
  nombre: 'Naomi',
  apellidos: 'Diaz',
  correo: 'demo@serena.test',
  telefono: '8888-8888',
  edad: 28,
  fechaRegistro: '2026-01-15T10:00:00.000Z',
  rolId: 1,
  estadoUsuarioId: 1,
  rol: { id: 1, nombre: 'Administrador', descripcion: 'Cuenta de demostracion', estado: true },
  estadoUsuario: { id: 1, nombre: 'Activo', descripcion: null },
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
};

const demoProfile = {
  id: 1,
  usuarioId: 1,
  ubicacionId: 1,
  tituloProfesional: 'Psicologa clinica',
  descripcion: 'Acompanamiento profesional para encontrar claridad y bienestar.',
  aniosExperiencia: 8,
  tarifaBase: '45.00',
  imagenPerfil: null,
  disponible: true,
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
  usuario: {
    id: 1,
    nombre: 'Laura',
    apellidos: 'Mendez',
    correo: 'laura@serena.test',
    telefono: '8888-1111',
  },
  ubicacion: { id: 1, provincia: 'San Jose', canton: 'Escazu', distrito: 'San Rafael' },
  especialidades: [
    { especialidad: { id: 1, nombre: 'Psicologia', descripcion: 'Salud emocional' } },
  ],
  servicios: [],
};

const demoService = {
  id: 1,
  perfilProfesionalId: 1,
  modalidadId: 1,
  estadoServicioId: 1,
  nombre: 'Sesion de orientacion',
  descripcion: 'Un espacio inicial para conversar sobre tus objetivos y necesidades.',
  precio: '45.00',
  duracionEstimada: 60,
  imagenServicio: null,
  perfilProfesional: demoProfile,
  modalidad: { id: 1, nombre: 'Virtual', descripcion: 'Atencion por videollamada' },
  estadoServicio: { id: 1, nombre: 'Activo', descripcion: null },
  especialidades: [{ id: 1, nombre: 'Psicologia', descripcion: 'Salud emocional', tipoEspecialidad: null }],
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
};

const demoResponse = (data: unknown) =>
  of(new HttpResponse({ status: 200, body: { success: true, data } }));

const demoPaginatedResponse = (data: unknown[]) =>
  of(new HttpResponse({
    status: 200,
    body: {
      success: true,
      meta: { page: 1, limit: 20, total: data.length, totalPages: 1 },
      data,
    },
  }));

export const demoInterceptor: HttpInterceptorFn = (request, next) => {
  if (!environment.demo) {
    return next(request);
  }

  const url = new URL(request.urlWithParams, window.location.origin).pathname;

  if (url.endsWith('/auth/login') || url.endsWith('/auth/register')) {
    return demoResponse({ token: 'serena-demo-token', usuario: demoUser });
  }

  if (url.endsWith('/auth/perfil')) {
    return demoResponse(demoUser);
  }

  if (url.includes('/servicios')) {
    return url.match(/\/servicios\/\d+$/)
      ? demoResponse(demoService)
      : demoPaginatedResponse([demoService]);
  }

  if (url.includes('/profesionales') || url.includes('/perfil-profesional')) {
    return url.match(/\/\d+$/)
      ? demoResponse(demoProfile)
      : demoPaginatedResponse([demoProfile]);
  }

  if (url.includes('/usuarios')) {
    return url.match(/\/\d+$/)
      ? demoResponse(demoUser)
      : demoPaginatedResponse([demoUser]);
  }

  if (url.includes('/citas')) {
    return demoResponse([]);
  }

  if (url.includes('/reportes')) {
    return demoResponse({ usuarios: 1, profesionales: 1, servicios: 1, citas: 0 });
  }

  if (url.includes('/notificaciones') || url.includes('/resenas') || url.includes('/solicitudes')) {
    return demoResponse([]);
  }

  if (url.includes('/especialidad')) {
    return demoPaginatedResponse([{ id: 1, nombre: 'Psicologia', descripcion: 'Salud emocional' }]);
  }

  if (url.includes('/tipo') || url.includes('/modalidad') || url.includes('/estado') || url.includes('/ubicacion')) {
    return demoResponse([
      { id: 1, nombre: 'Virtual', descripcion: 'Atencion remota' },
    ]);
  }

  if (request.method === 'GET') {
    return demoResponse([]);
  }

  return demoResponse({});
};
