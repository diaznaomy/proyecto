import { Router } from "express";
import { SolicitudProfesionalController } from "../controllers/solicitud-profesional.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import {
  autorizarRoles,
  verificarAutenticacion,
} from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
  crearSolicitudProfesionalSchema,
  rechazarSolicitudProfesionalSchema,
} from "../dtos/solicitud-profesional.dto";
import { uploadCredencialProfesional } from "../middlewares/credencial-profesional.middleware";

export class SolicitudProfesionalRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new SolicitudProfesionalController();

    // Cliente: crear su propia solicitud (multipart: datos + PDF).
    router.post(
      "/",
      verificarAutenticacion,
      autorizarRoles("Cliente"),
      uploadCredencialProfesional.single("credencial"),
      validateRequest(crearSolicitudProfesionalSchema),
      asyncHandler(controller.crear)
    );

    // Cualquier usuario autenticado: consultar su propia solicitud más
    // reciente (Cliente esperando resolución, o historial si ya se
    // resolvió).
    router.get(
      "/mia",
      verificarAutenticacion,
      asyncHandler(controller.obtenerMia)
    );

    // Administrador: listado de solicitudes pendientes.
    router.get(
      "/",
      verificarAutenticacion,
      autorizarRoles("Administrador"),
      asyncHandler(controller.listarPendientes)
    );

    // Administrador: detalle completo de una solicitud.
    router.get(
      "/:id",
      verificarAutenticacion,
      autorizarRoles("Administrador"),
      asyncHandler(controller.obtenerPorId)
    );

    // Administrador o dueño de la solicitud: descargar el PDF de
    // credenciales. La verificación de "dueño" ocurre dentro del
    // controller/service, no solo por rol.
    router.get(
      "/:id/credencial",
      verificarAutenticacion,
      asyncHandler(controller.descargarCredencial)
    );

    // Administrador: aprobar/rechazar.
    router.patch(
      "/:id/aprobar",
      verificarAutenticacion,
      autorizarRoles("Administrador"),
      asyncHandler(controller.aprobar)
    );

    router.patch(
      "/:id/rechazar",
      verificarAutenticacion,
      autorizarRoles("Administrador"),
      validateRequest(rechazarSolicitudProfesionalSchema),
      asyncHandler(controller.rechazar)
    );

    return router;
  }
}
