import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios-list',
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
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})
export class UsuariosList {
  private readonly usuarioService = inject(UsuarioService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly terminoBusqueda = signal<string>('');
  protected readonly rolSeleccionado = signal<string>('');
  protected readonly actualizandoEstado = signal<Set<number>>(new Set());

  protected readonly columnas = [
  'usuario',
  'rol',
  'estado',
  'fecha',
  'acciones',
];

  // Los roles del filtro salen de los usuarios ya cargados desde el API,
  // nunca de una lista fija en el frontend.
  protected readonly roles = computed<string[]>(() => {
    const nombresRoles = this.usuarios().map((usuario) => usuario.rol.nombre);
    return Array.from(new Set(nombresRoles)).sort((a, b) => a.localeCompare(b));
  });

  protected readonly usuariosFiltrados = computed<Usuario[]>(() => {
    const termino = this.terminoBusqueda().trim().toLowerCase();
    const rol = this.rolSeleccionado();

    return this.usuarios().filter((usuario) => {
      const nombreCompleto = this.nombreCompleto(usuario).toLowerCase();
      const coincideBusqueda =
        termino.length === 0 ||
        nombreCompleto.includes(termino) ||
        usuario.correo.toLowerCase().includes(termino);
      const coincideRol = rol.length === 0 || usuario.rol.nombre === rol;

      return coincideBusqueda && coincideRol;
    });
  });

  constructor() {
    this.cargarUsuarios();
  }

  protected recargar(): void {
    this.cargarUsuarios();
  }

  protected actualizarBusqueda(valor: string): void {
    this.terminoBusqueda.set(valor);
  }

  protected actualizarRol(valor: string): void {
    this.rolSeleccionado.set(valor);
  }

  protected nombreCompleto(usuario: Usuario): string {
    return `${usuario.nombre} ${usuario.apellidos}`;
  }

  protected formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

protected estaActualizando(usuario: Usuario): boolean {
  return this.actualizandoEstado().has(usuario.id);
}

  private cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.usuarioService.listar().subscribe({
      next: (response) => {
        this.usuarios.set(response.data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
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

protected alternarEstado(usuario: Usuario): void {

  if (this.estaActualizando(usuario)) {
    return;
  }

  const activar = usuario.estadoUsuario.nombre !== 'Activo';
  const accion = activar ? 'activar' : 'desactivar';
  const nombre = this.nombreCompleto(usuario);

  const confirmado = confirm(
    `¿Seguro que querés ${accion} a ${nombre}?`
  );

  if (!confirmado) {
    return;
  }

  this.marcarActualizando(usuario.id, true);

  this.usuarioService.cambiarEstado(usuario.id).subscribe({

    next: (usuarioActualizado) => {

      this.usuarios.update(lista =>
        lista.map(u =>
          u.id === usuarioActualizado.id
            ? usuarioActualizado
            : u
        )
      );

      this.marcarActualizando(usuario.id, false);
    },

    error: () => {

      this.error.set('No se pudo actualizar el estado.');

      this.marcarActualizando(usuario.id, false);
    }

  });
}
}