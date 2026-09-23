import { Router } from "express";
import { PerfilProfesionalController } from "../controllers/perfil-profesional.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import {
  autorizarRoles,
  verificarAutenticacion,
} from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
  createPerfilProfesionalSchema,
  updatePerfilProfesionalSchema,
  cambiarDisponibilidadSchema,
  createProfesionalCompletoSchema,
  updateProfesionalCompletoSchema,
} from "../dtos/perfil-profesional.dto";
import { uploadPerfilImage } from "../middlewares/perfil-image.middleware";

export class PerfilProfesionalRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new PerfilProfesionalController();

    router.get("/", asyncHandler(controller.listar));

router.post(
  "/completo",
  verificarAutenticacion,
  autorizarRoles("Administrador"),
  uploadPerfilImage.single("imagen"),
  validateRequest(createProfesionalCompletoSchema),
  asyncHandler(controller.crearCompleto)
);

router.post(
  "/",
  verificarAutenticacion,
  autorizarRoles("Administrador", "Profesional"),
  validateRequest(createPerfilProfesionalSchema),
  asyncHandler(controller.crear)
);

router.get(
  "/mio",
  verificarAutenticacion,
  autorizarRoles("Profesional"),
  asyncHandler(controller.obtenerMio)
);

router.get("/:id", asyncHandler(controller.obtenerPorId));

router.put(
  "/:id",
  verificarAutenticacion,
  autorizarRoles("Administrador", "Profesional"),
  validateRequest(updatePerfilProfesionalSchema),
  asyncHandler(controller.actualizar)
);

router.patch(
  "/:id/disponibilidad",
  verificarAutenticacion,
  autorizarRoles("Administrador", "Profesional"),
  validateRequest(cambiarDisponibilidadSchema),
  asyncHandler(controller.cambiarDisponibilidad)
);

router.put(
  "/completo/:id",
  verificarAutenticacion,
  autorizarRoles("Administrador", "Profesional"),
  uploadPerfilImage.single("imagen"),
  validateRequest(updateProfesionalCompletoSchema),
  asyncHandler(controller.actualizarCompleto)
);

    return router;
  }
}
