import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { UsuariosList } from './pages/usuarios/list/usuarios-list';
import { EspecialidadAdminList } from './pages/especialidades/especialidad-admin-list/especialidad-admin-list';
import { ProfesionalAdminList } from './pages/profesionales/profesional-admin-list/profesional-admin-list';
import { ProfesionalAdminForm } from './pages/profesionales/profesional-admin-form/profesional-admin-form';
import { ProfesionalDetail } from './pages/profesionales/profesional-detail/profesional-detail';
import { CitaAdminList } from './pages/citas/cita-admin-list/cita-admin-list';
import { CitaAdminForm } from './pages/citas/cita-admin-form/cita-admin-form';
import { CitaDetail } from './pages/citas/cita-detail/cita-detail';
import { ServiciosList } from './pages/servicios/servicios-list/servicios-list';
import { ServicioForm } from './pages/servicios/servicio-form/servicio-form';
import { ServicioDetalle } from './pages/servicios/servicio-detalle/servicio-detalle';
import { TiposEspecialidadList } from './pages/tipoEspecialidad-list/tipoEspecialidad-list';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Perfil } from './pages/auth/perfil/perfil';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ReportesPage } from './pages/reportes/reportes';
import { Agenda } from './pages/agenda/agenda';
import { QuizProfesionalIdeal } from './pages/home/components/quiz-profesional-ideal/quiz-profesional';
import { Notificaciones } from './pages/notificaciones/notificaciones';
import { SolicitudProfesionalForm } from './pages/profesionales/solicitud-profesional-form/solicitud-profesional-form';
import { SolicitudesAdminList } from './pages/profesionales/solicitudes-admin-list/solicitudes-admin-list';
import { SolicitudAdminDetail } from './pages/profesionales/solicitud-admin-detail/solicitud-admin-detail';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Home,
        title: 'Inicio',
      },

      // Solo Administrador: gestión de usuarios
      {
        path: 'usuarios',
        component: UsuariosList,
        title: 'Usuarios',
        canActivate: [roleGuard(['Administrador'])],
      },

      // Solo Administrador: gestión de categorías/especialidades
      {
        path: 'especialidades',
        component: EspecialidadAdminList,
        canActivate: [roleGuard(['Administrador'])],
      },
      {
        path: 'tipos-especialidad',
        component: TiposEspecialidadList,
        title: 'Tipos de especialidad',
        canActivate: [roleGuard(['Administrador'])],
      },

      // Profesionales: listado para roles autenticados,
      // alta solo Administrador.
      {
        path: 'profesionales',
        component: ProfesionalAdminList,
        title: 'Profesionales',
      },
      {
        path: 'profesionales/nuevo',
        component: ProfesionalAdminForm,
        title: 'Crear profesional',
        canActivate: [roleGuard(['Administrador'])],
      },
      {
        path: 'mi-perfil-profesional',
        component: ProfesionalAdminForm,
        title: 'Mi perfil profesional',
        canActivate: [roleGuard(['Profesional'])],
        data: { perfilPropio: true },
      },
      // Editar: Administrador (cualquiera) o Profesional (el suyo propio;
      // la verificación de "es el suyo" debe hacerse en el componente/backend
      // comparando el :id de la ruta con authService.usuario()?.id)
      {
        path: 'profesionales/:id/editar',
        component: ProfesionalAdminForm,
        title: 'Editar profesional',
        canActivate: [roleGuard(['Administrador', 'Profesional'])],
      },

      // Solicitar ser profesional: solo Cliente. El propio backend valida
      // además que no exista ya una solicitud pendiente o un perfil.
      {
        path: 'profesionales/solicitar',
        component: SolicitudProfesionalForm,
        title: 'Solicitar ser profesional',
        canActivate: [roleGuard(['Cliente'])],
      },
      // Ver solicitudes pendientes: solo Administrador.
      {
        path: 'profesionales/solicitudes',
        component: SolicitudesAdminList,
        title: 'Solicitudes de profesional',
        canActivate: [roleGuard(['Administrador'])],
      },
      // Detalle de una solicitud: solo Administrador.
      {
        path: 'profesionales/solicitudes/:id',
        component: SolicitudAdminDetail,
        title: 'Detalle de solicitud',
        canActivate: [roleGuard(['Administrador'])],
      },

      // Detalle: público (clientes consultan profesionales sin sesión)
      {
        path: 'profesionales/:id',
        component: ProfesionalDetail,
        title: 'Detalle del profesional',
      },

      // Citas: Administrador (consulta todas) y Profesional (su agenda)
      {
        path: 'citas',
        component: CitaAdminList,
        title: 'Citas',
        canActivate: [authGuard],
      },
      {
        path: 'citas/nueva',
        component: CitaAdminForm,
        title: 'Registrar cita',
        canActivate: [roleGuard(['Cliente'])],
      },
      {
        path: 'citas/:id',
        component: CitaDetail,
        title: 'Detalle de cita',
        canActivate: [authGuard],
      },

      {
        path: 'reportes',
        component: ReportesPage,
        title: 'Reportes',
        canActivate: [roleGuard(['Administrador', 'Profesional'])],
      },

      // Servicios: listado y detalle públicos (catálogo)
      {
        path: 'servicios',
        component: ServiciosList,
        title: 'Servicios',
      },
    
      // Crear/editar servicio: solo Profesional (dueño de sus servicios)
      {
        path: 'servicios/nuevo',
        component: ServicioForm,
        title: 'Crear servicio',
        canActivate: [roleGuard(['Profesional'])],
      },
      {
        path: 'servicios/:id/editar',
        component: ServicioForm,
        title: 'Editar servicio',
        canActivate: [roleGuard(['Profesional'])],
      },
      {
        path: 'servicios/:id',
        component: ServicioDetalle,
        title: 'Detalle del servicio',
      },
      // Auth públicas
      {
        path: 'login',
        component: Login,
        title: 'Iniciar sesión',
      },
      {
        path: 'register',
        component: Register,
        title: 'Registrarse',
      },

      // Perfil: cualquier usuario autenticado, sin importar el rol
      {
        path: 'perfil',
        component: Perfil,
        title: 'Perfil',
        canActivate: [authGuard],
      },
      // Agenda: cualquier usuario autenticado, sin importar el rol
      {
        path: 'agenda',
        component: Agenda,
        title: 'Agenda',
        canActivate: [authGuard],
      },
      // Quiz de profesional ideal: cualquier usuario autenticado, sin importar el rol
      {
        path: 'quiz-profesional-ideal',
        component: QuizProfesionalIdeal,
        title: 'Quiz de profesional ideal',
      },
      {
        path: 'notificaciones',
        component: Notificaciones,
        title: 'Notificaciones',
        canActivate: [authGuard],
      },

    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
