import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CrearResenaPayload, Resena, ResumenResenas } from '../models/resena.model';

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/resenas`;

  crear(data: CrearResenaPayload) {
    return this.http.post<ApiResponse<Resena>>(this.apiUrl, data);
  }

  listarPorProfesional(profesionalId: number) {
    return this.http.get<ApiResponse<ResumenResenas>>(
      `${this.apiUrl}/profesional/${profesionalId}`
    );
  }
}
