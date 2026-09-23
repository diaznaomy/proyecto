import { prisma } from "../config/prisma";
import {
  CreatePerfilProfesionalDto,
  UpdatePerfilProfesionalDto,
  CreateProfesionalCompletoDto,
  UpdateProfesionalCompletoDto,
} from "../dtos/perfil-profesional.dto";
import { AppError } from "../utils/app-error";
import { hashPassword } from "../utils/password";

const validarEspecialidadesActivas = async (especialidadIds: number[]) => {
  const especialidades = await prisma.especialidad.findMany({
    where: { id: { in: especialidadIds } },
    include: { estadoEspecialidad: true },
  });

  if (especialidades.length !== especialidadIds.length) {
    throw AppError.badRequest("Una o más especialidades no existen");
  }

  if (especialidades.some(
    (item) => item.estadoEspecialidad.nombre.toLowerCase() !== "activa"
  )) {
    throw AppError.badRequest("Solo se pueden asociar especialidades activas");
  }
};

const crearRelacionesEspecialidad = (especialidadIds: number[]) =>
  especialidadIds.map((especialidadId) => ({ especialidadId }));


export const perfilProfesionalService = {
  async listar(page: number = 1, limit: number = 0) {
    const paginar = limit > 0;
    const skip = paginar ? (page - 1) * limit : undefined;
    const take = paginar ? limit : undefined;

    const [totalItems, data] = await Promise.all([
      prisma.perfilProfesional.count(),
      prisma.perfilProfesional.findMany({
        skip,
        take,
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
          especialidades: {
            include: {
              especialidad: true,
            },
          },
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
    return prisma.perfilProfesional.findUnique({
      where: { id },
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
        especialidades: {
          include: {
            especialidad: true,
          },
        },
        servicios: true,
      },
    });
  },

  async obtenerPorUsuarioId(usuarioId: number) {
    const perfil = await prisma.perfilProfesional.findUnique({
      where: { usuarioId },
      select: { id: true },
    });

    return perfil ? this.obtenerPorId(perfil.id) : null;
  },

  async crear(data: CreatePerfilProfesionalDto) {
    await this.validateUsuario(data.usuarioId);
    await this.validateUbicacion(data.ubicacionId);
    await this.validateUsuarioSinPerfil(data.usuarioId);
    await validarEspecialidadesActivas(data.especialidadIds);

    return prisma.perfilProfesional.create({
      data: {
        usuarioId: data.usuarioId,
        ubicacionId: data.ubicacionId,
        tituloProfesional: data.tituloProfesional,
        descripcion: data.descripcion,
        aniosExperiencia: data.aniosExperiencia,
        tarifaBase: data.tarifaBase,
        imagenPerfil: data.imagenPerfil ?? "perfil-default.webp",
        disponible: data.disponible ?? true,
        especialidades: {
          create: crearRelacionesEspecialidad(data.especialidadIds),
        },
      },
      include: {
        usuario: true,
        ubicacion: true,
      },
    });
  },

  async actualizar(id: number, data: UpdatePerfilProfesionalDto) {
    const perfil = await this.obtenerPorId(id);

    if (!perfil) {
      throw AppError.notFound("Perfil profesional no encontrado");
    }

    if (data.usuarioId) {
      await this.validateUsuario(data.usuarioId);
    }

    if (data.ubicacionId) {
      await this.validateUbicacion(data.ubicacionId);
    }

    if (data.especialidadIds) {
      await validarEspecialidadesActivas(data.especialidadIds);
    }

    const { especialidadIds, ...datosPerfil } = data;

    return prisma.perfilProfesional.update({
      where: { id },
      data: {
        ...datosPerfil,
        especialidades: especialidadIds
          ? {
              deleteMany: {},
              create: crearRelacionesEspecialidad(especialidadIds),
            }
          : undefined,
      },
      include: {
        usuario: true,
        ubicacion: true,
        especialidades: {
          include: {
            especialidad: true,
          },
        },
      },
    });
  },

  async cambiarDisponibilidad(id: number, disponible: boolean) {
    const perfil = await this.obtenerPorId(id);

    if (!perfil) {
      throw AppError.notFound("Perfil profesional no encontrado");
    }

    return prisma.perfilProfesional.update({
      where: { id },
      data: {
        disponible,
      },
      include: {
        usuario: true,
        ubicacion: true,
      },
    });
  },

  async validateUsuario(usuarioId: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw AppError.badRequest("El usuario indicado no existe");
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

  async validateUsuarioSinPerfil(usuarioId: number) {
    const perfil = await prisma.perfilProfesional.findUnique({
      where: { usuarioId },
    });

    if (perfil) {
      throw AppError.badRequest("Este usuario ya tiene un perfil profesional");
    }
  },

  async crearCompleto(data: CreateProfesionalCompletoDto) {
  const correoNormalizado = data.correo.trim().toLowerCase();
  await validarEspecialidadesActivas(data.especialidadIds);

  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      correo: correoNormalizado,
    },
  });

  if (usuarioExistente) {
    throw AppError.conflict(
      "Ya existe un usuario registrado con ese correo"
    );
  }

  const rolProfesional = await prisma.rol.findFirst({
    where: {
      nombre: "Profesional",
      estado: true,
    },
  });

  if (!rolProfesional) {
    throw AppError.badRequest(
      "No se encontró el rol Profesional activo"
    );
  }

  const estadoActivo = await prisma.estadoUsuario.findFirst({
    where: {
      nombre: "Activo",
    },
  });

  if (!estadoActivo) {
    throw AppError.badRequest(
      "No se encontró el estado de usuario Activo"
    );
  }

  const ubicacion = await prisma.ubicacion.findUnique({
    where: {
      id: data.ubicacionId,
    },
  });

  if (!ubicacion) {
    throw AppError.badRequest(
      "La ubicación seleccionada no existe"
    );
  }

  const esUbicacionVirtual =
    ubicacion.provincia.trim().toLowerCase() === "virtual" ||
    ubicacion.canton.trim().toLowerCase() === "virtual" ||
    ubicacion.distrito.trim().toLowerCase() === "virtual";

  if (data.modalidad === "Virtual" && !esUbicacionVirtual) {
    throw AppError.badRequest(
      "Para modalidad virtual debe seleccionar la ubicación Virtual"
    );
  }

  if (data.modalidad === "Presencial" && esUbicacionVirtual) {
    throw AppError.badRequest(
      "Para modalidad presencial debe seleccionar una ubicación física"
    );
  }

  const passwordHash = await hashPassword(data.password);

  return prisma.$transaction(async (transaction) => {
    const usuario = await transaction.usuario.create({
      data: {
        nombre: data.nombre.trim(),
        apellidos: data.apellidos.trim(),
        correo: correoNormalizado,
        password: passwordHash,
        telefono: data.telefono?.trim() || null,
        rolId: rolProfesional.id,
        estadoUsuarioId: estadoActivo.id,
      },
    });

    const perfil = await transaction.perfilProfesional.create({
      data: {
        usuarioId: usuario.id,
        ubicacionId: data.ubicacionId,
        tituloProfesional: data.tituloProfesional.trim(),
        descripcion: data.descripcion.trim(),
        aniosExperiencia: data.aniosExperiencia,
        tarifaBase: data.tarifaBase,
        imagenPerfil:
          data.imagenPerfil?.trim() || "perfil-default.webp",
        disponible: data.disponible ?? true,
        especialidades: {
          create: crearRelacionesEspecialidad(data.especialidadIds),
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
        especialidades: {
          include: {
            especialidad: true,
          },
        },
      },
    });

    return perfil;
  });
},

async actualizarCompleto(
  id: number,
  data: UpdateProfesionalCompletoDto
) {
  const perfilActual = await prisma.perfilProfesional.findUnique({
    where: { id },
    include: {
      usuario: true,
      ubicacion: true,
    },
  });

  if (!perfilActual) {
    throw AppError.notFound(
      "Perfil profesional no encontrado"
    );
  }

  if (data.especialidadIds) {
    await validarEspecialidadesActivas(data.especialidadIds);
  }

  if (data.correo) {
    const correoNormalizado =
      data.correo.trim().toLowerCase();

    const usuarioConCorreo =
      await prisma.usuario.findUnique({
        where: {
          correo: correoNormalizado,
        },
      });

    if (
      usuarioConCorreo &&
      usuarioConCorreo.id !== perfilActual.usuarioId
    ) {
      throw AppError.conflict(
        "Ya existe un usuario registrado con ese correo"
      );
    }
  }

  if (data.ubicacionId) {
    const ubicacion =
      await prisma.ubicacion.findUnique({
        where: {
          id: data.ubicacionId,
        },
      });

    if (!ubicacion) {
      throw AppError.badRequest(
        "La ubicación seleccionada no existe"
      );
    }

    const esVirtual =
      ubicacion.provincia.toLowerCase() === "virtual" ||
      ubicacion.canton.toLowerCase() === "virtual" ||
      ubicacion.distrito.toLowerCase() === "virtual";

    if (
      data.modalidad === "Virtual" &&
      !esVirtual
    ) {
      throw AppError.badRequest(
        "Para modalidad virtual debe seleccionar la ubicación Virtual"
      );
    }

    if (
      data.modalidad === "Presencial" &&
      esVirtual
    ) {
      throw AppError.badRequest(
        "Para modalidad presencial debe seleccionar una ubicación física"
      );
    }
  }

  return prisma.$transaction(async (transaction) => {
    await transaction.usuario.update({
      where: {
        id: perfilActual.usuarioId,
      },

      data: {
        nombre:
          data.nombre?.trim(),

        apellidos:
          data.apellidos?.trim(),

        correo:
          data.correo
            ?.trim()
            .toLowerCase(),

        telefono:
          data.telefono === undefined
            ? undefined
            : data.telefono?.trim() || null,
      },
    });

    return transaction.perfilProfesional.update({
      where: {
        id,
      },

      data: {
        ubicacionId:
          data.ubicacionId,

        tituloProfesional:
          data.tituloProfesional?.trim(),

        descripcion:
          data.descripcion?.trim(),

        aniosExperiencia:
          data.aniosExperiencia,

        tarifaBase:
          data.tarifaBase,

        imagenPerfil:
          data.imagenPerfil,

        disponible:
          data.disponible,

        especialidades: data.especialidadIds
          ? {
              deleteMany: {},
              create: crearRelacionesEspecialidad(data.especialidadIds),
            }
          : undefined,
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

        especialidades: {
          include: {
            especialidad: true,
          },
        },

        servicios: true,
      },
    });
  });
},
};
