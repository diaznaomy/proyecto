import { z } from "zod";

export const createEspecialidadSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar 120 caracteres"),

  descripcion: z
    .string()
    .trim()
    .max(255, "La descripción no puede superar 255 caracteres")
    .optional(),

  tipoEspecialidadId: z
    .number()
    .int()
    .positive("El tipo de especialidad es obligatorio"),

  estadoEspecialidadId: z
    .number()
    .int()
    .positive("El estado de especialidad es obligatorio"),
});

export const updateEspecialidadSchema = createEspecialidadSchema.partial();

export type CreateEspecialidadDto = z.infer<typeof createEspecialidadSchema>;
export type UpdateEspecialidadDto = z.infer<typeof updateEspecialidadSchema>;