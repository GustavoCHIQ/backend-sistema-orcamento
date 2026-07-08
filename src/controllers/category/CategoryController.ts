import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import { Params, ListQuery } from '../../utils/types';
import { parsePagination, buildSearchFilter } from '../../utils/pagination';
import { z } from 'zod';

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

  async findAll(req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) {
    const pagination = parsePagination(req.query);
    const where = buildSearchFilter(req.query.search, ['name']);

    const [categories, total] = await Promise.all([
      prisma.categorias.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.categorias.count({ where }),
    ]);

    return reply.send({ data: categories, pagination: { ...pagination, total, pages: Math.ceil(total / pagination.limit) } });
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
    const { id } = req.params;
    const category = await prisma.categorias.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!category) {
      return reply.status(404).send({ error: 'Category not found' });
    }

    return reply.send(category);
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
    const { id } = req.params;
    const updateCategorySchema = z.object({
      name: z.string().optional(),
    });

    try {
      const data = updateCategorySchema.parse(req.body);
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