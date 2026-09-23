import { Router } from "express";

import { NotificacionController } from "../controllers/notificacion.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { verificarAutenticacion } from "../middlewares/auth.middleware";

export class NotificacionRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new NotificacionController();

    router.get(
      "/",
      verificarAutenticacion,
      asyncHandler(controller.listar)
    );

    router.patch(
      "/leer-todas",
      verificarAutenticacion,
      asyncHandler(controller.marcarTodasComoLeidas)
    );

    router.patch(
      "/:id/leer",
      verificarAutenticacion,
      asyncHandler(controller.marcarComoLeida)
    );

    return router;
  }
}
