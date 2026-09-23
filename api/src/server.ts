import express from "express";
import path from "path";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import tipoEspecialidad from "./routes/tipoEspecialidad.routes";
import usuarioRoutes from "./routes/usuario.routes";
import servicioRoutes from "./routes/servicio.routes";
import modalidadRoutes from "./routes/modalidad.routes";
import estadoServicioRoutes from "./routes/estado-servicio.routes";
import { PerfilProfesionalRoutes } from "./routes/perfil-profesional.routes";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";
import { sendSuccess } from "./utils/http-response";
import { StatusCodes } from "http-status-codes";
import { AppRoutes } from "./routes/routes";

const app = express();
// Acceder a la configuracion del archivo .env
dotenv.config();
// Puerto que escucha por defecto 300 o definido .env
const port = process.env.PORT || 3000;
// Middleware CORS para aceptar llamadas en el servido
app.use(cors());
// Middleware para loggear las llamadas al servidor
app.use(morgan("dev"));
// Middleware para gestionar Requests y Response json
app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.resolve(process.cwd(), "uploads")
  )
);
app.use(
    express.urlencoded({
        extended: true,
    })
);


app.get("/", (req, res) => {
    return sendSuccess(res, StatusCodes.OK, "API del proyecto funcionando correctamente");
});
//---- Definir rutas ----
app.use(AppRoutes.routes);
app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/tipos-especialidad", tipoEspecialidad);
app.use("/servicios", servicioRoutes);
app.use("/modalidades", modalidadRoutes)
app.use("/estados-servicio", estadoServicioRoutes);
app.use("/profesionales", PerfilProfesionalRoutes.routes);

// Handle errors middleware
app.use(ErrorMiddleware.handleError);

//Acceso a las imágenes

app.listen(port, () => {
    logger.info(`http://localhost:${port}`);
    logger.info("Presione CTRL-C para detenerlo");
});

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);
