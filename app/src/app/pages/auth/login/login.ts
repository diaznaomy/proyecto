import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected iniciarSesion(): void {
    // Evita doble envío: si ya hay una petición en curso, no se dispara otra.
    if (this.enviando() || this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    this.authService.login(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        if (this.authService.esAdmin()) {
          this.router.navigate(['/usuarios']);
        } else {
          this.router.navigate(['/perfil']);
        }
      },
      error: (error: Error) => {
        this.enviando.set(false);
        this.error.set(error.message);
      },
    });
  }
}
