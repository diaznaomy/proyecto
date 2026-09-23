import { Router } from "express";

import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    AuthRequest,
    authenticateToken,
    autorizarRoles,
} from "../middlewares/auth.middleware";
import {
    actualizar,
    cambiarEstado,
    crear,
    eliminar,
    listar,
    obtenerPorId,
} from "../controllers/usuario.controller";
import {
    usuarioCreateSchema,
    usuarioUpdateSchema,
} from "../dtos/usuario.dto";

const router = Router();

router.use(authenticateToken);
router.use(autorizarRoles("Administrador"));

router.get("/", asyncHandler(listar));
router.get("/:id", asyncHandler(obtenerPorId));
router.post("/", validateRequest(usuarioCreateSchema), asyncHandler(crear));
router.put("/:id", validateRequest(usuarioUpdateSchema), asyncHandler(actualizar));
router.patch("/:id/estado", asyncHandler(cambiarEstado));
router.delete("/:id", asyncHandler(eliminar));

export default router;