import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import {
  ApiPaginatedResponse,
  ApiResponse,
} from '../models/api-response.model';
import { Especialidad, EspecialidadPayload } from '../models/especialidad.model';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/especialidad`;

  listar() {
    return this.http.get<ApiPaginatedResponse<Especialidad>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Especialidad>>(`${this.apiUrl}/${id}`);
  }

  crear(data: EspecialidadPayload) {
    return this.http.post<ApiResponse<Especialidad>>(this.apiUrl, data);
  }

  actualizar(id: number, data: EspecialidadPayload) {
    return this.http.put<ApiResponse<Especialidad>>(`${this.apiUrl}/${id}`, data);
  }

 cambiarEstado(id: number) {
  return this.http.patch<ApiResponse<Especialidad>>(
    `${this.apiUrl}/${id}/estado`,
    {}
  );
}
}
