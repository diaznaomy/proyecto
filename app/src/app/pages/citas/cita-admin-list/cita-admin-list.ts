import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import {
  Cita,
  EstadoCita,
  ProfesionalCita,
} from '../../../core/models/cita.model';

import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-cita-admin-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatDatepickerModule,
MatNativeDateModule,
  ],
  templateUrl: './cita-admin-list.html',
  styleUrl: './cita-admin-list.css',
})
export class CitaAdminList {
  private readonly authService =
    inject(AuthService);

  private readonly citaService =
    inject(CitaService);

  private readonly router =
    inject(Router);

  citas = signal<Cita[]>([]);
  estados = signal<EstadoCita[]>([]);
  profesionales = signal<ProfesionalCita[]>([]);

  cargando = signal(false);

  filtroEstado = '';
  filtroProfesional = '';
 fechaDesde: Date | null = null;
fechaHasta: Date | null = null;

  columnas = [
    'cliente',
    'profesional',
    'servicio',
    'fecha',
    'hora',
    'estado',
    'acciones',
  ];

  constructor() {
    this.cargarCitas();
    this.cargarEstados();
    this.cargarProfesionales();
  }

  cargarCitas(): void {
    this.cargando.set(true);

    this.citaService.listar().subscribe({
      next: (response) => {
        this.citas.set(response.data ?? []);
        this.cargando.set(false);
      },

      error: (error) => {
        console.error(
          'Error al cargar citas',
          error
        );

        this.cargando.set(false);
      },
    });
  }

  cargarEstados(): void {
    this.citaService.listarEstados().subscribe({
      next: (response) => {
        this.estados.set(response.data ?? []);
      },

      error: (error) => {
        console.error(
          'Error al cargar estados',
          error
        );
      },
    });
  }

  cargarProfesionales(): void {
    this.citaService
      .listarProfesionales()
      .subscribe({
        next: (profesionales) => {
          this.profesionales.set(
            profesionales
          );
        },

        error: (error) => {
          console.error(
            'Error al cargar profesionales',
            error
          );
        },
      });
  }

 citasFiltradas(): Cita[] {
  return this.citas().filter((cita) => {
    const coincideEstado =
      !this.filtroEstado ||
      cita.estadoCitaId ===
        Number(this.filtroEstado);

    const coincideProfesional =
      !this.filtroProfesional ||
      cita.profesionalId ===
        Number(this.filtroProfesional);

    const fechaCita = new Date(
      cita.fechaCita
    );

    fechaCita.setHours(0, 0, 0, 0);

    const desde = this.fechaDesde
      ? new Date(this.fechaDesde)
      : null;

    const hasta = this.fechaHasta
      ? new Date(this.fechaHasta)
      : null;

    desde?.setHours(0, 0, 0, 0);
    hasta?.setHours(23, 59, 59, 999);

    const coincideDesde =
      !desde ||
      fechaCita >= desde;

    const coincideHasta =
      !hasta ||
      fechaCita <= hasta;

    return (
      coincideEstado &&
      coincideProfesional &&
      coincideDesde &&
      coincideHasta
    );
  });
}

  obtenerNombreCliente(cita: Cita): string {
    return `${cita.cliente.nombre} ${cita.cliente.apellidos}`;
  }

  obtenerNombreProfesional(cita: Cita): string {
    return `${cita.profesional.usuario.nombre} ${cita.profesional.usuario.apellidos}`;
  }

  obtenerNombreProfesionalFiltro(
    profesional: ProfesionalCita
  ): string {
    return `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`;
  }

  obtenerFechaLocal(fecha: string): string {
    return fecha.substring(0, 10);
  }

  obtenerHoraLocal(fecha: string): string {
    const date = new Date(fecha);

    return date.toLocaleTimeString(
      'es-CR',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }

 limpiarFiltros(): void {
  this.filtroEstado = '';
  this.filtroProfesional = '';
  this.fechaDesde = null;
  this.fechaHasta = null;
}

  crearCita(): void {
    this.router.navigate(['/citas/nueva']);
  }

  puedeCrearCita(): boolean {
    return this.authService.tieneRol(['Cliente']);
  }

  verDetalle(cita: Cita): void {
    this.router.navigate([
      '/citas',
      cita.id,
    ]);
  }
}