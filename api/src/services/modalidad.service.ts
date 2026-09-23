import { prisma } from "../config/prisma";

export const listarModalidades = async () => {
    return prisma.modalidad.findMany({
        orderBy: { id: "asc" },
    });
};