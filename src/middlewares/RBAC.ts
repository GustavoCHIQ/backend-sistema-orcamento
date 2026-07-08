import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Permissão negada' });
    }
  };
}

// Permite a operação se o usuário autenticado for o dono do recurso (params.id) ou tiver uma das roles informadas
export function requireSelfOrRole(...roles: Role[]) {
  return async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const isSelf = Number(request.params.id) === request.user.id;
    if (!isSelf && !roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Permissão negada' });
    }
  };
}
