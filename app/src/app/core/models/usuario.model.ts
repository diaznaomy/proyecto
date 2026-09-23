export interface Rol {
    id: number;
    nombre: string;
    descripcion: string | null;
    estado: boolean;
}

export interface EstadoUsuario {
    id: number;
    nombre: string;
    descripcion: string | null;
}

export interface Usuario {
    edad: number | null;
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string | null;
    fechaRegistro: string;
    rolId: number;
    estadoUsuarioId: number;
    rol: Rol;
    estadoUsuario: EstadoUsuario;
    createdAt: string;
    updatedAt: string;
}
