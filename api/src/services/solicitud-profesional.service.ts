import fs from "fs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { bitacoraService } from "./bitacora.service";
import { notificacionService } from "./notificacion.service";
import { CrearSolicitudProfesionalDto } from "../dtos/solicitud-profesional.dto";

const includeDetalle = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      correo: true,
      telefono: true,
      fechaRegistro: true,
    },
  },
  ubicacion: true,
  especialidades: {
    include: { especialidad: true },
  },
  resueltoPor: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
    },
  },
} as const;

const includeResumen = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
    },
  },
} as const;

export const solicitudProfesionalService = {
  async crear(
    usuarioId: number,
    data: CrearSolicitudProfesionalDto,
    credencialArchivo: string,
    credencialNombreOriginal: string
  ) {
    await this.validateRolCliente(usuarioId);
    await this.validateUsuarioSinPerfilProfesional(usuarioId);
    await this.validateSinSolicitudPendiente(usuarioId);
    await this.validateUbicacion(data.ubicacionId);
    await this.validateEspecialidades(data.especialidadIds);

    const solicitud = await prisma.solicitudProfesional.create({
      data: {
        usuarioId,
        estado: "Pendiente",
        ubicacionId: data.ubicacionId,
        tituloProfesional: data.tituloProfesional,
        descripcion: data.descripcion,
        aniosExperiencia: data.aniosExperiencia,
        tarifaBase: data.tarifaBase,
        credencialArchivo,
        credencialNombreOriginal,
        especialidades: {
          create: data.especialidadIds.map((especialidadId) => ({
            especialidadId,
          })),
        },
      },
      include: includeDetalle,
    });

    await bitacoraService.registrar(
      usuarioId,
      "Solicitud profesional creada",
      `El usuario #${usuarioId} solicitó convertirse en profesional (solicitud #${solicitud.id}).`
    );

    await notificacionService.notificarAdministradores(
      "ProfesionalPendienteAprobacion",
      "Nueva solicitud de profesional",
      `${solicitud.usuario.nombre} ${solicitud.usuario.apellidos} solicitó convertirse en profesional.`,
      { solicitudId: solicitud.id }
    );

    return solicitud;
  },

  async obtenerMiaPorUsuario(usuarioId: number) {
    return prisma.solicitudProfesional.findFirst({
      where: { usuarioId },
      orderBy: { createdAt: "desc" },
      include: includeDetalle,
    });
  },

  async listarPendientes(page: number = 1, limit: number = 10) {
    const paginar = limit > 0;
    const skip = paginar ? (page - 1) * limit : undefined;
    const take = paginar ? limit : undefined;

    const [totalItems, data] = await Promise.all([
      prisma.solicitudProfesional.count({ where: { estado: "Pendiente" } }),
      prisma.solicitudProfesional.findMany({
        where: { estado: "Pendiente" },
        skip,
        take,
        include: includeResumen,
        orderBy: { fechaSolicitud: "asc" },
      }),
    ]);

    return {
      meta: {
        totalItems,
        totalPages: paginar ? Math.ceil(totalItems / limit) : 1,
        currentPage: paginar ? page : 1,
        limit: paginar ? limit : totalItems,
      },
      data,
    };
  },

  async obtenerPorId(id: number) {
    return prisma.solicitudProfesional.findUnique({
      where: { id },
      include: includeDetalle,
    });
  },

  async aprobar(id: number, administradorId: number) {
    const solicitud = await prisma.solicitudProfesional.findUnique({
      where: { id },
      include: { especialidades: true },
    });

    if (!solicitud) {
      throw AppError.notFound("Solicitud no encontrada");
    }

    if (solicitud.estado !== "Pendiente") {
      throw AppError.conflict(
        "Esta solicitud ya fue procesada anteriormente"
      );
    }

    const rolProfesional = await prisma.rol.findFirst({
      where: { nombre: "Profesional", estado: true },
    });

    if (!rolProfesional) {
      throw AppError.badRequest("No se encontró el rol Profesional activo");
    }

    const resultado = await prisma.$transaction(async (transaction) => {
      const solicitudActualizada = await transaction.solicitudProfesional.update({
        where: { id },
        data: {
          estado: "Aprobada",
          fechaResolucion: new Date(),
          resueltoPorId: administradorId,
        },
      });

      const perfil = await transaction.perfilProfesional.create({
        data: {
          usuarioId: solicitud.usuarioId,
          ubicacionId: solicitud.ubicacionId,
          tituloProfesional: solicitud.tituloProfesional,
          descripcion: solicitud.descripcion,
          aniosExperiencia: solicitud.aniosExperiencia,
          tarifaBase: solicitud.tarifaBase,
          disponible: true,
          especialidades: {
            create: solicitud.especialidades.map((item) => ({
              especialidadId: item.especialidadId,
            })),
          },
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
              correo: true,
              telefono: true,
            },
          },
          ubicacion: true,
          especialidades: { include: { especialidad: true } },
        },
      });

      await transaction.usuario.update({
        where: { id: solicitud.usuarioId },
        data: { rolId: rolProfesional.id },
      });

      return { solicitud: solicitudActualizada, perfil };
    });

    await bitacoraService.registrar(
      administradorId,
      "Solicitud profesional aprobada",
      `El administrador #${administradorId} aprobó la solicitud #${id} del usuario #${solicitud.usuarioId}.`
    );

    await notificacionService.notificarUsuario(
      solicitud.usuarioId,
      "NuevoProfesionalRegistrado",
      "¡Tu solicitud fue aprobada!",
      "Ya puedes utilizar Serena como profesional.",
      { solicitudId: id }
    );

    return resultado;
  },

  async rechazar(id: number, administradorId: number, motivoRechazo: string) {
    const solicitud = await prisma.solicitudProfesional.findUnique({
      where: { id },
    });

    if (!solicitud) {
      throw AppError.notFound("Solicitud no encontrada");
    }

    if (solicitud.estado !== "Pendiente") {
      throw AppError.conflict(
        "Esta solicitud ya fue procesada anteriormente"
      );
    }

    const solicitudActualizada = await prisma.solicitudProfesional.update({
      where: { id },
      data: {
        estado: "Rechazada",
        fechaResolucion: new Date(),
        resueltoPorId: administradorId,
        motivoRechazo,
      },
      include: includeDetalle,
    });

    await bitacoraService.registrar(
      administradorId,
      "Solicitud profesional rechazada",
      `El administrador #${administradorId} rechazó la solicitud #${id} del usuario #${solicitud.usuarioId}. Motivo: ${motivoRechazo}`
    );

    await notificacionService.notificarUsuario(
      solicitud.usuarioId,
      "DocumentacionPendienteRevision",
      "Tu solicitud fue rechazada",
      motivoRechazo,
      { solicitudId: id }
    );

    return solicitudActualizada;
  },

  async obtenerRutaCredencial(id: number) {
    const solicitud = await prisma.solicitudProfesional.findUnique({
      where: { id },
      select: { id: true, usuarioId: true, credencialArchivo: true },
    });

    if (!solicitud) {
      throw AppError.notFound("Solicitud no encontrada");
    }

    return solicitud;
  },

  async validateRolCliente(usuarioId: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { rol: true },
    });

    if (!usuario) {
      throw AppError.badRequest("El usuario indicado no existe");
    }

    if (usuario.rol.nombre !== "Cliente") {
      throw AppError.forbidden(
        "Solo un usuario con rol Cliente puede solicitar convertirse en profesional"
      );
    }
  },

  async validateUsuarioSinPerfilProfesional(usuarioId: number) {
    const perfil = await prisma.perfilProfesional.findUnique({
      where: { usuarioId },
    });

    if (perfil) {
      throw AppError.conflict("Este usuario ya es profesional");
    }
  },

  async validateSinSolicitudPendiente(usuarioId: number) {
    const solicitudPendiente = await prisma.solicitudProfesional.findFirst({
      where: { usuarioId, estado: "Pendiente" },
    });

    if (solicitudPendiente) {
      throw AppError.conflict(
        "Ya tienes una solicitud de profesional en revisión"
      );
    }
  },

  async validateUbicacion(ubicacionId: number) {
    const ubicacion = await prisma.ubicacion.findUnique({
      where: { id: ubicacionId },
    });

    if (!ubicacion) {
      throw AppError.badRequest("La ubicación indicada no existe");
    }
  },

  async validateEspecialidades(especialidadIds: number[]) {
    const especialidades = await prisma.especialidad.findMany({
      where: { id: { in: especialidadIds } },
    });

    if (especialidades.length !== especialidadIds.length) {
      throw AppError.badRequest("Una o más especialidades indicadas no existen");
    }
  },

  eliminarArchivoSiExiste(rutaCompleta: string) {
    if (fs.existsSync(rutaCompleta)) {
      fs.unlinkSync(rutaCompleta);
    }
  },
};
