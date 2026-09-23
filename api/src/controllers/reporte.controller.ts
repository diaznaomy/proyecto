import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/auth.middleware";
import { reporteService } from "../services/reporte.service";
import { sendSuccess } from "../utils/http-response";

export class ReporteController {
  obtener = async (request: AuthRequest, response: Response, next: NextFunction) => {
    const resultado = await reporteService.obtener(request.user!, {
      fechaDesde: typeof request.query.fechaDesde === "string" ? request.query.fechaDesde : undefined,
      fechaHasta: typeof request.query.fechaHasta === "string" ? request.query.fechaHasta : undefined,
      profesionalId: typeof request.query.profesionalId === "string" ? request.query.profesionalId : undefined,
      especialidadId: typeof request.query.especialidadId === "string" ? request.query.especialidadId : undefined,
    });
    sendSuccess(response, StatusCodes.OK, "Reportes obtenidos correctamente", resultado);
  };
}
