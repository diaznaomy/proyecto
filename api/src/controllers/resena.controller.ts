import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/auth.middleware";
import { resenaService } from "../services/resena.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";

export class ResenaController {
  crear = async (request: AuthRequest, response: Response, next: NextFunction) => {
    const resena = await resenaService.crear(request.body, request.user!);
    sendSuccess(response, StatusCodes.CREATED, "Reseña registrada correctamente", resena);
  };

  listarPorProfesional = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const profesionalId = parseId(request.params.profesionalId);
    const resultado = await resenaService.listarPorProfesional(profesionalId);
    sendSuccess(response, StatusCodes.OK, "Reseñas obtenidas correctamente", resultado);
  };
}
