import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Especialidad } from '../../../core/models/especialidad.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { TipoEspecialidad } from '../../../core/models/tipoEspecialidad.model';
import { TipoEspecialidadService } from '../../../core/services/tipoEspecialidad.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  EspecialidadFormDialog,
  ModoEspecialidadDialog,
} from '../especialidad-form-dialog/especialidad-form-dialog';

@Component({
  selector: 'app-especialidad-admin-list',
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
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './especialidad-admin-list.html',
  styleUrl: './especialidad-admin-list.css',
})
export class EspecialidadAdminList {
  private readonly especialidadService = inject(EspecialidadService);
  private readonly tipoEspecialidadService = inject(TipoEspecialidadService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  especialidades = signal<Especialidad[]>([]);
  cargando = signal(false);
  tiposEspecialidad = signal<TipoEspecialidad[]>([]);

  busqueda = '';
  filtroEstado = '';

  columnas = ['nombre', 'estado', 'acciones'];

  constructor() {
    this.cargarEspecialidades();
    this.cargarTiposEspecialidad();
  }

  cargarTiposEspecialidad(): void {
    this.tipoEspecialidadService.listar().subscribe({
      next: (tipos) => this.tiposEspecialidad.set(
        tipos.filter(
          (tipo) => tipo.estadoTipoEspecialidad.nombre.trim().toLowerCase() === 'activa'
        )
      ),
      error: () => this.notification.error('No fue posible cargar las categorías.'),
    });
  }

  cargarEspecialidades(): void {
    this.cargando.set(true);

    this.especialidadService.listar().subscribe({
      next: (response) => {
        this.especialidades.set(response.data);
        this.cargando.set(false);
      },
      error: (error) => {
        this.notification.error(error.error?.message ?? 'No fue posible cargar las especialidades.');
        this.cargando.set(false);
      },
    });
  }

  abrirFormulario(modo: ModoEspecialidadDialog, especialidad?: Especialidad): void {
    const estadoActivo = this.especialidades().find(
      (item) => item.estadoEspecialidad.nombre === 'Activa'
    )?.estadoEspecialidadId;
    if (modo === 'crear' && !estadoActivo) {
      this.notification.error('No se encontró el estado Activa configurado.');
      return;
    }
    if (modo !== 'detalle' && !this.tiposEspecialidad().length) {
      this.notification.warning('Debe existir al menos una categoría activa.');
      return;
    }
    const referencia = this.dialog.open(EspecialidadFormDialog, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'serena-specialty-dialog',
      backdropClass: 'serena-dialog-backdrop',
      disableClose: modo !== 'detalle',
      data: { modo, especialidad, tipos: this.tiposEspecialidad(), estadoActivoId: estadoActivo ?? 0 },
    });
    referencia.afterClosed().subscribe((guardado) => {
      if (!guardado || modo === 'detalle') return;
      this.notification.success(
        modo === 'crear' ? 'Especialidad creada correctamente.' : 'Especialidad actualizada correctamente.'
      );
      this.cargarEspecialidades();
    });
  }

  especialidadesFiltradas(): Especialidad[] {
    return this.especialidades().filter((especialidad) => {
      const coincideNombre = especialidad.nombre
        .toLowerCase()
        .includes(this.busqueda.toLowerCase());

      const coincideEstado =
        !this.filtroEstado ||
        especialidad.estadoEspecialidad.nombre === this.filtroEstado;

      return coincideNombre && coincideEstado;
    });
  }

  cambiarEstado(especialidad: Especialidad): void {
  const accion =
    especialidad.estadoEspecialidad.nombre === 'Activa'
      ? 'desactivar'
      : 'activar';

  const confirmar = window.confirm(
    `¿Desea ${accion} la especialidad ${especialidad.nombre}?`
  );

  if (!confirmar) {
    return;
  }

  this.especialidadService
    .cambiarEstado(especialidad.id)
    .subscribe({
      next: () => {
        this.notification.success(`Especialidad ${accion === 'activar' ? 'activada' : 'desactivada'} correctamente.`);
        this.cargarEspecialidades();
      },
      error: (error) => {
        this.notification.error(error.error?.message ?? 'No fue posible cambiar el estado.');
      },
    });
}
}
