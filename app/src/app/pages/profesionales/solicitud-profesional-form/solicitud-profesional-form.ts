import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';

import { Especialidad } from '../../../core/models/especialidad.model';
import { Ubicacion } from '../../../core/models/ubicacion.model';
import { CrearSolicitudProfesionalPayload } from '../../../core/models/solicitud-profesional.model';

import { EspecialidadService } from '../../../core/services/especialidad.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { SolicitudProfesionalService } from '../../../core/services/solicitud-profesional.service';

const TAMANO_MAXIMO_PDF = 5 * 1024 * 1024; // 5 MB, igual que el backend.

@Component({
  selector: 'app-solicitud-profesional-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './solicitud-profesional-form.html',
  styleUrl: './solicitud-profesional-form.css',
})
export class SolicitudProfesionalForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly ubicacionService = inject(UbicacionService);
  private readonly solicitudService = inject(SolicitudProfesionalService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  ubicaciones = signal<Ubicacion[]>([]);
  especialidades = signal<Especialidad[]>([]);
  cargandoCatalogos = signal(false);
  enviando = signal(false);

  credencialSeleccionada = signal<File | null>(null);
  errorCredencial = signal<string | null>(null);

  formulario = this.formBuilder.nonNullable.group({
    tituloProfesional: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(150)],
    ],

    descripcion: [
      '',
      [Validators.required, Validators.minLength(10)],
    ],

    aniosExperiencia: [
      0,
      [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
    ],

    ubicacionId: [0, [Validators.required, Validators.min(1)]],

    tarifaBase: [0, [Validators.required, Validators.min(1)]],

    especialidadIds: [[] as number[], [Validators.required, Validators.minLength(1)]],
  });

  constructor() {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);

    this.ubicacionService.listar().subscribe({
      next: (response) => this.ubicaciones.set(response.data ?? []),
      error: (error) => console.error('Error al cargar ubicaciones', error),
    });

    this.especialidadService.listar().subscribe({
      next: (response) => {
        this.especialidades.set(response.data ?? []);
        this.cargandoCatalogos.set(false);
      },
      error: (error) => {
        console.error('Error al cargar especialidades', error);
        this.cargandoCatalogos.set(false);
      },
    });
  }

  obtenerTextoUbicacion(ubicacion: Ubicacion): string {
    return [ubicacion.distrito, ubicacion.canton, ubicacion.provincia]
      .filter(Boolean)
      .join(', ');
  }

  campoInvalido(nombreCampo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[nombreCampo];
    return control.invalid && (control.touched || control.dirty);
  }

  seleccionarCredencial(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.errorCredencial.set(null);

    if (!file) {
      return;
    }

    const esPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!esPdf) {
      this.errorCredencial.set('El archivo debe ser un PDF.');
      input.value = '';
      return;
    }

    if (file.size > TAMANO_MAXIMO_PDF) {
      this.errorCredencial.set('El PDF no puede superar los 5 MB.');
      input.value = '';
      return;
    }

    this.credencialSeleccionada.set(file);
  }

  eliminarCredencial(input: HTMLInputElement): void {
    this.credencialSeleccionada.set(null);
    this.errorCredencial.set(null);
    input.value = '';
  }

  enviar(): void {
    if (this.formulario.invalid || !this.credencialSeleccionada()) {
      this.formulario.markAllAsTouched();

      if (!this.credencialSeleccionada()) {
        this.errorCredencial.set(
          'Debes adjuntar el PDF de tus credenciales profesionales.'
        );
      }

      this.snackBar.open(
        'Revisa los campos obligatorios del formulario.',
        'Cerrar',
        { duration: 4000 }
      );

      return;
    }

    const datos = this.formulario.getRawValue();

    const payload: CrearSolicitudProfesionalPayload = {
      ubicacionId: Number(datos.ubicacionId),
      tituloProfesional: datos.tituloProfesional.trim(),
      descripcion: datos.descripcion.trim(),
      aniosExperiencia: Number(datos.aniosExperiencia),
      tarifaBase: Number(datos.tarifaBase),
      especialidadIds: datos.especialidadIds,
    };

    this.enviando.set(true);

    this.solicitudService
      .crear(payload, this.credencialSeleccionada()!)
      .subscribe({
        next: () => {
          this.snackBar.open(
            'Solicitud enviada. Quedará en revisión por un administrador.',
            'Cerrar',
            { duration: 4000 }
          );

          this.enviando.set(false);
          this.router.navigate(['/profesionales']);
        },

        error: (error) => {
          console.error('Error al enviar la solicitud', error);

          const mensaje =
            error?.error?.message ?? 'No fue posible enviar la solicitud.';

          this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          this.enviando.set(false);
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/profesionales']);
  }
}
