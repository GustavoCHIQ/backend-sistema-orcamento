import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import { Params, ListQuery } from '../../utils/types';
import { parsePagination, buildSearchFilter } from '../../utils/pagination';
import { z } from 'zod';

export default new class ProductController {
  async create(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    const createProductSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      description: z.string({ required_error: 'Description is required' }),
      price: z.number({ required_error: 'Price is required' }),
      categoryId: z.number({ required_error: 'Category ID is required' }),
      supplierId: z.number({ required_error: 'Supplier ID is required' })
    });

    try {
      const data = createProductSchema.parse(req.body);
      await prisma.produtos.create({
        data,
      });

      return reply.status(201).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error creating product' });
    }
  }

  async findAll(req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply): Promise<any> {
    const pagination = parsePagination(req.query);
    const where = buildSearchFilter(req.query.search, ['name', 'description']);

    const [products, total] = await Promise.all([
      prisma.produtos.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          categorias: {
            select: {
              id: true,
              name: true
            }
          },
          fornecedores: {
            select: {
              id: true,
              name: true
            }
          }
        },
      }),
      prisma.produtos.count({ where }),
    ]);

    return reply.send({ data: products, pagination: { ...pagination, total, pages: Math.ceil(total / pagination.limit) } });
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    const product = await prisma.produtos.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    return reply.send(product);
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    const updateProductSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      categoryId: z.number().optional(),
      supplierId: z.number().optional()
    });

    try {
      const data = updateProductSchema.parse(req.body);
      await prisma.produtos.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error updating product' });
    }
  }

  async delete(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    try {
      await prisma.produtos.delete({
        where: {
          id: Number(id),
        },
      });

      return reply.send({ message: "Product deleted" });
    } catch (err) {
      return reply.status(400).send({ error: 'Error deleting product' });
    }
  }
}