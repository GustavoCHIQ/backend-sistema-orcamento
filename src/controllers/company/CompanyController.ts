import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Params } from '../../utils/types';
import { z } from 'zod';

const prisma = new PrismaClient();

export default new class CompanyController {
  async create(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const createEmpresaSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      cnpj: z.string({ required_error: 'CNPJ is required' }),
      phone: z.string({ required_error: 'Phone is required' }),
      ie: z.string({ required_error: 'IE is required' }),
      pngLogo: z.string().optional(),
      email: z.string({ required_error: 'Email is required' }).email(),
      address: z.string({ required_error: 'Address is required' }).min(1, { message: 'Address is required' }),
      city: z.string({ required_error: 'City is required' }).min(1, { message: 'City is required' }),
    });


    try {
      const data = createEmpresaSchema.parse(req.body);
      await prisma.empresa.create({
        data,
      });

      return reply.status(201).send();
    } catch (error) {
      return reply.status(400).send("Error to create company");
    }
  }

  async findAll(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const empresas = await prisma.empresa.findUnique({
        where: {
          id: 1
        },
        select: {
          id: true,
          name: true,
          cnpj: true,
          phone: true,
          ie: true,
          pngLogo: true,
          email: true,
          address: true,
          city: true,
        }
      });
      reply.status(200).send(empresas);
    } catch (error) {
      return reply.status(400).send({ error: 'Error to find company' });
    }
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<void> {
    const { id } = req.params;
    const updateEmpresaSchema = z.object({
      name: z.string().optional(),
      cnpj: z.string().optional(),
      phone: z.string().optional(),
      ie: z.string().optional(),
      pngLogo: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
    });

    try {
      const data = updateEmpresaSchema.parse(req.body);
      await prisma.empresa.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error to update company' });
    }
  }
}