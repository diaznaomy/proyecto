import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, shareReplay, tap } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import {
  ActualizarPerfilDto,
  AutenticacionRespuesta,
  LoginDto,
  RegistroDto,
} from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Nombre de la clave utilizada para guardar y recuperar el JWT desde localStorage.
  private readonly tokenKey = 'serena_token';

  // Almacena internamente el token JWT actual. Su valor inicial se recupera desde localStorage.
  private readonly _token = signal<string | null>(this.leerTokenAlmacenado());
  // Almacena internamente la información del usuario autenticado obtenida desde /auth/perfil.
  private readonly _usuario = signal<Usuario | null>(null);
  // Indica si se está ejecutando una operación de inicio o restauración de sesión.
  private readonly _cargandoSesion = signal<boolean>(false);
  // Indica si Angular ya terminó de comprobar si existe una sesión almacenada.
  private readonly _sesionInicializada = signal<boolean>(false);
  // Guarda temporalmente la solicitud activa a /perfil para evitar peticiones duplicadas.
  private solicitudPerfilActual: Observable<Usuario | null> | null = null;

  // Expone _token sin permitir que los componentes modifiquen directamente su valor.
  readonly token = this._token.asReadonly();
  // Expone la información del usuario autenticado a componentes, Guards e interceptores.
  readonly usuario = this._usuario.asReadonly();
  // Permite mostrar indicadores de carga mientras se procesa la autenticación.
  readonly cargandoSesion = this._cargandoSesion.asReadonly();
  // Permite saber si ya terminó la restauración inicial de la sesión.
  readonly sesionInicializada = this._sesionInicializada.asReadonly();

  // Devuelve true cuando existe un token y el perfil del usuario fue recuperado correctamente.
  readonly autenticado = computed(() => this._token() !== null && this._usuario() !== null);
  // Obtiene el rol (nombre) del usuario autenticado. Devuelve null cuando no existe sesión.
  // Los roles vienen de la tabla Rol del backend (strings), no de un enum fijo.
  readonly rol = computed<string | null>(() => this._usuario()?.rol.nombre ?? null);
  // Comprueba si el rol actual corresponde a "Administrador".
  readonly esAdmin = computed(() => this.rol() === 'Administrador');

  /** Envía las credenciales al API, guarda el JWT, y almacena el usuario autenticado. */
  login(credenciales: LoginDto): Observable<Usuario> {
    this._cargandoSesion.set(true);

    return new Observable<Usuario>((subscriber) => {
      this.http
        .post<ApiResponse<AutenticacionRespuesta>>(`${this.apiUrl}/login`, credenciales)
        .subscribe({
          next: (respuesta) => {
            const datos = respuesta.data;
            if (!datos) {
              this._cargandoSesion.set(false);
              subscriber.error(new Error('El API no devolvió la sesión esperada'));
              return;
            }
            this.guardarToken(datos.token);
            this._usuario.set(datos.usuario);
            this._sesionInicializada.set(true);
            this._cargandoSesion.set(false);
            subscriber.next(datos.usuario);
            subscriber.complete();
          },
          error: (error: HttpErrorResponse) => {
            this._cargandoSesion.set(false);
            subscriber.error(this.obtenerErrorAutenticacion(error));
          },
        });
    });
  }

  /** Envía los datos del nuevo usuario (rol Cliente forzado en el backend) y devuelve el usuario creado. */
  registrar(datos: RegistroDto): Observable<Usuario> {
    this._cargandoSesion.set(true);

    return new Observable<Usuario>((subscriber) => {
      this.http
        .post<ApiResponse<AutenticacionRespuesta>>(`${this.apiUrl}/register`, datos)
        .subscribe({
          next: (respuesta) => {
            const resultado = respuesta.data;
            if (!resultado) {
              this._cargandoSesion.set(false);
              subscriber.error(new Error('El API no devolvió el usuario registrado'));
              return;
            }
            // El registro público también devuelve token: iniciamos sesión
            // automáticamente para no pedirle login otra vez al usuario.
            this.guardarToken(resultado.token);
            this._usuario.set(resultado.usuario);
            this._sesionInicializada.set(true);
            this._cargandoSesion.set(false);
            subscriber.next(resultado.usuario);
            subscriber.complete();
          },
          error: (error: HttpErrorResponse) => {
            this._cargandoSesion.set(false);
            subscriber.error(this.obtenerErrorAutenticacion(error));
          },
        });
    });
  }

  /** Consume GET /auth/perfil y devuelve la información del usuario asociada con el token. */
  obtenerPerfil(): Observable<Usuario> {
    return new Observable<Usuario>((subscriber) => {
      this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/perfil`).subscribe({
        next: (respuesta) => {
          if (!respuesta.data) {
            subscriber.error(new Error('El API no devolvió el perfil'));
            return;
          }
          subscriber.next(respuesta.data);
          subscriber.complete();
        },
        error: (error) => subscriber.error(error),
      });
    });
  }

  /** Envía los cambios permitidos del perfil propio (nombre, apellidos, telefono). */
  actualizarPerfil(datos: ActualizarPerfilDto): Observable<Usuario> {
    return new Observable<Usuario>((subscriber) => {
      this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/perfil`, datos).subscribe({
        next: (respuesta) => {
          if (!respuesta.data) {
            subscriber.error(new Error('El API no devolvió el perfil actualizado'));
            return;
          }
          // Actualiza la interfaz sin recarga manual: el signal ya refleja
          // los nuevos datos en cualquier componente que lo consuma.
          this._usuario.set(respuesta.data);
          subscriber.next(respuesta.data);
          subscriber.complete();
        },
        error: (error) => subscriber.error(error),
      });
    });
  }

  /**
   * Comprueba el token almacenado al iniciar Angular y restaura la sesión
   * cuando corresponde. Se usa en el APP_INITIALIZER y en los guards.
   */
  inicializarSesion(): Observable<Usuario | null> {
    if (this._sesionInicializada()) {
      return of(this._usuario());
    }

    if (!this._token()) {
      this._sesionInicializada.set(true);
      return of(null);
    }

    return this.cargarPerfil();
  }

  /** Recupera el perfil usando el token existente y evita solicitudes simultáneas. */
  cargarPerfil(): Observable<Usuario | null> {
    if (this.solicitudPerfilActual) {
      return this.solicitudPerfilActual;
    }

    this._cargandoSesion.set(true);

    this.solicitudPerfilActual = this.obtenerPerfil().pipe(
      tap((usuario) => {
        this._usuario.set(usuario);
        this._cargandoSesion.set(false);
        this._sesionInicializada.set(true);
      }),
      catchError(() => {
        // Token invalido/expirado o el usuario ya no existe: limpiamos todo.
        this.limpiarSesion();
        this._cargandoSesion.set(false);
        this._sesionInicializada.set(true);
        return of(null);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.solicitudPerfilActual;
  }

  /** Elimina el token, limpia el usuario y redirecciona al Login cuando redirigir es true. */
  logout(redirigir: boolean = true): void {
    this.limpiarSesion();

    if (redirigir) {
      this.router.navigate(['/login']);
    }
  }

  /** Comprueba si el rol del usuario actual se encuentra dentro del arreglo de roles permitidos. */
  tieneRol(rolesPermitidos: string[]): boolean {
    const rolActual = this.rol();
    if (!rolActual) {
      return false;
    }
    return rolesPermitidos.includes(rolActual);
  }

  /** Devuelve el JWT actual. Es utilizado principalmente por el interceptor de autenticación. */
  obtenerToken(): string | null {
    return this._token();
  }

  private guardarToken(token: string): void {
    if (!token) {
      return;
    }
    localStorage.setItem(this.tokenKey, token);
    this._token.set(token);
  }

  private leerTokenAlmacenado(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token && token.trim().length > 0 ? token : null;
  }

  private limpiarSesion(): void {
    localStorage.removeItem(this.tokenKey);
    this._token.set(null);
    this._usuario.set(null);
    this.solicitudPerfilActual = null;
  }

  private obtenerErrorAutenticacion(error: HttpErrorResponse): Error {
    if (error.status === 401) {
      return new Error('Correo o contraseña incorrectos.');
    }
    if (error.status === 403) {
      return new Error('Tu usuario no se encuentra activo.');
    }
    if (error.status === 409) {
      return new Error('Ya existe un usuario registrado con ese correo.');
    }
    if (error.status === 0) {
      return new Error('No se pudo conectar con el servidor. Intenta de nuevo.');
    }
    return new Error(error.error?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.');
  }
}
