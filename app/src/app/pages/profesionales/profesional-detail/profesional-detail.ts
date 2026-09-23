import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional.service';
import { ResumenResenas } from '../../../core/models/resena.model';
import { ResenaService } from '../../../core/services/resena.service';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritosService } from '../../../core/services/favoritos.service';

@Component({
  selector: 'app-profesional-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './profesional-detail.html',
  styleUrl: './profesional-detail.css',
})
export class ProfesionalDetail {
  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly profesionalService =
    inject(PerfilProfesionalService);
  private readonly resenaService = inject(ResenaService);
  private readonly authService = inject(AuthService);
  readonly favoritosService = inject(FavoritosService);

  perfil = signal<PerfilProfesional | null>(null);
  cargando = signal(true);
  resumenResenas = signal<ResumenResenas>({ promedio: 0, total: 0, resenas: [] });

  constructor() {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.profesionalService
      .obtenerPorId(id)
      .subscribe({
        next: (response) => {
          this.perfil.set(response.data ?? null);
          this.cargando.set(false);
        },

        error: () => {
          this.cargando.set(false);
        },
      });

    this.resenaService.listarPorProfesional(id).subscribe({
      next: (response) => {
        if (response.data) this.resumenResenas.set(response.data);
      },
    });
  }

  estrellas(puntuacion: number): number[] {
    return Array.from({ length: 5 }, (_, index) => index < Math.round(puntuacion) ? 1 : 0);
  }

  imagenUrl(perfil: PerfilProfesional): string {
    return this.profesionalService.getImageUrl(
      perfil.imagenPerfil
    );
  }

  esCliente(): boolean {
    return this.authService.tieneRol(['Cliente']);
  }

  modalidad(perfil: PerfilProfesional): string {
    const texto = `
      ${perfil.ubicacion.provincia}
      ${perfil.ubicacion.canton}
      ${perfil.ubicacion.distrito}
    `.toLowerCase();

    return texto.includes('virtual')
      ? 'Virtual'
      : 'Presencial';
  }

  editar(perfil: PerfilProfesional): void {
    if (this.authService.rol() === 'Profesional') {
      this.router.navigate(['/mi-perfil-profesional']);
      return;
    }

    this.router.navigate([
      '/profesionales',
      perfil.id,
      'editar',
    ]);
  }

  puedeEditar(): boolean {
    return this.authService.esAdmin();
  }

  esFavorito(id: number): boolean {
    return this.favoritosService.esProfesionalFavorito(id);
  }

  toggleFavorito(perfil: PerfilProfesional): void {
    const nombre = `${perfil.usuario.nombre} ${perfil.usuario.apellidos}`;
    this.favoritosService.toggleProfesionalFavorito(perfil.id, nombre);
  }

  volver(): void {
    this.router.navigate(['/profesionales']);
  }
}