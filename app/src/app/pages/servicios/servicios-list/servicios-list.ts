import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { Modalidad, Servicio } from '../../../core/models/servicio.model';
import { TipoEspecialidad } from '../../../core/models/tipoEspecialidad.model';
import { ModalidadService } from '../../../core/services/modalidad.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { TipoEspecialidadService } from '../../../core/services/tipoEspecialidad.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { FavoritosService } from '../../../core/services/favoritos.service';

import { PdfService } from '../../../services/pdf.servicios';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './servicios-list.html',
  styleUrl: './servicios-list.css',
})
export class ServiciosList {
  private readonly servicioService = inject(ServicioService);
  private readonly tipoEspecialidadService = inject(TipoEspecialidadService);
  private readonly modalidadService = inject(ModalidadService);
  private readonly router = inject(Router);
  private readonly pdfService = inject(PdfService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly profesionalService = inject(PerfilProfesionalService);
  readonly favoritosService = inject(FavoritosService);

  protected readonly servicios = signal<Servicio[]>([]);
  // Servicio no tiene categoriaId propio: "categoría" = TipoEspecialidad de
  // sus especialidades. El catálogo del filtro sale de /tipos-especialidad.
  protected readonly categorias = signal<TipoEspecialidad[]>([]);
  protected readonly modalidades = signal<Modalidad[]>([]);

  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly soloFavoritos = signal<boolean>(false);

  protected readonly terminoBusqueda = signal<string>('');
  protected readonly categoriaSeleccionada = signal<string>('');
  protected readonly modalidadSeleccionada = signal<string>('');
  protected readonly precioMinimo = signal<number | null>(null);
  protected readonly precioMaximo = signal<number | null>(null);

  protected readonly actualizandoEstado = signal<Set<number>>(new Set());

  columnas = [
  'servicio',
  'categoria',
  'precio',
  'modalidad',
  'estado',
  'acciones',
];

  protected readonly serviciosFiltrados = computed<Servicio[]>(() => {
    const termino = this.terminoBusqueda().trim().toLowerCase();
    const categoriaId = this.categoriaSeleccionada();
    const modalidadId = this.modalidadSeleccionada();
    const min = this.precioMinimo();
    const max = this.precioMaximo();

    return this.servicios().filter((servicio) => {
      const coincideBusqueda =
        termino.length === 0 || servicio.nombre.toLowerCase().includes(termino);
      const coincideCategoria =
        categoriaId.length === 0 ||
        servicio.especialidades.some(
          (especialidad) => String(especialidad.tipoEspecialidad.id) === categoriaId
        );
      const coincideModalidad =
        modalidadId.length === 0 || String(servicio.modalidadId) === modalidadId;

      const precio = Number(servicio.precio);
      const coincidePrecioMin = min === null || precio >= min;
      const coincidePrecioMax = max === null || precio <= max;

      const coincideFavorito =
        !this.soloFavoritos() || this.favoritosService.esServicioFavorito(servicio.id);

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideModalidad &&
        coincidePrecioMin &&
        coincidePrecioMax &&
        coincideFavorito
      );
    });
  });

  protected esFavorito(id: number): boolean {
    return this.favoritosService.esServicioFavorito(id);
  }

  protected toggleFavorito(servicio: Servicio, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.favoritosService.toggleServicioFavorito(servicio.id, servicio.nombre);
  }

  protected toggleSoloFavoritos(): void {
    this.soloFavoritos.set(!this.soloFavoritos());
  }

  protected totalFavoritos(): number {
    return this.favoritosService.favoritosServicios().length;
  }

  constructor() {
    this.cargarDatos();
  }

  protected recargar(): void {
    this.cargarDatos();
  }

  protected actualizarBusqueda(valor: string): void {
    this.terminoBusqueda.set(valor);
  }

protected actualizarCategoria(valor: string | number): void {
  this.categoriaSeleccionada.set(String(valor));
}

protected actualizarModalidad(valor: string | number): void {
  this.modalidadSeleccionada.set(String(valor));
}

protected compararPorValor(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}

  protected actualizarPrecioMinimo(valor: string): void {
    this.precioMinimo.set(valor.trim().length === 0 ? null : Number(valor));
  }

  protected actualizarPrecioMaximo(valor: string): void {
    this.precioMaximo.set(valor.trim().length === 0 ? null : Number(valor));
  }

  protected nombreProfesional(servicio: Servicio): string {
    const usuario = servicio.perfilProfesional.usuario;
    return `${usuario.nombre} ${usuario.apellidos}`;
  }

  // Nombres de categoría únicos derivados de las especialidades del
  // servicio, para pintarlos en la columna "Categoría" del listado.
  protected nombresCategorias(servicio: Servicio): string {
    const nombres = servicio.especialidades.map(
      (especialidad) => especialidad.tipoEspecialidad.nombre
    );
    const unicos = Array.from(new Set(nombres));
    return unicos.length > 0 ? unicos.join(', ') : '—';
  }

  protected formatearPrecio(precio: string): string {
    return Number(precio).toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0,
    });
  }

  protected estaActualizando(servicio: Servicio): boolean {
    return this.actualizandoEstado().has(servicio.id);
  }

  protected alternarEstado(servicio: Servicio): void {
    if (this.estaActualizando(servicio)) {
      return;
    }

    const estaActivo = servicio.estadoServicio.nombre === 'Activo';
    const accion = estaActivo ? 'desactivar' : 'activar';

    const confirmar = window.confirm(
      `¿Desea ${accion} el servicio "${servicio.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.marcarActualizando(servicio.id, true);

    this.servicioService.cambiarEstado(servicio.id).subscribe({
      next: (servicioActualizado) => {
        this.servicios.update((lista) =>
          lista.map((s) => (s.id === servicioActualizado.id ? servicioActualizado : s))
        );
        this.marcarActualizando(servicio.id, false);
        this.notification.success(
          `Servicio ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente.`
        );
      },
      error: (error) => {
        this.notification.error(
          error?.error?.message ?? 'No se pudo actualizar el estado del servicio. Intenta de nuevo.'
        );
        this.marcarActualizando(servicio.id, false);
      },
    });
  }

  protected irADetalle(servicio: Servicio): void {
    this.router.navigate(['/servicios', servicio.id]);
  }

  protected irAEditar(servicio: Servicio): void {
    this.router.navigate(['/servicios', servicio.id, 'editar']);
  }

  protected irACrear(): void {
    this.router.navigate(['/servicios', 'nuevo']);
  }

  protected esCliente(): boolean {
  return this.authService.tieneRol(['Cliente']);
}

  // Solo un Profesional autenticado puede crear servicios, y siempre quedan
  // asociados a su propio perfil (ver servicio-form).
  protected readonly puedeCrear = computed(() => this.authService.rol() === 'Profesional');

  protected exportarPDF(): void { 
  this.pdfService.generarReporteServicios(this.serviciosFiltrados());
}

  private marcarActualizando(id: number, enProceso: boolean): void {
    this.actualizandoEstado.update((idsActuales) => {
      const nuevosIds = new Set(idsActuales);
      if (enProceso) {
        nuevosIds.add(id);
      } else {
        nuevosIds.delete(id);
      }
      return nuevosIds;
    });
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    // Un profesional autenticado solo debe ver (y por lo tanto solo puede
    // editar/activar/desactivar) los servicios asociados a su propio perfil.
    // El resto de roles (Administrador, Cliente o visitante anónimo) sigue
    // viendo el catálogo completo, como corresponde a un listado público.
    if (this.authService.rol() === 'Profesional') {
      this.profesionalService.obtenerMio().subscribe({
        next: (respuesta) => {
          const miPerfilId = respuesta.data?.id ?? null;

          this.servicioService.listar().subscribe({
            next: (servicios) => {
              this.servicios.set(
                miPerfilId === null
                  ? []
                  : servicios.filter((servicio) => servicio.perfilProfesionalId === miPerfilId),
              );
              this.cargando.set(false);
            },
            error: () => {
              this.error.set('No se pudieron cargar los servicios. Intenta de nuevo.');
              this.cargando.set(false);
            },
          });
        },
        error: () => {
          this.error.set('No se pudo cargar tu perfil profesional.');
          this.cargando.set(false);
        },
      });
    } else {
      this.servicioService.listar().subscribe({
        next: (servicios) => {
          this.servicios.set(servicios);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los servicios. Intenta de nuevo.');
          this.cargando.set(false);
        },
      });
    }

    // Las opciones de los filtros vienen de los catálogos reales del API,
    // no de una lista fija en el frontend.
    this.tipoEspecialidadService.listar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
    });

    this.modalidadService.listar().subscribe({
      next: (modalidades) => this.modalidades.set(modalidades),
    });
  }
}