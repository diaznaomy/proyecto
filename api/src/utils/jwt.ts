import jwt, { type SignOptions } from "jsonwebtoken";

export interface TokenPayload {
    id: number;
    email: string;
    role: string;
}

const obtenerJwtSecret = (): string => {
    return process.env.JWT_SECRET ?? "serena_dev_secret";
};

const obtenerJwtExpiracion = (): string => {
    return process.env.JWT_EXPIRES_IN ?? "1d";
};

export const generarToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, obtenerJwtSecret(), {
        expiresIn: obtenerJwtExpiracion() as SignOptions["expiresIn"],
    });
};

export const verificarToken = (token: string): TokenPayload => {
    const decoded = jwt.verify(token, obtenerJwtSecret());

    if (typeof decoded === "string") {
        throw new Error("Token invalido");
    }

    return decoded as TokenPayload;
};