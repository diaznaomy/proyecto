import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { perfilProfesionalService } from "../services/perfil-profesional.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";
import { AppError } from "../utils/app-error";
import { AuthRequest } from "../middlewares/auth.middleware";

export class PerfilProfesionalController {
  listar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const { page, limit } = request.query;

    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = parseInt(limit as string, 10) || 10;

    const resultado = await perfilProfesionalService.listar(
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

    const perfil = await perfilProfesionalService.obtenerPorId(id);

    if (!perfil) {
      response.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Perfil profesional no encontrado",
      });

      return;
    }

    response.status(StatusCodes.OK).json({
      success: true,
      data: perfil,
    });
  };

  obtenerMio = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const perfil = await perfilProfesionalService.obtenerPorUsuarioId(
      request.user!.id
    );

    if (!perfil) {
      throw AppError.notFound("No tienes un perfil profesional asociado");
    }

    sendSuccess(
      response,
      StatusCodes.OK,
      "Perfil profesional propio obtenido correctamente",
      perfil
    );
  };

  crear = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    if (
      request.user?.role === "Profesional" &&
      request.body.usuarioId !== request.user.id
    ) {
      throw AppError.forbidden("Solo puedes crear tu propio perfil profesional");
    }

    const perfil = await perfilProfesionalService.crear(request.body);

    sendSuccess(
      response,
      StatusCodes.CREATED,
      "Perfil profesional creado correctamente",
      perfil
    );
  };

  actualizar = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);
    const perfilActual = await perfilProfesionalService.obtenerPorId(id);

    if (!perfilActual) {
      throw AppError.notFound("Perfil profesional no encontrado");
    }

    if (
      request.user?.role !== "Administrador" &&
      perfilActual.usuario.id !== request.user?.id
    ) {
      throw AppError.forbidden("No puedes modificar un perfil profesional que no es tuyo");
    }

    const perfil = await perfilProfesionalService.actualizar(
      id,
      request.body
    );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Perfil profesional actualizado correctamente",
      perfil
    );
  };

  cambiarDisponibilidad = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);
    const { disponible } = request.body;
    const perfilActual = await perfilProfesionalService.obtenerPorId(id);

    if (!perfilActual) {
      throw AppError.notFound("Perfil profesional no encontrado");
    }

    if (
      request.user?.role !== "Administrador" &&
      perfilActual.usuario.id !== request.user?.id
    ) {
      throw AppError.forbidden("No puedes cambiar la disponibilidad de un perfil que no es tuyo");
    }

    const perfil =
      await perfilProfesionalService.cambiarDisponibilidad(
        id,
        disponible
      );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Disponibilidad actualizada correctamente",
      perfil
    );
  };

 crearCompleto = async (
  request: AuthRequest,
  response: Response,
  next: NextFunction
): Promise<void> => {
  if (request.file) {
    request.body.imagenPerfil = request.file.filename;
  }

  const perfil =
    await perfilProfesionalService.crearCompleto(
      request.body
    );

  sendSuccess(
    response,
    StatusCodes.CREATED,
    "Profesional creado correctamente",
    perfil
  );
};

actualizarCompleto = async (
  request: AuthRequest,
  response: Response,
  next: NextFunction
): Promise<void> => {
  const id = parseId(request.params.id);
  const perfilActual = await perfilProfesionalService.obtenerPorId(id);

  if (!perfilActual) {
    throw AppError.notFound("Perfil profesional no encontrado");
  }

  if (
    request.user?.role !== "Administrador" &&
    perfilActual.usuario.id !== request.user?.id
  ) {
    throw AppError.forbidden("No puedes actualizar un perfil que no es tuyo");
  }

  if (request.file) {
    request.body.imagenPerfil =
      request.file.filename;
  }

  const perfil =
    await perfilProfesionalService.actualizarCompleto(
      id,
      request.body
    );

  sendSuccess(
    response,
    StatusCodes.OK,
    "Profesional actualizado correctamente",
    perfil
  );
};
}
