import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { especialidadService } from "../services/especialidad.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class EspecialidadController {
  listar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const { page, limit } = request.query;

    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = parseInt(limit as string, 10) || 10;

    const resultado = await especialidadService.listar(
      parsedPage,
      parsedLimit
    );

    response.status(StatusCodes.OK).json({
      success: true,
      meta: resultado.meta,
      data: resultado.data,
    });
  };

  obtenerPorId = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);

    const especialidad = await especialidadService.obtenerPorId(id);

    if (!especialidad) {
      response.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Especialidad no encontrada",
      });

      return;
    }

    response.status(StatusCodes.OK).json({
      success: true,
      data: especialidad,
    });
  };

  crear = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const especialidad = await especialidadService.crear(request.body);

    sendSuccess(
      response,
      StatusCodes.CREATED,
      "Especialidad creada correctamente",
      especialidad
    );
  };

  actualizar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);

    const especialidad = await especialidadService.actualizar(
      id,
      request.body
    );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Especialidad actualizada correctamente",
      especialidad
    );
  };

  eliminar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);

    await especialidadService.eliminar(id);

    sendSuccess(
      response,
      StatusCodes.OK,
      "Especialidad eliminada correctamente",
      null
    );
  };

  cambiarEstado = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);

    const especialidad =
      await especialidadService.cambiarEstado(id);

    sendSuccess(
      response,
      StatusCodes.OK,
      "Estado de especialidad actualizado correctamente",
      especialidad
    );
  };
} 