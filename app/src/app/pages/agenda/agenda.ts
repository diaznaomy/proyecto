import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

import dayGridPlugin from '@fullcalendar/angular/daygrid';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import listPlugin from '@fullcalendar/angular/list';
import interactionPlugin from '@fullcalendar/angular/interaction';
import themePlugin from '@fullcalendar/angular/themes/classic';

import { Cita } from '../../core/models/cita.model';
import { AuthService } from '../../core/services/auth.service';
import { CitaService } from '../../core/services/cita.service';

import { PacienteDashboardComponent } from './paciente-dashboard.component';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard.component';

@Component({
  selector: 'app-agenda',
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    PacienteDashboardComponent,
    DoctorDashboardComponent,
    AdminDashboardComponent,
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda {
  private readonly citaService = inject(CitaService);
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuario;
  readonly citas = signal<Cita[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly filtroEstado = signal('');
  readonly filtroProfesional = signal('');
  readonly filtroFecha = signal('');

  // Cita seleccionada al hacer clic en un evento del calendario (para el modal de detalle)
  readonly citaSeleccionada = signal<Cita | null>(null);

  readonly rol = computed(() => this.usuario()?.rol?.nombre ?? 'Cliente');
  readonly esCliente = computed(() => this.rol() === 'Cliente');
  readonly esProfesional = computed(() => this.rol() === 'Profesional');
  readonly esAdministrador = computed(() => this.rol() === 'Administrador');

  readonly citasHoy = computed(
    () =>
      this.citas().filter((cita) => this.esMismaFecha(new Date(cita.horaInicio), new Date()))
        .length,
  );

  readonly citasConfirmadas = computed(
    () =>
      this.citas().filter((cita) => {
        const estado = this.normalizarEstado(cita.estadoCita?.nombre ?? '');
        return estado === 'aceptada' || estado === 'confirmada';
      }).length,
  );

  readonly citasPendientes = computed(
    () =>
      this.citas().filter(
        (cita) => this.normalizarEstado(cita.estadoCita?.nombre ?? '') === 'pendiente',
      ).length,
  );

  readonly proximasCitas = computed(() =>
    [...this.citas()]
      .filter((cita) => !!cita.horaInicio && !!cita.horaFin)
      .sort((a, b) => new Date(a.horaInicio).getTime() - new Date(b.horaInicio).getTime())
      .slice(0, 3),
  );

  readonly citasFiltradas = computed(() => {
    const estadoFiltro = this.filtroEstado().trim().toLowerCase();
    const profesionalFiltro = this.filtroProfesional().trim();
    const fechaFiltro = this.filtroFecha().trim();

    return [...this.citas()]
      .filter((cita) => {
        const estado = this.normalizarEstado(cita.estadoCita?.nombre ?? '');
        const coincideEstado = !estadoFiltro || estado === estadoFiltro;
        const coincideProfesional =
          !profesionalFiltro || String(cita.profesionalId) === profesionalFiltro;
        const coincideFecha = !fechaFiltro || this.fechaEsIgual(cita.fechaCita, fechaFiltro);

        return coincideEstado && coincideProfesional && coincideFecha;
      })
      .sort((a, b) => new Date(a.horaInicio).getTime() - new Date(b.horaInicio).getTime());
  });

  readonly historialClienteCitas = computed(() =>
    [...this.citas()].sort(
      (a, b) => new Date(a.horaInicio).getTime() - new Date(b.horaInicio).getTime(),
    ),
  );

  readonly profesionalesDisponibles = computed(() => {
    const mapa = new Map<number, string>();

    this.citas().forEach((cita) => {
      const nombre =
        `${cita.profesional?.usuario?.nombre ?? ''} ${cita.profesional?.usuario?.apellidos ?? ''}`.trim();
      if (!mapa.has(cita.profesionalId) && nombre) {
        mapa.set(cita.profesionalId, nombre);
      }
    });

    return Array.from(mapa.entries()).map(([id, nombre]) => ({ id, nombre }));
  });

  readonly totalProfesionales = computed(() => this.profesionalesDisponibles().length);

  readonly totalUsuarios = computed(() => {
    const idsUnicos = new Set<string>();

    this.citas().forEach((cita) => {
      const cliente: any = cita.cliente;
      idsUnicos.add(String(cliente?.id ?? `${cliente?.nombre}-${cliente?.apellidos}`));
    });

    // Clientes distintos + profesionales distintos, como aproximación de "usuarios registrados".
    return idsUnicos.size + this.totalProfesionales();
  });

  readonly estadoLegendColors = {
    pendiente: '#d8b75a',
    aceptada: '#a0bbb2',
    confirmada: '#a0bbb2',
    cancelada: '#da7d91',
    completada: '#51361d',
  } as const;

  readonly fechaHoyTexto = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });

  calendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, themePlugin],
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    height: 'auto',
    nowIndicator: true,
    eventDidMount: (info: any) => {
      const estado = (info.event.extendedProps?.estado ?? 'pendiente') as string;
      const color = this.colorPorEstado(estado);
      const enVistaMes = info.view.type === 'dayGridMonth';

      const colorTexto = enVistaMes
        ? '#fbf6ee'
        : estado === 'cancelada' || estado === 'completada'
          ? '#ffffff'
          : '#51361d';

      info.el.style.backgroundColor = color;
      info.el.style.borderColor = color;
      info.el.style.boxShadow = 'none';
      info.el.style.opacity = '1';

      info.el.style.setProperty('color', colorTexto, 'important');
      info.el.querySelectorAll('*').forEach((el: HTMLElement) => {
        el.style.setProperty('color', colorTexto, 'important');
      });
    },

    eventClick: (info: any) => {
      const citaId = info.event.extendedProps?.citaId;
      const cita = this.citas().find((c) => c.id === citaId) ?? null;

      if (cita) {
        this.mostrarDetalleCita(cita);
      }
    },
    events: [] as Array<{
      title: string;
      start: string;
      end: string;
      backgroundColor: string;
      borderColor: string;
      textColor: string;
      classNames: string[];
      extendedProps: { estado: string; citaId: number };
    }>,
  };

  constructor() {
    this.cargarCitas();
  }

  private cargarCitas(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.citaService.listar().subscribe({
      next: (response) => {
        const citas = response.data ?? [];
        this.citas.set(citas);
        this.sincronizarEventos();
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar la agenda', error);
        this.error.set('No se pudo cargar la agenda de citas.');
        this.cargando.set(false);
      },
    });
  }

  resetFiltros(): void {
    this.filtroEstado.set('');
    this.filtroProfesional.set('');
    this.filtroFecha.set('');
    this.sincronizarEventos();
  }

  onEstadoChange(value: string): void {
    this.filtroEstado.set(value);
    this.sincronizarEventos();
  }

  onProfesionalChange(value: string): void {
    this.filtroProfesional.set(value);
    this.sincronizarEventos();
  }

  onFechaChange(value: string): void {
    this.filtroFecha.set(value);
    this.sincronizarEventos();
  }

  mostrarDetalleCita(cita: Cita): void {
    this.citaSeleccionada.set(cita);
  }

  cerrarDetalleCita(): void {
    this.citaSeleccionada.set(null);
  }

  private sincronizarEventos(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.mapearCitasAEventos(this.citasFiltradas()),
    };
  }

  private mapearCitasAEventos(citas: Cita[]) {
    return citas
      .filter((cita) => !!cita.horaInicio && !!cita.horaFin)
      .map((cita) => {
        const estado = this.estadoNombre(cita);
        const color = this.colorPorEstado(estado);

        return {
          title: `${this.obtenerNombreCliente(cita)} • ${cita.servicio.nombre}`,
          start: this.formatearFechaHora(new Date(cita.horaInicio)),
          end: this.formatearFechaHora(new Date(cita.horaFin)),
          backgroundColor: color,
          borderColor: color,
          textColor: estado === 'completada' ? '#ffffff' : '#51361d',
          classNames: [this.claseEstado(estado)],
          extendedProps: { estado: this.normalizarEstado(estado), citaId: cita.id },
        };
      });
  }

  obtenerNombreCliente(cita: Cita): string {
    return `${cita.cliente.nombre} ${cita.cliente.apellidos}`;
  }

  obtenerNombreProfesional(cita: Cita): string {
    const nombre =
      `${cita.profesional?.usuario?.nombre ?? ''} ${cita.profesional?.usuario?.apellidos ?? ''}`.trim();
    return nombre || 'Profesional';
  }

  estadoNombre(cita: Cita): string {
    return cita.estadoCita?.nombre ?? 'Pendiente';
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  claseEstado(estado: string): string {
    const estadoNormalizado = this.normalizarEstado(estado);

    if (estadoNormalizado === 'pendiente') return 'pending';
    if (estadoNormalizado === 'aceptada' || estadoNormalizado === 'confirmada') return 'confirmed';
    if (estadoNormalizado === 'cancelada') return 'cancelled';
    if (estadoNormalizado === 'completada') return 'completed';

    return 'pending';
  }

  private normalizarEstado(estado: string): string {
    return estado.trim().toLowerCase();
  }

  private colorPorEstado(estado: string): string {
    const estadoNormalizado = this.normalizarEstado(estado);

    if (estadoNormalizado === 'aceptada' || estadoNormalizado === 'confirmada') {
      return this.estadoLegendColors.aceptada;
    }

    if (estadoNormalizado === 'pendiente') {
      return this.estadoLegendColors.pendiente;
    }

    if (estadoNormalizado === 'cancelada') {
      return this.estadoLegendColors.cancelada;
    }

    if (estadoNormalizado === 'completada') {
      return this.estadoLegendColors.completada;
    }

    return this.estadoLegendColors.aceptada;
  }

  private formatearFechaHora(fecha: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(
      fecha.getDate(),
    )}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
  }

  private fechaEsIgual(fecha: string, filtro: string): boolean {
    const fechaCita = new Date(fecha);
    const fechaFiltro = new Date(`${filtro}T00:00:00`);
    return (
      fechaCita.getFullYear() === fechaFiltro.getFullYear() &&
      fechaCita.getMonth() === fechaFiltro.getMonth() &&
      fechaCita.getDate() === fechaFiltro.getDate()
    );
  }

  private esMismaFecha(fechaBase: Date, fechaComparar: Date): boolean {
    return (
      fechaBase.getFullYear() === fechaComparar.getFullYear() &&
      fechaBase.getMonth() === fechaComparar.getMonth() &&
      fechaBase.getDate() === fechaComparar.getDate()
    );
  }
}
