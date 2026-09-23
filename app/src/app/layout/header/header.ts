import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';
import { NotificacionesBell } from '../../shared/components/notificaciones-bell/notificaciones-bell';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    NotificacionesBell,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // 'protected' para poder leerlo desde el @if del template.
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected verUsuario(): void {
    const usuario = this.authService.usuario();
    if (usuario) {
      this.router.navigate(['/perfil']);
    }
  }

  protected cerrarSesion(): void {
    this.authService.logout(true);
  }
}
