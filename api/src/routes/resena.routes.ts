import { Router } from "express";
import { ResenaController } from "../controllers/resena.controller";
import { crearResenaSchema } from "../dtos/resena.dto";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { autorizarRoles, verificarAutenticacion } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

export class ResenaRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ResenaController();

    router.get(
      "/profesional/:profesionalId",
      asyncHandler(controller.listarPorProfesional)
    );
    router.post(
      "/",
      verificarAutenticacion,
      autorizarRoles("Cliente"),
      validateRequest(crearResenaSchema),
      asyncHandler(controller.crear)
    );
    return router;
  }
}
