import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { Notificacion } from '../../../core/models/notificacion.model';
import { iconoDe, rutaDe } from '../../../core/models/notificacion-config';
import { AuthService } from '../../../core/services/auth.service';
import { CentroNotificacionesService } from '../../../core/services/centro-notificaciones.service';

@Component({
  selector: 'app-notificaciones-bell',
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './notificaciones-bell.html',
  styleUrl: './notificaciones-bell.css',
})
export class NotificacionesBell implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  protected readonly centro = inject(CentroNotificacionesService);
  private readonly router = inject(Router);

  // Consulta la misma referencia de plantilla #menuTrigger para poder
  // cerrar el menú manualmente al navegar desde un click en un item.
  private readonly menuTriggerRef = viewChild<MatMenuTrigger>('menuTrigger');

  protected readonly notificaciones = this.centro.notificaciones;
  protected readonly noLeidas = this.centro.noLeidas;
  protected readonly cargando = this.centro.cargando;

  ngOnInit(): void {
    if (this.authService.autenticado()) {
      this.centro.iniciarPolling();
    }
  }

  ngOnDestroy(): void {
    this.centro.detenerPolling();
  }

  protected iconoDe(n: Notificacion): string {
    return iconoDe(n.tipo);
  }

  protected abrirMenu(): void {
    // Refresca al abrir para que se sienta "en vivo" sin esperar el polling.
    this.centro.cargar();
  }

  protected verNotificacion(n: Notificacion): void {
    if (!n.leida) {
      this.centro.marcarComoLeida(n.id);
    }
    const ruta = rutaDe(n.tipo);
    if (ruta) {
      this.router.navigateByUrl(ruta);
    }
    this.menuTriggerRef()?.closeMenu();
  }

  protected marcarTodasComoLeidas(event: MouseEvent): void {
    event.stopPropagation();
    this.centro.marcarTodasComoLeidas();
  }
}
