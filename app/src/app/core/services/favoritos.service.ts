import { inject, Injectable, signal, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly favoritosProfesionales = signal<number[]>([]);
  readonly favoritosServicios = signal<number[]>([]);

  constructor() {
    // Sincronizar favoritos automáticamente al cambiar el usuario autenticado
    effect(() => {
      const user = this.authService.usuario();
      const userId = user ? user.id : 'invitado';
      this.cargarFavoritos(userId);
    });
  }

  private getStorageKey(tipo: 'profesionales' | 'servicios', userId: number | string): string {
    return `serena_fav_${tipo}_${userId}`;
  }

  private cargarFavoritos(userId: number | string): void {
    try {
      const profs = localStorage.getItem(this.getStorageKey('profesionales', userId));
      const servs = localStorage.getItem(this.getStorageKey('servicios', userId));
      this.favoritosProfesionales.set(profs ? JSON.parse(profs) : []);
      this.favoritosServicios.set(servs ? JSON.parse(servs) : []);
    } catch {
      this.favoritosProfesionales.set([]);
      this.favoritosServicios.set([]);
    }
  }

  private guardarEnStorage(tipo: 'profesionales' | 'servicios', lista: number[]): void {
    const user = this.authService.usuario();
    const userId = user ? user.id : 'invitado';
    localStorage.setItem(this.getStorageKey(tipo, userId), JSON.stringify(lista));
  }

  // --- Profesionales ---
  esProfesionalFavorito(id: number): boolean {
    return this.favoritosProfesionales().includes(id);
  }

  toggleProfesionalFavorito(id: number, nombre?: string): boolean {
    const actuales = [...this.favoritosProfesionales()];
    const index = actuales.indexOf(id);
    let agregado = false;

    if (index >= 0) {
      actuales.splice(index, 1);
      this.notification.info(
        nombre ? `${nombre} fue eliminado de tus favoritos.` : 'Eliminado de tus favoritos.'
      );
    } else {
      actuales.push(id);
      agregado = true;
      this.notification.success(
        nombre ? `${nombre} fue agregado a tus favoritos.` : 'Agregado a tus favoritos.'
      );
    }

    this.favoritosProfesionales.set(actuales);
    this.guardarEnStorage('profesionales', actuales);
    return agregado;
  }

  // --- Servicios ---
  esServicioFavorito(id: number): boolean {
    return this.favoritosServicios().includes(id);
  }

  toggleServicioFavorito(id: number, nombre?: string): boolean {
    const actuales = [...this.favoritosServicios()];
    const index = actuales.indexOf(id);
    let agregado = false;

    if (index >= 0) {
      actuales.splice(index, 1);
      this.notification.info(
        nombre ? `"${nombre}" fue eliminado de tus favoritos.` : 'Servicio eliminado de favoritos.'
      );
    } else {
      actuales.push(id);
      agregado = true;
      this.notification.success(
        nombre ? `"${nombre}" fue agregado a tus favoritos.` : 'Servicio agregado a favoritos.'
      );
    }

    this.favoritosServicios.set(actuales);
    this.guardarEnStorage('servicios', actuales);
    return agregado;
  }
}
