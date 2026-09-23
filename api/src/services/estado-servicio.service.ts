import { prisma } from "../config/prisma";

export const listarEstadosServicio = async () => {
    return prisma.estadoServicio.findMany({
        orderBy: { id: "asc" },
    });
};