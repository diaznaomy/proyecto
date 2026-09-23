import { Usuario } from './usuario.model';

export interface LoginDto {
    correo: string;
    password: string;
}

// El registro publico SOLO crea usuarios con rol Cliente: por eso no hay
// rolId aqui, el backend lo asigna internamente sin que el frontend lo pida.
export interface RegistroDto {
    nombre: string;
    apellidos: string;
    correo: string;
    password: string;
    telefono?: string | null;
}

// Campos que un usuario puede editar de si mismo. No incluye rol, estado,
// correo ni password: eso solo lo administra un Administrador.
export interface ActualizarPerfilDto {
    nombre?: string;
    apellidos?: string;
    telefono?: string | null;
}

export interface AutenticacionRespuesta {
    usuario: Usuario;
    token: string;
}
