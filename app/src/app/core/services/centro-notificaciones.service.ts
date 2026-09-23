import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notificacion, RolNotificacion } from '../models/notificacion.model';
import { filtrarPorRol } from '../models/notificacion-config';
import { AuthService } from './auth.service';

/**
 * Estado del centro de notificaciones (la campanita del header).
 *
 * NOTA: el backend actual (Express + Prisma) todavía no expone
 * `/notificaciones`. Este servicio ya queda listo para consumirlo en
 * cuanto exista; mientras tanto, `cargar()` falla en silencio y la
 * campanita simplemente muestra "sin notificaciones" en vez de romper la
 * UI. Ver README-notificaciones.md para el contrato de API sugerido.
 */
@Injectable({ providedIn: 'root' })
export class CentroNotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = `${environment.apiUrl}/notificaciones`;

  private readonly _notificaciones = signal<Notificacion[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private intervaloPolling?: ReturnType<typeof setInterval>;

  /** Ya filtradas por el rol del usuario autenticado y ordenadas por fecha. */
  readonly notificaciones = computed(() => {
    const rol = (this.authService.rol() as RolNotificacion | null) ?? null;
    return filtrarPorRol(this._notificaciones(), rol).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  readonly noLeidas = computed(() => this.notificaciones().filter((n) => !n.leida).length);
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  /** Carga el histórico de notificaciones del usuario autenticado. */
  cargar(): void {
    if (!this.authService.autenticado()) return;

    this._cargando.set(true);
    this._error.set(null);

    this.http
      .get<ApiResponse<Notificacion[]>>(this.apiUrl)
      .pipe(
        tap((respuesta) => {
          this._notificaciones.set(respuesta.data ?? []);
          this._cargando.set(false);
        }),
        catchError(() => {
          // El endpoint puede no existir todavía; no rompemos la UI por eso.
          this._cargando.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Refresca cada `intervaloMs` mientras haya sesión activa. Simple y
   * suficiente para este proyecto; si más adelante se agrega un socket en
   * el backend, este método se reemplaza por una suscripción push sin
   * tocar el resto del servicio ni el componente de la campanita.
   */
  iniciarPolling(intervaloMs = 30000): void {
    this.detenerPolling();
    this.cargar();
    this.intervaloPolling = setInterval(() => this.cargar(), intervaloMs);
  }

  detenerPolling(): void {
    if (this.intervaloPolling) {
      clearInterval(this.intervaloPolling);
      this.intervaloPolling = undefined;
    }
  }

  marcarComoLeida(id: number): void {
    const anterior = this._notificaciones();
    this._notificaciones.set(
      anterior.map((n) =>
        n.id === id ? { ...n, leida: true, leidaEn: new Date().toISOString() } : n
      )
    );

    this.http
      .patch(`${this.apiUrl}/${id}/leer`, {})
      .pipe(catchError(() => {
        this._notificaciones.set(anterior); // revertimos si falla
        return of(null);
      }))
      .subscribe();
  }

  marcarTodasComoLeidas(): void {
    const anterior = this._notificaciones();
    const ahora = new Date().toISOString();
    this._notificaciones.set(
      anterior.map((n) => ({ ...n, leida: true, leidaEn: n.leidaEn ?? ahora }))
    );

    this.http
      .patch(`${this.apiUrl}/leer-todas`, {})
      .pipe(catchError(() => {
        this._notificaciones.set(anterior);
        return of(null);
      }))
      .subscribe();
  }

  /** Limpia el estado en memoria al cerrar sesión. */
  reiniciar(): void {
    this.detenerPolling();
    this._notificaciones.set([]);
  }
}
