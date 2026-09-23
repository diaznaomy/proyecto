import { prisma } from "../config/prisma";

export const listarUbicaciones = async () => {
  return prisma.ubicacion.findMany({
    orderBy: [
      {
        provincia: "asc",
      },
      {
        canton: "asc",
      },
      {
        distrito: "asc",
      },
    ],
  });
};