import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Modalidad } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ModalidadService {
  private readonly http = inject(HttpClient);
  private readonly recursoUrl = `${environment.apiUrl}/modalidades`;

  listar(): Observable<Modalidad[]> {
    return this.http
      .get<ApiResponse<Modalidad[]>>(this.recursoUrl)
      .pipe(map((respuesta) => respuesta.data ?? []));
  }
}
