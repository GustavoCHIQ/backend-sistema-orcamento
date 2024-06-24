import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Params } from '../../utils/types';
import { z } from 'zod';

const prisma = new PrismaClient();

export default new class CategoryController {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const createCategorySchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
    });

    try {
      const data = createCategorySchema.parse(req.body);
      await prisma.categorias.create({
        data,
      });
    } catch (error) {
      return reply.status(400).send({ error: 'Error to create category' });
    }

    reply.status(201).send();
  }

  async findAll(req: FastifyRequest, reply: FastifyReply) {
    const categories = await prisma.categorias.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return reply.send(categories);
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
    const { id } = req.params;
    const category = await prisma.categorias.findUnique({
      where: {
        id: Number(id),
      },
    });
    return reply.send(category);
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
    const { id } = req.params;
    const updateCategorySchema = z.object({
      name: z.string().optional(),
    });

    const data = updateCategorySchema.parse(req.body);
    try {
      await prisma.categorias.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error to update category' });
    }
  }

  async delete(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
    const { id } = req.params;
    try {
      await prisma.categorias.delete({
        where: {
          id: Number(id),
        },
      });
      return reply.status(204).send();
    } catch (err) {
      return reply.status(500).send({ error: 'Error to delete category' });
    }
  }
}