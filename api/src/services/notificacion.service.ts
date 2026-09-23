import { prisma } from "../config/prisma";
import { Prisma, TipoNotificacion } from "../../generated/prisma/client";
import { AppError } from "../utils/app-error";
import { AuthTokenPayload } from "../middlewares/auth.middleware";

// Servicio de notificaciones: crea notificaciones desde eventos internos
// del backend (usado por solicitud-profesional.service.ts, entre otros) y
// expone listar/marcarComoLeida/marcarTodasComoLeidas para la bandeja de
// notificaciones del frontend (GET/PATCH /notificaciones).
export const notificacionService = {
  async notificarUsuario(
    usuarioId: number,
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
    data?: Prisma.InputJsonValue
  ) {
    return prisma.notificacion.create({
      data: {
        usuarioId,
        tipo,
        titulo,
        mensaje,
        data,
      },
    });
  },

  async notificarAdministradores(
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
    data?: Prisma.InputJsonValue
  ) {
    const administradores = await prisma.usuario.findMany({
      where: {
        rol: { nombre: "Administrador" },
      },
      select: { id: true },
    });

    if (administradores.length === 0) {
      return [];
    }

    return prisma.notificacion.createMany({
      data: administradores.map((administrador) => ({
        usuarioId: administrador.id,
        tipo,
        titulo,
        mensaje,
        data,
      })),
    });
  },

  /** Histórico de notificaciones del usuario autenticado, más recientes primero. */
  async listar(usuario: AuthTokenPayload) {
    return prisma.notificacion.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Marca una notificación puntual como leída, validando que sea del usuario autenticado. */
  async marcarComoLeida(id: number, usuario: AuthTokenPayload) {
    const notificacion = await prisma.notificacion.findUnique({ where: { id } });

    if (!notificacion || notificacion.usuarioId !== usuario.id) {
      throw AppError.notFound("Notificación no encontrada");
    }

    if (notificacion.leida) {
      return notificacion;
    }

    return prisma.notificacion.update({
      where: { id },
      data: { leida: true, leidaEn: new Date() },
    });
  },

  /** Marca todas las notificaciones pendientes del usuario autenticado como leídas. */
  async marcarTodasComoLeidas(usuario: AuthTokenPayload) {
    return prisma.notificacion.updateMany({
      where: { usuarioId: usuario.id, leida: false },
      data: { leida: true, leidaEn: new Date() },
    });
  },
};