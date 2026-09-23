import { z } from "zod";

export const servicioCreateSchema = z.object({
    perfilProfesionalId: z.coerce
        .number()
        .int()
        .positive("El profesional asociado es obligatorio"),
    modalidadId: z.coerce
        .number()
        .int()
        .positive("La modalidad es obligatoria"),
    estadoServicioId: z.coerce
        .number()
        .int()
        .positive("El estadoServicioId es obligatorio y debe ser valido"),
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    descripcion: z.string().trim().min(1, "La descripcion es obligatoria"),
    precio: z.coerce.number().positive("El precio debe ser mayor a cero"),
    duracionEstimada: z.coerce
        .number()
        .int()
        .positive("La duracion debe ser mayor a cero"),
    imagenServicio: z.string().trim().optional().nullable(),
    // No existe un campo categoriaId en Servicio: la "categoria" se deriva
    // del TipoEspecialidad de las especialidades asociadas, por eso se exige
    // al menos una (cumple la validacion "Categoria obligatoria").
    especialidadIds: z
        .array(z.coerce.number().int().positive())
        .min(1, "Debe seleccionar al menos una especialidad (la categoria se deriva de ahi)"),
});

export const servicioUpdateSchema = servicioCreateSchema
    .partial()
    .refine((datos) => Object.keys(datos).length > 0, {
        message: "Debe enviar al menos un campo para actualizar",
    });

export type CrearServicioDTO = z.infer<typeof servicioCreateSchema>;
export type ActualizarServicioDTO = z.infer<typeof servicioUpdateSchema>;