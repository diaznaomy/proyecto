/**
 * notificacion-config.ts
 *
 * Esta tabla ES el mapa de notificaciones por rol, traducido a código.
 * Es la única fuente de verdad sobre qué rol recibe cada tipo de evento,
 * cómo se ve (icono, categoría) y a dónde navega al hacer click.
 *
 * El backend debería usar el mismo criterio al generar los registros de
 * notificación; el frontend vuelve a chequear con `rolPuedeRecibir` como
 * segunda barrera antes de renderizar cualquier notificación.
 *
 * Nota sobre Administrador*: "Cita cancelada" y "Cita reprogramada" solo
 * deberían llegarle al admin en casos puntuales (tardía, sin aviso,
 * disputada). Esa condición es lógica de negocio del backend al momento de
 * disparar el evento; aquí el admin solo figura como receptor posible.
 */

import {
  CategoriaNotificacion,
  Notificacion,
  RolNotificacion,
  TipoNotificacion,
} from './notificacion.model';

export interface NotificacionTipoConfig {
  tipo: TipoNotificacion;
  roles: RolNotificacion[];
  icono: string;
  categoria: CategoriaNotificacion;
  /** Ruta base a la que navega al hacer click (puede completarse con `data`). */
  ruta?: string;
}

export const NOTIFICACION_CONFIG: Record<TipoNotificacion, NotificacionTipoConfig> = {
  // ------------------------- CITAS -------------------------
  [TipoNotificacion.CitaConfirmada]: {
    tipo: TipoNotificacion.CitaConfirmada,
    roles: ['Cliente'],
    icono: '💗',
    categoria: CategoriaNotificacion.Citas,
    ruta: '/citas',
  },
  [TipoNotificacion.CitaCancelada]: {
    tipo: TipoNotificacion.CitaCancelada,
    roles: ['Cliente', 'Profesional', 'Administrador'],
    icono: '❌',
    categoria: CategoriaNotificacion.Citas,
    ruta: '/citas',
  },
  [TipoNotificacion.CitaReprogramada]: {
    tipo: TipoNotificacion.CitaReprogramada,
    roles: ['Cliente', 'Profesional', 'Administrador'],
    icono: '🔄',
    categoria: CategoriaNotificacion.Citas,
    ruta: '/citas',
  },
  [TipoNotificacion.RecordatorioCita]: {
    tipo: TipoNotificacion.RecordatorioCita,
    roles: ['Cliente', 'Profesional'],
    icono: '🗓️',
    categoria: CategoriaNotificacion.Citas,
    ruta: '/citas',
  },
  [TipoNotificacion.CitaProxima]: {
    tipo: TipoNotificacion.CitaProxima,
    roles: ['Cliente', 'Profesional'],
    icono: '⏰',
    categoria: CategoriaNotificacion.Citas,
    ruta: '/citas',
  },
  [TipoNotificacion.NuevaSolicitudCita]: {
    tipo: TipoNotificacion.NuevaSolicitudCita,
    roles: ['Profesional'],
    icono: '📋',
    categoria: CategoriaNotificacion.Citas,
    ruta: '/citas',
  },
  [TipoNotificacion.CitaAceptada]: {
    tipo: TipoNotificacion.CitaAceptada,
    roles: ['Profesional'],
    icono: '✅',
    categoria: CategoriaNotificacion.Citas,
    ruta: '/citas',
  },

  // ------------------------- MENSAJES -------------------------
  [TipoNotificacion.NuevoMensaje]: {
    tipo: TipoNotificacion.NuevoMensaje,
    roles: ['Cliente', 'Profesional'],
    icono: '💬',
    categoria: CategoriaNotificacion.Mensajes,
  },

  // ------------------------- VALORACIONES -------------------------
  [TipoNotificacion.SolicitudValoracion]: {
    tipo: TipoNotificacion.SolicitudValoracion,
    roles: ['Cliente'],
    icono: '⭐',
    categoria: CategoriaNotificacion.Valoraciones,
    ruta: '/citas',
  },
  [TipoNotificacion.NuevaValoracion]: {
    tipo: TipoNotificacion.NuevaValoracion,
    roles: ['Profesional'],
    icono: '⭐',
    categoria: CategoriaNotificacion.Valoraciones,
    ruta: '/perfil',
  },

  // ------------------------- CUENTA / AVISOS -------------------------
  [TipoNotificacion.AvisoImportante]: {
    tipo: TipoNotificacion.AvisoImportante,
    roles: ['Cliente'],
    icono: '📢',
    categoria: CategoriaNotificacion.Cuenta,
  },
  [TipoNotificacion.AvisoAdministrativo]: {
    tipo: TipoNotificacion.AvisoAdministrativo,
    roles: ['Profesional'],
    icono: '📢',
    categoria: CategoriaNotificacion.Cuenta,
  },
  [TipoNotificacion.Bienvenida]: {
    tipo: TipoNotificacion.Bienvenida,
    roles: ['Cliente'],
    icono: '✨',
    categoria: CategoriaNotificacion.Cuenta,
    ruta: '/',
  },

  // ------------------------- PERFIL (PROFESIONAL) -------------------------
  [TipoNotificacion.PerfilDocumentacionPendiente]: {
    tipo: TipoNotificacion.PerfilDocumentacionPendiente,
    roles: ['Profesional'],
    icono: '⚠️',
    categoria: CategoriaNotificacion.Perfil,
    ruta: '/perfil',
  },
  [TipoNotificacion.ReportePerfil]: {
    tipo: TipoNotificacion.ReportePerfil,
    roles: ['Profesional'],
    icono: '🚨',
    categoria: CategoriaNotificacion.Perfil,
    ruta: '/perfil',
  },

  // ------------------------- ADMIN / MODERACIÓN -------------------------
  [TipoNotificacion.NuevoUsuarioRegistrado]: {
    tipo: TipoNotificacion.NuevoUsuarioRegistrado,
    roles: ['Administrador'],
    icono: '👤',
    categoria: CategoriaNotificacion.Moderacion,
    ruta: '/usuarios',
  },
  [TipoNotificacion.NuevoProfesionalRegistrado]: {
    tipo: TipoNotificacion.NuevoProfesionalRegistrado,
    roles: ['Administrador'],
    icono: '🩺',
    categoria: CategoriaNotificacion.Moderacion,
    ruta: '/profesionales',
  },
  [TipoNotificacion.ProfesionalPendienteAprobacion]: {
    tipo: TipoNotificacion.ProfesionalPendienteAprobacion,
    roles: ['Administrador'],
    icono: '📋',
    categoria: CategoriaNotificacion.Moderacion,
    ruta: '/profesionales',
  },
  [TipoNotificacion.DocumentacionPendienteRevision]: {
    tipo: TipoNotificacion.DocumentacionPendienteRevision,
    roles: ['Administrador'],
    icono: '📄',
    categoria: CategoriaNotificacion.Moderacion,
    ruta: '/profesionales',
  },
  [TipoNotificacion.ProfesionalReportado]: {
    tipo: TipoNotificacion.ProfesionalReportado,
    roles: ['Administrador'],
    icono: '🚨',
    categoria: CategoriaNotificacion.Moderacion,
    ruta: '/profesionales',
  },
  [TipoNotificacion.UsuarioReportado]: {
    tipo: TipoNotificacion.UsuarioReportado,
    roles: ['Administrador'],
    icono: '⚠️',
    categoria: CategoriaNotificacion.Moderacion,
    ruta: '/usuarios',
  },
  [TipoNotificacion.NuevoReporte]: {
    tipo: TipoNotificacion.NuevoReporte,
    roles: ['Administrador'],
    icono: '💬',
    categoria: CategoriaNotificacion.Moderacion,
  },
  [TipoNotificacion.AvisoSistema]: {
    tipo: TipoNotificacion.AvisoSistema,
    roles: ['Administrador'],
    icono: '📢',
    categoria: CategoriaNotificacion.Sistema,
  },
  [TipoNotificacion.ProblemaSistema]: {
    tipo: TipoNotificacion.ProblemaSistema,
    roles: ['Administrador'],
    icono: '⚠️',
    categoria: CategoriaNotificacion.Sistema,
  },
};

/** true si ese rol debería poder ver ese tipo de notificación. */
export function rolPuedeRecibir(tipo: TipoNotificacion, rol: RolNotificacion | null): boolean {
  if (!rol) return false;
  return NOTIFICACION_CONFIG[tipo]?.roles.includes(rol) ?? false;
}

/** Filtra un arreglo de notificaciones dejando solo las que le tocan a ese rol. */
export function filtrarPorRol(
  notificaciones: Notificacion[],
  rol: RolNotificacion | null
): Notificacion[] {
  return notificaciones.filter((n) => rolPuedeRecibir(n.tipo, rol));
}

export function iconoDe(tipo: TipoNotificacion): string {
  return NOTIFICACION_CONFIG[tipo]?.icono ?? '🔔';
}

export function rutaDe(tipo: TipoNotificacion): string | undefined {
  return NOTIFICACION_CONFIG[tipo]?.ruta;
}
