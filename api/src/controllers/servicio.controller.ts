import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";
import { AppError } from "../utils/app-error";
import { AuthRequest } from "../middlewares/auth.middleware";
import { perfilProfesionalService } from "../services/perfil-profesional.service";
import {
    actualizarServicio,
    cambiarEstadoServicio,
    crearServicio,
    obtenerServicioPorId,
    listarServicios,
} from "../services/servicio.service";

export const listar = async (_req: Request, res: Response): Promise<void> => {
    const servicios = await listarServicios();

    sendSuccess(res, StatusCodes.OK, "Servicios obtenidos correctamente", servicios);
};

export const obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    const servicio = await obtenerServicioPorId(id);

    sendSuccess(res, StatusCodes.OK, "Servicio obtenido correctamente", servicio);
};

export const crear = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthRequest;
    const perfil = await perfilProfesionalService.obtenerPorId(Number(req.body.perfilProfesionalId));

    if (!perfil) {
        throw AppError.notFound("Perfil profesional no encontrado");
    }

    if (
        request.user?.role !== "Administrador" &&
        perfil.usuario.id !== request.user?.id
    ) {
        throw AppError.forbidden("No puedes crear servicios para otro profesional");
    }

    const servicio = await crearServicio(req.body);

    sendSuccess(res, StatusCodes.CREATED, "Servicio creado correctamente", servicio);
};

export const actualizar = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    const request = req as AuthRequest;
    const servicioActual = await obtenerServicioPorId(id);

    if (!servicioActual) {
        throw AppError.notFound("Servicio no encontrado");
    }

    if (
        request.user?.role !== "Administrador" &&
        servicioActual.perfilProfesional.usuario.id !== request.user?.id
    ) {
        throw AppError.forbidden("No puedes actualizar un servicio que no es tuyo");
    }

    const servicio = await actualizarServicio(id, req.body);

    sendSuccess(res, StatusCodes.OK, "Servicio actualizado correctamente", servicio);
};

export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    const request = req as AuthRequest;
    const servicioActual = await obtenerServicioPorId(id);

    if (!servicioActual) {
        throw AppError.notFound("Servicio no encontrado");
    }

    if (
        request.user?.role !== "Administrador" &&
        servicioActual.perfilProfesional.usuario.id !== request.user?.id
    ) {
        throw AppError.forbidden("No puedes cambiar el estado de un servicio que no es tuyo");
    }

    const servicio = await cambiarEstadoServicio(id);

    sendSuccess(res, StatusCodes.OK, "Estado del servicio actualizado correctamente", servicio);
};