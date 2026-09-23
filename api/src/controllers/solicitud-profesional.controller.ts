import { Response, NextFunction } from "express";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { solicitudProfesionalService } from "../services/solicitud-profesional.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";
import { AppError } from "../utils/app-error";
import { AuthRequest } from "../middlewares/auth.middleware";
import { rutaCredencialesProfesional } from "../middlewares/credencial-profesional.middleware";

export class SolicitudProfesionalController {
  crear = async (
    request: AuthRequest,
    response: Response,
    _next: NextFunction
  ): Promise<void> => {
    if (!request.file) {
      throw AppError.badRequest(
        "Debe adjuntar el PDF de credenciales del profesional"
      );
    }

    const usuarioId = request.user!.id;

    const solicitud = await solicitudProfesionalService.crear(
      usuarioId,
      request.body,
      request.file.filename,
      request.file.originalname
    );

    sendSuccess(
      response,
      StatusCodes.CREATED,
      "Solicitud enviada correctamente. Quedará en revisión por un administrador.",
      solicitud
    );
  };

  obtenerMia = async (
    request: AuthRequest,
    response: Response,
    _next: NextFunction
  ): Promise<void> => {
    const solicitud = await solicitudProfesionalService.obtenerMiaPorUsuario(
      request.user!.id
    );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Solicitud obtenida correctamente",
      solicitud
    );
  };

  listarPendientes = async (
    request: AuthRequest,
    response: Response,
    _next: NextFunction
  ): Promise<void> => {
    const { page, limit } = request.query;

    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = parseInt(limit as string, 10) || 10;

    const resultado = await solicitudProfesionalService.listarPendientes(
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
    request: AuthRequest,
    response: Response,
    _next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);
    const solicitud = await solicitudProfesionalService.obtenerPorId(id);

    if (!solicitud) {
      throw AppError.notFound("Solicitud no encontrada");
    }

    sendSuccess(
      response,
      StatusCodes.OK,
      "Solicitud obtenida correctamente",
      solicitud
    );
  };

  aprobar = async (
    request: AuthRequest,
    response: Response,
    _next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);

    const resultado = await solicitudProfesionalService.aprobar(
      id,
      request.user!.id
    );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Solicitud aprobada. El usuario ahora es profesional.",
      resultado
    );
  };

  rechazar = async (
    request: AuthRequest,
    response: Response,
    _next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);
    const { motivoRechazo } = request.body;

    const solicitud = await solicitudProfesionalService.rechazar(
      id,
      request.user!.id,
      motivoRechazo
    );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Solicitud rechazada",
      solicitud
    );
  };

  descargarCredencial = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);

    const solicitud = await solicitudProfesionalService.obtenerRutaCredencial(
      id
    );

    const esDueno = solicitud.usuarioId === request.user?.id;
    const esAdministrador = request.user?.role === "Administrador";

    if (!esDueno && !esAdministrador) {
      throw AppError.forbidden(
        "No tienes permisos para acceder a este documento"
      );
    }

    const rutaArchivo = path.join(
      rutaCredencialesProfesional,
      solicitud.credencialArchivo
    );

    response.sendFile(rutaArchivo, (error) => {
      // sendFile llama a este callback de forma asíncrona, fuera de la
      // promesa que asyncHandler está esperando, así que un throw aquí
      // no llegaría al ErrorMiddleware: hay que usar next() explícito.
      if (error && !response.headersSent) {
        next(AppError.notFound("El documento no fue encontrado"));
      }
    });
  };
}
