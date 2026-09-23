export interface UsuarioPerfil {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
}

export interface Ubicacion {
  id: number;
  provincia: string;
  canton: string;
  distrito: string;
}

export interface EspecialidadRelacion {
  especialidad: {
    id: number;
    nombre: string;
    descripcion: string | null;
  };
}

export interface PerfilProfesional {
  id: number;
  usuarioId: number;
  ubicacionId: number;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  tarifaBase: string;
  imagenPerfil: string | null;
  disponible: boolean;
  createdAt: string;
  updatedAt: string;
  usuario: UsuarioPerfil;
  ubicacion: Ubicacion;
  especialidades: EspecialidadRelacion[];
  servicios?: unknown[];
}

export interface PerfilProfesionalPayload {
  usuarioId: number;
  ubicacionId: number;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  tarifaBase: number;
  imagenPerfil?: string;
  disponible?: boolean;
  especialidadIds: number[];
}

export type ModalidadProfesional =
  | 'Virtual'
  | 'Presencial';

export interface CrearProfesionalCompletoPayload {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string | null;
  password: string;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  modalidad: ModalidadProfesional;
  ubicacionId: number;
  tarifaBase: number;
  imagenPerfil?: string | null;
  disponible: boolean;
  especialidadIds: number[];
}

export interface EditarProfesionalCompletoPayload {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string | null;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  modalidad: ModalidadProfesional;
  ubicacionId: number;
  tarifaBase: number;
  disponible: boolean;
  especialidadIds: number[];
}
