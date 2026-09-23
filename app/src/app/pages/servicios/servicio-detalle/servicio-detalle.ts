import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { Servicio } from '../../../core/models/servicio.model';
import { ServicioService } from '../../../core/services/servicio.service';

@Component({
  selector: 'app-servicio-detalle',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './servicio-detalle.html',
  styleUrl: './servicio-detalle.css',
})
export class ServicioDetalle {
  private readonly servicioService = inject(ServicioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly servicio = signal<Servicio | null>(null);
  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id)) {
      this.error.set('Identificador de servicio inválido.');
      this.cargando.set(false);
      return;
    }

    this.cargarServicio(id);
  }

  protected nombreProfesional(servicio: Servicio): string {
    const usuario = servicio.perfilProfesional.usuario;
    return `${usuario.nombre} ${usuario.apellidos}`;
  }

  // Servicio no tiene categoriaId propio: se deriva del tipoEspecialidad
  // de cada especialidad asociada.
  protected categorias(servicio: Servicio): string[] {
    const nombres = servicio.especialidades.map(
      (especialidad) => especialidad.tipoEspecialidad.nombre
    );
    return Array.from(new Set(nombres));
  }

  protected formatearPrecio(precio: string): string {
    return Number(precio).toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0,
    });
  }

  protected irAEditar(): void {
    const servicio = this.servicio();
    if (servicio) {
      this.router.navigate(['/servicios', servicio.id, 'editar']);
    }
  }

  protected volver(): void {
    this.router.navigate(['/servicios']);
  }

  private cargarServicio(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.servicioService.obtenerPorId(id).subscribe({
      next: (servicio) => {
        this.servicio.set(servicio);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el servicio.');
        this.cargando.set(false);
      },
    });
  }
}
