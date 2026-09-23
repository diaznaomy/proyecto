import { z } from "zod";

export const crearCitaSchema = z.object({
  clienteId: z.coerce
    .number()
    .int()
    .positive("El cliente es obligatorio"),

  profesionalId: z.coerce
    .number()
    .int()
    .positive("El profesional es obligatorio"),

  servicioId: z.coerce
    .number()
    .int()
    .positive("El servicio es obligatorio"),

  modalidadId: z.coerce
    .number()
    .int()
    .positive("La modalidad es obligatoria"),

  fecha: z
    .string()
    .trim()
    .min(1, "La fecha es obligatoria")
    .refine(
      (fecha) => !Number.isNaN(Date.parse(fecha)),
      {
        message: "La fecha no tiene un formato válido",
      }
    ),

  hora: z
    .string()
    .trim()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "La hora debe tener el formato HH:mm"
    ),

  comentario: z
    .string()
    .trim()
    .min(
      5,
      "El comentario debe tener al menos 5 caracteres"
    )
    .max(
      1000,
      "El comentario no puede superar 1000 caracteres"
    ),
});

export type CrearCitaDto = z.infer<
  typeof crearCitaSchema
>;

export const cambiarEstadoCitaSchema = z.object({
  estado: z.enum([
    "Aceptada",
    "Rechazada",
    "Cancelada",
    "Completada",
  ]),
  comentario: z.string().trim()
    .max(1000, "El comentario no puede superar 1000 caracteres")
    .optional(),
}).superRefine((data, context) => {
  if (
    ["Rechazada", "Cancelada"].includes(data.estado) &&
    (!data.comentario || data.comentario.length < 3)
  ) {
    context.addIssue({
      code: "custom",
      path: ["comentario"],
      message: "Debe indicar un motivo de al menos 3 caracteres",
    });
  }
});

export type CambiarEstadoCitaDto = z.infer<
  typeof cambiarEstadoCitaSchema
>;
