import {
  HttpClient,
} from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';

import {
  environment,
} from '../../../environments/environment';

import {
  ApiPaginatedResponse,
  ApiResponse,
} from '../models/api-response.model';

import {
  CrearProfesionalCompletoPayload,
  PerfilProfesional,
  PerfilProfesionalPayload,
  EditarProfesionalCompletoPayload,
} from '../models/perfil-profesional.model';

@Injectable({
  providedIn: 'root',
})
export class PerfilProfesionalService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/perfil-profesional`;

  listar() {
    return this.http.get<
      ApiPaginatedResponse<PerfilProfesional>
    >(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<
      ApiResponse<PerfilProfesional>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  obtenerMio() {
    return this.http.get<ApiResponse<PerfilProfesional>>(
      `${this.apiUrl}/mio`
    );
  }

  crear(data: PerfilProfesionalPayload) {
    return this.http.post<
      ApiResponse<PerfilProfesional>
    >(
      this.apiUrl,
      data
    );
  }

  actualizar(
    id: number,
    data: Partial<PerfilProfesionalPayload>
  ) {
    return this.http.put<
      ApiResponse<PerfilProfesional>
    >(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  cambiarDisponibilidad(
    id: number,
    disponible: boolean
  ) {
    return this.http.patch<
      ApiResponse<PerfilProfesional>
    >(
      `${this.apiUrl}/${id}/disponibilidad`,
      {
        disponible,
      }
    );
  }

  crearCompleto(
    data: CrearProfesionalCompletoPayload,
    imagen?: File | null
  ) {
    const formData = new FormData();

    formData.append(
      'nombre',
      data.nombre
    );

    formData.append(
      'apellidos',
      data.apellidos
    );

    formData.append(
      'correo',
      data.correo
    );

    formData.append(
      'telefono',
      data.telefono ?? ''
    );

    formData.append(
      'password',
      data.password
    );

    formData.append(
      'tituloProfesional',
      data.tituloProfesional
    );

    formData.append(
      'descripcion',
      data.descripcion
    );

    formData.append(
      'aniosExperiencia',
      String(data.aniosExperiencia)
    );

    formData.append(
      'modalidad',
      data.modalidad
    );

    formData.append(
      'ubicacionId',
      String(data.ubicacionId)
    );

    formData.append(
      'tarifaBase',
      String(data.tarifaBase)
    );

    formData.append(
      'disponible',
      String(data.disponible)
    );

    data.especialidadIds.forEach((id) =>
      formData.append('especialidadIds', String(id))
    );

    if (imagen) {
      formData.append(
        'imagen',
        imagen
      );
    }

    return this.http.post<
      ApiResponse<PerfilProfesional>
    >(
      `${this.apiUrl}/completo`,
      formData
    );
  }

  getImageUrl(
  imageName: string | null
): string {
  if (!imageName) {
    return 'assets/images/perfil-default.webp';
  }

  if (
    imageName.startsWith('http://') ||
    imageName.startsWith('https://')
  ) {
    return imageName;
  }

  return `${environment.imageUrl}/perfiles/${imageName}`;
}

actualizarCompleto(
  id: number,
  data: EditarProfesionalCompletoPayload,
  imagen?: File | null
) {
  const formData = new FormData();

  formData.append('nombre', data.nombre);
  formData.append('apellidos', data.apellidos);
  formData.append('correo', data.correo);
  formData.append('telefono', data.telefono ?? '');

  formData.append(
    'tituloProfesional',
    data.tituloProfesional
  );

  formData.append(
    'descripcion',
    data.descripcion
  );

  formData.append(
    'aniosExperiencia',
    String(data.aniosExperiencia)
  );

  formData.append(
    'modalidad',
    data.modalidad
  );

  formData.append(
    'ubicacionId',
    String(data.ubicacionId)
  );

  formData.append(
    'tarifaBase',
    String(data.tarifaBase)
  );

  formData.append(
    'disponible',
    String(data.disponible)
  );

  data.especialidadIds.forEach((especialidadId) =>
    formData.append('especialidadIds', String(especialidadId))
  );

  if (imagen) {
    formData.append('imagen', imagen);
  }

  return this.http.put<ApiResponse<PerfilProfesional>>(
    `${this.apiUrl}/completo/${id}`,
    formData
  );
}
}
