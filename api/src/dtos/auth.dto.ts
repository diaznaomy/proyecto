import { z } from "zod";

export const registrarSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    apellidos: z.string().trim().min(1, "Los apellidos son obligatorios"),
    correo: z.string().trim().email("El correo no es valido"),
    password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
    telefono: z.string().trim().optional().nullable(),
});

export const loginSchema = z.object({
    correo: z.string().trim().email("El correo no es valido"),
    password: z.string().min(1, "La contrasena es obligatoria"),
});

export const actualizarPerfilSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    apellidos: z.string().min(1, "Los apellidos son obligatorios"),
    telefono: z.string().nullable().optional(),
});

export type ActualizarPerfilDTO = z.infer<typeof actualizarPerfilSchema>;
export type RegistrarDTO = z.infer<typeof registrarSchema>;
export type IniciarSesionDTO = z.infer<typeof loginSchema>;