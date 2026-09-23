// profesionales-mock.ts
// Datos de ejemplo tomados directamente de tu seed.ts (Sofía, Valeria,
// Camila, Andrea, María, Gabriela, Fernanda, Paola, Karen, Silvia).
// Úsalos para probar el quiz mientras conectas el endpoint real;
// ProfesionalesService cae automáticamente a este mock si la API falla.

import { PerfilProfesional } from '../models/profesionalIdeal.model';

export const PROFESIONALES_MOCK: PerfilProfesional[] = [
  {
    id: 1,
    nombreCompleto: 'Sofía Ramírez',
    tituloProfesional: 'Médica Especialista en Ginecología',
    descripcion: 'Especialista en salud integral femenina, prevención y control ginecológico.',
    aniosExperiencia: 10,
    tarifaBase: 35000,
    imagenPerfil: 'sofia.jpg',
    disponible: true,
    ubicacion: { id: 1, provincia: 'San José', canton: 'Central', distrito: 'Carmen' },
    especialidades: [
      { id: 1, nombre: 'Ginecología', tipoEspecialidadNombre: 'Salud femenina' },
      { id: 2, nombre: 'Obstetricia', tipoEspecialidadNombre: 'Salud femenina' },
    ],
    servicios: [
      { id: 1, nombre: 'Consulta ginecológica general', precio: 35000, duracionEstimada: 60, modalidadNombre: 'Presencial' },
      { id: 2, nombre: 'Control de síndrome de ovario poliquístico', precio: 40000, duracionEstimada: 60, modalidadNombre: 'Virtual' },
      { id: 3, nombre: 'Control prenatal', precio: 45000, duracionEstimada: 60, modalidadNombre: 'Presencial' },
      { id: 16, nombre: 'Colposcopia diagnóstica', precio: 38000, duracionEstimada: 45, modalidadNombre: 'Presencial' },
    ],
  },
  {
    id: 2,
    nombreCompleto: 'Valeria Mora',
    tituloProfesional: 'Licenciada en Nutrición',
    descripcion: 'Nutricionista enfocada en salud hormonal, SOP y alimentación consciente.',
    aniosExperiencia: 7,
    tarifaBase: 30000,
    imagenPerfil: 'valeria.jpg',
    disponible: true,
    ubicacion: { id: 6, provincia: 'Virtual', canton: 'Virtual', distrito: 'Virtual' },
    especialidades: [
      { id: 4, nombre: 'Nutrición', tipoEspecialidadNombre: 'Bienestar integral' },
    ],
    servicios: [
      { id: 4, nombre: 'Plan nutricional para SOP', precio: 30000, duracionEstimada: 60, modalidadNombre: 'Virtual' },
      { id: 5, nombre: 'Nutrición para fertilidad', precio: 32000, duracionEstimada: 60, modalidadNombre: 'Mixta' },
      { id: 19, nombre: 'Nutrición deportiva femenina', precio: 31000, duracionEstimada: 60, modalidadNombre: 'Mixta' },
    ],
  },
  {
    id: 3,
    nombreCompleto: 'Camila Jiménez',
    tituloProfesional: 'Psicóloga Clínica',
    descripcion: 'Especialista en ansiedad, autoestima, infertilidad y acompañamiento emocional.',
    aniosExperiencia: 8,
    tarifaBase: 28000,
    imagenPerfil: 'camila.jpg',
    disponible: true,
    ubicacion: { id: 6, provincia: 'Virtual', canton: 'Virtual', distrito: 'Virtual' },
    especialidades: [
      { id: 3, nombre: 'Psicología', tipoEspecialidadNombre: 'Bienestar emocional' },
    ],
    servicios: [
      { id: 6, nombre: 'Terapia psicológica individual', precio: 28000, duracionEstimada: 60, modalidadNombre: 'Virtual' },
      { id: 18, nombre: 'Taller de manejo del estrés', precio: 25000, duracionEstimada: 50, modalidadNombre: 'Virtual' },
    ],
  },
  {
    id: 4,
    nombreCompleto: 'Andrea Vargas',
    tituloProfesional: 'Endocrinóloga',
    descripcion: 'Atención de trastornos hormonales, metabolismo y síndrome de ovario poliquístico.',
    aniosExperiencia: 12,
    tarifaBase: 42000,
    imagenPerfil: 'andrea.jpg',
    disponible: false, // no disponible actualmente: no debería sugerirse
    ubicacion: { id: 4, provincia: 'Cartago', canton: 'Central', distrito: 'Oriental' },
    especialidades: [
      { id: 5, nombre: 'Endocrinología', tipoEspecialidadNombre: 'Salud femenina' },
    ],
    servicios: [
      { id: 8, nombre: 'Consulta endocrinológica', precio: 45000, duracionEstimada: 60, modalidadNombre: 'Presencial' },
      { id: 20, nombre: 'Manejo de diabetes gestacional', precio: 44000, duracionEstimada: 60, modalidadNombre: 'Presencial' },
    ],
  },
  {
    id: 5,
    nombreCompleto: 'María Solís',
    tituloProfesional: 'Fisioterapeuta Especialista',
    descripcion: 'Rehabilitación del piso pélvico y acompañamiento durante el embarazo y postparto.',
    aniosExperiencia: 6,
    tarifaBase: 32000,
    imagenPerfil: 'maria.jpg',
    disponible: true,
    ubicacion: { id: 5, provincia: 'Puntarenas', canton: 'Corredores', distrito: 'Paso Canoas' },
    especialidades: [
      { id: 6, nombre: 'Fisioterapia de piso pélvico', tipoEspecialidadNombre: 'Bienestar integral' },
      { id: 7, nombre: 'Asesoría en lactancia', tipoEspecialidadNombre: 'Bienestar integral' },
    ],
    servicios: [
      { id: 9, nombre: 'Rehabilitación de piso pélvico', precio: 35000, duracionEstimada: 60, modalidadNombre: 'Presencial' },
      { id: 21, nombre: 'Fisioterapia postparto', precio: 33000, duracionEstimada: 60, modalidadNombre: 'Presencial' },
    ],
  },
  {
    id: 6,
    nombreCompleto: 'Gabriela Castro',
    tituloProfesional: 'Médica Especialista en Ginecología',
    descripcion: 'Consulta ginecológica general y preventiva.',
    aniosExperiencia: 9,
    tarifaBase: 30000,
    imagenPerfil: 'gabriela.jpg',
    disponible: true,
    ubicacion: { id: 3, provincia: 'Heredia', canton: 'Central', distrito: 'Heredia' },
    especialidades: [
      { id: 1, nombre: 'Ginecología', tipoEspecialidadNombre: 'Salud femenina' },
    ],
    servicios: [
      { id: 11, nombre: 'Consulta ginecológica de rutina', precio: 30000, duracionEstimada: 45, modalidadNombre: 'Presencial' },
    ],
  },
  {
    id: 7,
    nombreCompleto: 'Fernanda Rojas',
    tituloProfesional: 'Psicóloga Clínica',
    descripcion: 'Manejo de ansiedad, estrés y bienestar emocional femenino.',
    aniosExperiencia: 5,
    tarifaBase: 27000,
    imagenPerfil: 'fernanda.jpg',
    disponible: true,
    ubicacion: { id: 6, provincia: 'Virtual', canton: 'Virtual', distrito: 'Virtual' },
    especialidades: [
      { id: 3, nombre: 'Psicología', tipoEspecialidadNombre: 'Bienestar emocional' },
    ],
    servicios: [
      { id: 12, nombre: 'Terapia de manejo de ansiedad', precio: 27000, duracionEstimada: 50, modalidadNombre: 'Virtual' },
    ],
  },
  {
    id: 8,
    nombreCompleto: 'Paola Méndez',
    tituloProfesional: 'Licenciada en Nutrición',
    descripcion: 'Nutrición general y hábitos saludables.',
    aniosExperiencia: 6,
    tarifaBase: 29000,
    imagenPerfil: 'paola.jpg',
    disponible: true,
    ubicacion: { id: 2, provincia: 'Alajuela', canton: 'Central', distrito: 'Alajuela' },
    especialidades: [
      { id: 4, nombre: 'Nutrición', tipoEspecialidadNombre: 'Bienestar integral' },
    ],
    servicios: [
      { id: 13, nombre: 'Asesoría nutricional general', precio: 29000, duracionEstimada: 50, modalidadNombre: 'Mixta' },
      { id: 22, nombre: 'Asesoría en lactancia y nutrición', precio: 27000, duracionEstimada: 50, modalidadNombre: 'Virtual' },
    ],
  },
  {
    id: 9,
    nombreCompleto: 'Karen Alvarado',
    tituloProfesional: 'Médica Especialista en Obstetricia',
    descripcion: 'Control y acompañamiento del embarazo.',
    aniosExperiencia: 11,
    tarifaBase: 40000,
    imagenPerfil: 'karen.jpg',
    disponible: true,
    ubicacion: { id: 1, provincia: 'San José', canton: 'Central', distrito: 'Carmen' },
    especialidades: [
      { id: 2, nombre: 'Obstetricia', tipoEspecialidadNombre: 'Salud femenina' },
    ],
    servicios: [
      { id: 14, nombre: 'Control obstétrico', precio: 40000, duracionEstimada: 60, modalidadNombre: 'Presencial' },
      { id: 17, nombre: 'Ecografía obstétrica', precio: 42000, duracionEstimada: 45, modalidadNombre: 'Presencial' },
    ],
  },
  {
    id: 10,
    nombreCompleto: 'Silvia Chacón',
    tituloProfesional: 'Endocrinóloga',
    descripcion: 'Atención de tiroides y trastornos metabólicos.',
    aniosExperiencia: 15,
    tarifaBase: 43000,
    imagenPerfil: 'silvia.jpg',
    disponible: true,
    ubicacion: { id: 4, provincia: 'Cartago', canton: 'Central', distrito: 'Oriental' },
    especialidades: [
      { id: 5, nombre: 'Endocrinología', tipoEspecialidadNombre: 'Salud femenina' },
    ],
    servicios: [
      { id: 15, nombre: 'Consulta de tiroides y metabolismo', precio: 43000, duracionEstimada: 60, modalidadNombre: 'Presencial' },
    ],
  },
];
