import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Especialidad, EspecialidadPayload } from '../../../core/models/especialidad.model';
import { TipoEspecialidad } from '../../../core/models/tipoEspecialidad.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';

export type ModoEspecialidadDialog = 'crear' | 'editar' | 'detalle';
export interface EspecialidadDialogData {
  modo: ModoEspecialidadDialog;
  especialidad?: Especialidad;
  tipos: TipoEspecialidad[];
  estadoActivoId: number;
}

@Component({
  selector: 'app-especialidad-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './especialidad-form-dialog.html',
  styleUrl: './especialidad-form-dialog.css',
})
export class EspecialidadFormDialog {
  guardando = signal(false);
  error = signal<string | null>(null);
  formulario: FormGroup<{
    nombre: FormControl<string>;
    descripcion: FormControl<string>;
    tipoEspecialidadId: FormControl<number | null>;
  }>;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: EspecialidadDialogData,
    private readonly dialogRef: MatDialogRef<EspecialidadFormDialog>,
    private readonly especialidadService: EspecialidadService
  ) {
    this.formulario = new FormGroup({
      nombre: new FormControl(data.especialidad?.nombre ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
      }),
      descripcion: new FormControl(data.especialidad?.descripcion ?? '', {
        nonNullable: true,
        validators: [Validators.maxLength(255)],
      }),
      tipoEspecialidadId: new FormControl(data.especialidad?.tipoEspecialidadId ?? null, [Validators.required]),
    });
    if (data.modo === 'detalle') this.formulario.disable();
  }

  get esDetalle(): boolean { return this.data.modo === 'detalle'; }
  get titulo(): string {
    return this.data.modo === 'crear' ? 'Nueva especialidad'
      : this.data.modo === 'editar' ? 'Editar especialidad' : 'Detalle de especialidad';
  }

  guardar(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const payload: EspecialidadPayload = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim() || undefined,
      tipoEspecialidadId: Number(valores.tipoEspecialidadId),
      estadoEspecialidadId: this.data.especialidad?.estadoEspecialidadId ?? this.data.estadoActivoId,
    };
    this.guardando.set(true);
    this.error.set(null);
    const solicitud = this.data.modo === 'editar' && this.data.especialidad
      ? this.especialidadService.actualizar(this.data.especialidad.id, payload)
      : this.especialidadService.crear(payload);
    solicitud.subscribe({
      next: (response) => this.dialogRef.close(response.data ?? true),
      error: (error) => {
        this.guardando.set(false);
        this.error.set(error.error?.message ?? 'No fue posible guardar la especialidad.');
      },
    });
  }
}
