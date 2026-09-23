import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

import {
  actualizarTipoEspecialidad,
  cambiarEstadoTipoEspecialidad,
  crearTipoEspecialidad,
  eliminarTipoEspecialidad,
  listarTiposEspecialidad,
  obtenerTipoEspecialidadPorId,
} from "../services/tipoEspecialidad.service";

export const cambiarEstado = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseId(req.params.id);

  const tipoEspecialidad = await cambiarEstadoTipoEspecialidad(id);

  sendSuccess(
    res,
    StatusCodes.OK,
    "Estado del tipo de especialidad actualizado correctamente",
    tipoEspecialidad,
  );
};

export const listar = async (_req: Request, res: Response): Promise<void> => {
  const tiposEspecialidad = await listarTiposEspecialidad();

  sendSuccess(
    res,
    StatusCodes.OK,
    "Tipos de especialidad obtenidos correctamente",
    tiposEspecialidad,
  );
};

export const obtenerPorId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseId(req.params.id);

  const tipoEspecialidad = await obtenerTipoEspecialidadPorId(id);

  sendSuccess(
    res,
    StatusCodes.OK,
    "Tipo de especialidad obtenido correctamente",
    tipoEspecialidad,
  );
};

export const crear = async (req: Request, res: Response): Promise<void> => {
  const tipoEspecialidad = await crearTipoEspecialidad(req.body);

  sendSuccess(
    res,
    StatusCodes.CREATED,
    "Tipo de especialidad creado correctamente",
    tipoEspecialidad,
  );
};

export const actualizar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseId(req.params.id);

  const tipoEspecialidad = await actualizarTipoEspecialidad(id, req.body);

  sendSuccess(
    res,
    StatusCodes.OK,
    "Tipo de especialidad actualizado correctamente",
    tipoEspecialidad,
  );
};

export const eliminar = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);

  const tipoEspecialidad = await eliminarTipoEspecialidad(id);

  sendSuccess(
    res,
    StatusCodes.OK,
    "Tipo de especialidad eliminado correctamente",
    tipoEspecialidad,
  );
};