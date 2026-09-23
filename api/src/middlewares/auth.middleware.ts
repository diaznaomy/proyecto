import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { JwtPayload } from "jsonwebtoken"
import { verificarToken } from "../utils/jwt"
export interface AuthTokenPayload extends JwtPayload {
    id: number
    email: string
    role: string
}
export interface AuthRequest extends Request { user?: AuthTokenPayload }
export function authenticateToken(request: AuthRequest, response: Response, next: NextFunction): void {
    const authorizationHeader = request.headers.authorization
    if (!authorizationHeader) {
        response.status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Token no proporcionado" })
        return
    }
    const [scheme, token] = authorizationHeader.split(" ")
    if (scheme !== "Bearer" || !token) {
        response
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Formato de token inválido" })
        return
    }
    try {
        const decodedToken = verificarToken(token)
        if (!decodedToken.id || !decodedToken.email || !decodedToken.role) {
            response
                .status(StatusCodes.UNAUTHORIZED)
                .json({ success: false, message: "Token inválido" })
            return
        }
        request.user = {
            id: Number(decodedToken.id),
            email: String(decodedToken.email),
            role: String(decodedToken.role)
        }
        next()
    } catch {
        response
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Token inválido o expirado" })
        return
    }
}

export const verificarAutenticacion = authenticateToken

export const autorizarRoles = (...rolesPermitidos: string[]) => {
    return (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuario = request.user

        if (!usuario) {
            response
                .status(StatusCodes.UNAUTHORIZED)
                .json({ success: false, message: "Token no proporcionado" })
            return
        }

        if (!rolesPermitidos.includes(usuario.role)) {
            response
                .status(StatusCodes.FORBIDDEN)
                .json({ success: false, message: "No tienes permisos para realizar esta acción" })
            return
        }

        next()
    }
}
