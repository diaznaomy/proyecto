/**
 * Espejo backend de app/src/app/core/models/notificacion-config.ts.
 * Ambos deben mantenerse sincronizados: es la misma tabla de negocio
 * (mapa de notificaciones por rol) en los dos lados.
 */
export const ROLES_POR_TIPO_NOTIFICACION: Record<string, string[]> = {
  CitaConfirmada: ["Cliente"],
  CitaCancelada: ["Cliente", "Profesional", "Administrador"],
  CitaReprogramada: ["Cliente", "Profesional", "Administrador"],
  RecordatorioCita: ["Cliente", "Profesional"],
  CitaProxima: ["Cliente", "Profesional"],
  NuevaSolicitudCita: ["Profesional"],
  CitaAceptada: ["Profesional"],
  NuevoMensaje: ["Cliente", "Profesional"],
  SolicitudValoracion: ["Cliente"],
  NuevaValoracion: ["Profesional"],
  AvisoImportante: ["Cliente"],
  AvisoAdministrativo: ["Profesional"],
  Bienvenida: ["Cliente"],
  PerfilDocumentacionPendiente: ["Profesional"],
  ReportePerfil: ["Profesional"],
  NuevoUsuarioRegistrado: ["Administrador"],
  NuevoProfesionalRegistrado: ["Administrador"],
  ProfesionalPendienteAprobacion: ["Administrador"],
  DocumentacionPendienteRevision: ["Administrador"],
  ProfesionalReportado: ["Administrador"],
  UsuarioReportado: ["Administrador"],
  NuevoReporte: ["Administrador"],
  AvisoSistema: ["Administrador"],
  ProblemaSistema: ["Administrador"],
};

export function rolPuedeRecibir(tipo: string, rolNombre: string): boolean {
  return ROLES_POR_TIPO_NOTIFICACION[tipo]?.includes(rolNombre) ?? false;
}
