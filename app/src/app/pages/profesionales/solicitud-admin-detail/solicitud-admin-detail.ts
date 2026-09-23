import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';

import { SolicitudProfesional } from '../../../core/models/solicitud-profesional.model';
import { SolicitudProfesionalService } from '../../../core/services/solicitud-profesional.service';

@Component({
  selector: 'app-solicitud-admin-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './solicitud-admin-detail.html',
  styleUrl: './solicitud-admin-detail.css',
})
export class SolicitudAdminDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly solicitudService = inject(SolicitudProfesionalService);
  private readonly snackBar = inject(MatSnackBar);

  solicitud = signal<SolicitudProfesional | null>(null);
  cargando = signal(false);
  procesando = signal(false);

  mostrandoFormularioRechazo = signal(false);
  motivoRechazo = '';

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isNaN(id) && id > 0) {
      this.cargarSolicitud(id);
    }
  }

  cargarSolicitud(id: number): void {
    this.cargando.set(true);

    this.solicitudService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.solicitud.set(response.data);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar la solicitud', error);

        this.snackBar.open(
          'No fue posible cargar la solicitud.',
          'Cerrar',
          { duration: 4000 }
        );

        this.cargando.set(false);
        this.router.navigate(['/profesionales/solicitudes']);
      },
    });
  }

  obtenerNombreCompleto(): string {
    const solicitud = this.solicitud();
    if (!solicitud) return '';
    return `${solicitud.usuario.nombre} ${solicitud.usuario.apellidos}`;
  }

  obtenerTextoUbicacion(): string {
    const ubicacion = this.solicitud()?.ubicacion;
    if (!ubicacion) return '';
    return [ubicacion.distrito, ubicacion.canton, ubicacion.provincia]
      .filter(Boolean)
      .join(', ');
  }

  descargarCredencial(): void {
    const solicitud = this.solicitud();
    if (!solicitud) return;

    this.solicitudService.descargarCredencial(solicitud.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      error: (error) => {
        console.error('Error al descargar la credencial', error);

        this.snackBar.open(
          'No fue posible abrir el documento de credenciales.',
          'Cerrar',
          { duration: 4000 }
        );
      },
    });
  }

  aprobar(): void {
    const solicitud = this.solicitud();
    if (!solicitud) return;

    const confirmado = window.confirm(
      `¿Aprobar la solicitud de ${this.obtenerNombreCompleto()}? Se creará su perfil profesional y su rol cambiará a Profesional.`
    );

    if (!confirmado) return;

    this.procesando.set(true);

    this.solicitudService.aprobar(solicitud.id).subscribe({
      next: () => {
        this.snackBar.open(
          'Solicitud aprobada. El usuario ahora es profesional.',
          'Cerrar',
          { duration: 4000 }
        );

        this.procesando.set(false);
        this.router.navigate(['/profesionales/solicitudes']);
      },
      error: (error) => {
        console.error('Error al aprobar la solicitud', error);

        const mensaje =
          error?.error?.message ?? 'No fue posible aprobar la solicitud.';

        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        this.procesando.set(false);
      },
    });
  }

  mostrarFormularioRechazo(): void {
    this.mostrandoFormularioRechazo.set(true);
  }

  cancelarRechazo(): void {
    this.mostrandoFormularioRechazo.set(false);
    this.motivoRechazo = '';
  }

  confirmarRechazo(): void {
    const solicitud = this.solicitud();
    if (!solicitud) return;

    if (this.motivoRechazo.trim().length < 10) {
      this.snackBar.open(
        'El motivo de rechazo debe tener al menos 10 caracteres.',
        'Cerrar',
        { duration: 4000 }
      );
      return;
    }

    this.procesando.set(true);

    this.solicitudService
      .rechazar(solicitud.id, this.motivoRechazo.trim())
      .subscribe({
        next: () => {
          this.snackBar.open('Solicitud rechazada.', 'Cerrar', {
            duration: 4000,
          });

          this.procesando.set(false);
          this.router.navigate(['/profesionales/solicitudes']);
        },
        error: (error) => {
          console.error('Error al rechazar la solicitud', error);

          const mensaje =
            error?.error?.message ?? 'No fue posible rechazar la solicitud.';

          this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          this.procesando.set(false);
        },
      });
  }

  volver(): void {
    this.router.navigate(['/profesionales/solicitudes']);
  }
}
