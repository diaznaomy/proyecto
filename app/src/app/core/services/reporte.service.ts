import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Reportes } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  obtener(
    fechaDesde?: string,
    fechaHasta?: string,
    profesionalId?: number | null,
    especialidadId?: number | null
  ) {
    let params = new HttpParams();
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    if (profesionalId) params = params.set('profesionalId', profesionalId);
    if (especialidadId) params = params.set('especialidadId', especialidadId);
    return this.http.get<ApiResponse<Reportes>>(this.apiUrl, { params });
  }
}
