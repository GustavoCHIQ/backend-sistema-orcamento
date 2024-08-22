import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Params, UpdatePasswordBody } from '../../utils/types';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

require('dotenv').config();

const prisma = new PrismaClient();

export default new class UserController {
  async create(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    const createUserSchema = z.object({
      name: z.string({ required_error: 'Name is required' }).min(3, 'Name must have at least 3 characters'),
      email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
      password: z.string({ required_error: 'Password is required' }).min(6, 'Password must have at least 6 characters')
    });

    try {
      const data = createUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 8);

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

  async findAll(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    const users = await prisma.usuarios.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    return reply.send(users);
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

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
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
    }
  }

  async updatePassword(req: FastifyRequest<{ Params: Params; Body: UpdatePasswordBody }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    const { previousPassword, password, confirmPassword } = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);

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

    const passwordMatch = await bcrypt.compare(previousPassword, user.password);

    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Invalid password' });
    }

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
