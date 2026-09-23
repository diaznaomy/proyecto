import { Injectable } from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as any)['vfs'] = (pdfFonts as any).vfs;

@Injectable({
  providedIn: 'root'
})

export class PdfService {

  constructor() { }

  generarReporteServicios(servicios: any[]): void {

    const fecha = new Date().toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
   
    const filasServicios = servicios.map((servicio: any) => [
      servicio.nombre ?? 'Sin nombre',

      `${servicio.perfilProfesional?.usuario?.nombre ?? ''} ${
        servicio.perfilProfesional?.usuario?.apellidos ?? ''
      }`.trim() || 'Sin profesional',

      servicio.especialidades
        ?.map((especialidad: any) => especialidad.nombre)
        .join(', ') || 'Sin especialidad',

      servicio.modalidad?.nombre ?? 'Sin modalidad',

      `¢${Number(servicio.precio ?? 0).toLocaleString('es-CR')}`,

      `${servicio.duracionEstimada ?? 0} min`,

      servicio.estadoServicio?.nombre ?? 'Sin estado'
    ]);

    const documento: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [30, 40, 30, 45],

      content: [
        {
          text: 'SERENA',
          fontSize: 24,
          bold: true,
          alignment: 'center',
          color: '#D97A96',
          margin: [0, 0, 0, 6]
        },
        {
          text: 'Reporte de Servicios',
          fontSize: 18,
          bold: true,
          alignment: 'center',
          color: '#333333',
          margin: [0, 0, 0, 12]
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 780,
              y2: 0,
              lineWidth: 1.5,
              lineColor: '#F2C7D5'
            }
          ],
          margin: [0, 0, 0, 12]
        },
        {
          text: `Fecha de generación: ${fecha}`,
          alignment: 'right',
          italics: true,
          fontSize: 9,
          color: '#666666',
          margin: [0, 0, 0, 20]
        },

        {
          table: {
            headerRows: 1,

            widths: [
              '*',
              '*',
              '*',
              70,
              65,
              55,
              55
            ],

            body: [
              [
                {
                  text: 'Servicio',
                  style: 'encabezadoTabla'
                },
                {
                  text: 'Profesional',
                  style: 'encabezadoTabla'
                },
                {
                  text: 'Especialidad',
                  style: 'encabezadoTabla'
                },
                {
                  text: 'Modalidad',
                  style: 'encabezadoTabla'
                },
                {
                  text: 'Precio',
                  style: 'encabezadoTabla'
                },
                {
                  text: 'Duración',
                  style: 'encabezadoTabla'
                },
                {
                  text: 'Estado',
                  style: 'encabezadoTabla'
                }
              ],

              ...filasServicios
            ]
          },

          layout: {
            hLineWidth: (
              indice: number,
              nodo: any
            ) => {
              if (
                indice === 0 ||
                indice === 1 ||
                indice === nodo.table.body.length
              ) {
                return 1;
              }

              return 0.5;
            },

            hLineColor: (
              indice: number
            ) => {
              return indice === 1
                ? '#FFF9FB'
                : '#DDDDDD';
            },

            vLineWidth: () => 0.5,
            vLineColor: () => '#DDDDDD',

            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 5,
            paddingBottom: () => 5
          }
        }
      ],

      footer: (
        currentPage: number,
        pageCount: number
      ) => ({
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        fontSize: 9,
        color: '#666666',
        margin: [0, 12, 0, 0]
      }),

      styles: {
        encabezadoTabla: {
          bold: true,
          fontSize: 9,
          alignment: 'center',
          color: '#FFFFFF',
          fillColor: '#D97A96',
          margin: [2, 5, 2, 5]
        }
      },

      defaultStyle: {
        fontSize: 8,
        color: '#333333'
      }
    };

    pdfMake.createPdf(documento).open();

    pdfMake
      .createPdf(documento)
      .download('reporte-servicios.pdf');
  }
} 