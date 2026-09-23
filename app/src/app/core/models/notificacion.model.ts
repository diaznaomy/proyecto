// Los roles se manejan como strings porque así los devuelve el backend
// (tabla Rol), igual que en AuthService.rol y Usuario.rol.nombre.
export type RolNotificacion = 'Cliente' | 'Profesional' | 'Administrador';

/**
 * Cada valor representa un EVENTO de negocio, no una notificación por rol.
 * Un mismo evento (ej. CitaCancelada) puede generar notificaciones para
 * varios roles a la vez; quién la recibe se define en notificacion-config.ts.
 */
export enum TipoNotificacion {
  // --- Citas ---
  CitaConfirmada = 'CitaConfirmada',
  CitaCancelada = 'CitaCancelada',
  CitaReprogramada = 'CitaReprogramada',
  RecordatorioCita = 'RecordatorioCita',
  CitaProxima = 'CitaProxima',
  NuevaSolicitudCita = 'NuevaSolicitudCita',
  CitaAceptada = 'CitaAceptada',

  // --- Mensajería ---
  NuevoMensaje = 'NuevoMensaje',

  // --- Valoraciones ---
  SolicitudValoracion = 'SolicitudValoracion',
  NuevaValoracion = 'NuevaValoracion',

  // --- Avisos / cuenta ---
  AvisoImportante = 'AvisoImportante',
  AvisoAdministrativo = 'AvisoAdministrativo',
  Bienvenida = 'Bienvenida',

  // --- Perfil / documentación (Profesional) ---
  PerfilDocumentacionPendiente = 'PerfilDocumentacionPendiente',
  ReportePerfil = 'ReportePerfil',

  // --- Administración / moderación ---
  NuevoUsuarioRegistrado = 'NuevoUsuarioRegistrado',
  NuevoProfesionalRegistrado = 'NuevoProfesionalRegistrado',
  ProfesionalPendienteAprobacion = 'ProfesionalPendienteAprobacion',
  DocumentacionPendienteRevision = 'DocumentacionPendienteRevision',
  ProfesionalReportado = 'ProfesionalReportado',
  UsuarioReportado = 'UsuarioReportado',
  NuevoReporte = 'NuevoReporte',
  AvisoSistema = 'AvisoSistema',
  ProblemaSistema = 'ProblemaSistema',
}

export enum CategoriaNotificacion {
  Citas = 'Citas',
  Mensajes = 'Mensajes',
  Valoraciones = 'Valoraciones',
  Cuenta = 'Cuenta',
  Perfil = 'Perfil',
  Moderacion = 'Moderacion',
  Sistema = 'Sistema',
}

/** Instancia real de una notificación, tal como la devuelve el API. */
export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  usuarioId: number;
  titulo: string;
  mensaje: string;
  /** Datos contextuales: citaId, profesionalId, reporteId, etc. */
  data?: Record<string, unknown> | null;
  leida: boolean;
  createdAt: string;
  leidaEn?: string | null;
}
