import { prisma } from "../config/prisma";

// NOTA: el modelo `Bitacora` ya existía en el schema pero no se usaba en
// ningún controller/service del proyecto. Este helper es el primer punto
// de uso; se centraliza aquí para que, si más adelante se integra en otros
// flujos, no se dupliquen llamadas sueltas a prisma.bitacora.create por
// todo el código.
export const bitacoraService = {
  async registrar(usuarioId: number, accion: string, descripcion?: string) {
    return prisma.bitacora.create({
      data: {
        usuarioId,
        accion,
        descripcion,
      },
    });
  },
};
