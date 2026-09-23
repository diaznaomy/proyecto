import { Router } from "express";
import { EspecialidadRoutes } from "./especialidad.routes";
import { PerfilProfesionalRoutes } from "./perfil-profesional.routes";
import ubicacionRoutes from "./ubicacion.routes";
import { CitaRoutes } from "./cita.routes";
import servicioRoutes from "./servicio.routes";
import tipoEspecialidadRoutes from "./tipoEspecialidad.routes";
import { ResenaRoutes } from "./resena.routes";
import { ReporteRoutes } from "./reporte.routes";
import { NotificacionRoutes } from "./notificacion.routes";
import { SolicitudProfesionalRoutes } from "./solicitud-profesional.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // ----Agregar las rutas----
    router.use("/especialidad", EspecialidadRoutes.routes);
    router.use("/perfil-profesional", PerfilProfesionalRoutes.routes);
    router.use("/ubicaciones", ubicacionRoutes);
    router.use("/citas",CitaRoutes.routes);
    router.use("/servicios", servicioRoutes);
    router.use("/tipos-especialidad",tipoEspecialidadRoutes);
    router.use("/resenas", ResenaRoutes.routes);
    router.use("/reportes", ReporteRoutes.routes);
    router.use("/notificaciones", NotificacionRoutes.routes);
    router.use("/solicitudes-profesional", SolicitudProfesionalRoutes.routes);


    return router;
  }
}
