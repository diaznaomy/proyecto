import { Router } from "express";

import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
    iniciarSesionUsuario,
    registrarUsuario,
    obtenerPerfilUsuario,
    actualizarPerfilUsuario,
} from "../controllers/auth.controller";
import {
    loginSchema,
    registrarSchema,
    actualizarPerfilSchema,
} from "../dtos/auth.dto";

const router = Router();

router.post(
    "/register",
    validateRequest(registrarSchema),
    asyncHandler(registrarUsuario)
);
router.post(
    "/login",
    validateRequest(loginSchema),
    asyncHandler(iniciarSesionUsuario)
);

router.get(
    "/perfil",
    authenticateToken,
    asyncHandler(obtenerPerfilUsuario)
);

router.put(
    "/perfil",
    authenticateToken,
    validateRequest(actualizarPerfilSchema),
    asyncHandler(actualizarPerfilUsuario)
);

export default router;