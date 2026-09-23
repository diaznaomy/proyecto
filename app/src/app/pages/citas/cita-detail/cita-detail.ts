import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Cita, EstadoCitaAccion } from '../../../core/models/cita.model';
import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ResenaService } from '../../../core/services/resena.service';

@Component({
  selector: 'app-cita-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './cita-detail.html',
  styleUrl: './cita-detail.css',
})
export class CitaDetail {
  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly citaService =
    inject(CitaService);

  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly resenaService = inject(ResenaService);

  cita = signal<Cita | null>(null);
  cargando = signal(true);
  procesando = signal(false);
  guardandoResena = signal(false);
  puntuacion = signal(0);
  comentarioResena = '';

  constructor() {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.citaService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.cita.set(response.data ?? null);
        this.cargando.set(false);
      },

      error: (error) => {
        console.error(
          'Error al cargar cita',
          error
        );

        this.cargando.set(false);
      },
    });
  }

  nombreCliente(cita: Cita): string {
    return `${cita.cliente.nombre} ${cita.cliente.apellidos}`;
  }

  nombreProfesional(cita: Cita): string {
    return `${cita.profesional.usuario.nombre} ${cita.profesional.usuario.apellidos}`;
  }

  accionesDisponibles(cita: Cita): EstadoCitaAccion[] {
    const rol = this.authService.rol();
    const estado = cita.estadoCita.nombre;
    const usuarioId = this.authService.usuario()?.id;
    const esClienteDuenio = rol === 'Cliente' && usuarioId === cita.clienteId;
    const esProfesionalAsignado =
      rol === 'Profesional' && usuarioId === cita.profesional.usuario.id;

    if (rol === 'Administrador') return [];

    if (estado === 'Pendiente') {
      if (esClienteDuenio) return ['Cancelada'];
      if (esProfesionalAsignado) return ['Aceptada', 'Rechazada'];
    }

    if (estado === 'Aceptada') {
      if (esClienteDuenio) return ['Cancelada'];
      if (esProfesionalAsignado) return ['Completada', 'Cancelada'];
    }

    return [];
  }

  cambiarEstado(estado: EstadoCitaAccion): void {
    const cita = this.cita();
    if (!cita || this.procesando()) return;

    const requiereMotivo = estado === 'Rechazada' || estado === 'Cancelada';
    const comentario = requiereMotivo
      ? window.prompt(`Indique el motivo para marcar la cita como ${estado.toLowerCase()}:`)
      : undefined;

    if (requiereMotivo && comentario === null) return;
    if (requiereMotivo && !comentario?.trim()) {
      this.notification.warning('Debe indicar un motivo para realizar esta acción.');
      return;
    }
    if (!window.confirm(`¿Confirma cambiar la cita a ${estado}?`)) return;

    this.procesando.set(true);
    this.citaService.cambiarEstado(cita.id, {
      estado,
      comentario: comentario?.trim() || undefined,
    }).subscribe({
      next: (response) => {
        if (response.data) this.cita.set(response.data);
        this.procesando.set(false);
        this.notification.success(`La cita ahora está ${estado.toLowerCase()}.`);
      },
      error: (error) => {
        this.procesando.set(false);
        this.notification.error(
          error.error?.message ?? 'No se pudo actualizar el estado de la cita.'
        );
      },
    });
  }

  iconoAccion(estado: EstadoCitaAccion): string {
    return {
      Aceptada: 'check_circle',
      Rechazada: 'cancel',
      Cancelada: 'event_busy',
      Completada: 'task_alt',
    }[estado];
  }

  puedeResenar(cita: Cita): boolean {
    return this.authService.rol() === 'Cliente'
      && this.authService.usuario()?.id === cita.clienteId
      && cita.estadoCita.nombre === 'Completada'
      && !cita.resena;
  }

  seleccionarPuntuacion(valor: number): void {
    this.puntuacion.set(valor);
  }

  enviarResena(): void {
    const cita = this.cita();
    if (!cita || !this.puedeResenar(cita) || this.guardandoResena()) return;
    if (this.puntuacion() < 1 || this.puntuacion() > 5) {
      this.notification.warning('Seleccione una calificación de 1 a 5 estrellas.');
      return;
    }
    if (
      this.comentarioResena.trim().length > 0 &&
      this.comentarioResena.trim().length < 3
    ) {
      this.notification.warning('El comentario debe tener al menos 3 caracteres.');
      return;
    }

    this.guardandoResena.set(true);
    this.resenaService.crear({
      citaId: cita.id,
      puntuacion: this.puntuacion(),
      comentario: this.comentarioResena.trim() || undefined,
    }).subscribe({
      next: (response) => {
        if (response.data) {
          this.cita.update((actual) => actual
            ? { ...actual, resena: response.data! }
            : actual
          );
        }
        this.guardandoResena.set(false);
        this.notification.success('Gracias por compartir su experiencia.');
      },
      error: (error) => {
        this.guardandoResena.set(false);
        this.notification.error(
          error.error?.message ?? 'No se pudo registrar la reseña.'
        );
      },
    });
  }

  volver(): void {
    this.router.navigate(['/citas']);
  }
}
