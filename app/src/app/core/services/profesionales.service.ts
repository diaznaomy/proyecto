// services/profesionales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PerfilProfesional } from '../models/profesionalIdeal.model';
import { PROFESIONALES_MOCK } from './profesionales-mock';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfesionalesService {

  private readonly apiUrl = `${environment.apiUrl}/perfil-profesional`;

  constructor(private http: HttpClient) {}

  obtenerProfesionalesDisponibles(): Observable<PerfilProfesional[]> {
    return this.http.get<{ success: boolean; meta: any; data: any[] }>(
      this.apiUrl,
      { params: { limit: '1000' } }
    ).pipe(
      map((res) =>
        res.data
          .map((p) => ({
            ...p,
            nombreCompleto: `${p.usuario?.nombre ?? ''} ${p.usuario?.apellidos ?? ''}`.trim(),
          }))
          .filter((p) => p.disponible)
      ),
      catchError((error) => {
        console.warn('No se pudo conectar con la API de profesionales, usando datos de ejemplo.', error);
        return of(PROFESIONALES_MOCK);
      })
    );
  }
}