import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import { Params, UpdatePasswordBody, ListQuery } from '../../utils/types';
import { hashPassword, comparePassword } from '../../utils/password';
import { parsePagination, buildSearchFilter } from '../../utils/pagination';
import { z } from 'zod';

export default new class UserController {
  async create(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    const createUserSchema = z.object({
      name: z.string({ required_error: 'Name is required' }).min(3, 'Name must have at least 3 characters'),
      email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
      password: z.string({ required_error: 'Password is required' }).min(6, 'Password must have at least 6 characters')
    });

    try {
      const data = createUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(data.password);

      const user = await prisma.usuarios.findUnique({
        where: {
          email: data.email,
        },
      });

      if (user) {
        return reply.status(400).send({ error: 'User already exists' });
      }

      await prisma.usuarios.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });

      reply.status(201).send({ message: 'User created successfully' });
    } catch (error) {
      reply.status(400).send({ error: 'Error creating user' });
    }
  }

  async findAll(req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply): Promise<any> {
    const pagination = parsePagination(req.query);
    const where = buildSearchFilter(req.query.search, ['name', 'email']);

    const [users, total] = await Promise.all([
      prisma.usuarios.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      }),
      prisma.usuarios.count({ where }),
    ]);

    return reply.send({ data: users, pagination: { ...pagination, total, pages: Math.ceil(total / pagination.limit) } });
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    try {
      const user = await prisma.usuarios.findUnique({
        where: {
          id: Number(id),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async updateUser(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const updateUserSchema = z.object({
      name: z.string().min(5, 'Name must have at least 5 characters').optional(),
      email: z.string().email('Invalid email format').optional(),
    });

    try {
      const { id } = req.params;
      const data = updateUserSchema.parse(req.body);

      await prisma.usuarios.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return reply.send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      return reply.status(400).send({ error: 'Error updating user' });
    }
  }

  async updatePassword(req: FastifyRequest<{ Params: Params; Body: UpdatePasswordBody }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    const { previousPassword, password, confirmPassword } = req.body;

    const user = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (password !== confirmPassword) {
      return reply.status(400).send({ error: 'Passwords do not match' });
    }

    const passwordMatch = await comparePassword(previousPassword, user.password);

    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Invalid password' });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.usuarios.update({
      where: {
        id: Number(id),
      },
      data: {
        password: hashedPassword,
      },
    });

    return reply.send({ message: 'Password updated successfully' });
  }

  async delete(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuarios.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!usuario) {
        return reply.status(404).send({ error: 'User not found' });
      }

      await prisma.usuarios.delete({
        where: {
          id: Number(id)
        }
      });

      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error deleting user' });
    }
  }
}
