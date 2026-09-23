import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

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

import {
  CrearProfesionalCompletoPayload,
  EditarProfesionalCompletoPayload,
  ModalidadProfesional,
  PerfilProfesional,
} from '../../../core/models/perfil-profesional.model';

import { Ubicacion } from '../../../core/models/ubicacion.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';

@Component({
  selector: 'app-profesional-admin-form',
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
  templateUrl: './profesional-admin-form.html',
  styleUrl: './profesional-admin-form.css',
})
export class ProfesionalAdminForm {
  private readonly formBuilder = inject(FormBuilder);

  private readonly profesionalService = inject(
    PerfilProfesionalService
  );

  private readonly ubicacionService = inject(
    UbicacionService
  );

  private readonly especialidadService = inject(EspecialidadService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  perfilId: number | null = null;

  ubicaciones = signal<Ubicacion[]>([]);
  especialidades = signal<Especialidad[]>([]);
  cargandoUbicaciones = signal(false);
  cargandoEspecialidades = signal(false);
  cargandoPerfil = signal(false);
  guardando = signal(false);
  mostrarPassword = signal(false);
  modoEdicion = signal(false);
  edicionPropia = signal(false);

  imagenSeleccionada = signal<File | null>(null);
  imagenPreview = signal<string | null>(null);
  imagenActual = signal<string | null>(null);
  errorImagen = signal<string | null>(null);

  formulario = this.formBuilder.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
      ],
    ],

    apellidos: [
      '',
      [
        Validators.required,
        Validators.maxLength(150),
      ],
    ],

    correo: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
      ],
    ],

    telefono: [
      '',
      [
        Validators.maxLength(30),
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
      ],
    ],

    tituloProfesional: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150),
      ],
    ],

    descripcion: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
      ],
    ],

    aniosExperiencia: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/),
      ],
    ],

    modalidad: [
      '' as ModalidadProfesional | '',
      Validators.required,
    ],

    ubicacionId: [
      0,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],

    tarifaBase: [
      0,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],

    disponible: [true],

    especialidadIds: [
      [] as number[],
      Validators.required,
    ],
  });

  constructor() {
    this.edicionPropia.set(
      this.route.snapshot.data['perfilPropio'] === true
    );

    const idParametro =
      this.route.snapshot.paramMap.get('id');

    if (idParametro) {
      const id = Number(idParametro);

      if (!Number.isNaN(id) && id > 0) {
        this.perfilId = id;
        this.modoEdicion.set(true);

        this.formulario.controls.password.clearValidators();
        this.formulario.controls.password.disable();
        this.formulario.controls.password.updateValueAndValidity();
      }
    }

    this.cargarUbicaciones();
    this.cargarEspecialidades();

    if (this.perfilId) {
      this.cargarPerfil(this.perfilId);
    } else if (this.edicionPropia()) {
      this.modoEdicion.set(true);
      this.formulario.controls.password.clearValidators();
      this.formulario.controls.password.disable();
      this.formulario.controls.password.updateValueAndValidity();
      this.cargarPerfilPropio();
    }

    this.formulario.controls.modalidad.valueChanges.subscribe(
      (modalidad) => {
        this.actualizarUbicacionPorModalidad(modalidad);
      }
    );
  }

  cargarPerfilPropio(): void {
    this.cargandoPerfil.set(true);
    this.profesionalService.obtenerMio().subscribe({
      next: (response) => {
        const perfil = response.data;
        if (!perfil) {
          this.cargandoPerfil.set(false);
          this.snackBar.open('No se encontró su perfil profesional.', 'Cerrar');
          return;
        }
        this.perfilId = perfil.id;
        this.cargarPerfil(perfil.id);
      },
      error: (error) => {
        this.cargandoPerfil.set(false);
        this.snackBar.open(
          error?.error?.message ?? 'No fue posible cargar su perfil profesional.',
          'Cerrar',
          { duration: 5000 }
        );
      },
    });
  }

  rutaRegreso(): string {
    return this.edicionPropia() ? '/perfil' : '/profesionales';
  }

  cargarEspecialidades(): void {
    this.cargandoEspecialidades.set(true);
    this.especialidadService.listar().subscribe({
      next: (response) => {
        this.especialidades.set(
          (response.data ?? []).filter(
            (item) => item.estadoEspecialidad.nombre.toLowerCase() === 'activa'
          )
        );
        this.cargandoEspecialidades.set(false);
      },
      error: () => {
        this.cargandoEspecialidades.set(false);
        this.snackBar.open('No fue posible cargar las especialidades.', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }

  cargarUbicaciones(): void {
    this.cargandoUbicaciones.set(true);

    this.ubicacionService.listar().subscribe({
      next: (response) => {
        this.ubicaciones.set(response.data ?? []);
        this.cargandoUbicaciones.set(false);

        if (!this.modoEdicion()) {
          const modalidadActual =
            this.formulario.controls.modalidad.value;

          if (modalidadActual) {
            this.actualizarUbicacionPorModalidad(
              modalidadActual
            );
          }
        }
      },

      error: (error) => {
        console.error(
          'Error al cargar ubicaciones',
          error
        );

        this.snackBar.open(
          'No fue posible cargar las ubicaciones.',
          'Cerrar',
          {
            duration: 4000,
          }
        );

        this.cargandoUbicaciones.set(false);
      },
    });
  }

  cargarPerfil(id: number): void {
    this.cargandoPerfil.set(true);

    this.profesionalService.obtenerPorId(id).subscribe({
      next: (response) => {
        const perfil = response.data;

        if (!perfil) {
          this.snackBar.open(
            'No se encontró el profesional.',
            'Cerrar',
            {
              duration: 4000,
            }
          );

          this.router.navigate([this.rutaRegreso()]);
          return;
        }

        const modalidad: ModalidadProfesional =
          this.esUbicacionVirtual(perfil.ubicacion)
            ? 'Virtual'
            : 'Presencial';

        this.formulario.patchValue(
          {
            nombre: perfil.usuario.nombre,
            apellidos: perfil.usuario.apellidos,
            correo: perfil.usuario.correo,
            telefono: perfil.usuario.telefono ?? '',
            tituloProfesional:
              perfil.tituloProfesional,
            descripcion: perfil.descripcion,
            aniosExperiencia:
              perfil.aniosExperiencia,
            modalidad,
            ubicacionId: perfil.ubicacionId,
            tarifaBase: Number(perfil.tarifaBase),
            disponible: perfil.disponible,
            especialidadIds: perfil.especialidades.map(
              (relacion) => relacion.especialidad.id
            ),
          },
          {
            emitEvent: false,
          }
        );

        this.imagenActual.set(
          this.profesionalService.getImageUrl(
            perfil.imagenPerfil
          )
        );

        this.cargandoPerfil.set(false);
      },

      error: (error) => {
        console.error(
          'Error al cargar profesional',
          error
        );

        this.snackBar.open(
          'No fue posible cargar el profesional.',
          'Cerrar',
          {
            duration: 4000,
          }
        );

        this.cargandoPerfil.set(false);
        this.router.navigate([this.rutaRegreso()]);
      },
    });
  }
    ubicacionesPresenciales(): Ubicacion[] {
    return this.ubicaciones().filter(
      (ubicacion) =>
        !this.esUbicacionVirtual(ubicacion)
    );
  }

  obtenerUbicacionVirtual():
    | Ubicacion
    | undefined {
    return this.ubicaciones().find(
      (ubicacion) =>
        this.esUbicacionVirtual(ubicacion)
    );
  }

  esUbicacionVirtual(
    ubicacion: Ubicacion
  ): boolean {
    const texto = `
      ${ubicacion.provincia}
      ${ubicacion.canton}
      ${ubicacion.distrito}
    `.toLowerCase();

    return texto.includes('virtual');
  }

  actualizarUbicacionPorModalidad(
    modalidad: ModalidadProfesional | ''
  ): void {
    const controlUbicacion =
      this.formulario.controls.ubicacionId;

    if (modalidad === 'Virtual') {
      const ubicacionVirtual =
        this.obtenerUbicacionVirtual();

      if (ubicacionVirtual) {
        controlUbicacion.setValue(
          ubicacionVirtual.id
        );
      } else {
        controlUbicacion.setValue(0);

        if (!this.cargandoUbicaciones()) {
          this.snackBar.open(
            'No existe una ubicación Virtual registrada.',
            'Cerrar',
            {
              duration: 4000,
            }
          );
        }
      }

      return;
    }

    if (modalidad === 'Presencial') {
      const ubicacionActual =
        this.ubicaciones().find(
          (ubicacion) =>
            ubicacion.id === controlUbicacion.value
        );

      if (
        !ubicacionActual ||
        this.esUbicacionVirtual(ubicacionActual)
      ) {
        controlUbicacion.setValue(0);
      }

      return;
    }

    controlUbicacion.setValue(0);
  }

  obtenerTextoUbicacion(
    ubicacion: Ubicacion
  ): string {
    return [
      ubicacion.distrito,
      ubicacion.canton,
      ubicacion.provincia,
    ]
      .filter(Boolean)
      .join(', ');
  }

  campoInvalido(
    nombreCampo:
      keyof typeof this.formulario.controls
  ): boolean {
    const control =
      this.formulario.controls[nombreCampo];

    return (
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  seleccionarImagen(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    this.errorImagen.set(null);

    if (!file) {
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!tiposPermitidos.includes(file.type)) {
      this.errorImagen.set(
        'Solo se permiten imágenes JPG, PNG o WEBP.'
      );

      input.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorImagen.set(
        'La imagen no puede superar los 5 MB.'
      );

      input.value = '';
      return;
    }

    this.imagenSeleccionada.set(file);

    const reader = new FileReader();

    reader.onload = () => {
      this.imagenPreview.set(
        reader.result as string
      );
    };

    reader.readAsDataURL(file);
  }

  eliminarImagen(
    input: HTMLInputElement
  ): void {
    this.imagenSeleccionada.set(null);
    this.imagenPreview.set(null);
    this.errorImagen.set(null);

    input.value = '';
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();

      this.snackBar.open(
        'Revise los campos obligatorios del formulario.',
        'Cerrar',
        {
          duration: 4000,
        }
      );

      return;
    }

    const datos =
      this.formulario.getRawValue();

    this.guardando.set(true);

    if (this.modoEdicion() && this.perfilId) {
      const payloadEdicion:
        EditarProfesionalCompletoPayload = {
        nombre: datos.nombre.trim(),
        apellidos: datos.apellidos.trim(),

        correo: datos.correo
          .trim()
          .toLowerCase(),

        telefono:
          datos.telefono.trim() || null,

        tituloProfesional:
          datos.tituloProfesional.trim(),

        descripcion:
          datos.descripcion.trim(),

        aniosExperiencia:
          Number(datos.aniosExperiencia),

        modalidad:
          datos.modalidad as ModalidadProfesional,

        ubicacionId:
          Number(datos.ubicacionId),

        tarifaBase:
          Number(datos.tarifaBase),

        disponible:
          datos.disponible,

        especialidadIds: datos.especialidadIds.map(Number),
      };

      this.actualizarProfesional(
        this.perfilId,
        payloadEdicion
      );

      return;
    }

    const payloadCreacion:
      CrearProfesionalCompletoPayload = {
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),

      correo: datos.correo
        .trim()
        .toLowerCase(),

      telefono:
        datos.telefono.trim() || null,

      password: datos.password,

      tituloProfesional:
        datos.tituloProfesional.trim(),

      descripcion:
        datos.descripcion.trim(),

      aniosExperiencia:
        Number(datos.aniosExperiencia),

      modalidad:
        datos.modalidad as ModalidadProfesional,

      ubicacionId:
        Number(datos.ubicacionId),

      tarifaBase:
        Number(datos.tarifaBase),

      disponible:
        datos.disponible,

      especialidadIds: datos.especialidadIds.map(Number),
    };

    this.crearProfesional(payloadCreacion);
  }

  private crearProfesional(
    payload: CrearProfesionalCompletoPayload
  ): void {
    this.profesionalService
      .crearCompleto(
        payload,
        this.imagenSeleccionada()
      )
      .subscribe({
        next: () => {
          this.snackBar.open(
            'Profesional creado correctamente.',
            'Cerrar',
            {
              duration: 3500,
            }
          );

          this.guardando.set(false);
          this.router.navigate([this.rutaRegreso()]);
        },

        error: (error) => {
          console.error(
            'Error al crear profesional',
            error
          );

          const mensaje =
            error?.error?.message ??
            'No fue posible crear el profesional.';

          this.snackBar.open(
            mensaje,
            'Cerrar',
            {
              duration: 5000,
            }
          );

          this.guardando.set(false);
        },
      });
  }

  private actualizarProfesional(
    id: number,
    payload: EditarProfesionalCompletoPayload
  ): void {
    this.profesionalService
      .actualizarCompleto(
        id,
        payload,
        this.imagenSeleccionada()
      )
      .subscribe({
        next: () => {
          this.snackBar.open(
            'Profesional actualizado correctamente.',
            'Cerrar',
            {
              duration: 3500,
            }
          );

          this.guardando.set(false);
          this.router.navigate(['/profesionales']);
        },

        error: (error) => {
          console.error(
            'Error al actualizar profesional',
            error
          );

          const mensaje =
            error?.error?.message ??
            'No fue posible actualizar el profesional.';

          this.snackBar.open(
            mensaje,
            'Cerrar',
            {
              duration: 5000,
            }
          );

          this.guardando.set(false);
        },
      });
  }

  cancelar(): void {
    this.router.navigate([this.rutaRegreso()]);
  }

  alternarPassword(): void {
    this.mostrarPassword.update(
      (valor) => !valor
    );
  }
}
