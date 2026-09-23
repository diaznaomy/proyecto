import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { SolicitudProfesionalResumen } from '../../../core/models/solicitud-profesional.model';
import { SolicitudProfesionalService } from '../../../core/services/solicitud-profesional.service';

@Component({
  selector: 'app-solicitudes-admin-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './solicitudes-admin-list.html',
  styleUrl: './solicitudes-admin-list.css',
})
export class SolicitudesAdminList {
  private readonly solicitudService = inject(SolicitudProfesionalService);
  private readonly router = inject(Router);

  solicitudes = signal<SolicitudProfesionalResumen[]>([]);
  cargando = signal(false);

  columnas = ['usuario', 'fecha', 'acciones'];

  constructor() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);

    this.solicitudService.listarPendientes().subscribe({
      next: (response) => {
        this.solicitudes.set(response.data);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar solicitudes pendientes', error);
        this.cargando.set(false);
      },
    });
  }

  obtenerNombreCompleto(solicitud: SolicitudProfesionalResumen): string {
    return `${solicitud.usuario.nombre} ${solicitud.usuario.apellidos}`;
  }

  verDetalle(solicitud: SolicitudProfesionalResumen): void {
    this.router.navigate(['/profesionales/solicitudes', solicitud.id]);
  }

  volver(): void {
    this.router.navigate(['/profesionales']);
  }
}
