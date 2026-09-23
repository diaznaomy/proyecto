import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import type {
    ActualizarTipoEspecialidadDTO,
    CrearTipoEspecialidadDTO,
} from "../dtos/tipoEspecialidad.dto";


const incluirRelaciones = {
    estadoTipoEspecialidad: true,
    especialidades: true,
} as const;


const normalizarTexto = (valor: string): string => {
    return valor.trim();
};


export const listarTiposEspecialidad = async () => {
    return prisma.tipoEspecialidad.findMany({
        include: incluirRelaciones,
        orderBy: {
            id: "asc",
        },
    });
};


export const obtenerTipoEspecialidadPorId = async (id: number) => {

    const tipoEspecialidad = await prisma.tipoEspecialidad.findUnique({
        where: { id },
        include: incluirRelaciones,
    });


    if (!tipoEspecialidad) {
        throw AppError.notFound(
            "Tipo de especialidad no encontrado"
        );
    }


    return tipoEspecialidad;
};



const validarEstadoTipoEspecialidad = async (
    estadoTipoEspecialidadId: number
): Promise<void> => {

    const estado = await prisma.estadoTipoEspecialidad.findUnique({
        where: {
            id: estadoTipoEspecialidadId,
        },
    });


    if (!estado) {
        throw AppError.notFound(
            `No existe el estado de tipo de especialidad con id ${estadoTipoEspecialidadId}`
        );
    }
};



export const crearTipoEspecialidad = async (
    datos: CrearTipoEspecialidadDTO
) => {

    const nombre = normalizarTexto(datos.nombre);


    const tipoExistente = await prisma.tipoEspecialidad.findUnique({
        where: {
            nombre,
        },
    });


    if (tipoExistente) {
        throw AppError.conflict(
            "Ya existe un tipo de especialidad con ese nombre"
        );
    }


    await validarEstadoTipoEspecialidad(
        Number(datos.estadoTipoEspecialidadId)
    );


    return prisma.tipoEspecialidad.create({
        data: {
            nombre,
            descripcion: datos.descripcion?.trim() || null,
            estadoTipoEspecialidadId:
                Number(datos.estadoTipoEspecialidadId),
        },
        include: incluirRelaciones,
    });
};

export const cambiarEstadoTipoEspecialidad = async (
    id: number
) => {

    const tipoEspecialidad =
        await prisma.tipoEspecialidad.findUnique({
            where: {
                id,
            },
            include: incluirRelaciones,
        });


    if (!tipoEspecialidad) {
        throw AppError.notFound(
            "Tipo de especialidad no encontrado"
        );
    }


    const nuevoEstado =
        tipoEspecialidad.estadoTipoEspecialidad.nombre === "Activa"
            ? "Inactiva"
            : "Activa";


    const estado =
        await prisma.estadoTipoEspecialidad.findUnique({
            where: {
                nombre: nuevoEstado,
            },
        });


    if (!estado) {
        throw AppError.notFound(
            "Estado no encontrado"
        );
    }


    return prisma.tipoEspecialidad.update({
        where: {
            id,
        },
        data: {
            estadoTipoEspecialidadId: estado.id,
        },
        include: incluirRelaciones,
    });
};

export const actualizarTipoEspecialidad = async (
    id: number,
    datos: ActualizarTipoEspecialidadDTO
) => {


    const tipoExistente = await prisma.tipoEspecialidad.findUnique({
        where: {
            id,
        },
    });


    if (!tipoExistente) {
        throw AppError.notFound(
            "Tipo de especialidad no encontrado"
        );
    }


    if (datos.estadoTipoEspecialidadId !== undefined) {

        await validarEstadoTipoEspecialidad(
            Number(datos.estadoTipoEspecialidadId)
        );

    }



    if (datos.nombre !== undefined) {

        const nombre = normalizarTexto(datos.nombre);


        const tipoConNombre =
            await prisma.tipoEspecialidad.findUnique({
                where: {
                    nombre,
                },
            });


        if (
            tipoConNombre &&
            tipoConNombre.id !== id
        ) {
            throw AppError.conflict(
                "Ya existe un tipo de especialidad con ese nombre"
            );
        }
    }



    const datosActualizacion: Record<string, unknown> = {};



    if (datos.nombre !== undefined) {
        datosActualizacion.nombre =
            normalizarTexto(datos.nombre);
    }


    if (datos.descripcion !== undefined) {
        datosActualizacion.descripcion =
            datos.descripcion?.trim() || null;
    }


    if (datos.estadoTipoEspecialidadId !== undefined) {
        datosActualizacion.estadoTipoEspecialidadId =
            Number(datos.estadoTipoEspecialidadId);
    }



    return prisma.tipoEspecialidad.update({
        where: {
            id,
        },
        data: datosActualizacion,
        include: incluirRelaciones,
    });

};



export const eliminarTipoEspecialidad = async (
    id: number
) => {


    const tipoEspecialidad =
        await prisma.tipoEspecialidad.findUnique({
            where: {
                id,
            },
            include: incluirRelaciones,
        });



    if (!tipoEspecialidad) {
        throw AppError.notFound(
            "Tipo de especialidad no encontrado"
        );
    }



    await prisma.tipoEspecialidad.delete({
        where: {
            id,
        },
    });



    return tipoEspecialidad;
};