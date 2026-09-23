import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { hashPassword } from "../utils/password";
import type { ActualizarUsuarioDTO, CrearUsuarioDTO } from "../dtos/usuario.dto";

const incluirRelaciones = {
    rol: true,
    estadoUsuario: true,
} as const;

const removerPassword = <T extends { password: string }>(usuario: T) => {
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
};

const validarRol = async (rolId: number): Promise<void> => {
    const rol = await prisma.rol.findUnique({
        where: { id: rolId },
    });

    if (!rol) {
        throw AppError.notFound(`No existe el rol con id ${rolId}`);
    }
};

const validarEstadoUsuario = async (estadoUsuarioId: number): Promise<void> => {
    const estadoUsuario = await prisma.estadoUsuario.findUnique({
        where: { id: estadoUsuarioId },
    });

    if (!estadoUsuario) {
        throw AppError.notFound(`No existe el estado de usuario con id ${estadoUsuarioId}`);
    }
};

const normalizarCorreo = (correo: string): string => {
    return correo.trim().toLowerCase();
};

const normalizarTexto = (valor?: string | null): string | null | undefined => {
    if (valor === undefined) {
        return undefined;
    }

    if (valor === null) {
        return null;
    }

    const texto = valor.trim();
    return texto.length > 0 ? texto : null;
};

export const listarUsuarios = async () => {
    const usuarios = await prisma.usuario.findMany({
        include: incluirRelaciones,
        orderBy: {
            id: "asc",
        },
    });

    return usuarios.map((usuario) => removerPassword(usuario));
};

export const obtenerUsuarioPorId = async (id: number) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        include: incluirRelaciones,
    });

    if (!usuario) {
        throw AppError.notFound("Usuario no encontrado");
    }

    return removerPassword(usuario);
};

export const obtenerUsuarioPorCorreo = async (correo: string) => {
    return prisma.usuario.findUnique({
        where: { correo: normalizarCorreo(correo) },
        include: incluirRelaciones,
    });
};

export const crearUsuario = async (datos: CrearUsuarioDTO) => {
    const correo = normalizarCorreo(datos.correo);
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { correo },
    });

    if (usuarioExistente) {
        throw AppError.conflict("Ya existe un usuario con ese correo");
    }

    await validarRol(Number(datos.rolId));
    await validarEstadoUsuario(Number(datos.estadoUsuarioId));

    const usuario = await prisma.usuario.create({
        data: {
            nombre: datos.nombre.trim(),
            apellidos: datos.apellidos.trim(),
            correo,
            password: await hashPassword(datos.password),
            telefono: normalizarTexto(datos.telefono),
            rolId: Number(datos.rolId),
            estadoUsuarioId: Number(datos.estadoUsuarioId),
        },
        include: incluirRelaciones,
    });

    return removerPassword(usuario);
};

export const actualizarUsuario = async (
    id: number,
    datos: ActualizarUsuarioDTO
) => {
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { id },
    });

    if (!usuarioExistente) {
        throw AppError.notFound("Usuario no encontrado");
    }

    if (datos.rolId !== undefined) {
        await validarRol(Number(datos.rolId));
    }

    if (datos.estadoUsuarioId !== undefined) {
        await validarEstadoUsuario(Number(datos.estadoUsuarioId));
    }

    if (datos.correo !== undefined) {
        const correo = normalizarCorreo(datos.correo);
        const usuarioConCorreo = await prisma.usuario.findUnique({
            where: { correo },
        });

        if (usuarioConCorreo && usuarioConCorreo.id !== id) {
            throw AppError.conflict("Ya existe un usuario con ese correo");
        }
    }

    const datosActualizacion: Record<string, unknown> = {};

    if (datos.nombre !== undefined) {
        datosActualizacion.nombre = datos.nombre.trim();
    }

    if (datos.apellidos !== undefined) {
        datosActualizacion.apellidos = datos.apellidos.trim();
    }

    if (datos.correo !== undefined) {
        datosActualizacion.correo = normalizarCorreo(datos.correo);
    }

    if (datos.password !== undefined) {
        datosActualizacion.password = await hashPassword(datos.password);
    }

    if (datos.telefono !== undefined) {
        datosActualizacion.telefono = normalizarTexto(datos.telefono);
    }

    if (datos.rolId !== undefined) {
        datosActualizacion.rolId = Number(datos.rolId);
    }

    if (datos.estadoUsuarioId !== undefined) {
        datosActualizacion.estadoUsuarioId = Number(datos.estadoUsuarioId);
    }

    const usuarioActualizado = await prisma.usuario.update({
        where: { id },
        data: datosActualizacion,
        include: incluirRelaciones,
    });

    return removerPassword(usuarioActualizado);
};

export const cambiarEstadoUsuario = async (id: number) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
    });

    if (!usuario) {
        throw AppError.notFound("Usuario no encontrado");
    }

    // Alterna al otro estado existente en la tabla EstadoUsuario, sin
    // asumir nombres ni IDs fijos: toma cualquier estado distinto al actual.
    const estadoAlterno = await prisma.estadoUsuario.findFirst({
        where: { NOT: { id: usuario.estadoUsuarioId } },
    });

    if (!estadoAlterno) {
        throw AppError.notFound("No hay un estado alterno configurado");
    }

    const usuarioActualizado = await prisma.usuario.update({
        where: { id },
        data: { estadoUsuarioId: estadoAlterno.id },
        include: incluirRelaciones,
    });

    return removerPassword(usuarioActualizado);
};

export const eliminarUsuario = async (id: number) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        include: incluirRelaciones,
    });

    if (!usuario) {
        throw AppError.notFound("Usuario no encontrado");
    }

    await prisma.usuario.delete({
        where: { id },
    });

    return removerPassword(usuario);
};