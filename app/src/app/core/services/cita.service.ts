import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ApiPaginatedResponse,
  ApiResponse,
} from '../models/api-response.model';

import {
  Cita,
  DisponibilidadCita,
  CambiarEstadoCitaPayload,
  ClienteCita,
  CrearCitaPayload,
  EstadoCita,
  Modalidad,
  ProfesionalCita,
  ServicioCita,
} from '../models/cita.model';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/citas`;

  listar() {
    return this.http.get<ApiResponse<Cita[]>>(
      this.apiUrl
    );
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Cita>>(
      `${this.apiUrl}/${id}`
    );
  }

  crear(data: CrearCitaPayload) {
    return this.http.post<ApiResponse<Cita>>(
      this.apiUrl,
      data
    );
  }

  cambiarEstado(id: number, data: CambiarEstadoCitaPayload) {
    return this.http.patch<ApiResponse<Cita>>(
      `${this.apiUrl}/${id}/estado`,
      data
    );
  }

  listarEstados() {
    return this.http.get<ApiResponse<EstadoCita[]>>(
      `${this.apiUrl}/estados`
    );
  }

  listarModalidades() {
    return this.http.get<ApiResponse<Modalidad[]>>(
      `${this.apiUrl}/modalidades`
    );
  }

  obtenerDisponibilidad(profesionalId: number, servicioId: number, fecha: string) {
    return this.http.get<ApiResponse<DisponibilidadCita>>(
      `${this.apiUrl}/disponibilidad`,
      { params: { profesionalId, servicioId, fecha } }
    );
  }

  listarClientes() {
    return this.http
      .get<ApiResponse<ClienteCita[]>>(
        `${environment.apiUrl}/usuarios`
      )
      .pipe(
        map((response) =>
          (response.data ?? []).filter(
            (usuario) =>
              usuario.rol?.nombre
                ?.trim()
                .toLowerCase() === 'cliente'
          )
        )
      );
  }

  listarProfesionales() {
    return this.http
      .get<ApiPaginatedResponse<ProfesionalCita>>(
        `${environment.apiUrl}/perfil-profesional`
      )
      .pipe(
        map((response) =>
          (response.data ?? []).filter(
            (profesional) =>
              profesional.disponible
          )
        )
      );
  }
  
 listarServicios() {
  return this.http
    .get<ApiResponse<ServicioCita[]>>(
      `${environment.apiUrl}/servicios`
    )
    .pipe(
      map((response) =>
        (response.data ?? []).filter(
          (servicio) =>
            servicio.estadoServicio.nombre
              .trim()
              .toLowerCase() === 'activo'
        )
      )
    );
}
}
