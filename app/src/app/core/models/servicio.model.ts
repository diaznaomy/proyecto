import { Especialidad } from './especialidad.model';
import { PerfilProfesional } from './perfil-profesional.model';

export interface Modalidad {
    id: number;
    nombre: string;
    descripcion: string | null;
}

export interface EstadoServicio {
    id: number;
    nombre: string;
    descripcion: string | null;
}

export interface Servicio {
    id: number;
    perfilProfesionalId: number;
    modalidadId: number;
    estadoServicioId: number;
    nombre: string;
    descripcion: string;
    // Prisma serializa el tipo Decimal como string en el JSON de respuesta.
    precio: string;
    duracionEstimada: number;
    imagenServicio: string | null;
    perfilProfesional: PerfilProfesional;
    modalidad: Modalidad;
    estadoServicio: EstadoServicio;
    // Servicio no tiene categoriaId propio: la "categoria" se deriva del
    // tipoEspecialidad que ya viene anidado dentro de cada especialidad.
    especialidades: Especialidad[];
    createdAt: string;
    updatedAt: string;
}

export interface ServicioCreateDto {
    perfilProfesionalId: number;
    modalidadId: number;
    estadoServicioId: number;
    nombre: string;
    descripcion: string;
    precio: number;
    duracionEstimada: number;
    imagenServicio?: string | null;
    especialidadIds: number[];
}

export interface ServicioUpdateDto {
    perfilProfesionalId?: number;
    modalidadId?: number;
    estadoServicioId?: number;
    nombre?: string;
    descripcion?: string;
    precio?: number;
    duracionEstimada?: number;
    imagenServicio?: string | null;
    especialidadIds?: number[];
}
