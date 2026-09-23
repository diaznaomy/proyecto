import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';

import { Cita } from '../../core/models/cita.model';

const PALETTE = {
  rosa: '#da7d91',
  salvia: '#a0bbb2',
  crema: '#f1e7c8',
  menta: '#dcebe7',
  rosaClaro: '#f8dfe5',
  cafe: '#51361d',
  textoSuave: '#78695e',
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#d8b75a',
  aceptada: '#a0bbb2',
  confirmada: '#a0bbb2',
  cancelada: '#da7d91',
  completada: '#51361d',
};

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente-dashboard.component.html',
  styleUrl: './paciente-dashboard.component.css',
})
export class PacienteDashboardComponent implements AfterViewInit, OnChanges {
  /** Todas las citas del cliente que ha iniciado sesión. */
  @Input({ required: true }) citas: Cita[] = [];

  @ViewChild('estadoCanvas') estadoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('resumenCanvas') resumenCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private viewReady = false;

  citaSeleccionada: Cita | null = null;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['citas']) {
      const ordenadas = this.citasOrdenadas();
      if (ordenadas.length && !this.citaSeleccionada) {
        this.citaSeleccionada = ordenadas[0];
      }
    }
    if (this.viewReady) this.render();
  }

  citasOrdenadas(): Cita[] {
    return [...this.citas].sort(
      (a, b) => new Date(b.horaInicio).getTime() - new Date(a.horaInicio).getTime()
    );
  }

  seleccionarCita(cita: Cita): void {
    this.citaSeleccionada = this.citaSeleccionada === cita ? null : cita;
  }

  estadoNombre(cita: Cita): string {
    return (cita.estadoCita?.nombre ?? 'Pendiente').toLowerCase();
  }

  nombreProfesional(cita: Cita): string {
    const nombre = `${(cita as any).profesional?.usuario?.nombre ?? ''} ${(cita as any).profesional?.usuario?.apellidos ?? ''}`.trim();
    return nombre || 'Profesional asignado';
  }

  resenaDoc(cita: Cita): string {
    // Ajusta al campo real de tu modelo (notas / observaciones / resena del profesional).
    return (
      (cita as any).notas ??
      (cita as any).observaciones ??
      (cita as any).resena ??
      'El profesional aún no ha dejado una reseña para esta cita.'
    );
  }

  // ---------------------------------------------------------------------
  // Gráficos
  // ---------------------------------------------------------------------

  private render(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
    if (!this.estadoCanvas) return;

    this.charts.push(this.renderEstado());
    this.charts.push(this.renderResumenProfesional());
  }

  /** Estado de sus citas -> gráfico circular. */
  private renderEstado(): Chart {
    const conteo = new Map<string, number>();
    for (const cita of this.citas) {
      const estado = this.estadoNombre(cita);
      conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
    }
    const labels = Array.from(conteo.keys());
    const data = labels.map((l) => conteo.get(l)!);
    const colores = labels.map((l) => ESTADO_COLOR[l] ?? PALETTE.textoSuave);

    return new Chart(this.estadoCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels.map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{ data, backgroundColor: colores, borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { color: PALETTE.textoSuave, boxWidth: 10 } } },
      },
    });
  }

  /** Resumen de atención profesional: cuántas citas ha tenido por especialidad -> barras. */
  private renderResumenProfesional(): Chart {
    const conteo = new Map<string, number>();
    for (const cita of this.citas) {
      const servicio = cita.servicio?.nombre ?? 'General';
      conteo.set(servicio, (conteo.get(servicio) ?? 0) + 1);
    }
    const labels = Array.from(conteo.keys());
    const data = labels.map((l) => conteo.get(l)!);

    return new Chart(this.resumenCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Citas', data, backgroundColor: PALETTE.rosaClaro, borderRadius: 8 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0, color: PALETTE.textoSuave }, grid: { color: '#eee8df' } },
          y: { grid: { display: false }, ticks: { color: PALETTE.textoSuave } },
        },
      },
    });
  }
}
