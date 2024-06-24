import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Params } from '../../utils/types';
import { z } from 'zod';

const prisma = new PrismaClient();

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

  async findAll(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    const suppliers = await prisma.fornecedores.findMany({
      select: {
        id: true,
        name: true,
        contactInfo: true,
        email: true,
      },
    });
    return reply.send(suppliers);
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    const supplier = await prisma.fornecedores.findUnique({
      where: {
        id: Number(id),
      },
    });
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
      prisma.fornecedores.delete({
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