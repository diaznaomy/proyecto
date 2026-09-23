export interface TipoEspecialidad {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface EstadoEspecialidad {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Especialidad {
  id: number;
  tipoEspecialidadId: number;
  estadoEspecialidadId: number;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
  tipoEspecialidad: TipoEspecialidad;
  estadoEspecialidad: EstadoEspecialidad;
}

export interface EspecialidadPayload {
  nombre: string;
  descripcion?: string;
  tipoEspecialidadId: number;
  estadoEspecialidadId: number;
}