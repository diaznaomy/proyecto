import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";
import {
    actualizarUsuario,
    cambiarEstadoUsuario,
    crearUsuario,
    eliminarUsuario,
    listarUsuarios,
    obtenerUsuarioPorId,
} from "../services/usuario.service";
export const listar = async (_req: Request, res: Response): Promise<void> => {
    const usuarios = await listarUsuarios();

    sendSuccess(res, StatusCodes.OK, "Usuarios obtenidos correctamente", usuarios);

    console.log("Entró al listar");

    sendSuccess(res, StatusCodes.OK, "Usuarios obtenidos correctamente", usuarios);
};

export const obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    const usuario = await obtenerUsuarioPorId(id);

    sendSuccess(res, StatusCodes.OK, "Usuario obtenido correctamente", usuario);
};

export const crear = async (req: Request, res: Response): Promise<void> => {
    const usuario = await crearUsuario(req.body);

    sendSuccess(res, StatusCodes.CREATED, "Usuario creado correctamente", usuario);
};

export const actualizar = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    const usuario = await actualizarUsuario(id, req.body);

    sendSuccess(res, StatusCodes.OK, "Usuario actualizado correctamente", usuario);
};

export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    const usuario = await cambiarEstadoUsuario(id);

    sendSuccess(res, StatusCodes.OK, "Estado del usuario actualizado correctamente", usuario);
};

export const eliminar = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    const usuario = await eliminarUsuario(id);

    sendSuccess(res, StatusCodes.OK, "Usuario eliminado correctamente", usuario);
};
