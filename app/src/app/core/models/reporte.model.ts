export interface ReporteEstado {
  estado: string;
  total: number;
  porcentaje: number;
}

export interface ReporteProfesional {
  profesionalId: number;
  profesional: string;
  total: number;
  completadas: number;
  canceladas: number;
  montoEstimado: number;
  porcentajeFinalizacion: number;
}

export interface ReporteCalificacion {
  profesionalId: number;
  profesional: string;
  totalResenas: number;
  promedio: number;
  distribucion: Record<number, number>;
  mejoresServicios: string[];
  serviciosBajaCalificacion: Array<{ nombre: string; promedio: number }>;
}

export interface Reportes {
  periodo: { fechaDesde: string | null; fechaHasta: string | null };
  filtros: { profesionalId: number | null; especialidadId: number | null };
  totales: {
    citas: number;
    profesionales: number;
    resenas: number;
    promedioGeneral: number;
  };
  citasPorEstado: ReporteEstado[];
  citasPorProfesional: ReporteProfesional[];
  calificaciones: ReporteCalificacion[];
  umbralBajaCalificacion: number;
}
