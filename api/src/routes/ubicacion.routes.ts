import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { listar } from "../controllers/ubicacion.controller";

const router = Router();

router.get("/", asyncHandler(listar));

export default router;