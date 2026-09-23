// core/services/videojuego.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiPaginatedResponse, ApiResponse } from '../models/api-response.model';
import { Usuario } from '../models/usuario.model';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;
  //localhost:3000/usuarios
  listar() {
    return this.http.get<ApiPaginatedResponse<Usuario>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
  }

  getImageUrl(imageName: string): string {
    return `${environment.imageUrl}/${imageName}`;
  }

  cambiarEstado(id: number) {
  return this.http
    .patch<ApiResponse<Usuario>>(`${this.apiUrl}/${id}/estado`, {})
    .pipe(
      map((respuesta) => {
        if (!respuesta.data) {
          throw new Error('El API no devolvió el usuario actualizado');
        }

        return respuesta.data;
      })
    );
}
}