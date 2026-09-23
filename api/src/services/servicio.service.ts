import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import type { ActualizarServicioDTO, CrearServicioDTO } from "../dtos/servicio.dto";

const incluirRelaciones = {
    perfilProfesional: {
        include: {
            usuario: {
                select: {
                    id: true,
                    nombre: true,
                    apellidos: true,
                    correo: true,
                },
            },
        },
    },
    modalidad: true,
    estadoServicio: true,
    // Servicio no tiene categoriaId propio: la "categoria" se deriva del
    // TipoEspecialidad de cada especialidad asociada, por eso se incluye
    // anidado hasta ese nivel.
    especialidades: {
        include: {
            especialidad: {
                include: {
                    tipoEspecialidad: true,
                    estadoEspecialidad: true,
                },
            },
        },
    },
} as const;

// Aplana la tabla intermedia servicio_especialidad a un simple arreglo de
// especialidades (cada una ya trae su tipoEspecialidad anidado), para que
// el frontend no tenga que conocer el join ni resolver la categoria aparte.
const aplanarEspecialidades = <
    T extends { especialidades: { especialidad: unknown }[] }
>(
    servicio: T
) => {
    const { especialidades, ...resto } = servicio;
    return {
        ...resto,
        especialidades: especialidades.map((item) => item.especialidad),
    };
};

const validarPerfilProfesional = async (perfilProfesionalId: number): Promise<void> => {
    const perfil = await prisma.perfilProfesional.findUnique({
        where: { id: perfilProfesionalId },
    });

    if (!perfil) {
        throw AppError.notFound(`No existe el profesional con id ${perfilProfesionalId}`);
    }
};

const validarModalidad = async (modalidadId: number): Promise<void> => {
    const modalidad = await prisma.modalidad.findUnique({
        where: { id: modalidadId },
    });

    if (!modalidad) {
        throw AppError.notFound(`No existe la modalidad con id ${modalidadId}`);
    }
};

const validarEstadoServicio = async (estadoServicioId: number): Promise<void> => {
    const estadoServicio = await prisma.estadoServicio.findUnique({
        where: { id: estadoServicioId },
    });

    if (!estadoServicio) {
        throw AppError.notFound(`No existe el estado de servicio con id ${estadoServicioId}`);
    }
};

const validarEspecialidades = async (especialidadIds: number[]): Promise<void> => {
    if (especialidadIds.length === 0) {
        throw AppError.badRequest(
            "Debe seleccionar al menos una especialidad (la categoria se deriva de ahi)"
        );
    }

    const especialidades = await prisma.especialidad.findMany({
        where: { id: { in: especialidadIds } },
    });

    if (especialidades.length !== especialidadIds.length) {
        throw AppError.notFound("Una o mas especialidades enviadas no existen");
    }
};

export const listarServicios = async () => {
    const servicios = await prisma.servicio.findMany({
        include: incluirRelaciones,
        orderBy: { id: "asc" },
    });

    return servicios.map((servicio) => aplanarEspecialidades(servicio));
};

export const obtenerServicioPorId = async (id: number) => {
    const servicio = await prisma.servicio.findUnique({
        where: { id },
        include: incluirRelaciones,
    });

    if (!servicio) {
        throw AppError.notFound("Servicio no encontrado");
    }

    return aplanarEspecialidades(servicio);
};

export const crearServicio = async (datos: CrearServicioDTO) => {
    await validarPerfilProfesional(datos.perfilProfesionalId);
    await validarModalidad(datos.modalidadId);
    await validarEstadoServicio(datos.estadoServicioId);
    await validarEspecialidades(datos.especialidadIds);

    const servicio = await prisma.servicio.create({
        data: {
            perfilProfesionalId: datos.perfilProfesionalId,
            modalidadId: datos.modalidadId,
            estadoServicioId: datos.estadoServicioId,
            nombre: datos.nombre.trim(),
            descripcion: datos.descripcion.trim(),
            precio: datos.precio,
            duracionEstimada: datos.duracionEstimada,
            imagenServicio: datos.imagenServicio?.trim() || null,
            especialidades: {
                create: datos.especialidadIds.map((especialidadId) => ({
                    especialidadId,
                })),
            },
        },
        include: incluirRelaciones,
    });

    return aplanarEspecialidades(servicio);
};

export const actualizarServicio = async (id: number, datos: ActualizarServicioDTO) => {
    const servicioExistente = await prisma.servicio.findUnique({
        where: { id },
    });

    if (!servicioExistente) {
        throw AppError.notFound("Servicio no encontrado");
    }

    if (datos.perfilProfesionalId !== undefined) {
        await validarPerfilProfesional(datos.perfilProfesionalId);
    }

    if (datos.modalidadId !== undefined) {
        await validarModalidad(datos.modalidadId);
    }

    if (datos.estadoServicioId !== undefined) {
        await validarEstadoServicio(datos.estadoServicioId);
    }

    if (datos.especialidadIds !== undefined) {
        await validarEspecialidades(datos.especialidadIds);
    }

    const datosActualizacion: Record<string, unknown> = {};

    if (datos.perfilProfesionalId !== undefined) {
        datosActualizacion.perfilProfesionalId = datos.perfilProfesionalId;
    }

    if (datos.modalidadId !== undefined) {
        datosActualizacion.modalidadId = datos.modalidadId;
    }

    if (datos.estadoServicioId !== undefined) {
        datosActualizacion.estadoServicioId = datos.estadoServicioId;
    }

    if (datos.nombre !== undefined) {
        datosActualizacion.nombre = datos.nombre.trim();
    }

    if (datos.descripcion !== undefined) {
        datosActualizacion.descripcion = datos.descripcion.trim();
    }

    if (datos.precio !== undefined) {
        datosActualizacion.precio = datos.precio;
    }

    if (datos.duracionEstimada !== undefined) {
        datosActualizacion.duracionEstimada = datos.duracionEstimada;
    }

    if (datos.imagenServicio !== undefined) {
        datosActualizacion.imagenServicio = datos.imagenServicio?.trim() || null;
    }

    // Si vienen especialidades, se reemplaza el set completo dentro de una
    // transaccion: se borran las relaciones actuales y se crean las nuevas.
    const servicio = await prisma.$transaction(async (tx) => {
        if (datos.especialidadIds !== undefined) {
            await tx.servicioEspecialidad.deleteMany({
                where: { servicioId: id },
            });

            await tx.servicioEspecialidad.createMany({
                data: datos.especialidadIds.map((especialidadId) => ({
                    servicioId: id,
                    especialidadId,
                })),
            });
        }

        return tx.servicio.update({
            where: { id },
            data: datosActualizacion,
            include: incluirRelaciones,
        });
    });

    return aplanarEspecialidades(servicio);
};

export const cambiarEstadoServicio = async (id: number) => {
    const servicio = await prisma.servicio.findUnique({
        where: { id },
    });

    if (!servicio) {
        throw AppError.notFound("Servicio no encontrado");
    }

    // Alterna al otro estado existente en la tabla EstadoServicio, sin
    // asumir nombres ni IDs fijos: toma cualquier estado distinto al actual.
    const estadoAlterno = await prisma.estadoServicio.findFirst({
        where: { NOT: { id: servicio.estadoServicioId } },
    });

    if (!estadoAlterno) {
        throw AppError.notFound("No hay un estado alterno configurado");
    }

    const servicioActualizado = await prisma.servicio.update({
        where: { id },
        data: { estadoServicioId: estadoAlterno.id },
        include: incluirRelaciones,
    });

    return aplanarEspecialidades(servicioActualizado);
};