import { prisma } from "../config/prisma";
import {
  CambiarEstadoCitaDto,
  CrearCitaDto,
} from "../dtos/cita.dto";
import { AppError } from "../utils/app-error";

type UsuarioAutenticado = {
  id: number;
  role: string;
};

const incluirRelaciones = {
  cliente: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      correo: true,
      telefono: true,

      rol: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  },

  profesional: {
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          correo: true,
          telefono: true,
        },
      },

      ubicacion: true,
    },
  },

  servicio: {
    include: {
      modalidad: true,
      estadoServicio: true,

      especialidades: {
        include: {
          especialidad: {
            include: {
              tipoEspecialidad: true,
              estadoEspecialidad: true,
            },
          },
        },
      },
    },
  },

  estadoCita: true,
  modalidad: true,
  historialEstados: {
    include: {
      estadoAnterior: true,
      estadoNuevo: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          rol: { select: { nombre: true } },
        },
      },
    },
    orderBy: { fechaCambio: "asc" as const },
  },
  resena: true,
  asistencia: true,
} as const;

const transicionesPermitidas: Record<string, string[]> = {
  Pendiente: ["Aceptada", "Rechazada", "Cancelada"],
  Aceptada: ["Completada", "Cancelada"],
};

const HORA_APERTURA = 8;
const HORA_CIERRE = 18;
const INTERVALO_MINUTOS = 30;

/**
 * Agrega la edad directamente desde Usuario.
 *
 * Esto evita depender de que Prisma incluya
 * edad dentro de la relación cliente.
 */
async function agregarEdadClientes<T extends { clienteId: number; cliente: any }>(
  citas: T[]
): Promise<T[]> {

  if (citas.length === 0) {
    return citas;
  }

  const clienteIds = [
    ...new Set(
      citas.map((cita) => cita.clienteId)
    ),
  ];

  const clientes = await prisma.usuario.findMany({
    where: {
      id: {
        in: clienteIds,
      },
    },

    select: {
      id: true,
      edad: true,
    },
  });

  const edades = new Map<number, number | null>(
    clientes.map((cliente) => [
      cliente.id,
      cliente.edad,
    ])
  );

  return citas.map((cita) => ({
    ...cita,

    cliente: {
      ...cita.cliente,

      edad:
        edades.get(cita.clienteId) ?? null,
    },
  }));
}


const combinarFechaHora = (
  fecha: string,
  hora: string
): Date => {

  const fechaHora = new Date(
    `${fecha}T${hora}:00`
  );

  if (Number.isNaN(fechaHora.getTime())) {
    throw AppError.badRequest(
      "La fecha u hora indicada no es válida"
    );
  }

  return fechaHora;
};


const validarFechaFutura = (
  fechaHora: Date
): void => {

  const ahora = new Date();

  if (fechaHora <= ahora) {
    throw AppError.badRequest(
      "La cita debe programarse para una fecha y hora futura"
    );
  }
};


export const citaService = {

  async listar(usuario: UsuarioAutenticado) {

    // ==========================================
    // ADMINISTRADOR
    // ==========================================

    if (usuario.role === "Administrador") {

      const citas = await prisma.cita.findMany({

        include: incluirRelaciones,

        orderBy: [
          {
            fechaCita: "desc",
          },
          {
            horaInicio: "desc",
          },
        ],
      });

      return agregarEdadClientes(citas);
    }


    // ==========================================
    // PROFESIONAL
    // ==========================================

    if (usuario.role === "Profesional") {

      const perfil =
        await prisma.perfilProfesional.findUnique({
          where: {
            usuarioId: usuario.id,
          },
        });

      if (!perfil) {
        throw AppError.forbidden(
          "No tienes un perfil profesional asociado"
        );
      }

      const citas = await prisma.cita.findMany({

        where: {
          profesionalId: perfil.id,
        },

        include: incluirRelaciones,

        orderBy: [
          {
            fechaCita: "desc",
          },
          {
            horaInicio: "desc",
          },
        ],
      });

      return agregarEdadClientes(citas);
    }


    // ==========================================
    // CLIENTE
    // ==========================================

    if (usuario.role === "Cliente") {

      const citas = await prisma.cita.findMany({

        where: {
          clienteId: usuario.id,
        },

        include: incluirRelaciones,

        orderBy: [
          {
            fechaCita: "desc",
          },
          {
            horaInicio: "desc",
          },
        ],
      });

      return agregarEdadClientes(citas);
    }


    throw AppError.forbidden(
      "No tienes permisos para consultar citas"
    );
  },


  async obtenerPorId(
    id: number,
    usuario: UsuarioAutenticado
  ) {

    const cita =
      await prisma.cita.findUnique({

        where: {
          id,
        },

        include: incluirRelaciones,
      });

    if (!cita) {
      return null;
    }


    // ==========================================
    // ADMINISTRADOR
    // ==========================================

    if (usuario.role === "Administrador") {

      const resultado =
        await agregarEdadClientes([cita]);

      return resultado[0];
    }


    // ==========================================
    // PROFESIONAL
    // ==========================================

    if (usuario.role === "Profesional") {

      const perfil =
        await prisma.perfilProfesional.findUnique({
          where: {
            usuarioId: usuario.id,
          },
        });

      if (
        !perfil ||
        cita.profesionalId !== perfil.id
      ) {
        throw AppError.forbidden(
          "No puedes consultar una cita que no te pertenece"
        );
      }

      const resultado =
        await agregarEdadClientes([cita]);

      return resultado[0];
    }


    // ==========================================
    // CLIENTE
    // ==========================================

    if (usuario.role === "Cliente") {

      if (cita.clienteId !== usuario.id) {
        throw AppError.forbidden(
          "No puedes consultar una cita que no te pertenece"
        );
      }

      const resultado =
        await agregarEdadClientes([cita]);

      return resultado[0];
    }


    throw AppError.forbidden(
      "No tienes permisos para consultar esta cita"
    );
  },


  async crear(
    data: CrearCitaDto,
    usuario: UsuarioAutenticado
  ) {

    if (usuario.role !== "Cliente") {
      throw AppError.forbidden(
        "Solo un cliente puede registrar citas"
      );
    }

    if (data.clienteId !== usuario.id) {
      throw AppError.forbidden(
        "La cita solo puede crearse para el usuario autenticado"
      );
    }


    const cliente =
      await prisma.usuario.findUnique({

        where: {
          id: usuario.id,
        },

        include: {
          rol: true,
          estadoUsuario: true,
        },
      });

    if (!cliente) {
      throw AppError.badRequest(
        "El cliente seleccionado no existe"
      );
    }


    if (
      cliente.rol.nombre
        .trim()
        .toLowerCase() !== "cliente"
    ) {
      throw AppError.badRequest(
        "El usuario seleccionado no posee el rol Cliente"
      );
    }


    if (
      cliente.estadoUsuario.nombre
        .trim()
        .toLowerCase() !== "activo"
    ) {
      throw AppError.badRequest(
        "El cliente seleccionado no se encuentra activo"
      );
    }


    const profesional =
      await prisma.perfilProfesional.findUnique({

        where: {
          id: data.profesionalId,
        },

        include: {
          usuario: {
            include: {
              estadoUsuario: true,
            },
          },
        },
      });

    if (!profesional) {
      throw AppError.badRequest(
        "El profesional seleccionado no existe"
      );
    }


    if (!profesional.disponible) {
      throw AppError.badRequest(
        "El profesional seleccionado no está disponible"
      );
    }


    if (
      profesional.usuario.estadoUsuario.nombre
        .trim()
        .toLowerCase() !== "activo"
    ) {
      throw AppError.badRequest(
        "El profesional seleccionado no se encuentra activo"
      );
    }


    const servicio =
      await prisma.servicio.findUnique({

        where: {
          id: data.servicioId,
        },

        include: {
          perfilProfesional: true,
          modalidad: true,
          estadoServicio: true,
        },
      });

    if (!servicio) {
      throw AppError.badRequest(
        "El servicio seleccionado no existe"
      );
    }


    if (
      servicio.estadoServicio.nombre
        .trim()
        .toLowerCase() !== "activo"
    ) {
      throw AppError.badRequest(
        "El servicio seleccionado no está activo"
      );
    }


    if (
      servicio.perfilProfesionalId !==
      data.profesionalId
    ) {
      throw AppError.badRequest(
        "El servicio no pertenece al profesional seleccionado"
      );
    }


    const modalidad =
      await prisma.modalidad.findUnique({

        where: {
          id: data.modalidadId,
        },
      });

    if (!modalidad) {
      throw AppError.badRequest(
        "La modalidad seleccionada no existe"
      );
    }


    if (
      servicio.modalidadId !==
      data.modalidadId
    ) {
      throw AppError.badRequest(
        "La modalidad seleccionada no corresponde al servicio"
      );
    }


    const estadoPendiente =
      await prisma.estadoCita.findFirst({

        where: {
          nombre: {
            equals: "Pendiente",
          },
        },
      });

    if (!estadoPendiente) {
      throw AppError.badRequest(
        "No se encontró el estado inicial Pendiente"
      );
    }


    const horaInicio =
      combinarFechaHora(
        data.fecha,
        data.hora
      );

    validarFechaFutura(horaInicio);


    const horaFin = new Date(
      horaInicio.getTime() +
        servicio.duracionEstimada * 60 * 1000
    );

    validarHorarioJornada(horaInicio, horaFin);

    const fechaCita = new Date(
      `${data.fecha}T00:00:00`
    );

    const citaSuperpuesta =
      await prisma.cita.findFirst({

        where: {

          profesionalId:
            data.profesionalId,

          horaInicio: {
            lt: horaFin,
          },

          horaFin: {
            gt: horaInicio,
          },

          estadoCita: {
            nombre: {
              notIn: [
                "Cancelada",
                "Rechazada",
              ],
            },
          },
        },
      });


    if (citaSuperpuesta) {
      throw AppError.conflict(
        "El profesional ya tiene una cita programada en ese horario"
      );
    }

      return prisma.$transaction(async (transaction) => {
      const cita = await transaction.cita.create({
        data: {
          clienteId: usuario.id,
          profesionalId: data.profesionalId,
          servicioId: data.servicioId,
          modalidadId: data.modalidadId,
          estadoCitaId: estadoPendiente.id,
          fechaCita,
          horaInicio,
          horaFin,
          comentarioCliente: data.comentario.trim(),
          comentarioProfesional: null,
          montoEstimado: servicio.precio,
        },
      });

      await transaction.historialEstadoCita.create({
        data: {
          citaId: cita.id,
          estadoAnteriorId: null,
          estadoNuevoId: estadoPendiente.id,
          usuarioId: usuario.id,
          comentario: "Solicitud de cita registrada",
        },
      });

      return transaction.cita.findUniqueOrThrow({
        where: {
          id: cita.id,
        },
        include: incluirRelaciones,
      });
    });
  },

  async obtenerDisponibilidad(
    profesionalId: number,
    servicioId: number,
    fecha: string
  ) {
    if (!profesionalId || !servicioId || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw AppError.badRequest("Profesional, servicio y fecha son obligatorios");
    }

    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
      include: { modalidad: true, estadoServicio: true },
    });
    if (!servicio || servicio.perfilProfesionalId !== profesionalId) {
      throw AppError.badRequest("El servicio no pertenece al profesional seleccionado");
    }
    if (servicio.estadoServicio.nombre.toLowerCase() !== "activo") {
      throw AppError.badRequest("El servicio seleccionado no está activo");
    }

    const inicioFecha = new Date(`${fecha}T00:00:00`);
    const finFecha = new Date(`${fecha}T23:59:59.999`);
    if (Number.isNaN(inicioFecha.getTime())) throw AppError.badRequest("La fecha no es válida");

    const citas = await prisma.cita.findMany({
      where: {
        profesionalId,
        horaInicio: { gte: inicioFecha, lte: finFecha },
        estadoCita: { nombre: { notIn: ["Cancelada", "Rechazada"] } },
      },
      select: { horaInicio: true, horaFin: true },
    });

    const ahora = new Date();
    const bloques: Array<{
      hora: string;
      horaFin: string;
      disponible: boolean;
      motivo: string | null;
    }> = [];

    for (let minutos = HORA_APERTURA * 60; minutos < HORA_CIERRE * 60; minutos += INTERVALO_MINUTOS) {
      const hora = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
      const inicio = combinarFechaHora(fecha, hora);
      const fin = new Date(inicio.getTime() + servicio.duracionEstimada * 60 * 1000);
      const cierre = new Date(inicio);
      cierre.setHours(HORA_CIERRE, 0, 0, 0);
      if (fin > cierre) continue;

      const pasada = inicio <= ahora;
      const ocupada = citas.some((cita) => cita.horaInicio < fin && cita.horaFin > inicio);
      bloques.push({
        hora,
        horaFin: fin.toLocaleTimeString("es-CR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        disponible: !pasada && !ocupada,
        motivo: pasada ? "Hora pasada" : ocupada ? "Ocupado" : null,
      });
    }

    return {
      fecha,
      duracionEstimada: servicio.duracionEstimada,
      modalidad: servicio.modalidad,
      montoEstimado: servicio.precio,
      jornada: { inicio: "08:00", fin: "18:00", intervaloMinutos: INTERVALO_MINUTOS },
      bloques,
    };
  },

  async cambiarEstado(
    id: number,
    data: CambiarEstadoCitaDto,
    usuario: UsuarioAutenticado
  ) {
    const cita = await prisma.cita.findUnique({
      where: { id },
      include: { estadoCita: true },
    });

    if (!cita) {
      throw AppError.notFound("Cita no encontrada");
    }

    const esClienteDuenio =
      usuario.role === "Cliente" && cita.clienteId === usuario.id;

    let esProfesionalAsignado = false;
    if (usuario.role === "Profesional") {
      const perfil = await prisma.perfilProfesional.findUnique({
        where: { usuarioId: usuario.id },
        select: { id: true },
      });
      esProfesionalAsignado = perfil?.id === cita.profesionalId;
    }

    if (usuario.role === "Administrador") {
      throw AppError.forbidden(
        "El administrador puede consultar citas, pero no cambiar su estado"
      );
    }

    if (data.estado === "Cancelada") {
      const puedeCancelarPendiente =
        cita.estadoCita.nombre === "Pendiente" && esClienteDuenio;
      const puedeCancelarAceptada =
        cita.estadoCita.nombre === "Aceptada" &&
        (esClienteDuenio || esProfesionalAsignado);

      if (!puedeCancelarPendiente && !puedeCancelarAceptada) {
        throw AppError.forbidden("No puedes cancelar esta cita en su estado actual");
      }
    } else if (!esProfesionalAsignado) {
      throw AppError.forbidden(
        "Solo el profesional asignado puede realizar esta transición"
      );
    }

    const permitidos = transicionesPermitidas[cita.estadoCita.nombre] ?? [];
    if (!permitidos.includes(data.estado)) {
      throw AppError.conflict(
        `No se puede cambiar una cita ${cita.estadoCita.nombre} a ${data.estado}`
      );
    }

    if (data.estado === "Completada" && new Date() < cita.horaFin) {
      throw AppError.badRequest(
        "La cita no puede completarse antes de su hora de finalización"
      );
    }

    const estadoNuevo = await prisma.estadoCita.findUnique({
      where: { nombre: data.estado },
    });
    if (!estadoNuevo) {
      throw AppError.badRequest(`El estado ${data.estado} no está configurado`);
    }

    return prisma.$transaction(async (transaction) => {
      await transaction.cita.update({
        where: { id },
        data: {
          estadoCitaId: estadoNuevo.id,
          comentarioProfesional:
            usuario.role === "Cliente"
              ? undefined
              : data.comentario || undefined,
        },
      });

      await transaction.historialEstadoCita.create({
        data: {
          citaId: id,
          estadoAnteriorId: cita.estadoCitaId,
          estadoNuevoId: estadoNuevo.id,
          usuarioId: usuario.id,
          comentario: data.comentario || null,
        },
      });

      return transaction.cita.findUniqueOrThrow({
        where: { id },
        include: incluirRelaciones,
      });
    });
  },


  async listarEstados() {

    return prisma.estadoCita.findMany({

      orderBy: {
        id: "asc",
      },
    });
  },


  async listarModalidades() {

    return prisma.modalidad.findMany({

      orderBy: {
        nombre: "asc",
      },
    });
  },
};

const validarHorarioJornada = (horaInicio: Date, horaFin: Date): void => {
  const inicioJornada = new Date(horaInicio);
  inicioJornada.setHours(HORA_APERTURA, 0, 0, 0);
  const finJornada = new Date(horaInicio);
  finJornada.setHours(HORA_CIERRE, 0, 0, 0);

  if (
    horaInicio < inicioJornada ||
    horaFin > finJornada ||
    horaInicio.getMinutes() % INTERVALO_MINUTOS !== 0
  ) {
    throw AppError.badRequest(
      "Seleccione un bloque válido entre las 08:00 y las 18:00"
    );
  }
};
