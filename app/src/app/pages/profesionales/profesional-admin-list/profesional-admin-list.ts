import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { SolicitudProfesional } from '../../../core/models/solicitud-profesional.model';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { SolicitudProfesionalService } from '../../../core/services/solicitud-profesional.service';
import { FavoritosService } from '../../../core/services/favoritos.service';

@Component({
  selector: 'app-profesional-admin-list',
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
  ],
  templateUrl: './profesional-admin-list.html',
  styleUrl: './profesional-admin-list.css',
})
export class ProfesionalAdminList {
  readonly authService = inject(AuthService);
  readonly favoritosService = inject(FavoritosService);
  private readonly perfilProfesionalService = inject(
    PerfilProfesionalService
  );

  private readonly solicitudProfesionalService = inject(
    SolicitudProfesionalService
  );

  private readonly router = inject(Router);

  profesionales = signal<PerfilProfesional[]>([]);
  cargando = signal(false);
  soloFavoritos = signal(false);

  // Estado de la solicitud del usuario autenticado (solo aplica a Cliente).
  miSolicitud = signal<SolicitudProfesional | null>(null);
  cargandoMiSolicitud = signal(false);

  busqueda = '';
  filtroDisponibilidad = '';
  filtroModalidad = '';

  columnas = [
    'profesional',
    'modalidad',
    'tarifa',
    'disponibilidad',
    'acciones',
  ];

  constructor() {
    this.cargarProfesionales();

    if (this.esCliente()) {
      this.cargarMiSolicitud();
    }
  }

  cargarMiSolicitud(): void {
    this.cargandoMiSolicitud.set(true);

    this.solicitudProfesionalService.obtenerMia().subscribe({
      next: (response) => {
        this.miSolicitud.set(response.data);
        this.cargandoMiSolicitud.set(false);
      },
      error: (error) => {
        console.error('Error al cargar la solicitud del usuario', error);
        this.cargandoMiSolicitud.set(false);
      },
    });
  }

  cargarProfesionales(): void {
    this.cargando.set(true);

    this.perfilProfesionalService.listar().subscribe({
      next: (response) => {
        this.profesionales.set(response.data);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar profesionales', error);
        this.cargando.set(false);
      },
    });
  }

  profesionalesFiltrados(): PerfilProfesional[] {
  const textoBusqueda = this.busqueda
    .trim()
    .toLowerCase();

  return this.profesionales().filter((perfil) => {
    const nombreCompleto =
      `${perfil.usuario.nombre} ${perfil.usuario.apellidos}`
        .toLowerCase();

    const coincideNombre =
      nombreCompleto.includes(textoBusqueda);

    const modalidad =
      this.obtenerModalidad(perfil).toLowerCase();

    const coincideModalidad =
      !this.filtroModalidad ||
      modalidad === this.filtroModalidad.toLowerCase();

    const coincideDisponibilidad =
      !this.filtroDisponibilidad ||
      (this.filtroDisponibilidad === 'disponible' &&
        perfil.disponible) ||
      (this.filtroDisponibilidad === 'no-disponible' &&
        !perfil.disponible);

    const coincideFavorito =
      !this.soloFavoritos() ||
      this.favoritosService.esProfesionalFavorito(perfil.id);

    return (
      coincideNombre &&
      coincideModalidad &&
      coincideDisponibilidad &&
      coincideFavorito
    );
  });
}

  esFavorito(id: number): boolean {
    return this.favoritosService.esProfesionalFavorito(id);
  }

  toggleFavorito(perfil: PerfilProfesional, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.favoritosService.toggleProfesionalFavorito(
      perfil.id,
      this.obtenerNombreCompleto(perfil)
    );
  }

  toggleSoloFavoritos(): void {
    this.soloFavoritos.set(!this.soloFavoritos());
  }

  totalFavoritos(): number {
    return this.favoritosService.favoritosProfesionales().length;
  }

  obtenerNombreCompleto(perfil: PerfilProfesional): string {
    return `${perfil.usuario.nombre} ${perfil.usuario.apellidos}`;
  }

  obtenerUbicacion(perfil: PerfilProfesional): string {
    return [
      perfil.ubicacion.distrito,
      perfil.ubicacion.canton,
      perfil.ubicacion.provincia,
    ]
      .filter(Boolean)
      .join(', ');
  }

  obtenerIniciales(perfil: PerfilProfesional): string {
    const nombre = perfil.usuario.nombre?.charAt(0) ?? '';
    const apellido = perfil.usuario.apellidos?.charAt(0) ?? '';

    return `${nombre}${apellido}`.toUpperCase();
  }

  cambiarDisponibilidad(perfil: PerfilProfesional): void {
    const nuevaDisponibilidad = !perfil.disponible;

    const accion = nuevaDisponibilidad
      ? 'marcar como disponible'
      : 'marcar como no disponible';

    const confirmar = window.confirm(
      `¿Desea ${accion} a ${this.obtenerNombreCompleto(perfil)}?`
    );

    if (!confirmar) {
      return;
    }

    this.perfilProfesionalService
      .cambiarDisponibilidad(perfil.id, nuevaDisponibilidad)
      .subscribe({
        next: () => {
          this.cargarProfesionales();
        },
        error: (error) => {
          console.error(
            'Error al cambiar la disponibilidad',
            error
          );
        },
      });
  }

  verDetalle(perfil: PerfilProfesional): void {
    this.router.navigate(['/profesionales', perfil.id]);
  }

  editarProfesional(perfil: PerfilProfesional): void {
    this.router.navigate([
      '/profesionales',
      perfil.id,
      'editar',
    ]);
  }

  esModalidadVirtual(perfil: PerfilProfesional): boolean {
  const ubicacionCompleta = `
    ${perfil.ubicacion.provincia ?? ''}
    ${perfil.ubicacion.canton ?? ''}
    ${perfil.ubicacion.distrito ?? ''}
  `
    .trim()
    .toLowerCase();

  return ubicacionCompleta.includes('virtual');
}

obtenerModalidad(perfil: PerfilProfesional): string {
  return this.esModalidadVirtual(perfil)
    ? 'Virtual'
    : 'Presencial';
}

crearProfesional(): void {
  this.router.navigate(['/profesionales/nuevo']);
}

obtenerImagenUrl(
  perfil: PerfilProfesional
): string {
  return this.perfilProfesionalService.getImageUrl(
    perfil.imagenPerfil
  );
}

usarImagenPredeterminada(
  event: Event
): void {
  const imagen =
    event.target as HTMLImageElement;

  imagen.onerror = null;

  imagen.src =
    'assets/images/perfil-default.webp';
}

esAdministrador(): boolean {
  return this.authService.tieneRol(['Administrador']);
}

esCliente(): boolean {
  return this.authService.tieneRol(['Cliente']);
}

// true si el usuario tiene una solicitud actualmente en revisión.
tieneSolicitudPendiente(): boolean {
  return this.miSolicitud()?.estado === 'Pendiente';
}

// true si su última solicitud fue rechazada (puede volver a solicitar).
tieneSolicitudRechazada(): boolean {
  return this.miSolicitud()?.estado === 'Rechazada';
}

solicitarSerProfesional(): void {
  this.router.navigate(['/profesionales/solicitar']);
}

verSolicitudesAdmin(): void {
  this.router.navigate(['/profesionales/solicitudes']);
}
}
