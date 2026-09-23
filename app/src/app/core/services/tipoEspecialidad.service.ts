import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { TipoEspecialidad } from '../models/tipoEspecialidad.model';

@Injectable({ providedIn: 'root' })
export class TipoEspecialidadService {

  private readonly http = inject(HttpClient);

  private readonly recursoUrl = `${environment.apiUrl}/tipos-especialidad`;


  listar(): Observable<TipoEspecialidad[]> {

    return this.http
      .get<ApiResponse<TipoEspecialidad[]>>(this.recursoUrl)
      .pipe(
        map((respuesta) => respuesta.data ?? [])
      );

  }



  cambiarEstado(id: number): Observable<TipoEspecialidad> {

    return this.http
      .patch<ApiResponse<TipoEspecialidad>>(
        `${this.recursoUrl}/${id}/estado`,
        {}
      )
      .pipe(

        map((respuesta) => {

          if (!respuesta.data) {

            throw new Error(
              'El API no devolvió el tipo de especialidad actualizado'
            );

          }

          return respuesta.data;

        })

      );

  }

}