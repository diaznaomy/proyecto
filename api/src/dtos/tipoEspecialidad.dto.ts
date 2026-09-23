import { z } from "zod";

export const tipoEspecialidadCreateSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),

    descripcion: z.string().trim().optional().nullable(),

    estadoTipoEspecialidadId: z.coerce
        .number()
        .int()
        .positive("El estadoTipoEspecialidadId es obligatorio y debe ser válido"),
});


export const tipoEspecialidadUpdateSchema = tipoEspecialidadCreateSchema
    .partial()
    .refine((datos) => Object.keys(datos).length > 0, {
        message: "Debe enviar al menos un campo para actualizar",
    });


export type CrearTipoEspecialidadDTO =
    z.infer<typeof tipoEspecialidadCreateSchema>;

export type ActualizarTipoEspecialidadDTO =
    z.infer<typeof tipoEspecialidadUpdateSchema>;