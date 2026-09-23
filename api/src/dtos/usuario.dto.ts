import { z } from "zod";

export const usuarioCreateSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    apellidos: z.string().trim().min(1, "Los apellidos son obligatorios"),
    correo: z.string().trim().email("El correo no es valido"),
    edad: z.coerce
        .number()
        .int()
        .positive("La edad debe ser un número positivo")
        .optional()
        .nullable(),
    password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
    telefono: z.string().trim().optional().nullable(),
    rolId: z.coerce.number().int().positive("El rolId es obligatorio y debe ser valido"),
    estadoUsuarioId: z.coerce
        .number()
        .int()
        .positive("El estadoUsuarioId es obligatorio y debe ser valido"),
});

export const usuarioUpdateSchema = usuarioCreateSchema
    .omit({ password: true })
    .extend({
        password: z
            .string()
            .min(6, "La contrasena debe tener al menos 6 caracteres")
            .optional(),
    })
    .partial()
    .refine((datos) => Object.keys(datos).length > 0, {
        message: "Debe enviar al menos un campo para actualizar",
    });

export type CrearUsuarioDTO = z.infer<typeof usuarioCreateSchema>;
export type ActualizarUsuarioDTO = z.infer<typeof usuarioUpdateSchema>;
