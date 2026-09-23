import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

import {
  ApiPaginatedResponse,
  ApiResponse,
} from '../models/api-response.model';

import {
  CrearSolicitudProfesionalPayload,
  SolicitudProfesional,
  SolicitudProfesionalResumen,
} from '../models/solicitud-profesional.model';

@Injectable({
  providedIn: 'root',
})
export class SolicitudProfesionalService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/solicitudes-profesional`;

  crear(
    data: CrearSolicitudProfesionalPayload,
    credencial: File
  ) {
    const formData = new FormData();

    formData.append('ubicacionId', String(data.ubicacionId));
    formData.append('tituloProfesional', data.tituloProfesional);
    formData.append('descripcion', data.descripcion);
    formData.append('aniosExperiencia', String(data.aniosExperiencia));
    formData.append('tarifaBase', String(data.tarifaBase));

    data.especialidadIds.forEach((id) => {
      formData.append('especialidadIds', String(id));
    });

    formData.append('credencial', credencial);

    return this.http.post<ApiResponse<SolicitudProfesional>>(
      this.apiUrl,
      formData
    );
  }

  obtenerMia() {
    return this.http.get<ApiResponse<SolicitudProfesional | null>>(
      `${this.apiUrl}/mia`
    );
  }

  listarPendientes(page = 1, limit = 10) {
    return this.http.get<ApiPaginatedResponse<SolicitudProfesionalResumen>>(
      this.apiUrl,
      { params: { page, limit } }
    );
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<SolicitudProfesional>>(
      `${this.apiUrl}/${id}`
    );
  }

  aprobar(id: number) {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.apiUrl}/${id}/aprobar`,
      {}
    );
  }

  rechazar(id: number, motivoRechazo: string) {
    return this.http.patch<ApiResponse<SolicitudProfesional>>(
      `${this.apiUrl}/${id}/rechazar`,
      { motivoRechazo }
    );
  }

  // El PDF está protegido: no se puede enlazar directo, hay que pedirlo
  // como blob para que el interceptor le agregue el Bearer token.
  descargarCredencial(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/credencial`, {
      responseType: 'blob',
    });
  }
}
