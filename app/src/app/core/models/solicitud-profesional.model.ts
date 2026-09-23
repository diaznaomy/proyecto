import { Ubicacion } from './perfil-profesional.model';

export type EstadoSolicitudProfesional =
  | 'Pendiente'
  | 'Aprobada'
  | 'Rechazada';

export interface UsuarioSolicitante {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  fechaRegistro?: string;
}

export interface UsuarioResolutor {
  id: number;
  nombre: string;
  apellidos: string;
}

export interface EspecialidadSolicitudRelacion {
  especialidad: {
    id: number;
    nombre: string;
    descripcion: string | null;
  };
}

// Vista resumida: la que trae el listado de pendientes para el admin.
export interface SolicitudProfesionalResumen {
  id: number;
  estado: EstadoSolicitudProfesional;
  fechaSolicitud: string;
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
  };
}

// Vista completa: detalle + "mi solicitud".
export interface SolicitudProfesional {
  id: number;
  estado: EstadoSolicitudProfesional;
  usuarioId: number;
  ubicacionId: number;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  tarifaBase: string;
  credencialArchivo: string;
  credencialNombreOriginal: string | null;
  fechaSolicitud: string;
  fechaResolucion: string | null;
  resueltoPorId: number | null;
  motivoRechazo: string | null;
  usuario: UsuarioSolicitante;
  ubicacion: Ubicacion;
  especialidades: EspecialidadSolicitudRelacion[];
  resueltoPor: UsuarioResolutor | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearSolicitudProfesionalPayload {
  ubicacionId: number;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  tarifaBase: number;
  especialidadIds: number[];
}
