import { z } from "zod";

// Los datos llegan como multipart/form-data (van junto con el PDF de
// credenciales), por lo que todo llega como string y hay que convertir
// con z.coerce, igual que en createProfesionalCompletoSchema.
export const crearSolicitudProfesionalSchema = z.object({
  ubicacionId: z.coerce
    .number()
    .int()
    .positive("La ubicación es obligatoria"),

  tituloProfesional: z
    .string()
    .trim()
    .min(3, "El título profesional debe tener al menos 3 caracteres")
    .max(150, "El título profesional no puede superar 150 caracteres"),

  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres"),

  aniosExperiencia: z.coerce
    .number()
    .int()
    .min(0, "Los años de experiencia no pueden ser negativos"),

  tarifaBase: z.coerce
    .number()
    .positive("La tarifa base debe ser mayor a cero"),

  // Llega como string separado por comas ("1,4,7") o como arreglo, según
  // cómo lo arme el cliente HTTP; se normaliza a number[].
  especialidadIds: z.preprocess((value) => {
    if (Array.isArray(value)) {
      return value.map((item) => Number(item));
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => !Number.isNaN(item));
    }

    return [];
  }, z.array(z.number().int().positive())
    .min(1, "Debe seleccionar al menos una especialidad")),
});

export type CrearSolicitudProfesionalDto = z.infer<
  typeof crearSolicitudProfesionalSchema
>;

export const rechazarSolicitudProfesionalSchema = z.object({
  motivoRechazo: z
    .string()
    .trim()
    .min(10, "El motivo de rechazo debe tener al menos 10 caracteres")
    .max(500, "El motivo de rechazo no puede superar 500 caracteres"),
});

export type RechazarSolicitudProfesionalDto = z.infer<
  typeof rechazarSolicitudProfesionalSchema
>;
