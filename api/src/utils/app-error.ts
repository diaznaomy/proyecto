export class AppError extends Error {
    statusCode: number;
    validationErrors: any;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }

    static badRequest(message: string, validationErrors: { field: string; message: string; }[] = []): AppError {
        return new AppError(400, message);
    }

    static unauthorized(message: string): AppError {
        return new AppError(401, message);
    }

    static forbidden(message: string): AppError {
        return new AppError(403, message);
    }

    static notFound(message: string): AppError {
        return new AppError(404, message);
    }

    static conflict(message: string): AppError {
        return new AppError(409, message);
    }
}