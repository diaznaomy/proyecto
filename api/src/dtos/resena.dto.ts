import { z } from "zod";

export const crearResenaSchema = z.object({
  citaId: z.coerce.number().int().positive("La cita es obligatoria"),
  puntuacion: z.coerce.number().int()
    .min(1, "La puntuación mínima es 1")
    .max(5, "La puntuación máxima es 5"),
  comentario: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.string().trim()
      .min(3, "El comentario debe tener al menos 3 caracteres")
      .max(1000, "El comentario no puede superar 1000 caracteres")
      .optional()
  ),
});

export type CrearResenaDto = z.infer<typeof crearResenaSchema>;
