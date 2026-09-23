import { Router } from "express";

import { asyncHandler } from "../middlewares/async-handler.middleware";
import {
    autorizarRoles,
    verificarAutenticacion,
} from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    cambiarEstado,
    actualizar,
    crear,
    eliminar,
    listar,
    obtenerPorId,
} from "../controllers/tipoEspecialidad.controller";

import {
    tipoEspecialidadCreateSchema,
    tipoEspecialidadUpdateSchema,
} from "../dtos/tipoEspecialidad.dto";


const router = Router();



router.get("/", asyncHandler(listar));

router.get("/:id", asyncHandler(obtenerPorId));

router.post(
    "/",
    verificarAutenticacion,
    autorizarRoles("Administrador"),
    validateRequest(tipoEspecialidadCreateSchema),
    asyncHandler(crear)
);

router.put(
    "/:id",
        verificarAutenticacion,
        autorizarRoles("Administrador"),
    validateRequest(tipoEspecialidadUpdateSchema),
    asyncHandler(actualizar)
);

router.patch(
  "/:id/estado",
    verificarAutenticacion,
    autorizarRoles("Administrador"),
  asyncHandler(cambiarEstado)
);

router.delete(
    "/:id",
        verificarAutenticacion,
        autorizarRoles("Administrador"),
    asyncHandler(eliminar)
);


export default router;