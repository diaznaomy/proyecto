import { z } from "zod";

const optionalNullableString = z.preprocess(
  (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    return value;
  },
  z
    .string()
    .trim()
    .nullable()
    .optional()
);

const booleanFromFormData = z.preprocess(
  (value) => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  },
  z.boolean()
);

const especialidadIdsSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") return [];
    return Array.isArray(value) ? value : [value];
  },
  z.array(z.coerce.number().int().positive())
    .min(1, "Debe seleccionar al menos una especialidad")
    .transform((ids) => [...new Set(ids)])
);

export const createPerfilProfesionalSchema = z.object({
  usuarioId: z
    .number()
    .int()
    .positive("El usuario es obligatorio"),

  ubicacionId: z
    .number()
    .int()
    .positive("La ubicación es obligatoria"),

  tituloProfesional: z
    .string()
    .trim()
    .min(
      3,
      "El título profesional debe tener al menos 3 caracteres"
    )
    .max(
      150,
      "El título profesional no puede superar 150 caracteres"
    ),

  descripcion: z
    .string()
    .trim()
    .min(
      10,
      "La descripción debe tener al menos 10 caracteres"
    ),

  aniosExperiencia: z
    .number()
    .int()
    .min(
      0,
      "Los años de experiencia no pueden ser negativos"
    ),

  tarifaBase: z
    .number()
    .positive("La tarifa base debe ser mayor a cero"),

  imagenPerfil: z
    .string()
    .trim()
    .max(
      255,
      "La imagen no puede superar 255 caracteres"
    )
    .optional(),

  disponible: z.boolean().optional(),
  especialidadIds: especialidadIdsSchema,
});

export const updatePerfilProfesionalSchema =
  createPerfilProfesionalSchema.partial();

export type CreatePerfilProfesionalDto = z.infer<
  typeof createPerfilProfesionalSchema
>;

export type UpdatePerfilProfesionalDto = z.infer<
  typeof updatePerfilProfesionalSchema
>;

export const cambiarDisponibilidadSchema = z.object({
  disponible: z.boolean({
    message:
      "La disponibilidad debe ser verdadera o falsa",
  }),
});

export const createProfesionalCompletoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(
      100,
      "El nombre no puede superar 100 caracteres"
    ),

  apellidos: z
    .string()
    .trim()
    .min(1, "Los apellidos son obligatorios")
    .max(
      150,
      "Los apellidos no pueden superar 150 caracteres"
    ),

  correo: z
    .string()
    .trim()
    .email("El correo no es válido"),

  telefono: optionalNullableString,

  password: z
    .string()
    .min(
      6,
      "La contraseña debe tener al menos 6 caracteres"
    ),

  tituloProfesional: z
    .string()
    .trim()
    .min(
      3,
      "El título profesional debe tener al menos 3 caracteres"
    )
    .max(
      150,
      "El título profesional no puede superar 150 caracteres"
    ),

  descripcion: z
    .string()
    .trim()
    .min(
      10,
      "La descripción debe tener al menos 10 caracteres"
    ),

  aniosExperiencia: z.coerce
    .number()
    .int()
    .min(
      0,
      "Los años de experiencia no pueden ser negativos"
    ),

  modalidad: z.enum(
    ["Virtual", "Presencial"],
    {
      message:
        "La modalidad debe ser Virtual o Presencial",
    }
  ),

  ubicacionId: z.coerce
    .number()
    .int()
    .positive("La ubicación es obligatoria"),

  tarifaBase: z.coerce
    .number()
    .positive(
      "La tarifa base debe ser mayor a cero"
    ),

  imagenPerfil: optionalNullableString,

  disponible: booleanFromFormData.optional(),
  especialidadIds: especialidadIdsSchema,
});

export type CreateProfesionalCompletoDto = z.infer<
  typeof createProfesionalCompletoSchema
>;

export const updateProfesionalCompletoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100)
    .optional(),

  apellidos: z
    .string()
    .trim()
    .min(1, "Los apellidos son obligatorios")
    .max(150)
    .optional(),

  correo: z
    .string()
    .trim()
    .email("El correo no es válido")
    .optional(),

  telefono: optionalNullableString,

  tituloProfesional: z
    .string()
    .trim()
    .min(3, "El título profesional es obligatorio")
    .max(150)
    .optional(),

  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .optional(),

  aniosExperiencia: z.coerce
    .number()
    .int()
    .min(0, "La experiencia no puede ser negativa")
    .optional(),

  modalidad: z
    .enum(["Virtual", "Presencial"])
    .optional(),

  ubicacionId: z.coerce
    .number()
    .int()
    .positive("La ubicación es obligatoria")
    .optional(),

  tarifaBase: z.coerce
    .number()
    .positive("La tarifa base debe ser mayor a cero")
    .optional(),

  imagenPerfil: optionalNullableString,

  disponible: booleanFromFormData.optional(),
  especialidadIds: especialidadIdsSchema.optional(),
});

export type UpdateProfesionalCompletoDto = z.infer<
  typeof updateProfesionalCompletoSchema
>;
