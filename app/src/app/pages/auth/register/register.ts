import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../login/login.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  // El rol NO es un campo del formulario: el backend siempre asigna
  // "Cliente" en /auth/register, no se puede elegir desde aquí.
  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telefono: [''],
  });

  protected registrar(): void {
    if (this.enviando() || this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    const valores = this.formulario.getRawValue();

    this.authService
      .registrar({
        nombre: valores.nombre,
        apellidos: valores.apellidos,
        correo: valores.correo,
        password: valores.password,
        telefono: valores.telefono || null,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.router.navigate(['/perfil']);
        },
        error: (error: Error) => {
          this.enviando.set(false);
          this.error.set(error.message);
        },
      });
  }
}
