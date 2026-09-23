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

const demoUsers = [
  demoUser,
  {
    ...demoUser,
    id: 2,
    nombre: 'Carlos',
    apellidos: 'Vargas',
    correo: 'carlos@serena.test',
    rolId: 2,
    rol: { id: 2, nombre: 'Profesional', descripcion: 'Prestador de servicios', estado: true },
  },
  {
    ...demoUser,
    id: 3,
    nombre: 'Sofia',
    apellidos: 'Ramirez',
    correo: 'sofia@serena.test',
    rolId: 3,
    rol: { id: 3, nombre: 'Cliente', descripcion: 'Persona usuaria', estado: true },
  },
];

const demoProfiles = [
  demoProfile,
  {
    ...demoProfile,
    id: 2,
    usuarioId: 2,
    tituloProfesional: 'Nutricionista',
    descripcion: 'Planes practicos para una alimentacion sostenible.',
    aniosExperiencia: 5,
    tarifaBase: '35.00',
    usuario: { ...demoProfile.usuario, id: 2, nombre: 'Carlos', apellidos: 'Vargas', correo: 'carlos@serena.test' },
    especialidades: [{ especialidad: { id: 2, nombre: 'Nutricion', descripcion: 'Habitos saludables' } }],
  },
  {
    ...demoProfile,
    id: 3,
    usuarioId: 3,
    tituloProfesional: 'Terapeuta ocupacional',
    descripcion: 'Herramientas para recuperar equilibrio y autonomia.',
    aniosExperiencia: 11,
    tarifaBase: '50.00',
    usuario: { ...demoProfile.usuario, id: 3, nombre: 'Andrea', apellidos: 'Solis', correo: 'andrea@serena.test' },
    especialidades: [{ especialidad: { id: 3, nombre: 'Terapia ocupacional', descripcion: 'Bienestar integral' } }],
  },
];

const demoServices = [
  demoService,
  {
    ...demoService,
    id: 2,
    perfilProfesionalId: 2,
    nombre: 'Plan nutricional inicial',
    descripcion: 'Revision de habitos y objetivos para crear un plan personalizado.',
    precio: '35.00',
    duracionEstimada: 45,
    perfilProfesional: demoProfiles[1],
    especialidades: [{ id: 2, nombre: 'Nutricion', descripcion: 'Habitos saludables', tipoEspecialidad: null }],
  },
  {
    ...demoService,
    id: 3,
    perfilProfesionalId: 3,
    nombre: 'Acompanamiento integral',
    descripcion: 'Sesiones enfocadas en rutinas, autonomia y calidad de vida.',
    precio: '50.00',
    perfilProfesional: demoProfiles[2],
    especialidades: [{ id: 3, nombre: 'Terapia ocupacional', descripcion: 'Bienestar integral', tipoEspecialidad: null }],
  },
];

const demoReport = {
  periodo: { fechaDesde: null, fechaHasta: null },
  filtros: { profesionalId: null, especialidadId: null },
  totales: { citas: 18, profesionales: 3, resenas: 12, promedioGeneral: 4.7 },
  citasPorEstado: [
    { estado: 'Completada', total: 10, porcentaje: 56 },
    { estado: 'Confirmada', total: 5, porcentaje: 28 },
    { estado: 'Pendiente', total: 2, porcentaje: 11 },
    { estado: 'Cancelada', total: 1, porcentaje: 5 },
  ],
  citasPorProfesional: [
    { profesionalId: 1, profesional: 'Laura Mendez', total: 8, completadas: 7, canceladas: 0, montoEstimado: 360, porcentajeFinalizacion: 88 },
    { profesionalId: 2, profesional: 'Carlos Vargas', total: 6, completadas: 3, canceladas: 1, montoEstimado: 210, porcentajeFinalizacion: 50 },
    { profesionalId: 3, profesional: 'Andrea Solis', total: 4, completadas: 3, canceladas: 0, montoEstimado: 200, porcentajeFinalizacion: 75 },
  ],
  calificaciones: [
    { profesionalId: 1, profesional: 'Laura Mendez', totalResenas: 6, promedio: 4.9, distribucion: { 5: 5, 4: 1 }, mejoresServicios: ['Sesion de orientacion'], serviciosBajaCalificacion: [] },
    { profesionalId: 2, profesional: 'Carlos Vargas', totalResenas: 4, promedio: 4.5, distribucion: { 5: 2, 4: 2 }, mejoresServicios: ['Plan nutricional inicial'], serviciosBajaCalificacion: [] },
    { profesionalId: 3, profesional: 'Andrea Solis', totalResenas: 2, promedio: 4.6, distribucion: { 5: 1, 4: 1 }, mejoresServicios: ['Acompanamiento integral'], serviciosBajaCalificacion: [] },
  ],
  umbralBajaCalificacion: 3,
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
      ? demoResponse(demoServices[0])
      : demoPaginatedResponse(demoServices);
  }

  if (url.includes('/profesionales') || url.includes('/perfil-profesional')) {
    return url.match(/\/\d+$/)
      ? demoResponse(demoProfile)
      : demoPaginatedResponse(demoProfiles);
  }

  if (url.includes('/usuarios')) {
    return url.match(/\/\d+$/)
      ? demoResponse(demoUser)
      : demoPaginatedResponse(demoUsers);
  }

  if (url.includes('/citas')) {
    return demoResponse([]);
  }

  if (url.includes('/reportes')) {
    return demoResponse(demoReport);
  }

  if (url.includes('/notificaciones') || url.includes('/resenas') || url.includes('/solicitudes')) {
    return demoResponse([]);
  }

  if (url.includes('/tipo') || url.includes('/modalidad') || url.includes('/estado') || url.includes('/ubicacion')) {
    return demoResponse([
      { id: 1, nombre: 'Virtual', descripcion: 'Atencion remota' },
    ]);
  }

  if (url.includes('/especialidad')) {
    return demoPaginatedResponse([
      { id: 1, nombre: 'Psicologia', descripcion: 'Salud emocional' },
      { id: 2, nombre: 'Nutricion', descripcion: 'Habitos saludables' },
      { id: 3, nombre: 'Terapia ocupacional', descripcion: 'Bienestar integral' },
    ]);
  }

  if (request.method === 'GET') {
    return demoResponse([]);
  }

  return demoResponse({});
};
