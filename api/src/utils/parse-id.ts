import { AppError } from "./app-error";

export const parseId = (value: string | string[] | undefined): number => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    const id = Number(normalizedValue);

    if (!Number.isInteger(id) || id <= 0) {
        throw AppError.badRequest("El id proporcionado no es valido");
    }

    return id;
};