import type { Response } from "express";

export interface SuccessResponse<T = unknown> {
    success: true;
    message: string;
    data?: T;
}

export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T
) => {
    const payload: SuccessResponse<T> = {
        success: true,
        message,
    };

    if (data !== undefined) {
        payload.data = data;
    }

    return res.status(statusCode).json(payload);
};