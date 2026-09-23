import { Router } from "express";

import { asyncHandler } from "../middlewares/async-handler.middleware";
import {
    autorizarRoles,
    verificarAutenticacion,
} from "../middlewares/auth.middleware";
import { listar } from "../controllers/modalidad.controller";

const router = Router();

// router.use(verificarAutenticacion);
// router.use(autorizarRoles("Administrador"));

router.get("/", asyncHandler(listar));

export default router;