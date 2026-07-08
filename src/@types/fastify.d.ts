import { Role } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number;
      role: Role;
      isActive: boolean;
    };
  }
}
