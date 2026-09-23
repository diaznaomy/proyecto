import { Router } from "express";
import { ReporteController } from "../controllers/reporte.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { autorizarRoles, verificarAutenticacion } from "../middlewares/auth.middleware";

export class ReporteRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ReporteController();
    router.get(
      "/",
      verificarAutenticacion,
      autorizarRoles("Administrador", "Profesional"),
      asyncHandler(controller.obtener)
    );
    return router;
  }
}
