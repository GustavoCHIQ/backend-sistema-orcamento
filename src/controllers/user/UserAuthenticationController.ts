import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Login } from '../../utils/types';

const prisma = new PrismaClient();

export default new class UserAuthenticationController {
  async login(req: FastifyRequest<{ Body: Login }>, reply: FastifyReply): Promise<any> {
    const { email, password } = req.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    const user = await prisma.usuarios.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || '', {
      expiresIn: '1d', // O token expira em 1 dia
    });

    reply.setCookie('access_token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 86400000), // 1 dia
    });

    return reply.send({ token });
  }

  async logout(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    // Verifica se o usuário está autenticado e se o JWT é válido
    try {
      const token = req.cookies.access_token;
      if (!token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      // Verifica se o JWT é válido
      jwt.verify(token, process.env.JWT_SECRET || '');

      // Remove o cookie do token de acesso
      reply.clearCookie('access_token');
      return reply.send({ message: 'Logged out successfully' });

    } catch (error) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  }
}