import { Router } from "express";

import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    autorizarRoles,
    verificarAutenticacion,
} from "../middlewares/auth.middleware";
import {
    actualizar,
    cambiarEstado,
    crear,
    listar,
    obtenerPorId,
} from "../controllers/servicio.controller";
import {
    servicioCreateSchema,
    servicioUpdateSchema,
} from "../dtos/servicio.dto";

const router = Router();

router.get("/", asyncHandler(listar));
router.get("/:id", asyncHandler(obtenerPorId));
router.post(
    "/",
    verificarAutenticacion,
    autorizarRoles("Profesional"),
    validateRequest(servicioCreateSchema),
    asyncHandler(crear)
);
router.put(
    "/:id",
    verificarAutenticacion,
    autorizarRoles("Profesional"),
    validateRequest(servicioUpdateSchema),
    asyncHandler(actualizar)
);
router.patch(
    "/:id/estado",
    verificarAutenticacion,
    autorizarRoles("Profesional"),
    asyncHandler(cambiarEstado)
);

export default router;