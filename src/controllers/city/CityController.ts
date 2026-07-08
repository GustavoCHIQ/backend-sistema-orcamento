import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import { Params, ListQuery } from '../../utils/types';
import { parsePagination, buildSearchFilter } from '../../utils/pagination';
import { z } from 'zod';

export default new class CityController {
  async create(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    const createCitySchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      state: z.string({ required_error: 'State is required' }),
      country: z.string({ required_error: 'Country is required' }),
      cep: z.string({ required_error: 'CEP is required' }).min(8),
    });

    try {
      const data = createCitySchema.parse(req.body);
      await prisma.cidades.create({
        data,
      });

      return reply.status(201).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error to create city' });
    }
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    const updateCitySchema = z.object({
      name: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      cep: z.string().optional(),
    });

    try {
      const data = updateCitySchema.parse(req.body);
      await prisma.cidades.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error to update city' });
    }
  }

  async findAll(req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply): Promise<any> {
    const pagination = parsePagination(req.query);
    const where = buildSearchFilter(req.query.search, ['name']);

    const [cities, total] = await Promise.all([
      prisma.cidades.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      prisma.cidades.count({ where }),
    ]);

    return reply.send({ data: cities, pagination: { ...pagination, total, pages: Math.ceil(total / pagination.limit) } });
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    try {
      const city = await prisma.cidades.findUnique({
        where: {
          id: Number(id)
        }
      });

      if (!city) {
        return reply.status(404).send({ error: 'City not found' });
      }

      return reply.send(city);
    } catch (error) {
      return reply.status(400).send({ error: 'Error to find city' });
    }
  }

  async delete(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    try {
      await prisma.cidades.delete({
        where: {
          id: Number(id)
        }
      });

      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}