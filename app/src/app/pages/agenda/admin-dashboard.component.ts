import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
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
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements AfterViewInit, OnChanges {
  /** Todas las citas de la plataforma (sin filtrar por profesional). */
  @Input({ required: true }) citas: Cita[] = [];
  /** Totales que normalmente vienen de tu servicio de usuarios/profesionales. */
  @Input() usuariosRegistrados = 0;
  @Input() profesionalesActivos = 0;

  @ViewChild('estadosCanvas') estadosCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tiempoCanvas') tiempoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('especialidadesCanvas') especialidadesCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private viewReady = false;

  citasEsteMes = 0;
  citasEsteAnio = 0;
  citasCompletadasTotal = 0;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.calcularKpis();
    this.render();
  }

  ngOnChanges(): void {
    this.calcularKpis();
    if (this.viewReady) this.render();
  }

  private calcularKpis(): void {
    const hoy = new Date();
    this.citasEsteMes = this.citas.filter((c) => {
      const f = new Date(c.horaInicio);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }).length;

    this.citasEsteAnio = this.citas.filter((c) => new Date(c.horaInicio).getFullYear() === hoy.getFullYear()).length;

    this.citasCompletadasTotal = this.citas.filter(
      (c) => (c.estadoCita?.nombre ?? '').toLowerCase() === 'completada'
    ).length;
  }

  private render(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
    if (!this.estadosCanvas) return;

    this.charts.push(this.renderEstados());
    this.charts.push(this.renderTiempo());
    this.charts.push(this.renderEspecialidades());
  }

  /** Citas por estado (doughnut) a nivel de toda la plataforma. */
  private renderEstados(): Chart {
    const conteo = new Map<string, number>();
    for (const cita of this.citas) {
      const estado = (cita.estadoCita?.nombre ?? 'Pendiente').toLowerCase();
      conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
    }
    const labels = Array.from(conteo.keys());
    const data = labels.map((l) => conteo.get(l)!);
    const colores = labels.map((l) => ESTADO_COLOR[l] ?? PALETTE.textoSuave);

    return new Chart(this.estadosCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels.map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{ data, backgroundColor: colores, borderWidth: 0 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: PALETTE.textoSuave, boxWidth: 10 } } } },
    });
  }

  /** Citas a lo largo del tiempo (línea), últimos 12 meses. */
  private renderTiempo(): Chart {
    const hoy = new Date();
    const meses: string[] = [];
    const conteo: number[] = [];
    const nombresMes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      meses.push(`${nombresMes[fecha.getMonth()]} ${String(fecha.getFullYear()).slice(2)}`);
      conteo.push(0);
    }

    for (const cita of this.citas) {
      const f = new Date(cita.horaInicio);
      const diffMeses =
        (hoy.getFullYear() - f.getFullYear()) * 12 + (hoy.getMonth() - f.getMonth());
      if (diffMeses >= 0 && diffMeses < 12) {
        conteo[11 - diffMeses]++;
      }
    }

    return new Chart(this.tiempoCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Citas',
            data: conteo,
            borderColor: PALETTE.rosa,
            backgroundColor: 'rgba(218,125,145,0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: PALETTE.rosa,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: PALETTE.textoSuave } },
          y: { beginAtZero: true, ticks: { precision: 0, color: PALETTE.textoSuave }, grid: { color: '#eee8df' } },
        },
      },
    });
  }

  /** Especialidades/servicios más solicitados en toda la plataforma. */
  private renderEspecialidades(): Chart {
    const conteo = new Map<string, number>();
    for (const cita of this.citas) {
      const servicio = cita.servicio?.nombre ?? 'General';
      conteo.set(servicio, (conteo.get(servicio) ?? 0) + 1);
    }
    const entradas = Array.from(conteo.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const labels = entradas.map((e) => e[0]);
    const data = entradas.map((e) => e[1]);

    return new Chart(this.especialidadesCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Citas', data, backgroundColor: PALETTE.crema, borderRadius: 8 }],
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
