import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

import { sendSuccess } from "../utils/http-response";
import { listarModalidades } from "../services/modalidad.service";

export const listar = async (_req: Request, res: Response): Promise<void> => {
    const modalidades = await listarModalidades();

    sendSuccess(res, StatusCodes.OK, "Modalidades obtenidas correctamente", modalidades);
};