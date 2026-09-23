import { prisma } from "../config/prisma";
import { CrearResenaDto } from "../dtos/resena.dto";
import { AppError } from "../utils/app-error";

type UsuarioAutenticado = { id: number; role: string };

const incluirRelaciones = {
  cliente: {
    select: { id: true, nombre: true, apellidos: true },
  },
  cita: {
    select: {
      id: true,
      fechaCita: true,
      servicio: { select: { id: true, nombre: true } },
    },
  },
} as const;

export const resenaService = {
  async crear(data: CrearResenaDto, usuario: UsuarioAutenticado) {
    if (usuario.role !== "Cliente") {
      throw AppError.forbidden("Solo los clientes pueden registrar reseñas");
    }

    const cita = await prisma.cita.findUnique({
      where: { id: data.citaId },
      include: { estadoCita: true, resena: true },
    });

    if (!cita) throw AppError.notFound("Cita no encontrada");
    if (cita.clienteId !== usuario.id) {
      throw AppError.forbidden("No puedes reseñar una cita que no te pertenece");
    }
    if (cita.estadoCita.nombre !== "Completada") {
      throw AppError.badRequest("Solo se pueden reseñar citas completadas");
    }
    if (cita.resena) {
      throw AppError.conflict("Esta cita ya tiene una reseña registrada");
    }

    return prisma.resena.create({
      data: {
        citaId: cita.id,
        clienteId: usuario.id,
        profesionalId: cita.profesionalId,
        puntuacion: data.puntuacion,
        comentario: data.comentario ?? null,
      },
      include: incluirRelaciones,
    });
  },

  async listarPorProfesional(profesionalId: number) {
    const profesional = await prisma.perfilProfesional.findUnique({
      where: { id: profesionalId },
      select: { id: true },
    });
    if (!profesional) throw AppError.notFound("Perfil profesional no encontrado");

    const [resenas, resumen] = await Promise.all([
      prisma.resena.findMany({
        where: { profesionalId },
        include: incluirRelaciones,
        orderBy: { fechaResena: "desc" },
      }),
      prisma.resena.aggregate({
        where: { profesionalId },
        _avg: { puntuacion: true },
        _count: { _all: true },
      }),
    ]);

    return {
      promedio: resumen._avg.puntuacion ?? 0,
      total: resumen._count._all,
      resenas,
    };
  },
};
