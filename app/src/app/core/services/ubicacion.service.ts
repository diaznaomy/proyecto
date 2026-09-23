import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Ubicacion } from '../models/ubicacion.model';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/ubicaciones`;

  listar() {
    return this.http.get<ApiResponse<Ubicacion[]>>(
      this.apiUrl
    );
  }
}