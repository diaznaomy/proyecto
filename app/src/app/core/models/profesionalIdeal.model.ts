// core/models/profesionalIdeal.model.ts
// Tipos alineados con las tablas del seed: Ubicacion, Especialidad,
// TipoEspecialidad, Modalidad, Servicio y PerfilProfesional.
// Estos DTOs asumen que el backend ya hace los "join" (nombre de la
// provincia, nombre del tipo de especialidad, nombre de la modalidad),
// que es lo más cómodo de consumir desde el frontend.

export type NombreModalidad = 'Virtual' | 'Presencial' | 'Mixta';

export interface UbicacionDto {
  id: number;
  provincia: string;
  canton: string;
  distrito: string;
}

export interface EspecialidadDto {
  id: number;
  nombre: string; // ej. "Ginecología"
  tipoEspecialidadNombre: string; // ej. "Salud femenina"
}

export interface ServicioDto {
  id: number;
  nombre: string;
  precio: number;
  duracionEstimada: number;
  modalidadNombre: NombreModalidad;
}

export interface PerfilProfesional {
  id: number;
  nombreCompleto: string;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  tarifaBase: number;
  imagenPerfil: string;
  disponible: boolean;
  ubicacion: UbicacionDto;
  especialidades: EspecialidadDto[];
  servicios: ServicioDto[];
}

// Respuestas que llena la paciente en el quiz
export interface QuizRespuestas {
  edad: number | null;
  provinciaPreferida: string; // nombre de provincia o 'Cualquiera'
  modalidadPreferida: NombreModalidad | 'Cualquiera';
  tiposInteres: string[]; // nombres de TipoEspecialidad seleccionados
  presupuestoMax: number | null;
}

// Catálogos estáticos (coinciden con lo sembrado en el seed.ts)
export const PROVINCIAS_CR = ['San José', 'Alajuela', 'Heredia', 'Cartago', 'Puntarenas'];

export const TIPOS_ESPECIALIDAD = [
  'Salud femenina',
  'Bienestar emocional',
  'Nutrición y hábitos saludables',
  'Fertilidad y maternidad',
  'Bienestar integral',
  'Educación femenina',
];