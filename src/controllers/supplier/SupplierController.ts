import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import { Params, ListQuery } from '../../utils/types';
import { parsePagination, buildSearchFilter } from '../../utils/pagination';
import { z } from 'zod';

export default new class SupplierController {
  async create(req: FastifyRequest, reply: FastifyReply): Promise<any> {

    const createSupplierSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      contactInfo: z.string({ required_error: 'Contact info is required' }),
      email: z.string({ required_error: 'Email is required' }).email(),
      cnpj: z.string({ required_error: 'CNPJ is required' })
    });

    try {
      const data = createSupplierSchema.parse(req.body);
      await prisma.fornecedores.create({
        data,
      });

      return reply.status(201).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error creating supplier' });
    }
  }

  async findAll(req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply): Promise<any> {
    const pagination = parsePagination(req.query);
    const where = buildSearchFilter(req.query.search, ['name', 'email']);

    const [suppliers, total] = await Promise.all([
      prisma.fornecedores.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          contactInfo: true,
          email: true,
        },
      }),
      prisma.fornecedores.count({ where }),
    ]);

    return reply.send({ data: suppliers, pagination: { ...pagination, total, pages: Math.ceil(total / pagination.limit) } });
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    const supplier = await prisma.fornecedores.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!supplier) {
      return reply.status(404).send({ error: 'Supplier not found' });
    }

    return reply.send(supplier);
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {

    const updateSupplierSchema = z.object({
      name: z.string().optional(),
      contactInfo: z.string().optional(),
      email: z.string().email().optional(),
      cnpj: z.string().optional()
    });

    try {
      const { id } = req.params;
      const data = updateSupplierSchema.parse(req.body);
      await prisma.fornecedores.update({
        where: {
          id: Number(id),
        },
        data,
      });

      return reply.send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error updating supplier' });
    }
  }

  async delete(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    try {
      await prisma.fornecedores.delete({
        where: {
          id: Number(id),
        },
      });

      return reply.send({ message: "Supplier deleted" });
    } catch (err) {
      return reply.status(400).send({ error: 'Error deleting supplier' });
    }
  }
}