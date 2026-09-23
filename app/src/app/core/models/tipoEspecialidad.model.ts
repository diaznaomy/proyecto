export interface EstadoTipoEspecialidad {
  id: number;
  nombre: string;
  descripcion: string | null;
}


export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string | null;
}


export interface TipoEspecialidad {
  id: number;
  nombre: string;
  descripcion: string | null;

  estadoTipoEspecialidadId: number;
  estadoTipoEspecialidad: EstadoTipoEspecialidad;

  especialidades: Especialidad[];

  createdAt: string;
  updatedAt: string;
}


export interface TipoEspecialidadCreateDto {
  nombre: string;
  descripcion?: string | null;
  estadoTipoEspecialidadId: number;
}


export interface TipoEspecialidadUpdateDto {
  nombre?: string;
  descripcion?: string | null;
  estadoTipoEspecialidadId?: number;
}