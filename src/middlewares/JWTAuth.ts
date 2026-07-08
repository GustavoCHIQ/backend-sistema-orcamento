import jwt, { JwtPayload } from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export function extractToken(request: FastifyRequest): string | undefined {
  const headerToken = request.headers.authorization?.replace('Bearer ', '');
  return headerToken || request.cookies['access_token'];
}

class UserUtils {
  public static async verifyJwt(request: FastifyRequest, reply: FastifyReply) {
    const token = extractToken(request);

    if (!token) { return reply.status(401).send({ error: 'Nenhum token fornecido' }); }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return reply.status(500).send({ error: 'Internal server error' });
    }

    let decoded: JwtPayload;
    try {
      const result = jwt.verify(token, jwtSecret);

      if (typeof result !== 'object' || result === null || typeof result.id !== 'number') {
        return reply.status(401).send({ error: 'Sem autorização' });
      }

      decoded = result;
    } catch (err) {
      return reply.status(401).send({ error: 'Token inválido' });
    }

    const user = await prisma.usuarios.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'Sem autorização' });
    }

    request.user = user;
  }
}

export const verifyJwt = UserUtils.verifyJwt.bind(UserUtils);
