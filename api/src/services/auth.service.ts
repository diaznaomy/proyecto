import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { comparePassword } from "../utils/password";
import { generarToken } from "../utils/jwt";
import { crearUsuario, obtenerUsuarioPorCorreo } from "./usuario.service";
import type { IniciarSesionDTO, RegistrarDTO } from "../dtos/auth.dto";

const quitarPassword = <T extends { password: string }>(usuario: T) => {
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
};

type UsuarioToken = {
    id: number;
    correo: string;
    nombre: string;
    rol: {
        id: number;
        nombre: string;
    };
};

const obtenerRolCliente = async () => {
    const rol = await prisma.rol.findUnique({
        where: { nombre: "Cliente" },
    });

    if (!rol) {
        throw AppError.notFound("No existe el rol Cliente en el sistema");
    }

    return rol;
};

const obtenerEstadoActivo = async () => {
    const estadoUsuario = await prisma.estadoUsuario.findUnique({
        where: { nombre: "Activo" },
    });

    if (!estadoUsuario) {
        throw AppError.notFound("No existe el estado Activo para usuarios");
    }

    return estadoUsuario;
};

const construirToken = (usuario: UsuarioToken) => {
    return generarToken({
        id: usuario.id,
        email: usuario.correo,
        role: usuario.rol.nombre,
    });
};

export const registrar = async (datos: RegistrarDTO) => {
    const rolCliente = await obtenerRolCliente();
    const estadoActivo = await obtenerEstadoActivo();

    const usuario = await crearUsuario({
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        correo: datos.correo,
        password: datos.password,
        telefono: datos.telefono,
        rolId: rolCliente.id,
        estadoUsuarioId: estadoActivo.id,
    });

    return {
        usuario,
        token: construirToken(usuario),
    };
};

export const iniciarSesion = async (datos: IniciarSesionDTO) => {
    const usuario = await obtenerUsuarioPorCorreo(datos.correo);

    if (!usuario) {
        throw AppError.unauthorized("Credenciales invalidas");
    }

    if (usuario.estadoUsuario.nombre !== "Activo") {
        throw AppError.forbidden("El usuario no se encuentra activo");
    }

    const contrasenaValida = await comparePassword(datos.password, usuario.password);

    if (!contrasenaValida) {
        throw AppError.unauthorized("Credenciales invalidas");
    }

    const usuarioSinPassword = quitarPassword(usuario);

    return {
        usuario: usuarioSinPassword,
        token: construirToken(usuario),
    };
};

export const obtenerPerfilPorId = async (usuarioId: number) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: { rol: true, estadoUsuario: true },
    });

    if (!usuario) {
        throw AppError.notFound("Usuario no encontrado");
    }

    return quitarPassword(usuario);
};

export const actualizarPerfilPropio = async (
    usuarioId: number,
    datos: { nombre: string; apellidos: string; telefono?: string | null }
) => {
    const usuario = await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
            nombre: datos.nombre,
            apellidos: datos.apellidos,
            telefono: datos.telefono ?? null,
        },
        include: { rol: true, estadoUsuario: true },
    });

    return quitarPassword(usuario);
};