// matching-algorithm.ts
// Lógica pura de "matching" entre las respuestas del quiz y la lista de
// profesionales disponibles. No depende de Angular, así que se puede
// probar con Jest/Jasmine de forma aislada.

// TODO: ajusta la profundidad de '../' si tu estructura real de carpetas es distinta
import { PerfilProfesional, QuizRespuestas } from '../../../../core/models/profesionalIdeal.model';

export interface ProfesionalConPuntaje extends PerfilProfesional {
  puntaje: number;
  razones: string[]; 
}

// Pesos del algoritmo: ajusta estos números si quieres que algún criterio
// pese más que otro (por ejemplo, priorizar ubicación sobre presupuesto).
const PESO_ESPECIALIDAD = 4;
const PESO_UBICACION = 2;
const PESO_MODALIDAD = 2;
const PESO_PRESUPUESTO = 1.5;
const PESO_EXPERIENCIA = 0.15; // desempate suave, no domina el resultado

/**
 * Devuelve las N mejores coincidencias, ordenadas de mayor a menor puntaje.
 * Solo considera profesionales con disponible === true y puntaje > 0
 * (es decir, que coincidieron en al menos un criterio).
 */
export function calcularCoincidencias(
  profesionales: PerfilProfesional[],
  respuestas: QuizRespuestas,
  cantidad = 3
): ProfesionalConPuntaje[] {
  return profesionales
    .filter((p) => p.disponible)
    .map((p) => puntuarProfesional(p, respuestas))
    .filter((p) => p.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, cantidad);
}

function puntuarProfesional(
  profesional: PerfilProfesional,
  respuestas: QuizRespuestas
): ProfesionalConPuntaje {
  let puntaje = 0;
  const razones: string[] = [];

  // 1. Coincidencia por área de interés (TipoEspecialidad)
  const tiposDelProfesional = new Set(
    (profesional.especialidades ?? []).map((e) => e.tipoEspecialidadNombre)
  );
  const nombresEspecialidadesCoincidentes = (profesional.especialidades ?? [])
    .filter((e) => respuestas.tiposInteres.includes(e.tipoEspecialidadNombre))
    .map((e) => e.nombre);

  const cantidadTiposCoincidentes = respuestas.tiposInteres.filter((t) =>
    tiposDelProfesional.has(t)
  ).length;

  if (cantidadTiposCoincidentes > 0) {
    puntaje += cantidadTiposCoincidentes * PESO_ESPECIALIDAD;
    const detalle = nombresEspecialidadesCoincidentes.length
      ? nombresEspecialidadesCoincidentes.join(', ')
      : profesional.tituloProfesional;
    razones.push(`Especialista en ${detalle}`);
  }

  // 2. Coincidencia por ubicación
  const provinciaProfesional = profesional.ubicacion?.provincia ?? '';
  const modalidadesDelProfesional = new Set(
    (profesional.servicios ?? []).map((s) => s.modalidadNombre)
  );

  if (respuestas.provinciaPreferida === 'Cualquiera') {
    puntaje += PESO_UBICACION * 0.5;
  } else if (provinciaProfesional === respuestas.provinciaPreferida) {
    puntaje += PESO_UBICACION;
    razones.push(`Atiende en ${provinciaProfesional}`);
  } else if (modalidadesDelProfesional.has('Virtual')) {
    puntaje += PESO_UBICACION * 0.5;
    razones.push('Ofrece atención virtual, sin importar dónde vivas');
  }

  // 3. Coincidencia por modalidad preferida
  if (respuestas.modalidadPreferida === 'Cualquiera') {
    puntaje += PESO_MODALIDAD * 0.3;
  } else if (modalidadesDelProfesional.has(respuestas.modalidadPreferida)) {
    puntaje += PESO_MODALIDAD;
    razones.push(`Disponible en modalidad ${respuestas.modalidadPreferida.toLowerCase()}`);
  }

  // 4. Presupuesto
  if (respuestas.presupuestoMax != null && respuestas.presupuestoMax > 0) {
    const serviciosEnPresupuesto = (profesional.servicios ?? []).filter(
      (s) => s.precio <= respuestas.presupuestoMax!
    );
    if (serviciosEnPresupuesto.length > 0) {
      puntaje += PESO_PRESUPUESTO;
      razones.push('Tiene servicios dentro de tu presupuesto');
    } else {
      puntaje -= PESO_PRESUPUESTO; // penaliza pero no descarta del todo
    }
  }

  // 5. Experiencia (desempate suave entre profesionales muy parejas)
  puntaje += (profesional.aniosExperiencia ?? 0) * PESO_EXPERIENCIA;

  return {
    ...profesional,
    puntaje: Math.round(puntaje * 100) / 100,
    razones,
  };
}
