import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import type { Request } from "express";

import { sendSuccess } from "../utils/http-response";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
    iniciarSesion,
    registrar,
    obtenerPerfilPorId,
    actualizarPerfilPropio,
} from "../services/auth.service";

export const registrarUsuario = async (
    req: Request,
    res: Response
): Promise<void> => {
    const resultado = await registrar(req.body);

    sendSuccess(res, StatusCodes.CREATED, "Usuario registrado correctamente", resultado);
};

export const iniciarSesionUsuario = async (
    req: Request,
    res: Response
): Promise<void> => {
    const resultado = await iniciarSesion(req.body);

    sendSuccess(res, StatusCodes.OK, "Inicio de sesion exitoso", resultado);
};

export const obtenerPerfilUsuario = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    const usuario = await obtenerPerfilPorId(req.user!.id);

    sendSuccess(res, StatusCodes.OK, "Perfil obtenido correctamente", usuario);
};

export const actualizarPerfilUsuario = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    const usuario = await actualizarPerfilPropio(req.user!.id, req.body);

    sendSuccess(res, StatusCodes.OK, "Perfil actualizado correctamente", usuario);
};