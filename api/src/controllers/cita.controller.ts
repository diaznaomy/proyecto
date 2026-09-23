import {
  NextFunction,
  Request,
  Response,
} from "express";

import { StatusCodes } from "http-status-codes";

import { citaService } from "../services/cita.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class CitaController {
  listar = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const citas = await citaService.listar(request.user!);

    sendSuccess(
      response,
      StatusCodes.OK,
      "Citas obtenidas correctamente",
      citas
    );
  };

  obtenerPorId = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);

    const cita =
      await citaService.obtenerPorId(id, request.user!);

    if (!cita) {
      response
        .status(StatusCodes.NOT_FOUND)
        .json({
          success: false,
          message: "Cita no encontrada",
        });

      return;
    }

    sendSuccess(
      response,
      StatusCodes.OK,
      "Cita obtenida correctamente",
      cita
    );
  };

  crear = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const cita =
      await citaService.crear(request.body, request.user!);

    sendSuccess(
      response,
      StatusCodes.CREATED,
      "Cita registrada correctamente",
      cita
    );
  };

  cambiarEstado = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseId(request.params.id);
    const cita = await citaService.cambiarEstado(
      id,
      request.body,
      request.user!
    );

    sendSuccess(
      response,
      StatusCodes.OK,
      "Estado de la cita actualizado correctamente",
      cita
    );
  };

  obtenerDisponibilidad = async (
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const disponibilidad = await citaService.obtenerDisponibilidad(
      Number(request.query.profesionalId),
      Number(request.query.servicioId),
      typeof request.query.fecha === "string" ? request.query.fecha : ""
    );
    sendSuccess(
      response,
      StatusCodes.OK,
      "Disponibilidad obtenida correctamente",
      disponibilidad
    );
  };

  listarEstados = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const estados =
      await citaService.listarEstados();

    sendSuccess(
      response,
      StatusCodes.OK,
      "Estados de cita obtenidos correctamente",
      estados
    );
  };

  listarModalidades = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const modalidades =
      await citaService.listarModalidades();

    sendSuccess(
      response,
      StatusCodes.OK,
      "Modalidades obtenidas correctamente",
      modalidades
    );
  };
}
