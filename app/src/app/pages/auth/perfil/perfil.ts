import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);

  protected readonly editando = signal<boolean>(false);
  protected readonly guardando = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly guardadoOk = signal<boolean>(false);

  // Signal de solo lectura con la información real del usuario autenticado.
  protected readonly usuario = this.authService.usuario;
  protected readonly nombreRol = computed(() => this.usuario()?.rol.nombre ?? '');

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    telefono: [''],
  });

  protected activarEdicion(): void {
    const usuarioActual = this.usuario();
    if (!usuarioActual) {
      return;
    }
    this.formulario.setValue({
      nombre: usuarioActual.nombre,
      apellidos: usuarioActual.apellidos,
      telefono: usuarioActual.telefono ?? '',
    });
    this.guardadoOk.set(false);
    this.error.set(null);
    this.editando.set(true);
  }

  protected cancelarEdicion(): void {
    this.editando.set(false);
  }

  protected guardar(): void {
    if (this.guardando() || this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.formulario.getRawValue();

    this.authService
      .actualizarPerfil({
        nombre: valores.nombre,
        apellidos: valores.apellidos,
        telefono: valores.telefono || null,
      })
      .subscribe({
        next: () => {
          // El signal usuario ya se actualizó dentro de AuthService: la
          // vista se refresca sola, sin recargar la página.
          this.guardando.set(false);
          this.editando.set(false);
          this.guardadoOk.set(true);
        },
        error: () => {
          this.guardando.set(false);
          this.error.set('No se pudo actualizar el perfil. Intenta de nuevo.');
        },
      });
  }

  protected cerrarSesion(): void {
    this.authService.logout(true);
  }
}
