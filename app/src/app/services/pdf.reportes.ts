import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Reportes } from '../core/models/reporte.model';

(pdfMake as any)['vfs'] = (pdfFonts as any).vfs;

@Injectable({ providedIn: 'root' })
export class PdfReportesService {
  private encabezado(titulo: string, datos: Reportes): any[] {
    const periodo = datos.periodo.fechaDesde || datos.periodo.fechaHasta
      ? `${datos.periodo.fechaDesde ?? 'Inicio'} al ${datos.periodo.fechaHasta ?? 'Actualidad'}`
      : 'Todos los registros';
    return [
      { text: 'SERENA', style: 'marca' },
      { text: titulo, style: 'titulo' },
      { text: `Período: ${periodo}`, alignment: 'right', color: '#666666', margin: [0, 0, 0, 16] },
    ];
  }

  private descargar(titulo: string, nombre: string, contenido: any[]): void {
    const documento: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [35, 40, 35, 45],
      content: contenido,
      styles: {
        marca: { fontSize: 23, bold: true, alignment: 'center', color: '#D97A96' },
        titulo: { fontSize: 17, bold: true, alignment: 'center', margin: [0, 5, 0, 15] },
        tabla: { bold: true, color: '#FFFFFF', fillColor: '#D97A96' },
      },
      footer: (pagina, paginas) => ({
        text: `Página ${pagina} de ${paginas}`,
        alignment: 'center',
        fontSize: 9,
        color: '#777777',
      }),
    };
    pdfMake.createPdf(documento).download(nombre);
  }

  citasPorEstado(datos: Reportes): void {
    this.descargar('Reporte de citas por estado', 'citas-por-estado.pdf', [
      ...this.encabezado('Reporte de citas por estado', datos),
      { text: `Total de citas: ${datos.totales.citas}`, margin: [0, 0, 0, 12] },
      { table: { headerRows: 1, widths: ['*', 90, 90], body: [
        [{ text: 'Estado', style: 'tabla' }, { text: 'Cantidad', style: 'tabla' }, { text: 'Porcentaje', style: 'tabla' }],
        ...datos.citasPorEstado.map((item) => [item.estado, item.total, `${item.porcentaje.toFixed(1)}%`]),
      ] } },
    ]);
  }

  citasPorProfesional(datos: Reportes): void {
    this.descargar('Reporte de citas por profesional', 'citas-por-profesional.pdf', [
      ...this.encabezado('Reporte de citas por profesional', datos),
      { table: { headerRows: 1, widths: ['*', 42, 58, 62, 60, 72], body: [
        ['Profesional', 'Total', 'Completadas', 'Finalización', 'Canceladas', 'Monto estimado'].map((text) => ({ text, style: 'tabla' })),
        ...datos.citasPorProfesional.map((item) => [
          item.profesional, item.total, item.completadas, `${item.porcentajeFinalizacion.toFixed(1)}%`, item.canceladas,
          `₡${item.montoEstimado.toLocaleString('es-CR')}`,
        ]),
      ] } },
    ]);
  }

  calificaciones(datos: Reportes): void {
    this.descargar('Reporte de calificaciones', 'reporte-calificaciones.pdf', [
      ...this.encabezado('Reporte de calificaciones', datos),
      { text: `Promedio general: ${datos.totales.promedioGeneral.toFixed(1)} / 5`, margin: [0, 0, 0, 12] },
      { text: `Umbral de baja calificación: promedio menor a ${datos.umbralBajaCalificacion} de 5`, margin: [0, 0, 0, 12], color: '#666666' },
      { table: { headerRows: 1, widths: ['*', 52, 48, '*', '*'], body: [
        ['Profesional', 'Promedio', 'Reseñas', 'Mejor servicio', 'Baja calificación'].map((text) => ({ text, style: 'tabla' })),
        ...datos.calificaciones.map((item) => [
          item.profesional,
          item.totalResenas ? item.promedio.toFixed(1) : 'Sin reseñas',
          item.totalResenas,
          item.mejoresServicios.join(', ') || 'Sin datos',
          item.serviciosBajaCalificacion
            .map((servicio) => `${servicio.nombre} (${servicio.promedio.toFixed(1)})`)
            .join(', ') || 'Ninguno',
        ]),
      ] } },
    ]);
  }
}
