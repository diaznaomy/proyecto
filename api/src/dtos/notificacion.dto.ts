import { z } from "zod";

// Body vacío para los PATCH de "marcar leída" — se valida solo el :id de
// la ruta con parseId. Este schema queda por si en el futuro se agrega
// algún campo (ej. "leida: false" para revertir).
export const marcarLeidaSchema = z.object({}).optional();

// DTO interno usado por otros servicios (citas, reseñas, etc.) para crear
// una notificación. No se expone como endpoint público: las notificaciones
// nacen de eventos internos del backend, no de un formulario del cliente.
export const crearNotificacionSchema = z.object({
  usuarioId: z.coerce.number().int().positive(),

  tipo: z.enum([
    "CitaConfirmada",
    "CitaCancelada",
    "CitaReprogramada",
    "RecordatorioCita",
    "CitaProxima",
    "NuevaSolicitudCita",
    "CitaAceptada",
    "NuevoMensaje",
    "SolicitudValoracion",
    "NuevaValoracion",
    "AvisoImportante",
    "AvisoAdministrativo",
    "Bienvenida",
    "PerfilDocumentacionPendiente",
    "ReportePerfil",
    "NuevoUsuarioRegistrado",
    "NuevoProfesionalRegistrado",
    "ProfesionalPendienteAprobacion",
    "DocumentacionPendienteRevision",
    "ProfesionalReportado",
    "UsuarioReportado",
    "NuevoReporte",
    "AvisoSistema",
    "ProblemaSistema",
  ]),

  titulo: z.string().trim().min(1).max(150),
  mensaje: z.string().trim().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type CrearNotificacionDto = z.infer<typeof crearNotificacionSchema>;
