export interface EnumOption {
    value: string;
    label: string;
}

export type EstadoOrden = "Pendiente" | "Pagada" | "Enviada" | "Cancelada";
export type Role = "Cliente" | "Administrador";
export type EstadoAsistencia = "Asistio" | "NoAsistio" | "Tardanza" | "CanceladaUltimaHora";

//Estado de las Órdenes
export const EstadoOrdenMap: Record<EstadoOrden, string> = {
    Pendiente: "Pendiente de Pago",
    Pagada: "Pagada",
    Enviada: "Enviada",
    Cancelada: "Cancelada"
};

// Roles
export const RoleMap: Record<Role, string> = {
    Cliente: "Cliente",
    Administrador: "Administrador"
};

// Estado de Asistencia
export const EstadoAsistenciaMap: Record<EstadoAsistencia, string> = {
    Asistio: "Asistió",
    NoAsistio: "No Asistió",
    Tardanza: "Tardanza",
    CanceladaUltimaHora: "Cancelada Última Hora"
};

/**
 * Convierte un diccionario de mapas en un array de opciones
 */
export function getEnumOptions<T extends string>(map: Record<T, string>): EnumOption[] {
    return Object.entries(map).map(([value, label]) => ({
        value,
        label: label as string
    }));
}