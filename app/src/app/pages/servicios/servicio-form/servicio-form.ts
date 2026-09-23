import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Especialidad } from '../../../core/models/especialidad.model';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { EstadoServicio, Modalidad } from '../../../core/models/servicio.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { EstadoServicioService } from '../../../core/services/estado-servicio.service';
import { ModalidadService } from '../../../core/services/modalidad.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './servicio-form.html',
  styleUrl: './servicio-form.css',
})
export class ServicioForm {
  private readonly fb = inject(FormBuilder);
  private readonly servicioService = inject(ServicioService);
  private readonly modalidadService = inject(ModalidadService);
  private readonly estadoServicioService = inject(EstadoServicioService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly profesionalService = inject(PerfilProfesionalService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly modalidades = signal<Modalidad[]>([]);
  protected readonly estados = signal<EstadoServicio[]>([]);
  // Solo contiene las especialidades del profesional autenticado (se filtra
  // el catálogo completo contra los ids que trae su perfil).
  protected readonly especialidades = signal<Especialidad[]>([]);
  // Un servicio siempre pertenece al profesional autenticado: no se elige
  // de una lista, se carga una sola vez el perfil propio (/perfil-profesional/mio).
  protected readonly miPerfil = signal<PerfilProfesional | null>(null);
  protected readonly especialidadesSeleccionadas = signal<Set<number>>(new Set());

  protected readonly cargando = signal<boolean>(true);
  protected readonly guardando = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  // Servicio no tiene categoriaId propio: la categoría se deriva de las
  // especialidades elegidas, por eso se valida aparte del FormGroup.
  protected readonly errorEspecialidades = signal<string | null>(null);

  private readonly servicioId = signal<number | null>(null);
  protected readonly esEdicion = computed(() => this.servicioId() !== null);

  // Categorías (TipoEspecialidad) presentes en las especialidades ya
  // elegidas, solo para mostrarle al usuario qué categoría está armando.
  protected readonly categoriasDerivadas = computed<string[]>(() => {
    const seleccionadas = this.especialidadesSeleccionadas();
    const nombres = this.especialidades()
      .filter((especialidad) => seleccionadas.has(especialidad.id))
      .map((especialidad) => especialidad.tipoEspecialidad.nombre);
    return Array.from(new Set(nombres));
  });

  protected readonly formulario = this.fb.nonNullable.group({
    // Se llena automáticamente con el perfil del profesional autenticado y
    // permanece deshabilitado: nunca se elige ni se edita desde el formulario.
    perfilProfesionalId: [{ value: '', disabled: true }, Validators.required],
    modalidadId: ['', Validators.required],
    estadoServicioId: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(1)]],
    descripcion: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    duracionEstimada: [0, [Validators.required, Validators.min(1)]],
    imagenServicio: [''],
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.servicioId.set(Number(idParam));
    }

    this.cargarDatos();
  }

  protected estaSeleccionada(especialidad: Especialidad): boolean {
    return this.especialidadesSeleccionadas().has(especialidad.id);
  }

  protected alternarEspecialidad(especialidad: Especialidad): void {
    this.especialidadesSeleccionadas.update((idsActuales) => {
      const nuevosIds = new Set(idsActuales);
      if (nuevosIds.has(especialidad.id)) {
        nuevosIds.delete(especialidad.id);
      } else {
        nuevosIds.add(especialidad.id);
      }
      return nuevosIds;
    });
    this.errorEspecialidades.set(null);
  }

  protected cancelar(): void {
    this.router.navigate(['/servicios']);
  }

  protected guardar(): void {
    if (this.especialidadesSeleccionadas().size === 0) {
      this.errorEspecialidades.set(
        'La categoría es obligatoria: selecciona al menos una especialidad.',
      );
    }

    if (this.formulario.invalid || this.especialidadesSeleccionadas().size === 0) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const dto = {
      perfilProfesionalId: Number(valores.perfilProfesionalId),
      modalidadId: Number(valores.modalidadId),
      estadoServicioId: Number(valores.estadoServicioId),
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      duracionEstimada: Number(valores.duracionEstimada),
      imagenServicio: valores.imagenServicio || null,
      especialidadIds: Array.from(this.especialidadesSeleccionadas()),
    };

    this.guardando.set(true);
    this.error.set(null);

    const id = this.servicioId();
    const peticion = id
      ? this.servicioService.actualizar(id, dto)
      : this.servicioService.crear(dto);

    peticion.subscribe({
      next: (servicio) => {
        this.guardando.set(false);
        this.router.navigate(['/servicios', servicio.id]);
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar el servicio. Verifica los datos e intenta de nuevo.');
      },
    });
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    // Un servicio solo puede crearse/editarse por el profesional dueño de su
    // propio perfil, por lo que en vez de listar todos los profesionales
    // (como antes) se resuelve únicamente el perfil del usuario autenticado.
    forkJoin({
      modalidades: this.modalidadService.listar(),
      estados: this.estadoServicioService.listar(),
      especialidades: this.especialidadService.listar(),
      miPerfil: this.profesionalService.obtenerMio(),
    }).subscribe({
      next: ({ modalidades, estados, especialidades, miPerfil }) => {
        this.modalidades.set(modalidades);
        this.estados.set(estados);

        const perfil = miPerfil.data ?? null;
        this.miPerfil.set(perfil);

        // El perfil trae sus propias especialidades pero con un tipo más
        // angosto (sin tipoEspecialidad/estadoEspecialidad). Por eso se
        // filtra el catálogo completo (que sí trae el shape completo de
        // Especialidad) contra esos ids, en vez de usar el objeto anidado.
        const idsDelProfesional = new Set(
          (perfil?.especialidades ?? []).map((relacion) => relacion.especialidad.id),
        );

        this.especialidades.set(
          (especialidades.data ?? []).filter((especialidad) =>
            idsDelProfesional.has(especialidad.id),
          ),
        );

        if (perfil) {
          this.formulario.patchValue({
            perfilProfesionalId: String(perfil.id),
          });
        }

        const id = this.servicioId();
        if (id) {
          this.cargarServicio(id);
        } else {
          this.cargando.set(false);
        }
      },
      error: () => {
        this.error.set(
          'No se pudieron cargar los catálogos necesarios para el formulario. Verifica que tengas un perfil profesional activo.',
        );
        this.cargando.set(false);
      },
    });
  }

  private cargarServicio(id: number): void {
    this.servicioService.obtenerPorId(id).subscribe({
      next: (servicio) => {
        // Un profesional solo puede editar sus propios servicios. El backend
        // ya lo rechaza, pero validamos aquí también para no mostrarle el
        // formulario cargado con datos de un servicio ajeno.
        const perfil = this.miPerfil();
        if (perfil && servicio.perfilProfesionalId !== perfil.id) {
          this.notification.error('No puedes editar un servicio que no te pertenece.');
          this.router.navigate(['/servicios']);
          return;
        }

        this.formulario.patchValue({
          perfilProfesionalId: String(servicio.perfilProfesionalId),
          modalidadId: String(servicio.modalidadId),
          estadoServicioId: String(servicio.estadoServicioId),
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          precio: Number(servicio.precio),
          duracionEstimada: servicio.duracionEstimada,
          imagenServicio: servicio.imagenServicio ?? '',
        });

        this.especialidadesSeleccionadas.set(
          new Set(servicio.especialidades.map((especialidad) => especialidad.id)),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el servicio a editar.');
        this.cargando.set(false);
      },
    });
  }
}