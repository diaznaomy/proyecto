export interface Resena {
  id: number;
  citaId: number;
  clienteId: number;
  profesionalId: number;
  puntuacion: number;
  comentario: string | null;
  fechaResena: string;
  cliente: {
    id: number;
    nombre: string;
    apellidos: string;
  };
  cita: {
    id: number;
    fechaCita: string;
    servicio: { id: number; nombre: string };
  };
}

export interface ResumenResenas {
  promedio: number;
  total: number;
  resenas: Resena[];
}

export interface CrearResenaPayload {
  citaId: number;
  puntuacion: number;
  comentario?: string;
}
