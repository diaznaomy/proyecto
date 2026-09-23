import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

type UsuarioAutenticado = { id: number; role: string };
const ESTADOS_CITA = ["Pendiente", "Aceptada", "Rechazada", "Cancelada", "Completada"] as const;
const UMBRAL_BAJA_CALIFICACION = 3.5;

const inicioDia = (valor?: string) => {
  if (!valor) return undefined;
  const fecha = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) throw AppError.badRequest("La fecha desde no es válida");
  return fecha;
};

const finDia = (valor?: string) => {
  if (!valor) return undefined;
  const fecha = new Date(`${valor}T23:59:59.999`);
  if (Number.isNaN(fecha.getTime())) throw AppError.badRequest("La fecha hasta no es válida");
  return fecha;
};

const idOpcional = (valor: string | undefined, nombre: string) => {
  if (!valor) return undefined;
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest(`${nombre} no es válido`);
  }
  return id;
};

export const reporteService = {
  async obtener(
    usuario: UsuarioAutenticado,
    filtros: {
      fechaDesde?: string;
      fechaHasta?: string;
      profesionalId?: string;
      especialidadId?: string;
    }
  ) {
    const desde = inicioDia(filtros.fechaDesde);
    const hasta = finDia(filtros.fechaHasta);
    if (desde && hasta && desde > hasta) {
      throw AppError.badRequest("La fecha desde no puede ser posterior a la fecha hasta");
    }

    let profesionalId = idOpcional(filtros.profesionalId, "El profesional");
    const especialidadId = idOpcional(filtros.especialidadId, "La categoría");
    if (usuario.role === "Profesional") {
      const perfil = await prisma.perfilProfesional.findUnique({
        where: { usuarioId: usuario.id },
        select: { id: true },
      });
      if (!perfil) throw AppError.forbidden("No tienes un perfil profesional asociado");
      profesionalId = perfil.id;
    } else if (usuario.role !== "Administrador") {
      throw AppError.forbidden("No tienes permisos para consultar reportes");
    }

    const rango = desde || hasta ? { gte: desde, lte: hasta } : undefined;
    const [perfiles, citas, resenas] = await Promise.all([
      prisma.perfilProfesional.findMany({
        where: {
          id: profesionalId,
          servicios: especialidadId
            ? { some: { especialidades: { some: { especialidadId } } } }
            : undefined,
        },
        include: {
          usuario: { select: { nombre: true, apellidos: true } },
        },
        orderBy: { usuario: { nombre: "asc" } },
      }),
      prisma.cita.findMany({
        where: {
          profesionalId,
          fechaCita: rango,
          servicio: especialidadId
            ? { especialidades: { some: { especialidadId } } }
            : undefined,
        },
        include: {
          estadoCita: true,
          profesional: {
            include: {
              usuario: { select: { nombre: true, apellidos: true } },
            },
          },
        },
      }),
      prisma.resena.findMany({
        where: {
          profesionalId,
          fechaResena: rango,
          cita: especialidadId
            ? {
                servicio: {
                  especialidades: { some: { especialidadId } },
                },
              }
            : undefined,
        },
        include: {
          cita: {
            select: {
              servicio: { select: { id: true, nombre: true } },
            },
          },
          profesional: {
            include: {
              usuario: { select: { nombre: true, apellidos: true } },
            },
          },
        },
      }),
    ]);

    const estados = new Map<string, number>(ESTADOS_CITA.map((estado) => [estado, 0]));
    const profesionales = new Map<number, {
      profesionalId: number;
      profesional: string;
      total: number;
      completadas: number;
      canceladas: number;
      montoEstimado: number;
      porcentajeFinalizacion: number;
    }>();

    for (const perfil of perfiles) {
      profesionales.set(perfil.id, {
        profesionalId: perfil.id,
        profesional: `${perfil.usuario.nombre} ${perfil.usuario.apellidos}`,
        total: 0,
        completadas: 0,
        canceladas: 0,
        montoEstimado: 0,
        porcentajeFinalizacion: 0,
      });
    }

    for (const cita of citas) {
      estados.set(cita.estadoCita.nombre, (estados.get(cita.estadoCita.nombre) ?? 0) + 1);
      const actual = profesionales.get(cita.profesionalId) ?? {
        profesionalId: cita.profesionalId,
        profesional: `${cita.profesional.usuario.nombre} ${cita.profesional.usuario.apellidos}`,
        total: 0,
        completadas: 0,
        canceladas: 0,
        montoEstimado: 0,
        porcentajeFinalizacion: 0,
      };
      actual.total += 1;
      actual.completadas += cita.estadoCita.nombre === "Completada" ? 1 : 0;
      actual.canceladas += ["Cancelada", "Rechazada"].includes(cita.estadoCita.nombre) ? 1 : 0;
      actual.montoEstimado += Number(cita.montoEstimado);
      profesionales.set(cita.profesionalId, actual);
    }

    const calificaciones = new Map<number, {
      profesionalId: number;
      profesional: string;
      suma: number;
      totalResenas: number;
      distribucion: Record<number, number>;
      servicios: Map<number, { nombre: string; suma: number; total: number }>;
    }>();

    for (const perfil of perfiles) {
      calificaciones.set(perfil.id, {
        profesionalId: perfil.id,
        profesional: `${perfil.usuario.nombre} ${perfil.usuario.apellidos}`,
        suma: 0,
        totalResenas: 0,
        distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
        servicios: new Map(),
      });
    }

    for (const resena of resenas) {
      const actual = calificaciones.get(resena.profesionalId) ?? {
        profesionalId: resena.profesionalId,
        profesional: `${resena.profesional.usuario.nombre} ${resena.profesional.usuario.apellidos}`,
        suma: 0,
        totalResenas: 0,
        distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
        servicios: new Map(),
      };
      actual.suma += resena.puntuacion;
      actual.totalResenas += 1;
      actual.distribucion[resena.puntuacion] += 1;
      const servicio = resena.cita.servicio;
      const resumenServicio = actual.servicios.get(servicio.id) ?? {
        nombre: servicio.nombre,
        suma: 0,
        total: 0,
      };
      resumenServicio.suma += resena.puntuacion;
      resumenServicio.total += 1;
      actual.servicios.set(servicio.id, resumenServicio);
      calificaciones.set(resena.profesionalId, actual);
    }

    const totalCitas = citas.length;
    return {
      periodo: { fechaDesde: filtros.fechaDesde ?? null, fechaHasta: filtros.fechaHasta ?? null },
      filtros: { profesionalId: profesionalId ?? null, especialidadId: especialidadId ?? null },
      totales: {
        citas: totalCitas,
        profesionales: perfiles.length,
        resenas: resenas.length,
        promedioGeneral: resenas.length
          ? resenas.reduce((suma, item) => suma + item.puntuacion, 0) / resenas.length
          : 0,
      },
      citasPorEstado: ESTADOS_CITA
        .map((estado) => [estado, estados.get(estado) ?? 0] as const)
        .map(([estado, total]) => ({
          estado,
          total,
          porcentaje: totalCitas ? (total * 100) / totalCitas : 0,
        })),
      citasPorProfesional: [...profesionales.values()]
        .map((item) => ({
          ...item,
          porcentajeFinalizacion: item.total ? (item.completadas * 100) / item.total : 0,
        }))
        .sort((a, b) => b.total - a.total),
      calificaciones: [...calificaciones.values()]
        .map(({ suma, servicios, ...item }) => {
          const estadisticasServicios = [...servicios.values()].map((servicio) => ({
            nombre: servicio.nombre,
            promedio: servicio.total ? servicio.suma / servicio.total : 0,
          }));
          const mejorPromedio = estadisticasServicios.length
            ? Math.max(...estadisticasServicios.map((servicio) => servicio.promedio))
            : null;
          return {
            ...item,
            promedio: item.totalResenas ? suma / item.totalResenas : 0,
            mejoresServicios: mejorPromedio === null
              ? []
              : estadisticasServicios
                  .filter((servicio) => servicio.promedio === mejorPromedio)
                  .map((servicio) => servicio.nombre)
                  .sort(),
            serviciosBajaCalificacion: estadisticasServicios
              .filter((servicio) => servicio.promedio < UMBRAL_BAJA_CALIFICACION)
              .sort((a, b) => a.promedio - b.promedio || a.nombre.localeCompare(b.nombre)),
          };
        })
        .sort((a, b) => b.promedio - a.promedio),
      umbralBajaCalificacion: UMBRAL_BAJA_CALIFICACION,
    };
  },
};
