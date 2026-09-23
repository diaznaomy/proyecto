import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

import { sendSuccess } from "../utils/http-response";
import { listarEstadosServicio } from "../services/estado-servicio.service";

export const listar = async (_req: Request, res: Response): Promise<void> => {
    const estados = await listarEstadosServicio();

    sendSuccess(res, StatusCodes.OK, "Estados de servicio obtenidos correctamente", estados);
};