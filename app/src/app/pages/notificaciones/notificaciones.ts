import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Notificacion } from '../../core/models/notificacion.model';
import { iconoDe, rutaDe } from '../../core/models/notificacion-config';
import { CentroNotificacionesService } from '../../core/services/centro-notificaciones.service';

type Filtro = 'todas' | 'no-leidas';

@Component({
  selector: 'app-notificaciones',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatButtonToggleModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class Notificaciones implements OnInit {
  private readonly centro = inject(CentroNotificacionesService);
  private readonly router = inject(Router);

  protected readonly filtro = signal<Filtro>('todas');
  protected readonly cargando = this.centro.cargando;
  protected readonly noLeidas = this.centro.noLeidas;

  protected readonly notificaciones = computed(() => {
    const todas = this.centro.notificaciones();
    return this.filtro() === 'no-leidas' ? todas.filter((n) => !n.leida) : todas;
  });

  ngOnInit(): void {
    this.centro.cargar();
  }

  protected cambiarFiltro(valor: Filtro): void {
    this.filtro.set(valor);
  }

  protected iconoDe(n: Notificacion): string {
    return iconoDe(n.tipo);
  }

  protected marcarTodasComoLeidas(): void {
    this.centro.marcarTodasComoLeidas();
  }

  protected abrir(n: Notificacion): void {
    if (!n.leida) {
      this.centro.marcarComoLeida(n.id);
    }
    const ruta = rutaDe(n.tipo);
    if (ruta) {
      this.router.navigateByUrl(ruta);
    }
  }
}
