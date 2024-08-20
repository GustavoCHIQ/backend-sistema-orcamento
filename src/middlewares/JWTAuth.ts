import jwt, { JwtPayload } from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';

class UserUtils {
  public static async verifyJwt(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies['access_token']; // Busca o token no cookie

    if (!token) {
      return reply.status(401).send({ error: 'Nenhum token fornecido' });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return reply.status(500).send({ error: 'Internal server error' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      if (typeof decoded === 'object' && decoded !== null) {
        request.user = decoded;
      } else {
        return reply.status(401).send({ error: 'Sem autorização' });
      }
    } catch (err) {
      return reply.status(401).send({ error: 'Token inválido' });
    }
  }
}

export const verifyJwt = UserUtils.verifyJwt.bind(UserUtils);
