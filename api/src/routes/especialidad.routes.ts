import { Router } from "express";
import { EspecialidadController } from "../controllers/especialidad.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import {
  autorizarRoles,
  verificarAutenticacion,
} from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
  createEspecialidadSchema,
  updateEspecialidadSchema,
} from "../dtos/especialidad.dto";

export class EspecialidadRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new EspecialidadController();

    router.get("/", asyncHandler(controller.listar));
    router.get("/:id", asyncHandler(controller.obtenerPorId));

    router.post(
      "/",
      verificarAutenticacion,
      autorizarRoles("Administrador"),
      validateRequest(createEspecialidadSchema),
      asyncHandler(controller.crear)
    );

    router.put(
      "/:id",
      verificarAutenticacion,
      autorizarRoles("Administrador"),
      validateRequest(updateEspecialidadSchema),
      asyncHandler(controller.actualizar)
    );

    router.delete(
    "/:id",
    verificarAutenticacion,
    autorizarRoles("Administrador"),
    asyncHandler(controller.eliminar)
    );

    router.patch(
     "/:id/estado",
  verificarAutenticacion,
  autorizarRoles("Administrador"),
  asyncHandler(controller.cambiarEstado)
  );

    return router;
  }
}