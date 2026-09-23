import { prisma } from "../config/prisma";
import { CreateEspecialidadDto, UpdateEspecialidadDto } from "../dtos/especialidad.dto";
import { AppError } from "../utils/app-error";

export const especialidadService = {
  async listar(page: number = 1, limit: number = 0) {
    const paginar = limit > 0;
    const skip = paginar ? (page - 1) * limit : undefined;
    const take = paginar ? limit : undefined;

    const [totalItems, data] = await Promise.all([
      prisma.especialidad.count(),
      prisma.especialidad.findMany({
        skip,
        take,
        include: {
          tipoEspecialidad: true,
          estadoEspecialidad: true,
        },
        orderBy: { createdAt: "desc" },
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
    return prisma.especialidad.findUnique({
      where: { id },
      include: {
        tipoEspecialidad: true,
        estadoEspecialidad: true,
      },
    });
  },

  async crear(data: CreateEspecialidadDto) {
    await this.validateTipoEspecialidad(data.tipoEspecialidadId);
    await this.validateEstadoEspecialidad(data.estadoEspecialidadId);
    await this.validateNombreDisponible(data.nombre);

    return prisma.especialidad.create({
      data,
      include: {
        tipoEspecialidad: true,
        estadoEspecialidad: true,
      },
    });
  },

  async actualizar(id: number, data: UpdateEspecialidadDto) {
    const especialidad = await this.obtenerPorId(id);

    if (!especialidad) {
      throw AppError.notFound("Especialidad no encontrada");
    }

    if (data.tipoEspecialidadId) {
      await this.validateTipoEspecialidad(data.tipoEspecialidadId);
    }

    if (data.estadoEspecialidadId) {
      await this.validateEstadoEspecialidad(data.estadoEspecialidadId);
    }

    if (data.nombre) {
      await this.validateNombreDisponible(data.nombre, id);
    }

    return prisma.especialidad.update({
      where: { id },
      data,
      include: {
        tipoEspecialidad: true,
        estadoEspecialidad: true,
      },
    });
  },

  async validateTipoEspecialidad(tipoEspecialidadId: number) {
    const tipo = await prisma.tipoEspecialidad.findUnique({
      where: { id: tipoEspecialidadId },
    });

    if (!tipo) {
      throw AppError.badRequest("El tipo de especialidad indicado no existe");
    }
  },

  async validateEstadoEspecialidad(estadoEspecialidadId: number) {
    const estado = await prisma.estadoEspecialidad.findUnique({
      where: { id: estadoEspecialidadId },
    });

    if (!estado) {
      throw AppError.badRequest("El estado de especialidad indicado no existe");
    }
  },

  async validateNombreDisponible(nombre: string, excluirId?: number) {
    const existente = await prisma.especialidad.findFirst({
      where: {
        nombre: { equals: nombre.trim() },
        id: excluirId ? { not: excluirId } : undefined,
      },
      select: { id: true },
    });

    if (existente) {
      throw AppError.conflict('Ya existe una especialidad con ese nombre');
    }
  },

  async eliminar(id: number) {
    await this.obtenerPorId(id);

    return prisma.especialidad.delete({
        where: { id }
    });
},

async cambiarEstado(id: number) {
  const especialidad = await prisma.especialidad.findUnique({
    where: { id },
    include: {
      estadoEspecialidad: true,
    },
  });

  if (!especialidad) {
    throw AppError.notFound("Especialidad no encontrada");
  }

  const nuevoEstadoNombre =
    especialidad.estadoEspecialidad.nombre === "Activa"
      ? "Inactiva"
      : "Activa";

  const nuevoEstado = await prisma.estadoEspecialidad.findUnique({
    where: {
      nombre: nuevoEstadoNombre,
    },
  });

  if (!nuevoEstado) {
    throw AppError.badRequest(
      `El estado ${nuevoEstadoNombre} no está configurado`
    );
  }

  return prisma.especialidad.update({
    where: { id },
    data: {
      estadoEspecialidadId: nuevoEstado.id,
    },
    include: {
      tipoEspecialidad: true,
      estadoEspecialidad: true,
    },
  });
},


};
