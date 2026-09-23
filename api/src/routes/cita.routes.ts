import { Router } from "express";

import { CitaController } from "../controllers/cita.controller";
import {
  cambiarEstadoCitaSchema,
  crearCitaSchema,
} from "../dtos/cita.dto";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import {
  autorizarRoles,
  verificarAutenticacion,
} from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

export class CitaRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CitaController();

    router.get(
      "/",
      verificarAutenticacion,
      asyncHandler(controller.listar)
    );

    router.get(
      "/estados",
      asyncHandler(controller.listarEstados)
    );

    router.get(
      "/modalidades",
      asyncHandler(
        controller.listarModalidades
      )
    );

    router.get(
      "/disponibilidad",
      verificarAutenticacion,
      autorizarRoles("Cliente"),
      asyncHandler(controller.obtenerDisponibilidad)
    );

    router.post(
      "/",
      verificarAutenticacion,
      autorizarRoles("Cliente"),
      validateRequest(crearCitaSchema),
      asyncHandler(controller.crear)
    );

    router.get(
      "/:id",
      verificarAutenticacion,
      asyncHandler(controller.obtenerPorId)
    );

    router.patch(
      "/:id/estado",
      verificarAutenticacion,
      autorizarRoles("Cliente", "Profesional"),
      validateRequest(cambiarEstadoCitaSchema),
      asyncHandler(controller.cambiarEstado)
    );

    return router;
  }
}
