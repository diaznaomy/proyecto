export interface EstadoCita {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Modalidad {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface ClienteCita {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  edad: number | null;
  rol?: {
    id: number;
    nombre: string;
  };
}

export interface ProfesionalCita {
  id: number;
  tituloProfesional: string;
  disponible: boolean;

  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string | null;
  };

  ubicacion: {
    id: number;
    provincia: string;
    canton: string;
    distrito: string;
  };
}

export interface ServicioCita {
  id: number;
  perfilProfesionalId: number;
  modalidadId: number;
  estadoServicioId: number;

  nombre: string;
  descripcion: string;
  precio: string;
  duracionEstimada: number;
  imagenServicio: string | null;

  modalidad: Modalidad;

  estadoServicio: {
    id: number;
    nombre: string;
    descripcion: string | null;
  };

  especialidades: {
    id: number;
    tipoEspecialidadId: number;
    estadoEspecialidadId: number;
    nombre: string;
    descripcion: string | null;

    tipoEspecialidad: {
      id: number;
      nombre: string;
      descripcion: string | null;
    };

    estadoEspecialidad: {
      id: number;
      nombre: string;
      descripcion: string | null;
    };
  }[];
}

export interface Cita {
  id: number;
  clienteId: number;
  servicioId: number;
  profesionalId: number;
  estadoCitaId: number;
  modalidadId: number;

  fechaCita: string;
  horaInicio: string;
  horaFin: string;

  comentarioCliente: string | null;
  comentarioProfesional: string | null;
  montoEstimado: string;

  cliente: ClienteCita;
  profesional: ProfesionalCita;
  servicio: ServicioCita;
  estadoCita: EstadoCita;
  modalidad: Modalidad;
  historialEstados: HistorialEstadoCita[];
  resena: {
    id: number;
    puntuacion: number;
    comentario: string | null;
    fechaResena: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}

export interface CrearCitaPayload {
  clienteId: number;
  profesionalId: number;
  servicioId: number;
  modalidadId: number;
  fecha: string;
  hora: string;
  comentario: string;
}

export interface BloqueAgenda {
  hora: string;
  horaFin: string;
  disponible: boolean;
  motivo: string | null;
}

export interface DisponibilidadCita {
  fecha: string;
  duracionEstimada: number;
  modalidad: Modalidad;
  montoEstimado: string;
  jornada: { inicio: string; fin: string; intervaloMinutos: number };
  bloques: BloqueAgenda[];
}

export type EstadoCitaAccion = 'Aceptada' | 'Rechazada' | 'Cancelada' | 'Completada';

export interface HistorialEstadoCita {
  id: number;
  citaId: number;
  estadoAnteriorId: number | null;
  estadoNuevoId: number;
  usuarioId: number;
  comentario: string | null;
  fechaCambio: string;
  estadoAnterior: EstadoCita | null;
  estadoNuevo: EstadoCita;
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    rol: { nombre: string };
  };
}

export interface CambiarEstadoCitaPayload {
  estado: EstadoCitaAccion;
  comentario?: string;
}
