import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { EstadoServicio } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class EstadoServicioService {
  private readonly http = inject(HttpClient);
  private readonly recursoUrl = `${environment.apiUrl}/estados-servicio`;

  listar(): Observable<EstadoServicio[]> {
    return this.http
      .get<ApiResponse<EstadoServicio[]>>(this.recursoUrl)
      .pipe(map((respuesta) => respuesta.data ?? []));
  }
}
