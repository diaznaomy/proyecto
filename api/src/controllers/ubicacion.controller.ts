import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

import { sendSuccess } from "../utils/http-response";
import { listarUbicaciones } from "../services/ubicacion.service";

export const listar = async (_req: Request, res: Response): Promise<void> => {
    const ubicaciones = await listarUbicaciones();

    sendSuccess(res, StatusCodes.OK, "Ubicaciones obtenidas correctamente", ubicaciones);
};