import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Servicio, ServicioCreateDto, ServicioUpdateDto } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly recursoUrl = `${environment.apiUrl}/servicios`;

  listar(): Observable<Servicio[]> {
    return this.http
      .get<ApiResponse<Servicio[]>>(this.recursoUrl)
      .pipe(map((respuesta) => respuesta.data ?? []));
  }

  obtenerPorId(id: number): Observable<Servicio> {
    return this.http
      .get<ApiResponse<Servicio>>(`${this.recursoUrl}/${id}`)
      .pipe(map((respuesta) => this.extraerDatos(respuesta)));
  }

  crear(datos: ServicioCreateDto): Observable<Servicio> {
    return this.http
      .post<ApiResponse<Servicio>>(this.recursoUrl, datos)
      .pipe(map((respuesta) => this.extraerDatos(respuesta)));
  }

  actualizar(id: number, datos: ServicioUpdateDto): Observable<Servicio> {
    return this.http
      .put<ApiResponse<Servicio>>(`${this.recursoUrl}/${id}`, datos)
      .pipe(map((respuesta) => this.extraerDatos(respuesta)));
  }

  cambiarEstado(id: number): Observable<Servicio> {
    return this.http
      .patch<ApiResponse<Servicio>>(`${this.recursoUrl}/${id}/estado`, {})
      .pipe(map((respuesta) => this.extraerDatos(respuesta)));
  }

  private extraerDatos(respuesta: ApiResponse<Servicio>): Servicio {
    if (!respuesta.data) {
      throw new Error('El API no devolvió el servicio esperado');
    }
    return respuesta.data;
  }
}
