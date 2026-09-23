import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { notificacionService } from "../services/notificacion.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class NotificacionController {
  listar = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const notificaciones = await notificacionService.listar(request.user!);

    sendSuccess(
      response,
      StatusCodes.OK,
      "Notificaciones obtenidas correctamente",
      notificaciones
    );
  };

  marcarComoLeida = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);

    const notificacion = await notificacionService.marcarComoLeida(
      id,
      request.user!
    );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Notificación marcada como leída",
      notificacion
    );
  };

  marcarTodasComoLeidas = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const resultado = await notificacionService.marcarTodasComoLeidas(
      request.user!
    );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Notificaciones marcadas como leídas",
      resultado
    );
  };
}
