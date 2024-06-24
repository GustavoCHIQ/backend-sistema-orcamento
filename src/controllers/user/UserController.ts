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

      await prisma.usuarios.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });

      return reply.status(201).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error creating user' });
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

    return reply.send(user);
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const updateUserSchema = z.object({
      name: z.string().min(3, 'Name must have at least 3 characters').optional(),
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
      return reply.status(400).send({ error: 'Error updating user' });
    }
  }

  async updatePassword(req: FastifyRequest<{ Params: Params; Body: UpdatePasswordBody }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    const { previousPassword, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
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
    const { id } = req.params;

    const userNotExists = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
      },
    });

    if (id !== userNotExists?.id.toString()) {
      return reply.status(404).send({ error: 'User not found' });
    }

    try {
      await prisma.usuarios.delete({
        where: {
          id: Number(id),
        },
      });

      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error deleting user' });
    }
  }
};