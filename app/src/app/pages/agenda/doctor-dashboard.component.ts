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

/**
 * Paleta compartida con agenda.css para que todo el dashboard se vea
 * como una sola familia visual (rosa, salvia, crema, menta).
 */
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

interface PacienteResumen {
  id: string;
  nombre: string;
  edad: number | null;
  telefono?: string;
  citas: Cita[];
  ultimaCita: Cita;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css',
})
export class DoctorDashboardComponent implements AfterViewInit, OnChanges {
  /** Citas ya filtradas para el profesional que ve el panel. */
  @Input({ required: true }) citas: Cita[] = [];

  @ViewChild('edadesCanvas') edadesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('visitasCanvas') visitasCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('serviciosCanvas') serviciosCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('estadoCanvas') estadoCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private viewReady = false;

  pacientes: PacienteResumen[] = [];
  pacienteSeleccionado: PacienteResumen | null = null;

  // KPIs del profesional (mismo criterio que el dashboard de admin)
  citasEsteMes = 0;
  citasEsteAnio = 0;
  citasCompletadasTotal = 0;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.calcularKpis();
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['citas']) {
      this.pacientes = this.agruparPacientes(this.citas);
      this.calcularKpis();

      if (this.pacientes.length && !this.pacienteSeleccionado) {
        this.pacienteSeleccionado = this.pacientes[0];
      }
    }

    if (this.viewReady) {
      this.render();
    }
  }

  seleccionarPaciente(paciente: PacienteResumen): void {
    this.pacienteSeleccionado =
      this.pacienteSeleccionado?.id === paciente.id ? this.pacienteSeleccionado : paciente;
  }

  toggleExpand(paciente: PacienteResumen): void {
    this.pacienteSeleccionado = this.pacienteSeleccionado?.id === paciente.id ? null : paciente;
  }

  resenaDoc(cita: Cita): string {
    return (
      (cita as any).notas ??
      (cita as any).observaciones ??
      (cita as any).resena ??
      'Sin notas registradas para esta cita.'
    );
  }

  estadoNombre(cita: Cita): string {
    return (cita.estadoCita?.nombre ?? 'Pendiente').toLowerCase();
  }

  // ---------------------------------------------------------------------
  // KPIs
  // ---------------------------------------------------------------------

  private calcularKpis(): void {
    const hoy = new Date();

    this.citasEsteMes = this.citas.filter((c) => {
      const f = new Date(c.horaInicio);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }).length;

    this.citasEsteAnio = this.citas.filter(
      (c) => new Date(c.horaInicio).getFullYear() === hoy.getFullYear(),
    ).length;

    this.citasCompletadasTotal = this.citas.filter(
      (c) => (c.estadoCita?.nombre ?? '').toLowerCase() === 'completada',
    ).length;
  }

  // ---------------------------------------------------------------------
  // Agrupación de pacientes
  // ---------------------------------------------------------------------

  private agruparPacientes(citas: Cita[]): PacienteResumen[] {
    const mapa = new Map<string, PacienteResumen>();

    for (const cita of citas) {
      const cliente = cita.cliente;
      const id = String(cliente?.id ?? `${cliente?.nombre}-${cliente?.apellidos}`);
      const existente = mapa.get(id);

      if (existente) {
        existente.citas.push(cita);

        if (
          new Date(cita.horaInicio).getTime() > new Date(existente.ultimaCita.horaInicio).getTime()
        ) {
          existente.ultimaCita = cita;
        }

        if (existente.edad === null && cliente?.edad !== null && cliente?.edad !== undefined) {
          existente.edad = cliente.edad;
        }
      } else {
        mapa.set(id, {
          id,
          nombre: `${cliente?.nombre ?? ''} ${cliente?.apellidos ?? ''}`.trim() || 'Paciente',
          edad: cliente?.edad ?? null,
          telefono: cliente?.telefono ?? undefined,
          citas: [cita],
          ultimaCita: cita,
        });
      }
    }

    return Array.from(mapa.values()).sort(
      (a, b) =>
        new Date(b.ultimaCita.horaInicio).getTime() - new Date(a.ultimaCita.horaInicio).getTime(),
    );
  }

  // ---------------------------------------------------------------------
  // Render de gráficos
  // ---------------------------------------------------------------------

  private render(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];

    if (!this.edadesCanvas) return;

    this.charts.push(this.renderEdades());
    this.charts.push(this.renderVisitasPorMes());
    this.charts.push(this.renderTiposServicio());
    this.charts.push(this.renderEstados());
  }

  private renderEdades(): Chart {
    const buckets = ['0-17', '18-30', '31-45', '46-60', '60+', 'Sin dato'];
    const conteo = [0, 0, 0, 0, 0, 0];

    for (const p of this.pacientes) {
      if (p.edad === null) conteo[5]++;
      else if (p.edad < 18) conteo[0]++;
      else if (p.edad <= 30) conteo[1]++;
      else if (p.edad <= 45) conteo[2]++;
      else if (p.edad <= 60) conteo[3]++;
      else conteo[4]++;
    }

    return new Chart(this.edadesCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: buckets,
        datasets: [
          {
            label: 'Pacientes',
            data: conteo,
            backgroundColor: '#da7d91',
            borderColor: '#51361d',
            borderWidth: 1,
            borderRadius: 8,
            hoverBackgroundColor: '#da7d91',
            hoverBorderColor: '#51361d',
            hoverBorderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  }

  private renderVisitasPorMes(): Chart {
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const anioActual = new Date().getFullYear();
    const conteo = new Array(12).fill(0);

    for (const cita of this.citas) {
      const fecha = new Date(cita.horaInicio);
      if (fecha.getFullYear() === anioActual) conteo[fecha.getMonth()]++;
    }

    const puntos = conteo.map((valor, i) => ({ x: i, y: valor }));

    return this.crearChart(this.visitasCanvas.nativeElement, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Citas',
            data: puntos,
            backgroundColor: PALETTE.rosa,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        ...this.baseOptions(),
        scales: {
          x: {
            type: 'linear',
            min: -0.5,
            max: 11.5,
            ticks: { stepSize: 1, callback: (v) => meses[Number(v)] ?? '' },
            grid: { display: false },
          },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  }

  private renderTiposServicio(): Chart {
    const porServicio = new Map<string, Set<string>>();

    for (const cita of this.citas) {
      const servicio = cita.servicio?.nombre ?? 'General';
      const clienteId = String((cita.cliente as any)?.id ?? cita.cliente?.nombre);
      if (!porServicio.has(servicio)) porServicio.set(servicio, new Set());
      porServicio.get(servicio)!.add(clienteId);
    }

    const labels = Array.from(porServicio.keys());
    const data = labels.map((l) => porServicio.get(l)!.size);

    return this.crearChart(this.serviciosCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Pacientes',
            data,
            backgroundColor: PALETTE.rosa,
            hoverBackgroundColor: PALETTE.rosa,
            borderRadius: 8,
          },
        ],
      },
      options: { ...this.baseOptions(), indexAxis: 'y' },
    });
  }

  private renderEstados(): Chart {
    const conteo = new Map<string, number>();
    for (const cita of this.citas) {
      const estado = this.estadoNombre(cita);
      conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
    }
    const labels = Array.from(conteo.keys());
    const data = labels.map((l) => conteo.get(l)!);
    const colores = labels.map((l) => ESTADO_COLOR[l] ?? PALETTE.textoSuave);

    return new Chart<'doughnut'>(this.estadoCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels.map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{ data, backgroundColor: colores, borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } },
      },
    });
  }

  private crearChart(canvas: HTMLCanvasElement, config: ChartConfiguration): Chart {
    return new Chart(canvas, config);
  }

  private baseOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: PALETTE.textoSuave } },
        y: { grid: { color: '#eee8df' }, ticks: { color: PALETTE.textoSuave, precision: 0 } },
      },
    };
  }
}